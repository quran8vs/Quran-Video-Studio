export interface VideoConfig {
  surahId: number;
  verseStart: number;
  verseEnd: number;
  reciterId: number | string;
  fontFamily: string;
  fontSize: number;
  wordSpacing: number;
  // ayahMarkerFont removed
  textColor: string;
  backgroundColor: string;

  // Background Image Support
  backgroundType: 'color' | 'image';
  backgroundImage: string | null;
  backgroundImageOpacity: number;
  backgroundImageX: number;
  backgroundImageY: number;

  aspectRatio: '9:16' | '16:9' | '1:1';
  showTranslation: boolean;
  translationColor: string;
  translationHighlightColor: string; // New: Highlight color for translation
  translationHighlightMode: 'none' | 'karaoke' | 'word'; // New: Highlight mode
  translationFontFamily: string;
  translationFontSize: number;
  enableHighlight: boolean;
  highlightColor: string;
  showSurahHeader: boolean;
  surahHeaderColor: string;
  surahHeaderSize: number;
  surahHeaderY: number;
  showBismillah: boolean;
  bismillahColor: string;
  bismillahSize: number;
  bismillahY: number;
  quranTextY: number;
  translationY: number;
  fontPalette: string;
  visualizationMode: 'page' | 'stream' | 'page_v2';
  verseNumberColor: string;
}
