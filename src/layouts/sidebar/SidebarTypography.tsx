import React from 'react';
import { VideoConfig } from '../../features/video-editor/types';
import { FONTS, ENGLISH_FONTS, AL_QADR_FONT } from '../../shared/constants';

interface SidebarTypographyProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  typoTab: 'quran' | 'translation';
  setTypoTab: (v: 'quran' | 'translation') => void;
}

export default function SidebarTypography({ config, setConfig, typoTab, setTypoTab }: SidebarTypographyProps) {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
                <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">Typography</h2>
            </div>
            <div className="flex bg-[#1a1a1e] rounded-lg p-0.5 border border-white/5">
                <button onClick={() => setTypoTab('quran')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${typoTab === 'quran' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>Quran</button>
                <button onClick={() => setTypoTab('translation')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${typoTab === 'translation' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>Sub</button>
            </div>
        </div>

        {typoTab === 'quran' ? (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    {FONTS.map(font => (
                        <button
                            key={font.name}
                            onClick={() => {
                                let updates = {};
                                if (font.family === 'v1') {
                                    updates = { fontSize: 105, quranTextY: 53, wordSpacing: 4 };
                                } else if (font.family === 'v2') {
                                    updates = { fontSize: 86, quranTextY: 52, wordSpacing: 4 };
                                } else if (font.family === 'v4') {
                                    // V4 Update: Matched to V2 settings as requested (Size 86, Y 52)
                                    updates = { fontSize: 86, quranTextY: 52, wordSpacing: 4 };
                                }
                                setConfig({...config, fontFamily: font.family, ...updates});
                            }}
                            className={`px-2 py-3 rounded-xl text-xs font-medium border transition-all ${config.fontFamily === font.family ? 'border-studio-accent bg-studio-accent/10 text-white' : 'border-white/5 bg-[#1a1a1e] text-zinc-400 hover:bg-white/5'}`}
                        >
                            {font.label}
                        </button>
                    ))}
                    {config.surahId === 97 && (
                        <button
                            onClick={() => setConfig({...config, fontFamily: AL_QADR_FONT.family})}
                            className={`px-2 py-3 rounded-xl text-xs font-medium border transition-all truncate ${config.fontFamily === AL_QADR_FONT.family ? 'border-studio-accent bg-studio-accent/10 text-white' : 'border-emerald-500/20 bg-emerald-900/10 text-emerald-400 hover:bg-emerald-900/20'}`}
                        >
                            {AL_QADR_FONT.label}
                        </button>
                    )}
                </div>

                <div className="p-3 bg-[#1a1a1e] border border-white/5 rounded-xl space-y-4">
                        <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Size</span>
                            <span>{config.fontSize}px</span>
                        </div>
                        <input
                            type="range" min="40" max="150"
                            value={config.fontSize}
                            onChange={(e) => setConfig({...config, fontSize: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                        </div>
                        <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Vertical Position</span>
                            <span>{config.quranTextY}%</span>
                        </div>
                        <input
                            type="range" min="10" max="90"
                            value={config.quranTextY}
                            onChange={(e) => setConfig({...config, quranTextY: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                        </div>
                        <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Spacing</span>
                            <span>{config.wordSpacing}px</span>
                        </div>
                        <input
                            type="range" min="-10" max="50"
                            value={config.wordSpacing}
                            onChange={(e) => setConfig({...config, wordSpacing: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                        </div>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    {ENGLISH_FONTS.slice(0, 6).map(font => (
                        <button
                            key={font.name}
                            onClick={() => setConfig({...config, translationFontFamily: font.family})}
                            className={`px-2 py-3 rounded-xl text-xs font-medium border transition-all truncate ${config.translationFontFamily === font.family ? 'border-studio-accent bg-studio-accent/10 text-white' : 'border-white/5 bg-[#1a1a1e] text-zinc-400 hover:bg-white/5'}`}
                        >
                            {font.label}
                        </button>
                    ))}
                </div>
                <div className="p-3 bg-[#1a1a1e] border border-white/5 rounded-xl space-y-4">
                        <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Size</span>
                            <span>{config.translationFontSize}px</span>
                        </div>
                        <input
                            type="range" min="20" max="80"
                            value={config.translationFontSize}
                            onChange={(e) => setConfig({...config, translationFontSize: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                        </div>
                        <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Position</span>
                            <span>{config.translationY}%</span>
                        </div>
                        <input
                            type="range" min="10" max="95"
                            value={config.translationY}
                            onChange={(e) => setConfig({...config, translationY: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                        </div>
                </div>
            </div>
        )}
    </div>
  );
}