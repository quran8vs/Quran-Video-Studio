export interface Word {
    text_uthmani: string;
    char_type_name: string;
    code_v1?: string;
    code_v2?: string;
    page_number?: number;
    position: number;
    translation?: { text: string };
}

export type TimingSegment = [number, number, number];

export interface VerseTiming {
    verse_key: string;
    timestamp_from: number;
    timestamp_to: number;
    duration: number;
    segments: TimingSegment[];
}

export interface VerseData {
  id: number;
  text: string;
  translation: string;
  verseNumber: number;
  verseKey: string;
  words: Word[];
  timing?: VerseTiming;
}

export interface Surah {
  number: number;
  englishName: string;
  arabicName: string;
  totalAyahs: number;
}
