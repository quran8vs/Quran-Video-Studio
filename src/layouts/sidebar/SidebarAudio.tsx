import React from 'react';
import { Mic, Mic2 } from 'lucide-react';
import { VideoConfig } from '../../features/video-editor/types';
import { RECITERS } from '../../shared/constants';

interface SidebarAudioProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

export default function SidebarAudio({ config, setConfig }: SidebarAudioProps) {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
            <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">Reciter</h2>
        </div>

        <div className="bg-[#1a1a1e] border border-white/5 rounded-xl overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                {RECITERS.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setConfig({...config, reciterId: r.id})}
                        className={`group flex items-center gap-3 p-2.5 rounded-lg transition-all text-left w-full mb-1 last:mb-0
                            ${config.reciterId === r.id
                                ? 'bg-studio-accent text-white shadow-md'
                                : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                    >
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${config.reciterId === r.id ? 'bg-white/20' : 'bg-black/20'}`}>
                            {config.reciterId === r.id ? <Mic2 className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate leading-tight">{r.name}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}