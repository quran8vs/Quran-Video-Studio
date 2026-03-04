import { VideoConfig } from '../types';
import { AL_QADR_FONT, FONTS } from '../../../shared/constants';

// Smooth interpolation for the camera movement
export const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
};

// Helper to draw text via scratch canvas for compositing (V4 coloring fix)
export const drawCompositedText = (
    ctx: CanvasRenderingContext2D,
    scratch: HTMLCanvasElement | null,
    text: string,
    font: string,
    x: number, // Center X
    y: number, // Center Y (Middle Baseline)
    color: string,
    width: number,
    fontSize: number
) => {
    if (!scratch) return;

    const padding = fontSize;
    const w = width + (padding * 2);
    const h = fontSize * 2.5; // generous height

    // Grow scratch canvas if needed
    if (scratch.width < w) scratch.width = w;
    if (scratch.height < h) scratch.height = h;

    const sCtx = scratch.getContext('2d');
    if (!sCtx) return;

    // Clear scratch
    sCtx.clearRect(0, 0, w, h);

    // 1. Draw base text centered
    sCtx.font = font;
    sCtx.textBaseline = 'middle';
    sCtx.textAlign = 'center';
    sCtx.fillStyle = '#000'; // Draw opaque base
    sCtx.fillText(text, w / 2, h / 2);

    // 2. Tint using source-in
    sCtx.globalCompositeOperation = 'source-in';
    sCtx.fillStyle = color;
    sCtx.fillRect(0, 0, w, h);

    // Reset
    sCtx.globalCompositeOperation = 'source-over';

    // 3. Draw back
    ctx.drawImage(scratch, 0, 0, w, h, x - (w / 2), y - (h / 2), w, h);
};

export const getFontType = (config: VideoConfig) => {
    if (config.fontFamily === AL_QADR_FONT.family) {
        return AL_QADR_FONT.type;
    }
    const selectedFont = FONTS.find(f => f.family === config.fontFamily);
    return selectedFont?.type || 'v2';
};

export const getWordDisplay = (word: any, fontType: string) => {
    let displayWord = word.text_uthmani;
    if (fontType === 'v1' && word.code_v1) displayWord = word.code_v1;
    else if (fontType === 'qadr' && word.code_v1) displayWord = word.code_v1;
    else if ((fontType === 'v2' || fontType === 'v4') && word.code_v2) displayWord = word.code_v2;
    return displayWord;
};

export const getWordFont = (word: any, fontType: string, config: VideoConfig) => {
    if (fontType === 'qadr') return `normal ${config.fontSize}px "${AL_QADR_FONT.family}"`;
    if (word.page_number) return `normal ${config.fontSize}px "quran-${fontType}-p${word.page_number}"`;
    return `bold ${config.fontSize}px "${config.fontFamily}"`;
};
