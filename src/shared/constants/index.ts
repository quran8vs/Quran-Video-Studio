import { Reciter, QuranFont } from '../types';

export const RECITERS: Reciter[] = [
  { id: 19, name: "Ahmed ibn Ali al-Ajmy" },
  { id: 158, name: "Abdullah Ali Jabir" },
  { id: 160, name: "Bandar Baleela" },
  { id: 159, name: "Maher al-Muaiqly" },
  { id: 2, name: "AbdulBaset AbdulSamad" },
  { id: 1, name: "AbdulBaset AbdulSamad (Mujawwad)" },
  { id: 6, name: "Mahmoud Khalil Al-Husary" },
  { id: 7, name: "Mishari Rashid al-`Afasy" },
  { id: 3, name: "Abdur-Rahman as-Sudais" },
  { id: 9, name: "Mohamed Siddiq al-Minshawi" },
  { id: 4, name: "Abu Bakr al-Shatri" },
  { id: 10, name: "Sa'ud ash-Shuraim" },
  { id: 161, name: "Khalifah Al Tunaiji" },
  { id: 13, name: "Sa'ad al-Ghamdi" },
  { id: 5, name: "Hani ar-Rifai" },
  { id: 175, name: "Abdullah Hamad Abu Sharida" },
  { id: 12, name: "Mahmoud Khalil Al-Husary (Muallim)" },
  { id: 173, name: "Mishari Rashid al-`Afasy" },
  { id: 168, name: "Mohamed Siddiq al-Minshawi (Kids repeat)" },
  { id: 174, name: "Yasser Ad Dussary" }
];

// Page-specific Font Base URLs - Using jsDelivr CDN with fallbacks
export const FONT_BASE_URLS = {
  'v1': [
    "https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v1/woff2/p",
    "https://verses.quran.foundation/fonts/quran/hafs/v1/woff2/p",
    "https://quran.com/fonts/quran/hafs/v1/woff2/p"
  ],
  'v2': [
    "https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v2/woff2/p",
    "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p",
    "https://quran.com/fonts/quran/hafs/v2/woff2/p"
  ],
  'v4': [
    "https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v4/colrv1/woff2/p",
    "https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p",
    "https://quran.com/fonts/quran/hafs/v4/colrv1/woff2/p"
  ],
};

export const FONTS: QuranFont[] = [
  // Only Official Quran.com Fonts
  { name: 'v1', family: 'v1', label: 'KFC V1', type: 'v1' },
  { name: 'v2', family: 'v2', label: 'KFC V2', type: 'v2' },
  { name: 'v4', family: 'v4', label: 'QPC Hafs', type: 'v4' },
];

export const AL_QADR_FONT: QuranFont = {
  name: 'surah_al_qadr',
  family: 'surah_al_qadr',
  label: 'Al-Qadr Special',
  type: 'qadr'
};

export const ENGLISH_FONTS: QuranFont[] = [
  { name: 'figtree', family: 'Figtree', label: 'Figtree', type: 'v1' }, // Dummy type to satisfy TS, not used for Quran text
  { name: 'inter', family: 'Inter', label: 'Inter', type: 'v1' },
  { name: 'roboto', family: 'Roboto', label: 'Roboto', type: 'v1' },
  { name: 'montserrat', family: 'Montserrat', label: 'Montserrat', type: 'v1' },
  { name: 'poppins', family: 'Poppins', label: 'Poppins', type: 'v1' },
  { name: 'lato', family: 'Lato', label: 'Lato', type: 'v1' },
];

export const CANVAS_SIZES = {
  '9:16': { width: 1080, height: 1920 },
  '16:9': { width: 1920, height: 1080 },
  '1:1': { width: 1080, height: 1080 },
};
