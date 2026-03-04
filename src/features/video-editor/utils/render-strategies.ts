import { VideoConfig } from '../types';
import { VerseData } from '../../quran/types';
import { drawCompositedText, getFontType, getWordDisplay, getWordFont, lerp } from './drawing-utils';

export interface StreamPart {
    text: string;
    font: string;
    width: number;
    type: 'text' | 'end';
}

export interface StreamWordLayout {
    parts: StreamPart[];
    totalWidth: number;
    x: number;
    verseIndex: number;
    wordIndex: number;
    startTime: number;
    endTime: number;
}

interface RenderContext {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    config: VideoConfig;
    verses: VerseData[];
    activeVerse: VerseData | undefined;
    currentTimeMs: number;
    streamLayoutRef: React.MutableRefObject<{ words: StreamWordLayout[]; configSig: string; } | null>;
    cameraOffsetRef: React.MutableRefObject<number>;
    scratchCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

export const renderStreamMode = ({
    ctx, canvas, config, verses, activeVerse, currentTimeMs,
    streamLayoutRef, cameraOffsetRef, scratchCanvasRef
}: RenderContext) => {
    const fontType = getFontType(config);
    const streamCenterY = canvas.height * (config.quranTextY / 100);
    const globalWordSpacing = config.wordSpacing;
    const wordSpacing = (config.fontSize * 0.5) + globalWordSpacing;
    const configSig = `${config.surahId}-${config.verseStart}-${config.fontFamily}-${config.fontSize}-${config.wordSpacing}-${verses.length}`;

    if (!streamLayoutRef.current || streamLayoutRef.current.configSig !== configSig) {
        const layoutWords: StreamWordLayout[] = [];
        let currentCursorX = 0;
        verses.forEach((verse, vIdx) => {
            const sortedSegments = verse.timing?.segments || [];
            for (let i = 0; i < verse.words.length; i++) {
                const word = verse.words[i];
                if (word.char_type_name === 'end' && i > 0) continue;
                const parts: StreamPart[] = [];
                let totalWidth = 0;

                const displayWord = getWordDisplay(word, fontType);
                const fontStr = getWordFont(word, fontType, config);

                ctx.font = fontStr;
                const mainWidth = ctx.measureText(displayWord).width;
                parts.push({ text: displayWord, font: fontStr, width: mainWidth, type: 'text' });
                totalWidth += mainWidth;

                const nextWord = verse.words[i + 1];
                if (nextWord && nextWord.char_type_name === 'end') {
                    const markerDisplay = getWordDisplay(nextWord, fontType);
                    const markerFont = getWordFont(nextWord, fontType, config);

                    ctx.font = markerFont;
                    const markerWidth = ctx.measureText(markerDisplay).width;
                    parts.push({ text: markerDisplay, font: markerFont, width: markerWidth, type: 'end' });
                    totalWidth += (10 + markerWidth);
                }

                let start = 0, end = 0;
                const segment = sortedSegments.find(s => s[0] === word.position);
                if (segment) { start = segment[1]; end = segment[2]; }
                else { const prev = layoutWords[layoutWords.length - 1]; if (prev) { start = prev.endTime; end = prev.endTime + 500; } }
                if (parts.length > 1) {
                    const nextVerse = verses[vIdx + 1];
                    if (nextVerse && nextVerse.timing && nextVerse.timing.segments.length > 0) {
                        const nextStart = nextVerse.timing.segments[0][1];
                        if (nextStart > end) end = nextStart;
                    } else { end += 1500; }
                }
                const centerPos = currentCursorX - (totalWidth / 2);
                layoutWords.push({ parts, totalWidth, x: centerPos, verseIndex: vIdx, wordIndex: i, startTime: start, endTime: end });
                currentCursorX -= (totalWidth + wordSpacing);
            }
        });
        streamLayoutRef.current = { words: layoutWords, configSig };
    }

    const allWords = streamLayoutRef.current.words;
    let activeLayoutIndex = 0;
    const foundIndex = allWords.findIndex(w => currentTimeMs >= w.startTime && currentTimeMs < w.endTime);
    if (foundIndex !== -1) activeLayoutIndex = foundIndex;
    else {
        let minDiff = Infinity;
        allWords.forEach((w, idx) => {
            const diff = Math.min(Math.abs(currentTimeMs - w.startTime), Math.abs(currentTimeMs - w.endTime));
            if (diff < minDiff) { minDiff = diff; activeLayoutIndex = idx; }
        });
    }

    const activeWord = allWords[activeLayoutIndex];
    if (activeWord) {
        const targetOffset = (canvas.width / 2) - activeWord.x;
        if (Math.abs(targetOffset - cameraOffsetRef.current) > 2000) cameraOffsetRef.current = targetOffset;
        else cameraOffsetRef.current = lerp(cameraOffsetRef.current, targetOffset, 0.08);
    }

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    allWords.forEach((layout, i) => {
        const screenX = layout.x + cameraOffsetRef.current;
        if (screenX < -200 || screenX > canvas.width + 200) return;
        const distFromCenter = Math.abs(screenX - (canvas.width / 2));
        const visibleThreshold = canvas.width * 0.40;
        const fadeStart = config.fontSize * 1.5;
        let opacity = 1;
        if (distFromCenter > fadeStart) opacity = 1 - ((distFromCenter - fadeStart) / (visibleThreshold - fadeStart));
        opacity = Math.max(0, Math.min(1, opacity));

        if (opacity > 0.01) {
            ctx.globalAlpha = opacity;
            const isActive = (i === activeLayoutIndex);

            if (isActive) {
                ctx.save();
                ctx.translate(screenX, streamCenterY);
                ctx.scale(1.15, 1.15);
                let currentPartX = layout.totalWidth / 2;

                layout.parts.forEach(part => {
                    ctx.font = part.font;
                    const isHighlight = isActive && config.enableHighlight && part.type === 'text';

                    if (isHighlight) {
                        ctx.shadowColor = config.highlightColor;
                        ctx.shadowBlur = 20;
                        if (fontType === 'v4') {
                            const partCenterX = currentPartX - (part.width / 2);
                            drawCompositedText(ctx, scratchCanvasRef.current, part.text, part.font, partCenterX, 0, config.highlightColor, part.width, config.fontSize);
                        } else {
                            ctx.fillStyle = config.highlightColor;
                            ctx.textAlign = 'right';
                            ctx.fillText(part.text, currentPartX, 0);
                        }
                    } else {
                        ctx.shadowBlur = 0;
                        if (part.type === 'end') ctx.fillStyle = config.verseNumberColor;
                        else ctx.fillStyle = config.textColor;
                        ctx.textAlign = 'right';
                        ctx.fillText(part.text, currentPartX, 0);
                    }
                    const spacing = (part.type === 'end') ? 0 : 10;
                    currentPartX -= (part.width + spacing);
                });
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(screenX, streamCenterY);
                let currentPartX = layout.totalWidth / 2;
                layout.parts.forEach(part => {
                    ctx.font = part.font;
                    ctx.shadowBlur = 0;
                    if (part.type === 'end') ctx.fillStyle = config.verseNumberColor;
                    else ctx.fillStyle = config.textColor;
                    ctx.textAlign = 'right';
                    ctx.fillText(part.text, currentPartX, 0);
                    const spacing = (part.type === 'end') ? 0 : 10;
                    currentPartX -= (part.width + spacing);
                });
                ctx.restore();
            }
        }
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Return active word translation for "word by word" subtitles in stream mode
    if (activeWord) {
        const wordObj = verses[activeWord.verseIndex].words[activeWord.wordIndex];
        const wordTranslation = wordObj.translation?.text;
        
        if (wordTranslation) {
            return {
                text: wordTranslation,
                start: activeWord.startTime,
                end: activeWord.endTime
            };
        }
    }
    
    // Fallback to verse translation if no active word or no word translation
    return {
        text: activeVerse?.translation || "",
        start: activeVerse?.timing?.timestamp_from,
        end: activeVerse?.timing?.timestamp_to
    };
};

export const renderSingleMode = ({
    ctx, canvas, config, activeVerse, currentTimeMs, scratchCanvasRef
}: RenderContext) => {
    const fontType = getFontType(config);
    const contentAreaCenterY = canvas.height * (config.quranTextY / 100);
    const globalWordSpacing = config.wordSpacing;
    const WORDS_PER_LINE = 4;
    const words = activeVerse ? activeVerse.words : [];
    const chunks: any[][] = [];
    let currentChunk: any[] = [];
    words.forEach((word, index) => {
        const isEnd = word.char_type_name === 'end';
        currentChunk.push(word);
        const nextWord = words[index + 1];
        const nextIsEnd = nextWord && nextWord.char_type_name === 'end';
        if ((currentChunk.length >= WORDS_PER_LINE && !nextIsEnd) || isEnd || index === words.length - 1) {
            chunks.push(currentChunk);
            currentChunk = [];
        }
    });
    let activeChunkIndex = 0;
    let activeWordPosition = -1;
    if (activeVerse?.timing?.segments && activeVerse.timing.segments.length > 0) {
        const segments = activeVerse.timing.segments;
        const activeSegment = segments.find(s => currentTimeMs >= s[1] && currentTimeMs < s[2]);
        if (activeSegment) activeWordPosition = activeSegment[0];
        else {
            const lastSegment = segments[segments.length - 1];
            if (currentTimeMs >= lastSegment[2]) activeWordPosition = lastSegment[0];
            else if (currentTimeMs < segments[0][1]) activeWordPosition = segments[0][0];
            else { const prevSegment = [...segments].sort((a, b) => b[2] - a[2]).find(s => s[2] <= currentTimeMs); if (prevSegment) activeWordPosition = prevSegment[0]; }
        }
    }
    chunks.forEach((chunk, cIdx) => { if (chunk.some(w => w.position === activeWordPosition)) activeChunkIndex = cIdx; });
    if (activeVerse?.timing?.segments?.length) {
        const segments = activeVerse.timing.segments;
        const lastSegment = segments[segments.length - 1];
        if (currentTimeMs >= lastSegment[2]) activeChunkIndex = chunks.length - 1;
    }
    const chunkToRender = chunks[activeChunkIndex] || chunks[0] || [];

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';

    const measuredWords = chunkToRender.map(word => {
        const displayWord = getWordDisplay(word, fontType);
        const fontStr = getWordFont(word, fontType, config);
        ctx.font = fontStr;
        return { ...word, displayWord, font: fontStr, width: ctx.measureText(displayWord).width };
    });

    const totalWidth = measuredWords.reduce((acc, w, i) => acc + w.width + (i < measuredWords.length - 1 ? globalWordSpacing : 0), 0);
    let currentX = (canvas.width / 2) + (totalWidth / 2);

    measuredWords.forEach(word => {
        ctx.font = word.font;
        let isActive = false;
        if (config.enableHighlight && activeVerse?.timing?.segments) {
            const segment = activeVerse.timing.segments.find(s => s[0] === word.position);
            if (segment) { const [_, start, end] = segment; if (currentTimeMs >= start && currentTimeMs < end) isActive = true; }
        }

        if (isActive) {
            ctx.shadowColor = config.highlightColor;
            ctx.shadowBlur = 15;

            if (fontType === 'v4') {
                const partCenterX = currentX - (word.width / 2);
                drawCompositedText(ctx, scratchCanvasRef.current, word.displayWord, word.font, partCenterX, contentAreaCenterY, config.highlightColor, word.width, config.fontSize);
            } else {
                ctx.fillStyle = config.highlightColor;
                ctx.textAlign = 'right';
                ctx.fillText(word.displayWord, currentX, contentAreaCenterY);
            }
        } else {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            if (word.char_type_name === 'end') ctx.fillStyle = config.verseNumberColor;
            else ctx.fillStyle = config.textColor;

            ctx.textAlign = 'right';
            ctx.fillText(word.displayWord, currentX, contentAreaCenterY);
        }

        currentX -= (word.width + globalWordSpacing);
        ctx.shadowBlur = 0;
    });

    return {
        text: chunkToRender.filter(w => w.char_type_name === 'word').map(w => w.translation?.text).filter(Boolean).join(' '),
        start: chunkToRender.length > 0 && activeVerse?.timing?.segments ? 
            activeVerse.timing.segments.find(s => s[0] === chunkToRender[0].position)?.[1] : undefined,
        end: chunkToRender.length > 0 && activeVerse?.timing?.segments ? 
            activeVerse.timing.segments.find(s => s[0] === chunkToRender[chunkToRender.length - 1].position)?.[2] : undefined
    };
};

export const renderPageMode = ({
    ctx, canvas, config, activeVerse, currentTimeMs, scratchCanvasRef
}: RenderContext) => {
    const fontType = getFontType(config);
    const currentVerseWords = activeVerse ? activeVerse.words : [];
    const contentAreaCenterY = canvas.height * (config.quranTextY / 100);
    const textStartY = contentAreaCenterY;
    const globalWordSpacing = config.wordSpacing;

    ctx.font = `bold ${config.fontSize}px "${config.fontFamily}"`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    const lines: { words: any[], yOffset: number }[] = [];
    let currentLineWords: any[] = [];
    const maxWidth = canvas.width * 0.8;
    const lineHeight = config.fontSize * 1.6;

    for (let i = 0; i < currentVerseWords.length; i++) {
        const word = currentVerseWords[i];
        const displayWord = getWordDisplay(word, fontType);
        const fontStr = getWordFont(word, fontType, config);

        ctx.font = fontStr;
        const metrics = ctx.measureText(displayWord + " ");
        const effectiveWidth = metrics.width + globalWordSpacing;
        const currentLineWidth = currentLineWords.reduce((acc, w) => acc + w.effectiveWidth, 0);
        if (currentLineWidth + effectiveWidth > maxWidth && i > 0) {
            lines.push({ words: currentLineWords, yOffset: 0 });
            currentLineWords = [{ ...word, displayWord, width: metrics.width, effectiveWidth, font: fontStr }];
        } else { currentLineWords.push({ ...word, displayWord, width: metrics.width, effectiveWidth, font: fontStr }); }
    }
    lines.push({ words: currentLineWords, yOffset: 0 });

    const totalTextHeight = lines.length * lineHeight;
    const startY = textStartY - (totalTextHeight / 2);
    const centerX = canvas.width / 2;

    lines.forEach((line, lineIndex) => {
        const y = startY + (lineIndex * lineHeight);
        const totalLineWidth = line.words.reduce((acc, w) => acc + w.effectiveWidth, 0);
        let currentX = centerX + (totalLineWidth / 2);

        line.words.forEach((word) => {
            ctx.font = word.font;
            let isActive = false;
            if (config.enableHighlight && activeVerse?.timing?.segments) {
                const segment = activeVerse.timing.segments.find(s => s[0] === word.position);
                if (segment) { const [_, start, end] = segment; if (currentTimeMs >= start && currentTimeMs < end) isActive = true; }
            }

            if (isActive) {
                ctx.shadowColor = config.highlightColor;
                ctx.shadowBlur = 15;

                if (fontType === 'v4') {
                    const partCenterX = currentX - (word.width / 2);
                    drawCompositedText(ctx, scratchCanvasRef.current, word.displayWord, word.font, partCenterX, y, config.highlightColor, word.width, config.fontSize);
                } else {
                    ctx.fillStyle = config.highlightColor;
                    ctx.textAlign = 'right';
                    ctx.fillText(word.displayWord, currentX, y);
                }
            } else {
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                if (word.char_type_name === 'end') ctx.fillStyle = config.verseNumberColor;
                else ctx.fillStyle = config.textColor;

                ctx.textAlign = 'right';
                ctx.fillText(word.displayWord, currentX, y);
            }
            currentX -= word.effectiveWidth;
            ctx.shadowBlur = 0;
        });
    });

    return {
        text: activeVerse?.translation || "",
        start: activeVerse?.timing?.timestamp_from,
        end: activeVerse?.timing?.timestamp_to
    };
};
