import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { VideoConfig } from '../../features/video-editor/types';
import { Surah } from '../../features/quran/types';

import { AL_QADR_FONT } from '../../shared/constants';

interface SidebarSelectionProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  currentSurah: Surah;
  filteredSurahs: Surah[];
  isSurahOpen: boolean;
  setIsSurahOpen: (v: boolean) => void;
  surahSearch: string;
  setSurahSearch: (v: string) => void;
}

// Custom Verse Dropdown Component
function VerseDropdown({ 
    label, 
    value, 
    max, 
    min = 1, 
    onChange 
}: { 
    label: string, 
    value: number, 
    max: number, 
    min?: number, 
    onChange: (val: number) => void 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll to selected item when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const options = Array.from({ length: max }, (_, i) => i + 1).filter(n => n >= min);
    const filteredOptions = options.filter(n => n.toString().includes(search));

    return (
        <div className="flex-1 relative group" ref={containerRef}>
            <div 
                onClick={() => {
                    if (!isOpen) setSearch("");
                    setIsOpen(!isOpen);
                }}
                className={`
                    flex items-center justify-between 
                    bg-[#1a1a1e] border border-white/5 
                    px-3 py-3 cursor-pointer transition-all rounded-xl
                    ${isOpen ? 'border-studio-accent ring-1 ring-studio-accent/20' : 'hover:border-white/10'}
                `}
            >
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{label}</span>
                <span className="text-sm font-bold text-white font-mono flex-1 text-center">{value}</span>
                <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180 text-studio-accent' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-white/5">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-transparent focus:border-studio-accent/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none placeholder:text-zinc-600"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const num = parseInt(search);
                                    if (!isNaN(num) && num >= min && num <= max) {
                                        onChange(num);
                                        setIsOpen(false);
                                    }
                                }
                            }}
                        />
                    </div>
                    
                    {/* List */}
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(num => (
                                <button
                                    key={num}
                                    onClick={() => {
                                        onChange(num);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                        ${num === value ? 'bg-studio-accent text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                                    `}
                                >
                                    <span>{num}</span>
                                    {num === value && <Check className="w-3 h-3" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-center text-xs text-zinc-600">No match</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SidebarSelection({
  config, setConfig, currentSurah, filteredSurahs,
  isSurahOpen, setIsSurahOpen, surahSearch, setSurahSearch
}: SidebarSelectionProps) {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
            <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">Selection</h2>
        </div>

        <div className="space-y-3">
            {/* Surah Selector - REDESIGNED */}
            <div className="relative z-50">
                <button
                    onClick={() => setIsSurahOpen(!isSurahOpen)}
                    className={`w-full flex items-center justify-between bg-[#1a1a1e] border ${isSurahOpen ? 'border-studio-accent ring-1 ring-studio-accent/20' : 'border-white/5 hover:border-white/10'} rounded-xl px-4 py-3.5 transition-all group shadow-sm`}
                >
                    <div className="flex items-center gap-3">
                        {/* Number Badge */}
                        <span className="h-7 min-w-[36px] px-1 rounded-md bg-white/5 flex items-center justify-center text-base font-lateef text-zinc-500 group-hover:bg-studio-accent/20 group-hover:text-studio-accent transition-colors">
                            {currentSurah.number}
                        </span>
                        {/* English Name - Clean & Bold */}
                        <span className="font-lateef font-bold text-lg text-white tracking-tight group-hover:text-studio-accent transition-colors">
                            {currentSurah.englishName}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Arabic Name - Subtle on the right */}
                        <span className="font-lateef text-2xl text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            {currentSurah.arabicName}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isSurahOpen ? 'rotate-180 text-studio-accent' : ''}`} />
                    </div>
                </button>

                {isSurahOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 max-h-[400px] bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                        {/* Sticky Search Header */}
                        <div className="p-3 border-b border-[#27272a] sticky top-0 bg-[#18181b]/95 backdrop-blur-sm z-10">
                            <div className="relative group">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-studio-accent transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Surah..."
                                    autoFocus
                                    value={surahSearch}
                                    onChange={(e) => setSurahSearch(e.target.value)}
                                    className="w-full bg-[#27272a] border border-transparent focus:border-studio-accent/50 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-studio-accent/20 outline-none placeholder:text-zinc-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                            {filteredSurahs.map(s => (
                                <button
                                    key={s.number}
                                    onClick={() => {
                                        const maxV = Math.min(7, s.totalAyahs);
                                        const newConfig = {
                                            ...config,
                                            surahId: s.number,
                                            verseStart: 1,
                                            verseEnd: maxV
                                        };
                                        
                                        // Auto-select Al-Qadr font for Surah 97
                                        if (s.number === 97) {
                                            newConfig.fontFamily = AL_QADR_FONT.family;
                                        } else if (config.fontFamily === AL_QADR_FONT.family) {
                                            // Reset to default font if moving away from Al-Qadr and current font is Al-Qadr
                                            newConfig.fontFamily = 'v2';
                                        }

                                        setConfig(newConfig);
                                        setIsSurahOpen(false);
                                        setSurahSearch("");
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 transition-all group ${config.surahId === s.number ? 'bg-studio-accent text-white shadow-md' : 'hover:bg-white/5 text-zinc-400'}`}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <span className={`text-base font-lateef w-8 text-center ${config.surahId === s.number ? 'text-white/80' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                            {s.number}
                                        </span>
                                        <div className="flex flex-col items-start">
                                            <span className={`text-base font-lateef font-bold ${config.surahId === s.number ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                                                {s.englishName}
                                            </span>
                                            <span className={`text-[10px] uppercase tracking-wider ${config.surahId === s.number ? 'text-white/60' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                                                {s.totalAyahs} Ayahs
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`font-lateef text-2xl ${config.surahId === s.number ? 'text-white/90' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                            {s.arabicName}
                                        </span>
                                        {s.number === 97 && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Verse Range - Custom Dropdowns */}
            <div className="flex items-center gap-2">
                <VerseDropdown 
                    label="From" 
                    value={config.verseStart} 
                    max={currentSurah.totalAyahs} 
                    onChange={(val) => {
                        const newEnd = val > config.verseEnd ? val : config.verseEnd;
                        setConfig({...config, verseStart: val, verseEnd: newEnd});
                    }}
                />
                <div className="w-px h-8 bg-white/5"></div>
                <VerseDropdown 
                    label="To" 
                    value={config.verseEnd} 
                    max={currentSurah.totalAyahs} 
                    min={config.verseStart}
                    onChange={(val) => setConfig({...config, verseEnd: val})}
                />
            </div>
        </div>
    </div>
  );
}