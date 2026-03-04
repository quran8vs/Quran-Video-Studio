import React from 'react';
import { AlertCircle } from 'lucide-react';
import { VideoConfig } from '../features/video-editor/types';
import { Surah } from '../features/quran/types';
import SidebarSelection from './sidebar/SidebarSelection';
import SidebarAudio from './sidebar/SidebarAudio';
import SidebarFormat from './sidebar/SidebarFormat';
import SidebarLayout from './sidebar/SidebarLayout';
import SidebarTypography from './sidebar/SidebarTypography';
import SidebarStyle from './sidebar/SidebarStyle';
import { isTauri } from '../shared/utils/platform';

interface SidebarProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  errorMsg: string | null;
  currentSurah: Surah;
  filteredSurahs: Surah[];
  isSurahOpen: boolean;
  setIsSurahOpen: (v: boolean) => void;
  surahSearch: string;
  setSurahSearch: (v: string) => void;
  typoTab: 'quran' | 'translation';
  setTypoTab: (v: 'quran' | 'translation') => void;
}

export default function Sidebar({
  config, setConfig, errorMsg,
  currentSurah, filteredSurahs,
  isSurahOpen, setIsSurahOpen,
  surahSearch, setSurahSearch,
  typoTab, setTypoTab
}: SidebarProps) {

  const isApp = isTauri();

  return (
    <div className={`w-full ${config.aspectRatio === '16:9' ? 'md:w-[340px]' : 'md:w-[400px]'} flex flex-col border-l border-white/5 bg-[#121214] h-[50vh] md:h-full z-10 shadow-2xl relative transition-all duration-300 font-sans`}>

        {/* Minimal Centered Header */}
        <div 
            className={`py-5 border-b border-white/5 bg-[#121214] shrink-0 text-center relative overflow-hidden ${isApp ? 'cursor-move' : ''}`}
            data-tauri-drag-region
        >
            <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-studio-accent to-transparent opacity-50 pointer-events-none"
                data-tauri-drag-region
            ></div>
            <h1 
                className="text-xl font-bold tracking-tight text-white pointer-events-none"
                data-tauri-drag-region
            >
                Quran Video Studio
            </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
            {errorMsg && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex gap-2 text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{errorMsg}</p>
                </div>
            )}

            {/* SELECTION */}
            <SidebarSelection
                config={config}
                setConfig={setConfig}
                currentSurah={currentSurah}
                filteredSurahs={filteredSurahs}
                isSurahOpen={isSurahOpen}
                setIsSurahOpen={setIsSurahOpen}
                surahSearch={surahSearch}
                setSurahSearch={setSurahSearch}
            />

            {/* AUDIO SOURCE */}
            <SidebarAudio
                config={config}
                setConfig={setConfig}
            />

            {/* FORMAT */}
            <SidebarFormat
                config={config}
                setConfig={setConfig}
            />

            {/* LAYOUT ELEMENTS */}
            <SidebarLayout
                config={config}
                setConfig={setConfig}
            />

            {/* TYPOGRAPHY */}
            <SidebarTypography
                config={config}
                setConfig={setConfig}
                typoTab={typoTab}
                setTypoTab={setTypoTab}
            />

            {/* STYLING & COLORS */}
            <SidebarStyle
                config={config}
                setConfig={setConfig}
            />

        </div>
    </div>
  );
}
