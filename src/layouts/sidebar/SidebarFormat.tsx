import React from 'react';
import {
  Smartphone, Square, Monitor,
  AlignLeft, Sun, Moon, BookOpen, ScrollText, Book
} from 'lucide-react';
import { VideoConfig } from '../../features/video-editor/types';

interface SidebarFormatProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

export default function SidebarFormat({ config, setConfig }: SidebarFormatProps) {

  const applyTheme = (mode: 'light' | 'dark' | 'sepia') => {
      const newConfig = { ...config };
      if (mode === 'dark') {
          newConfig.backgroundColor = '#1f2125';
          newConfig.textColor = '#e7e9ea';
          newConfig.highlightColor = '#2ca4ab';
          newConfig.verseNumberColor = '#ffffff';
          newConfig.surahHeaderColor = '#e7e9ea';
          newConfig.bismillahColor = '#e7e9ea';
          newConfig.fontPalette = '--Dark';
      } else if (mode === 'sepia') {
          newConfig.backgroundColor = '#f8ebd5';
          newConfig.textColor = '#463e34';
          newConfig.highlightColor = '#72603f';
          newConfig.verseNumberColor = '#72603f';
          newConfig.surahHeaderColor = '#463e34';
          newConfig.bismillahColor = '#463e34';
          newConfig.fontPalette = '--Sepia';
      } else {
          newConfig.backgroundColor = '#ffffff';
          newConfig.textColor = '#1f2125';
          newConfig.highlightColor = '#2ca4ab';
          newConfig.verseNumberColor = '#2ca4ab';
          newConfig.surahHeaderColor = '#1f2125';
          newConfig.bismillahColor = '#1f2125';
          newConfig.fontPalette = 'normal';
      }
      setConfig(newConfig);
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
            <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">Format</h2>
        </div>

        <div className="flex p-1 bg-[#1a1a1e] rounded-xl border border-white/5">
            {[
                { id: 'stream', icon: ScrollText, label: 'Stream' },
                { id: 'page', icon: Book, label: 'Page' },
                { id: 'page_v2', icon: AlignLeft, label: 'Single' },
            ].map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => setConfig({ ...config, visualizationMode: mode.id as any })}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                        config.visualizationMode === mode.id
                        ? 'bg-studio-accent text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <mode.icon className="w-4 h-4" />
                    {mode.label}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <label className="text-[10px] uppercase text-studio-textMuted font-bold tracking-wide">Theme</label>
                <div className="flex gap-1 p-1 bg-[#1a1a1e] rounded-lg border border-white/5">
                    {[
                        { id: 'light', icon: Sun },
                        { id: 'sepia', icon: BookOpen },
                        { id: 'dark', icon: Moon },
                    ].map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => applyTheme(theme.id as any)}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                                (theme.id === 'light' && config.backgroundColor === '#ffffff') ||
                                (theme.id === 'sepia' && config.backgroundColor === '#f8ebd5') ||
                                (theme.id === 'dark' && config.backgroundColor === '#1f2125')
                                ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <theme.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase text-studio-textMuted font-bold tracking-wide">Ratio</label>
                <div className="flex gap-1 p-1 bg-[#1a1a1e] rounded-lg border border-white/5">
                    {[
                        { id: '9:16', icon: Smartphone },
                        { id: '1:1', icon: Square },
                        { id: '16:9', icon: Monitor },
                    ].map(ratio => (
                        <button
                            key={ratio.id}
                            onClick={() => setConfig({...config, aspectRatio: ratio.id as any})}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                                config.aspectRatio === ratio.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <ratio.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}