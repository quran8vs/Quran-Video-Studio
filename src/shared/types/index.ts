export interface Reciter {
  id: number | string;
  name: string;
}

export interface QuranFont {
  name: string;
  family: string;
  label: string;
  type: 'v1' | 'v2' | 'v4' | 'qadr'; // Strict typing
}
