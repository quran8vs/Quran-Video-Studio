import { useRef, useEffect, useState } from 'react';
import { VideoConfig } from '../types';
import { VerseData } from '../../quran/types';
import { FONTS, FONT_BASE_URLS, AL_QADR_FONT } from '../../../shared/constants';

export const useFontLoader = (config: VideoConfig, verses: VerseData[]) => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const loadedFontsCache = useRef<Set<string>>(new Set());

    // Load Header Font (SurahNames)
    useEffect(() => {
        const fontUrl = "/fonts/surah_names_v2.woff";
        const font = new FontFace('SurahNames', `url("${fontUrl}")`);
        font.load().then((f) => document.fonts.add(f)).catch(console.error);
    }, []);

    // --- DYNAMIC FONT LOADING (V1, V2, V4, Qadr) ---
    useEffect(() => {
        const loadPageFonts = async () => {
            let fontType = 'v2';

            // Check for Special Al-Qadr Font First
            if (config.fontFamily === AL_QADR_FONT.family) {
                fontType = AL_QADR_FONT.type;
            } else {
                const selectedFont = FONTS.find(f => f.family === config.fontFamily);
                fontType = selectedFont?.type || 'v2';
            }

            // Special loading logic for Al-Qadr Font
            if (fontType === 'qadr') {
                 if (loadedFontsCache.current.has(AL_QADR_FONT.family)) {
                     setFontsLoaded(true);
                     return;
                 }
                 try {
                    // Direct font file loading
                    const font = new FontFace(AL_QADR_FONT.family, `url("/fonts/surah_al_qadr.woff2")`);
                    await font.load();
                    document.fonts.add(font);
                    loadedFontsCache.current.add(AL_QADR_FONT.family);
                    console.log(`Loaded Special Font: ${AL_QADR_FONT.family}`);
                 } catch (e) {
                    console.error("Failed to load Al-Qadr font", e);
                 }
                 setFontsLoaded(true);
                 return;
            }

            if (verses.length > 0) {
                setFontsLoaded(false);
                const uniquePages = new Set<number>();
                verses.forEach(v => v.words.forEach(w => {
                    if(w.page_number) uniquePages.add(w.page_number);
                }));

                // --- V4 PALETTE & OVERRIDE LOGIC ---
                // We create a global style that defines the palettes.
                // We include `override-colors: 0 ${config.textColor}` to allow custom coloring.
                if (fontType === 'v4') {
                    const familyNames = Array.from(uniquePages).map(p => `"quran-v4-p${p}"`);
                    const styleId = 'quran-v4-global-palettes';
                    let style = document.getElementById(styleId) as HTMLStyleElement;
                    if (!style) {
                        style = document.createElement('style');
                        style.id = styleId;
                        document.head.appendChild(style);
                    }

                    // Note: Index 0 is typically the main body text in QPC V4
                    // We override it with the user's selected textColor
                    style.innerHTML = `
                        @font-palette-values --Dark {
                            font-family: ${familyNames.join(', ')};
                            base-palette: 1;
                            override-colors: 0 ${config.textColor};
                        }
                        @font-palette-values --Sepia {
                            font-family: ${familyNames.join(', ')};
                            base-palette: 2;
                            override-colors: 0 ${config.textColor};
                        }
                        @font-palette-values normal {
                            font-family: ${familyNames.join(', ')};
                            base-palette: 0;
                            override-colors: 0 ${config.textColor};
                        }
                    `;
                }

                const promises = Array.from(uniquePages).map(async (page) => {
                    const fontFamilyName = `quran-${fontType}-p${page}`;

                    // Cache check
                    if (loadedFontsCache.current.has(fontFamilyName)) return;

                    const baseUrls = FONT_BASE_URLS[fontType as keyof typeof FONT_BASE_URLS];
                    
                    let loaded = false;
                    for (const baseUrl of baseUrls) {
                        if (loaded) break;
                        const targetUrl = `${baseUrl}${page}.woff2`;
                        try {
                            // Fetch with no-referrer to avoid CORS/Hotlink protection issues
                            const response = await fetch(targetUrl, {
                                referrerPolicy: 'no-referrer'
                            });
                            if (!response.ok) throw new Error(`HTTP ${response.status}`);
                            
                            const buffer = await response.arrayBuffer();
                            const font = new FontFace(fontFamilyName, buffer);
                            await font.load();
                            document.fonts.add(font);
                            
                            loadedFontsCache.current.add(fontFamilyName);
                            console.log(`Loaded Font: ${fontFamilyName} from ${baseUrl}`);
                            loaded = true;
                        } catch (e) {
                            console.warn(`Failed to load font ${fontFamilyName} from ${baseUrl}`, e);
                        }
                    }

                    if (!loaded) {
                        console.error(`All fallbacks failed for font ${fontFamilyName}`);
                    }
                });

                await Promise.all(promises);
                setFontsLoaded(true);
            } else {
                setFontsLoaded(true);
            }
        };

        loadPageFonts();
    }, [config.fontFamily, verses, config.textColor]);

    return { fontsLoaded };
};
