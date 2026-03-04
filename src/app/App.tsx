import { useState, useRef } from 'react';
import {
  Play, Pause, Loader2, Film, Settings
} from 'lucide-react';
import { VideoConfig } from '../features/video-editor/types';
import { SURAHS } from '../features/quran/data/surahs';
import Sidebar from '../layouts/Sidebar';
import { useQuranData } from '../features/quran/hooks/useQuranData';
import { useAudioRecorder } from '../features/audio/hooks/useAudioRecorder';
import { useVideoExporter } from '../features/video-editor/hooks/useVideoExporter';
import VideoCanvas from '../features/video-editor/components/VideoCanvas';
import DesktopControls from '../shared/components/DesktopControls';
import AboutOverlay from '../shared/components/AboutOverlay';

export default function App() {
  // --- STATE ---
  const [config, setConfig] = useState<VideoConfig>({
    surahId: 1,
    verseStart: 1,
    verseEnd: 7,
    reciterId: 10, // Sa'ud ash-Shuraim (Default)
    fontFamily: 'v2', // Default KFC V2
    fontSize: 86, // Default 86px for V2
    wordSpacing: 4, // Default Word Spacing 4px
    textColor: '#e7e9ea', // Default Dark Text
    backgroundColor: '#1f2125', // Default Dark BG

    // Background Image Defaults
    backgroundType: 'image',
    backgroundImage: 'https://i.postimg.cc/V16NR097/fb-00.jpg',
    backgroundImageOpacity: 0.6, // Default overlay opacity
    backgroundImageX: 50, // Default Center (50%)
    backgroundImageY: 50, // Default Center (50%)

    aspectRatio: '9:16',
    showTranslation: true,
    translationColor: '#a1a1aa',
    translationHighlightColor: '#ffffff', // Default Highlight White
    translationHighlightMode: 'karaoke', // Default Karaoke Mode
    translationFontFamily: 'Lato',
    translationFontSize: 30,
    enableHighlight: true,
    highlightColor: '#2ca4ab', // Default Accent
    showSurahHeader: true,
    surahHeaderColor: '#e7e9ea', // Default Header Color
    surahHeaderSize: 16, // Default 16% width
    surahHeaderY: 12, // Default 12% vertical position
    showBismillah: true,
    bismillahColor: '#e7e9ea', // Default Bismillah Color
    bismillahSize: 50, // Default 50% width
    bismillahY: 22, // Default 22% vertical position
    quranTextY: 52, // Default 52% (V2 Default)
    translationY: 85, // Default 85% (Bottom)
    fontPalette: '--Dark', // Default Palette
    visualizationMode: 'page_v2', // Default to Single Mode
    verseNumberColor: '#ffffff' // Default Verse Number Color (White)
  });

  const [typoTab, setTypoTab] = useState<'quran' | 'translation'>('quran');

  // Selector State
  const [isSurahOpen, setIsSurahOpen] = useState(false);
  const [surahSearch, setSurahSearch] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentSurah = SURAHS.find(s => s.number === config.surahId) || SURAHS[0];
  const filteredSurahs = SURAHS.filter(s =>
    s.number.toString().includes(surahSearch) ||
    s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
    s.arabicName.includes(surahSearch)
  );

  // --- HOOKS ---
  const { verses, audioUrl, isLoading, loadingProgress, errorMsg } = useQuranData(config);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Existing Audio Player Hook (Kept for Playback/Preview)
  const {
      audioRef, isPlaying, isBuffering, togglePlay, checkTime, currentVerseIndex
  } = useAudioRecorder(config, verses, audioUrl, canvasRef);

  // New High Quality Video Exporter
  const { isVideoExporting, videoExportProgress, exportStatus, startVideoExport } = useVideoExporter(
    config, verses, audioUrl, canvasRef, audioRef
  );

  const isAnyExporting = isVideoExporting;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-studio-bg text-studio-text overflow-hidden font-sans">
      <DesktopControls />

      {/* Hidden Font Preloader hack */}
      <div style={{ fontFamily: 'SurahNames', position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        s001 s114
      </div>

      <Sidebar
          config={config}
          setConfig={setConfig}
          errorMsg={errorMsg}
          currentSurah={currentSurah}
          filteredSurahs={filteredSurahs}
          isSurahOpen={isSurahOpen}
          setIsSurahOpen={setIsSurahOpen}
          surahSearch={surahSearch}
          setSurahSearch={setSurahSearch}
          typoTab={typoTab}
          setTypoTab={setTypoTab}
      />

      {/* PREVIEW AREA */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] relative p-8">

        <VideoCanvas
            canvasRef={canvasRef}
            config={config}
            verses={verses}
            currentVerseIndex={currentVerseIndex}
            audioRef={audioRef}
            checkTime={checkTime}
            isLoading={isLoading}
            isExporting={isAnyExporting} // Disable interactions during exports
            loadingProgress={loadingProgress}
        />

        {/* CONTROLS */}
        <div className="mt-8 flex items-center gap-6 z-20">
            <button
                onClick={togglePlay}
                disabled={isAnyExporting || isLoading || verses.length === 0}
                className="w-16 h-16 rounded-full bg-studio-panel border border-studio-border flex items-center justify-center hover:bg-studio-accent hover:border-studio-accent hover:text-white hover:scale-105 hover:shadow-[0_0_20px_var(--color-qdc-blue)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-studio-panel disabled:hover:cursor-not-allowed group relative text-studio-text"
            >
                {/* Spinner Overlay */}
                {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-studio-panel/80 rounded-full z-10">
                        <Loader2 className="w-6 h-6 text-studio-accent animate-spin" />
                    </div>
                )}

                {isPlaying ?
                    <Pause className="w-6 h-6 fill-current group-hover:fill-white" /> :
                    <Play className="w-6 h-6 fill-current ml-1 group-hover:fill-white" />
                }
            </button>

            {/* High Quality MP4 Export */}
            <button
                onClick={startVideoExport}
                disabled={isAnyExporting || isLoading || verses.length === 0 || isBuffering}
                className="flex items-center gap-3 px-8 py-5 bg-studio-accent hover:bg-studio-accentHover text-white rounded-full font-bold shadow-[0_0_25px_var(--color-qdc-blue)] hover:shadow-[0_0_35px_var(--color-qdc-blue)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
                {isVideoExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                <span className="tracking-wide">EXPORT VIDEO</span>
            </button>

            {/* Settings Button */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                disabled={isAnyExporting}
                className="w-14 h-14 rounded-full bg-studio-panel border border-studio-border flex items-center justify-center hover:bg-zinc-700 hover:border-zinc-600 hover:text-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-studio-panel disabled:hover:cursor-not-allowed text-studio-textMuted"
            >
                <Settings className="w-6 h-6" />
            </button>
        </div>

        {/* HQ Video Export Progress Overlay */}
        {isVideoExporting && (
             <div dir="ltr" className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-50">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-studio-panel border-t-studio-accent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                            {videoExportProgress}%
                        </span>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-studio-accent to-emerald-400 bg-clip-text text-transparent">Rendering HD Video</h3>
                    <p className="text-sm text-studio-textMuted max-w-xs mx-auto">
                        {exportStatus}<br/>
                        <span className="text-xs opacity-70">Creating frame-perfect MP4 (H.264/AAC)</span>
                    </p>
                </div>
            </div>
        )}

      </div>

      <AboutOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
