import React, { useState } from 'react';
import JSZip from 'jszip';
import { VideoConfig } from '../types';
import { VerseData } from '../../quran/types';

export function useProjectExporter(
  config: VideoConfig,
  verses: VerseData[],
  audioUrl: string | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  audioRef: React.RefObject<HTMLAudioElement>,
  fullAudioData: any // Receives the raw audio data for JSON
) {
  const [isProjectExporting, setIsProjectExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0); // 0 to 100

  const startProjectExport = async () => {
    if (!canvasRef.current || !audioRef.current || !audioUrl || verses.length === 0) return;

    setIsProjectExporting(true);
    setExportProgress(0);

    const zip = new JSZip();
    const imgFolder = zip.folder("img");

    // 1. Determine Time Range
    const firstVerse = verses[0];
    const lastVerse = verses[verses.length - 1];

    // Safety check for timings
    if (!firstVerse.timing || !lastVerse.timing) {
        alert("Timing data missing, cannot export.");
        setIsProjectExporting(false);
        return;
    }

    const startMs = firstVerse.timing.timestamp_from;
    const endMs = lastVerse.timing.timestamp_to;

    // Exact audio duration calculation
    const startTime = startMs / 1000;
    const endTime = (endMs / 1000) + 0.1; // Slight buffer for end
    const duration = endTime - startTime;

    // FPS configuration: 30FPS as requested
    const fps = 30;
    const totalFrames = Math.ceil(duration * fps);

    // Surah ID padding (e.g. 002)
    const paddedSurah = String(config.surahId).padStart(3, '0');

    // 2. Fetch and Add Audio File
    try {
        const audioResp = await fetch(audioUrl);
        const audioBlob = await audioResp.blob();

        // Add .mp3 to root using STORE compression
        zip.file(`${paddedSurah}.mp3`, audioBlob, { compression: "STORE" });
    } catch (e) {
        console.error("Failed to download audio for export", e);
    }

    // 3. Generate Project JSON (Strict Structure)
    // Filter audio files to only include the relevant one if full data is passed
    // But usually audio_files array contains one or more representations. We dump what we have.
    const audioFilesJson = fullAudioData && fullAudioData.audio_files ? fullAudioData.audio_files : [];

    const projectData = {
        selected: {
            from_verse: `${config.surahId}:${config.verseStart}`,
            to_verse: `${config.surahId}:${config.verseEnd}`,
            start_ms: startMs,
            end_ms: endMs
        },
        // Injected Config for re-creation
        app_config: config,
        // Requested API Data
        audio_files: audioFilesJson
    };
    zip.file("project.json", JSON.stringify(projectData, null, 2));

    // 4. Capture Frames
    const audio = audioRef.current;
    const canvas = canvasRef.current;

    const originalTime = audio.currentTime;
    const originalVolume = audio.volume;
    audio.volume = 0; // Mute during capture
    audio.pause();

    // Loop through frames
    for (let i = 0; i < totalFrames; i++) {
        // Calculate exact time for this frame
        const t = startTime + (i / fps);

        // Set Audio Time -> Triggers VideoCanvas update
        audio.currentTime = t;

        // Wait for Paint
        // We use double RequestAnimationFrame to ensure the browser has actually painted the canvas
        // with the new state derived from audio.currentTime.
        await new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => resolve());
            });
        });

        // Capture Canvas
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

        if (blob && imgFolder) {
            // Name: frame_00000.png (5 digits padding)
            const frameName = `frame_${String(i).padStart(5, '0')}.png`;
            imgFolder.file(frameName, blob, { compression: "STORE" });
        }

        // Update Progress (0-90%)
        setExportProgress(Math.round(((i + 1) / totalFrames) * 90));
    }

    // 5. Generate Zip (90-100%)
    const content = await zip.generateAsync({
        type: "blob",
        compression: "STORE"
    }, (metadata) => {
        setExportProgress(90 + Math.round(metadata.percent * 0.1));
    });

    // Trigger Download
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuranProject_${paddedSurah}_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Restore State
    audio.currentTime = originalTime;
    audio.volume = originalVolume;
    setIsProjectExporting(false);
  };

  return { isProjectExporting, exportProgress, startProjectExport };
}
