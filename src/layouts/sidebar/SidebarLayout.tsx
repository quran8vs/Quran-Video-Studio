import React from 'react';
import { VideoConfig } from '../../features/video-editor/types';
import { ToggleSwitch } from '../../shared/components/ToggleSwitch';
import ColorPicker from '../../shared/components/ColorPicker';

interface SidebarLayoutProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

export default function SidebarLayout({ config, setConfig }: SidebarLayoutProps) {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
            <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">Layout Elements</h2>
        </div>

        {/* Surah Header Card */}
        <div className="p-4 bg-[#1a1a1e] rounded-xl border border-white/5 space-y-4 transition-all">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Surah Header</span>
                <ToggleSwitch
                    checked={config.showSurahHeader}
                    onChange={() => setConfig({...config, showSurahHeader: !config.showSurahHeader})}
                />
            </div>

            {config.showSurahHeader && (
                <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                    {/* Color Picker */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Color</span>
                        <ColorPicker 
                            color={config.surahHeaderColor} 
                            onChange={(c) => setConfig({...config, surahHeaderColor: c})} 
                        />
                    </div>

                        <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                            <span>Vertical Position</span>
                            <span>{config.surahHeaderY}%</span>
                        </div>
                        <input
                            type="range" min="5" max="50"
                            value={config.surahHeaderY}
                            onChange={(e) => setConfig({...config, surahHeaderY: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                            <span>Size</span>
                            <span>{config.surahHeaderSize}%</span>
                        </div>
                        <input
                            type="range" min="10" max="40"
                            value={config.surahHeaderSize}
                            onChange={(e) => setConfig({...config, surahHeaderSize: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Bismillah Card */}
        <div className="p-4 bg-[#1a1a1e] rounded-xl border border-white/5 space-y-4 transition-all">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Bismillah</span>
                <ToggleSwitch
                    checked={config.showBismillah}
                    onChange={() => setConfig({...config, showBismillah: !config.showBismillah})}
                />
            </div>

            {config.showBismillah && (
                <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                    {/* Color Picker */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Color</span>
                        <ColorPicker 
                            color={config.bismillahColor} 
                            onChange={(c) => setConfig({...config, bismillahColor: c})} 
                        />
                    </div>

                        <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                            <span>Vertical Position</span>
                            <span>{config.bismillahY}%</span>
                        </div>
                        <input
                            type="range" min="5" max="60"
                            value={config.bismillahY}
                            onChange={(e) => setConfig({...config, bismillahY: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                        <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                            <span>Size</span>
                            <span>{config.bismillahSize}%</span>
                        </div>
                        <input
                            type="range" min="20" max="80"
                            value={config.bismillahSize}
                            onChange={(e) => setConfig({...config, bismillahSize: parseInt(e.target.value)})}
                            className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}