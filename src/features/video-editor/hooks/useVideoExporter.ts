import React, { useState } from 'react';
import * as Mp4Muxer from 'mp4-muxer';
import { VideoConfig } from '../types';
import { VerseData } from '../../quran/types';
import { CANVAS_SIZES, RECITERS } from '../../../shared/constants';
import { SURAHS } from '../../quran/data/surahs';
import { saveVideoFile } from '../../../shared/utils/tauri-fs';

export function useVideoExporter(
  config: VideoConfig,
  verses: VerseData[],
  audioUrl: string | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  audioRef: React.RefObject<HTMLAudioElement>
) {
  const [isVideoExporting, setIsVideoExporting] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");

  const startVideoExport = async () => {
    if (!canvasRef.current || !audioRef.current || !audioUrl || verses.length === 0) return;

    setIsVideoExporting(true);
    setVideoExportProgress(0);
    setExportStatus("Initializing...");

    try {
        // 1. Calculate Timing
        const firstVerse = verses[0];
        const lastVerse = verses[verses.length - 1];

        if (!firstVerse.timing || !lastVerse.timing) {
            alert("Timing data missing, cannot export.");
            setIsVideoExporting(false);
            return;
        }

        const startMs = firstVerse.timing.timestamp_from;
        const endMs = lastVerse.timing.timestamp_to;
        const startTime = startMs / 1000;
        const endTime = (endMs / 1000) + 0.1;
        const duration = endTime - startTime;

        const fps = 30;
        const totalFrames = Math.ceil(duration * fps);
        const width = CANVAS_SIZES[config.aspectRatio].width;
        const height = CANVAS_SIZES[config.aspectRatio].height;

        // 2. Setup MP4 Muxer
        const muxer = new Mp4Muxer.Muxer({
            target: new Mp4Muxer.ArrayBufferTarget(),
            video: {
                codec: 'avc', // H.264
                width,
                height
            },
            audio: {
                codec: 'aac',
                numberOfChannels: 2,
                sampleRate: 44100
            },
            fastStart: 'in-memory'
        });

        // 3. Setup Video Encoder
        const videoEncoder = new VideoEncoder({
            output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
            error: (e) => console.error("Video Encoder Error", e)
        });

        videoEncoder.configure({
            codec: 'avc1.4d002a', // H.264 Main Profile Level 4.2
            width,
            height,
            bitrate: 8_000_000, // 8 Mbps
            framerate: fps
        });

        // 4. Setup Audio Encoder
        const audioEncoder = new AudioEncoder({
            output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
            error: (e) => console.error("Audio Encoder Error", e)
        });

        audioEncoder.configure({
            codec: 'mp4a.40.2', // AAC LC
            numberOfChannels: 2,
            sampleRate: 44100,
            bitrate: 128_000
        });

        // 5. Fetch and Decode Audio
        setExportStatus("Processing Audio...");
        const audioCtx = new AudioContext({ sampleRate: 44100 });
        const audioResp = await fetch(audioUrl);
        const audioArrayBuffer = await audioResp.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

        // Slice Audio Buffer
        const startSample = Math.floor(startTime * 44100);
        const endSample = Math.floor(endTime * 44100);
        const length = endSample - startSample;
        const slicedBuffer = audioCtx.createBuffer(2, length, 44100);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            const slicedData = slicedBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                slicedData[i] = channelData[startSample + i] || 0;
            }
        }

        // Interleave audio data for AudioData
        const left = slicedBuffer.getChannelData(0);
        const right = slicedBuffer.getChannelData(1);
        const interleaved = new Float32Array(length * 2);
        for (let i = 0; i < length; i++) {
            interleaved[i * 2] = left[i];
            interleaved[i * 2 + 1] = right[i];
        }
        
        // Create AudioData directly from interleaved buffer
        const finalAudioData = new AudioData({
            format: 'f32',
            numberOfChannels: 2,
            numberOfFrames: length,
            sampleRate: 44100,
            timestamp: 0,
            data: interleaved
        });

        audioEncoder.encode(finalAudioData);
        await audioEncoder.flush();
        finalAudioData.close();

        // 6. Render Video Frames
        setExportStatus("Rendering Video Frames...");
        const canvas = canvasRef.current;
        const audio = audioRef.current;

        const originalTime = audio.currentTime;
        const originalVolume = audio.volume;
        audio.volume = 0;
        audio.pause();

        for (let i = 0; i < totalFrames; i++) {
            const t = startTime + (i / fps);
            const timestampMicro = (i / fps) * 1_000_000;

            // Update Canvas State
            audio.currentTime = t;

            // Wait for Paint
            await new Promise<void>(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => resolve());
                });
            });

            // Create VideoFrame from Canvas
            const frame = new VideoFrame(canvas, { timestamp: timestampMicro });

            // Encode
            videoEncoder.encode(frame, { keyFrame: i % 30 === 0 });
            frame.close();

            // Progress
            setVideoExportProgress(Math.round(((i + 1) / totalFrames) * 100));
        }

        setExportStatus("Finalizing...");
        await videoEncoder.flush();
        muxer.finalize();

        // 7. Save Video
        const { buffer } = muxer.target;
        const blob = new Blob([buffer], { type: 'video/mp4' });

        // Construct dynamic filename
        const surahNum = config.surahId.toString().padStart(3, '0');
        const rawSurahName = SURAHS.find(s => s.number === config.surahId)?.englishName || 'Surah';
        const surahName = rawSurahName
            .replace(/-/g, '_')
            .replace(/\s+/g, '_')
            .replace(/['`]/g, '');

        const rawReciterName = RECITERS.find(r => r.id === config.reciterId)?.name || 'Reciter';
        const reciterName = rawReciterName.split(' ').pop()?.replace(/[^\w]/g, '') || 'Reciter';

        const filename = `${surahNum}_${surahName}_${config.verseStart}-${config.verseEnd}_${reciterName}.mp4`;

        // Get default export path from localStorage if available
        const defaultExportPath = localStorage.getItem('exportPath') || undefined;
        const skipDialog = localStorage.getItem('skipDialog') === 'true';

        await saveVideoFile(blob, filename, { defaultDir: defaultExportPath, skipDialog });

        // Restore
        audio.currentTime = originalTime;
        audio.volume = originalVolume;

    } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed: " + error);
    } finally {
        setIsVideoExporting(false);
    }
  };

  return { isVideoExporting, videoExportProgress, exportStatus, startVideoExport };
}
