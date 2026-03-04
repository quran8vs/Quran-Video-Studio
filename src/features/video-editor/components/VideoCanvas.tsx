import React, { useEffect, useRef } from 'react';
import { VideoConfig } from '../types';
import { VerseData } from '../../quran/types';
import { CANVAS_SIZES } from '../../../shared/constants';
import { useFontLoader } from '../hooks/useFontLoader';
import { useAssetLoader } from '../hooks/useAssetLoader';
import { renderStreamMode, renderSingleMode, renderPageMode, StreamWordLayout } from '../utils/render-strategies';

interface VideoCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  config: VideoConfig;
  verses: VerseData[];
  currentVerseIndex: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  checkTime: () => void;
  isLoading: boolean;
  isExporting: boolean;
  loadingProgress: string;
}

export default function VideoCanvas({
  canvasRef, config, verses, currentVerseIndex,
  audioRef, checkTime, isLoading, isExporting, loadingProgress
}: VideoCanvasProps) {

  const { bismillahImgRef, bgImageRef } = useAssetLoader(config);
  const { fontsLoaded } = useFontLoader(config, verses);

  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const cameraOffsetRef = useRef(0);
  const streamLayoutRef = useRef<{ words: StreamWordLayout[]; configSig: string; } | null>(null);

  useEffect(() => {
    if (!scratchCanvasRef.current) {
        scratchCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  const renderFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    checkTime();

    // 1. Clear & Background
    if (config.backgroundType === 'image' && bgImageRef.current) {
        const img = bgImageRef.current;
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const posX = config.backgroundImageX ?? 50;
        const x = (canvas.width - scaledWidth) * (posX / 100);

        const posY = config.backgroundImageY ?? 50;
        const y = (canvas.height - scaledHeight) * (posY / 100);

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        ctx.fillStyle = `rgba(0,0,0,${config.backgroundImageOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    } else {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const activeVerse = verses[currentVerseIndex];
    const currentTimeMs = (audioRef.current?.currentTime || 0) * 1000;
    const centerX = canvas.width / 2;

    if (config.showSurahHeader) {
        const headerY = canvas.height * (config.surahHeaderY / 100);
        const headerSize = canvas.width * (config.surahHeaderSize / 100);
        ctx.direction = 'ltr';
        ctx.font = `normal ${headerSize}px SurahNames, serif`;
        ctx.fillStyle = config.surahHeaderColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const surahGlyph = `s${String(config.surahId).padStart(3, '0')}`;
        ctx.fillText(surahGlyph, centerX, headerY);
    }

    if (config.showBismillah && config.surahId !== 9 && bismillahImgRef.current) {
        const bismY = canvas.height * (config.bismillahY / 100);
        const bismWidth = canvas.width * (config.bismillahSize / 100);
        const ratio = bismillahImgRef.current.height / bismillahImgRef.current.width;
        const bismHeight = bismWidth * ratio;
        ctx.drawImage(bismillahImgRef.current, centerX - (bismWidth / 2), bismY, bismWidth, bismHeight);
    }

    let displayedTranslation = activeVerse?.translation || "";
    let translationStart = activeVerse?.timing?.timestamp_from;
    let translationEnd = activeVerse?.timing?.timestamp_to;

    if (verses.length > 0 && fontsLoaded) {
        const renderContext = {
            ctx, canvas, config, verses, activeVerse, currentTimeMs,
            streamLayoutRef, cameraOffsetRef, scratchCanvasRef
        };

        let result: any = null;
        const currentHighlightMode = config.translationHighlightMode;

        if (config.visualizationMode === 'stream') {
            result = renderStreamMode(renderContext);
        } else if (config.visualizationMode === 'page_v2') {
            result = renderSingleMode(renderContext);
        } else {
            result = renderPageMode(renderContext);
        }

        // Handle object return from all render modes
        if (result && typeof result === 'object' && 'text' in result) {
            displayedTranslation = result.text;
            if (result.start !== undefined) translationStart = result.start;
            if (result.end !== undefined) translationEnd = result.end;
        } else if (typeof result === 'string') {
            displayedTranslation = result;
        }

        if (config.showTranslation && displayedTranslation) {
            ctx.direction = 'ltr'; ctx.textAlign = 'center';
            
            // Apply Editorial Style for Page Mode Subtitles
            const isPageMode = config.visualizationMode === 'page';
            const finalTranslation = isPageMode ? displayedTranslation.toUpperCase() : displayedTranslation;
            const finalFont = isPageMode ? `italic 600 ${config.translationFontSize}px serif` : `bold ${config.translationFontSize}px "${config.translationFontFamily}"`;
            
            ctx.font = finalFont;
            ctx.shadowBlur = 0;
            
            const transWords = finalTranslation.split(' ');
            let transLine = ''; const transLines = [];
            const transMaxWidth = canvas.width * 0.85;
            const transLineHeight = config.translationFontSize * 1.4;
            
            for(let n = 0; n < transWords.length; n++) {
                const testLine = transLine + transWords[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > transMaxWidth && n > 0) { transLines.push(transLine); transLine = transWords[n] + ' '; }
                else { transLine = testLine; }
            }
            transLines.push(transLine);
            
            const transStartY = canvas.height * (config.translationY / 100);
            
            // Calculate Progress for Karaoke Effect
            let progress = 0;
            if (translationStart !== undefined && translationEnd !== undefined) {
                const duration = translationEnd - translationStart;
                if (duration > 0) {
                    progress = Math.max(0, Math.min(1, (currentTimeMs - translationStart) / duration));
                }
            } else {
                progress = 1;
            }

            const totalChars = transLines.reduce((acc, line) => acc + line.length, 0);
            const highlightCharIndex = Math.floor(totalChars * progress);
            
            let charCount = 0;
            transLines.forEach((l, i) => { 
                const y = transStartY + (i * transLineHeight);
                
                // 1. Draw Base Text
                if (currentHighlightMode === 'none') {
                    ctx.fillStyle = config.translationColor;
                    ctx.globalAlpha = 1.0;
                    ctx.fillText(l, centerX, y);
                } else {
                    // Dimmed base for highlight modes
                    ctx.fillStyle = config.translationColor;
                    ctx.globalAlpha = 0.4;
                    ctx.fillText(l, centerX, y);
                    ctx.globalAlpha = 1.0;
                    
                    // 2. Draw Highlighted Text Overlay
                    if (currentHighlightMode === 'karaoke' || currentHighlightMode === 'word') {
                         const lineStart = charCount;
                         const lineEnd = charCount + l.length;
                         
                         if (highlightCharIndex > lineStart) {
                             ctx.fillStyle = config.translationHighlightColor;
                             
                             if (highlightCharIndex >= lineEnd) {
                                 // Full line highlighted
                                 ctx.fillText(l, centerX, y);
                             } else {
                                 // Partial line highlighted
                                 const splitIndex = highlightCharIndex - lineStart;
                                 
                                 // Word-aware splitting for better "word by word" feel
                                 let actualSplitIndex = splitIndex;
                                 if (currentHighlightMode === 'word') {
                                     // Find the end of the current word
                                     const nextSpace = l.indexOf(' ', splitIndex);
                                     if (nextSpace !== -1) {
                                         actualSplitIndex = nextSpace;
                                     } else {
                                         actualSplitIndex = l.length;
                                     }
                                 }

                                 const highlightPart = l.substring(0, actualSplitIndex);
                                 
                                 // Calculate x-offset for centered text
                                 const lineWidth = ctx.measureText(l).width;
                                 const xStart = centerX - (lineWidth / 2);
                                 
                                 ctx.textAlign = 'left';
                                 ctx.fillText(highlightPart, xStart, y);
                                 ctx.textAlign = 'center'; // Restore
                             }
                         }
                    }
                }
                charCount += l.length;
            });
        }
    }
  };

  useEffect(() => {
    let running = true;
    const loop = () => {
        if (!running) return;
        renderFrame();
        animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
        running = false;
        cancelAnimationFrame(animationFrameRef.current);
    }
  });

  return (
    <div className="relative shadow-2xl rounded-2xl overflow-hidden border-2 border-studio-border ring-1 ring-white/5 bg-studio-bg group transition-colors duration-300">
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZES[config.aspectRatio].width}
            height={CANVAS_SIZES[config.aspectRatio].height}
            className="max-h-[75vh] max-w-full w-auto object-contain bg-studio-bg"
            style={{
                aspectRatio: config.aspectRatio.replace(':', '/'),
                fontPalette: config.fontPalette
            }}
        />
        {(isLoading || (!fontsLoaded && verses.length > 0)) && (
            <div dir="ltr" className="absolute inset-0 bg-studio-bg/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="animate-spin text-studio-accent">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-studio-text font-medium text-lg">{!fontsLoaded ? "Loading Fonts..." : "Loading Resources"}</span>
                    <span className="text-studio-textMuted text-sm">{loadingProgress}</span>
                </div>
            </div>
        )}
        {isExporting && (
            <div dir="ltr" className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-50">
                <div className="relative">
                <div className="w-20 h-20 border-4 border-studio-border border-t-studio-accent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-bold text-white">{verses.length > 0 ? Math.round(((currentVerseIndex + 1) / verses.length) * 100) : 0}%</span></div>
                </div>
                <div className="text-center"><h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Rendering Video</h3><p className="text-sm text-studio-textMuted">Rendering Verse {currentVerseIndex + 1} of {verses.length}</p></div>
            </div>
        )}
    </div>
  );
}
