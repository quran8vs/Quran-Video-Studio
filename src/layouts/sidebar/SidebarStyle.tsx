import React from 'react';
import { Sparkles, Upload, Trash2, Subtitles, Type } from 'lucide-react';
import { VideoConfig } from '../../features/video-editor/types';
import ColorPicker from '../../shared/components/ColorPicker';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';

interface SidebarStyleProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

export default function SidebarStyle({ config, setConfig }: SidebarStyleProps) {

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  setConfig({
                      ...config,
                      backgroundImage: event.target.result as string,
                      backgroundType: 'image'
                  });
              }
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="space-y-4 pb-8">
            <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
            <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">Style</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
            {/* Quran Text Color - NEW */}
            <div className="flex items-center justify-between p-3 bg-[#1a1a1e] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-zinc-500">
                        <Type className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Quran Text</span>
                        <span className="text-[10px] text-zinc-500">Main Text Color</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                        <ColorPicker color={config.textColor} onChange={(c) => setConfig({...config, textColor: c})} />
                </div>
            </div>

            {/* Highlight */}
            <div className="flex items-center justify-between p-3 bg-[#1a1a1e] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${config.enableHighlight ? 'bg-studio-accent text-white' : 'bg-black/40 text-zinc-500'}`}>
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Active Word</span>
                        <span className="text-[10px] text-zinc-500">Highlight Color</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                        <ColorPicker color={config.highlightColor} onChange={(c) => setConfig({...config, highlightColor: c})} />
                        <ToggleSwitch
                        checked={config.enableHighlight}
                        onChange={() => setConfig({...config, enableHighlight: !config.enableHighlight})}
                        />
                </div>
            </div>

            {/* End of Ayah Color */}
            <div className="flex items-center justify-between p-3 bg-[#1a1a1e] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-zinc-500">
                        <div className="w-4 h-4 rounded-full border-2 border-current opacity-60" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">End of Ayah</span>
                        <span className="text-[10px] text-zinc-500">Symbol Color</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                        <ColorPicker color={config.verseNumberColor} onChange={(c) => setConfig({...config, verseNumberColor: c})} />
                </div>
            </div>

            {/* Background */}
            <div className="p-4 bg-[#1a1a1e] rounded-xl border border-white/5 space-y-4">
                <div className="flex bg-black/40 p-1 rounded-lg">
                    <button
                        onClick={() => setConfig({...config, backgroundType: 'color'})}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${config.backgroundType === 'color' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Solid Color
                    </button>
                    <button
                        onClick={() => setConfig({...config, backgroundType: 'image'})}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${config.backgroundType === 'image' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Image
                    </button>
                </div>

                {config.backgroundType === 'color' ? (
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Background Color</span>
                        <ColorPicker color={config.backgroundColor} onChange={(c) => setConfig({...config, backgroundColor: c})} />
                        </div>
                ) : (
                    <div className="space-y-4">
                            {config.backgroundImage ? (
                                <div className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/20">
                                    <img src={config.backgroundImage} className="w-full h-full object-cover opacity-80" alt="bg" />

                                    {/* Click to Replace - Full Overlay */}
                                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                                    <Upload className="w-8 h-8 text-white mb-1" />
                                    <span className="text-[10px] text-white font-bold uppercase tracking-wide">Change Image</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>

                                    {/* Remove Button - Top Right */}
                                    <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfig({...config, backgroundImage: null});
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-colors z-20 pointer-events-auto"
                                    title="Remove Image"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg hover:border-studio-accent/50 hover:bg-white/5 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-zinc-500 group-hover:text-studio-accent mb-2 transition-colors" />
                                    <p className="text-xs text-zinc-500 font-medium">Click to upload background</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            )}

                            {config.backgroundImage && (
                                <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                        <span>Horizontal Position</span>
                                        <span>{config.backgroundImageX}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={config.backgroundImageX}
                                        onChange={(e) => setConfig({...config, backgroundImageX: parseInt(e.target.value)})}
                                        className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                        <span>Vertical Position</span>
                                        <span>{config.backgroundImageY ?? 50}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={config.backgroundImageY ?? 50}
                                        onChange={(e) => setConfig({...config, backgroundImageY: parseInt(e.target.value)})}
                                        className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                        <span>Overlay Opacity</span>
                                        <span>{Math.round(config.backgroundImageOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={config.backgroundImageOpacity}
                                        onChange={(e) => setConfig({...config, backgroundImageOpacity: parseFloat(e.target.value)})}
                                        className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                </>
                            )}
                    </div>
                )}
            </div>

            {/* Subtitles */}
            <div className="p-4 bg-[#1a1a1e] rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${config.showTranslation ? 'bg-studio-accent text-white' : 'bg-black/40 text-zinc-500'}`}>
                            <Subtitles className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-white">Subtitles</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ColorPicker color={config.translationColor} onChange={(c) => setConfig({...config, translationColor: c})} />
                        <ToggleSwitch
                            checked={config.showTranslation}
                            onChange={() => setConfig({...config, showTranslation: !config.showTranslation})}
                        />
                    </div>
                </div>

                {config.showTranslation && (
                    <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                <span>Animation Mode</span>
                            </div>
                            <div className="flex bg-black/40 p-1 rounded-lg">
                                <button
                                    onClick={() => setConfig({...config, translationHighlightMode: 'karaoke'})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${config.translationHighlightMode === 'karaoke' ? 'bg-studio-accent text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Karaoke
                                </button>
                                <button
                                    onClick={() => setConfig({...config, translationHighlightMode: 'word'})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${config.translationHighlightMode === 'word' ? 'bg-studio-accent text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Word
                                </button>
                                <button
                                    onClick={() => setConfig({...config, translationHighlightMode: 'none'})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${config.translationHighlightMode === 'none' ? 'bg-studio-accent text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Normal
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                <span>Subtitle Size</span>
                                <span>{config.translationFontSize}px</span>
                            </div>
                            <input
                                type="range" min="20" max="80"
                                value={config.translationFontSize}
                                onChange={(e) => setConfig({...config, translationFontSize: parseInt(e.target.value)})}
                                className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                <span>Vertical Position</span>
                                <span>{config.translationY}%</span>
                            </div>
                            <input
                                type="range" min="10" max="95"
                                value={config.translationY}
                                onChange={(e) => setConfig({...config, translationY: parseInt(e.target.value)})}
                                className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}