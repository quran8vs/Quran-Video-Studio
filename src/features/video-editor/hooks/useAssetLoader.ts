import { useRef, useEffect } from 'react';
import { VideoConfig } from '../types';

export const useAssetLoader = (config: VideoConfig) => {
    const bismillahImgRef = useRef<HTMLImageElement | null>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);

    // Load Bismillah Image
    useEffect(() => {
        // Use dynamic bismillah color
        fetch('/bismillah_arabic.svg')
            .then(res => res.text())
            .then(svgContent => {
                const svgStr = svgContent.replace(/currentColor/g, config.bismillahColor);
                const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    bismillahImgRef.current = img;
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            })
            .catch(err => console.error("Failed to load bismillah svg", err));
    }, [config.bismillahColor]);

    // Load Background Image
    useEffect(() => {
        if (config.backgroundType === 'image' && config.backgroundImage) {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Enable CORS for canvas export
            img.src = config.backgroundImage;
            img.onload = () => { bgImageRef.current = img; };
        } else {
            bgImageRef.current = null;
        }
    }, [config.backgroundImage, config.backgroundType]);

    return { bismillahImgRef, bgImageRef };
};
