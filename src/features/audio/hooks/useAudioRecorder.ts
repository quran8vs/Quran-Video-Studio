import React, { useState, useEffect, useRef } from 'react';
import { VerseData } from '../../quran/types';
import { VideoConfig } from '../../video-editor/types';

export function useAudioRecorder(
  _config: VideoConfig,
  verses: VerseData[],
  audioUrl: string | null,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. Initialize Audio Element & Web Audio Context
  useEffect(() => {
    if (!audioRef.current) {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.preload = "auto";
        audioRef.current = audio;

        // Buffering Event Listeners
        const setBuffering = () => {
            setIsBuffering(true);
        };
        const setReady = () => {
            setIsBuffering(false);
        };

        audio.addEventListener('waiting', setBuffering);
        audio.addEventListener('loadstart', setBuffering);
        audio.addEventListener('seeking', setBuffering);

        audio.addEventListener('canplay', setReady);
        audio.addEventListener('playing', setReady);
        audio.addEventListener('seeked', setReady);

        audio.addEventListener('error', () => {
            // Ignore errors when src is not set (common during initialization)
            if (!audio.getAttribute('src')) return;

            console.error("Audio Error Event:", audio.error);
            setIsBuffering(false);
            setIsPlaying(false);
        });

        // Safety: If audio naturally ends, ensure we update state
        audio.addEventListener('ended', () => {
             setIsPlaying(false);
        });
    }

    if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        streamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };
  }, []);

  // 2. Set Audio Source & Connect Graph
  useEffect(() => {
    if (audioUrl && audioRef.current && audioContextRef.current && streamDestinationRef.current) {
        const audio = audioRef.current;
        const ctx = audioContextRef.current;
        const dest = streamDestinationRef.current;

        if (audio.src !== audioUrl) {
            audio.src = audioUrl;
            audio.load();
        }

        if (!sourceNodeRef.current) {
            try {
                const source = ctx.createMediaElementSource(audio);
                sourceNodeRef.current = source;
                source.connect(ctx.destination);
                source.connect(dest);
            } catch (e) {
                console.warn("Error connecting audio graph:", e);
            }
        }
    }
  }, [audioUrl]);

  // Helper: Get Start/End Times
  const getRangeTiming = () => {
      if (verses.length === 0) return null;
      const first = verses[0];
      const last = verses[verses.length - 1];
      if (!first.timing || !last.timing) return null;

      // Add buffer: -0.05s start, +0.1s end
      // Note: We will clamp the end time against duration in checkTime
      const start = Math.max(0, (first.timing.timestamp_from / 1000) - 0.05);
      const end = (last.timing.timestamp_to / 1000) + 0.1;

      return { start, end };
  };

  const ensureAudioReady = async (targetTime: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = targetTime;

      if (audio.seeking) {
          await new Promise<void>(resolve => {
              const onSeeked = () => {
                  audio.removeEventListener('seeked', onSeeked);
                  resolve();
              };
              audio.addEventListener('seeked', onSeeked);
          });
      }

      if (audio.readyState < 3) {
          setIsBuffering(true);
          await new Promise<void>(resolve => {
              const onCanPlay = () => {
                  audio.removeEventListener('canplay', onCanPlay);
                  resolve();
              };
              audio.addEventListener('canplay', onCanPlay);
          });
          setIsBuffering(false);
      }
  };

  const togglePlay = async () => {
      if (!audioRef.current || !verses.length) {
          console.warn("Cannot play: Missing audio ref or verses");
          return;
      }
      const timing = getRangeTiming();
      if (!timing) {
          console.warn("Cannot play: Missing timing");
          return;
      }

      if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
      }

      if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
      } else {
          const currentT = audioRef.current.currentTime;
          // If out of bounds or at the very end, reset to start
          if (currentT < timing.start || currentT >= timing.end - 0.1) {
              await ensureAudioReady(timing.start);
          }

          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (e) { console.error("Play failed", e); }
      }
  };

  const startExport = async () => {
    if (!canvasRef.current || !streamDestinationRef.current || !audioRef.current || !verses.length) return;

    const timing = getRangeTiming();
    if (!timing) return;

    // Reset State
    audioRef.current.pause();
    setIsPlaying(false);
    setIsExporting(true);
    setDownloadUrl(null);
    setCurrentVerseIndex(0);
    chunksRef.current = [];

    // Ensure Audio Context is active
    if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    // Set start time
    await ensureAudioReady(timing.start);

    // Prepare streams
    // Wait for one animation frame to ensure canvas is drawn
    await new Promise(r => requestAnimationFrame(r));

    // Capture Canvas Stream (30 FPS)
    const canvasStream = canvasRef.current.captureStream(30);
    const audioStream = streamDestinationRef.current.stream;

    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
    ]);

    // Setup Recorder
    const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 8000000
    });

    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsExporting(false);
        setIsPlaying(false);

        combinedStream.getTracks().forEach(track => track.stop());

        // Cleanup Audio Events
        if (audioRef.current) {
            audioRef.current.onplay = null;
            audioRef.current.pause();
            audioRef.current.currentTime = timing.start;
        }
        setCurrentVerseIndex(0);
    };

    mediaRecorderRef.current = recorder;

    // Critical Export Logic:
    // 1. Set onplay listener to start recorder immediately when audio plays
    // 2. Play audio
    audioRef.current.onplay = () => {
         // Start recording immediately
         if (recorder.state === 'inactive') {
             recorder.start();
         }
    };

    try {
        await audioRef.current.play();
        setIsPlaying(true);
    } catch (e) {
        console.error("Export play failed", e);
        if (recorder.state !== 'inactive') recorder.stop();
        setIsExporting(false);
    }
  };

  const checkTime = () => {
      if (!audioRef.current || verses.length === 0) return;

      const timing = getRangeTiming();
      if (!timing) return;

      const t = audioRef.current.currentTime;
      const t_ms = t * 1000;
      const duration = audioRef.current.duration || Infinity;

      // Update Verse Index
      const index = verses.findIndex(v => {
          if (!v.timing) return false;
          return t_ms >= v.timing.timestamp_from && t_ms < v.timing.timestamp_to;
      });

      if (index !== -1 && index !== currentVerseIndex) {
          setCurrentVerseIndex(index);
      }

      // Stop Logic
      const targetEnd = Math.min(timing.end, duration);
      const isFinished = t >= targetEnd || audioRef.current.ended || (duration > 0 && t >= duration - 0.05);

      if (isFinished) {
          if (isExporting && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
          } else if (isPlaying && !isExporting) {
              audioRef.current.pause();
              setIsPlaying(false);
              audioRef.current.currentTime = timing.start;
          }
      }
  };

  return {
    audioRef,
    isPlaying,
    isExporting,
    isBuffering,
    downloadUrl,
    setDownloadUrl,
    currentVerseIndex,
    setCurrentVerseIndex,
    togglePlay,
    startExport,
    checkTime
  };
}
