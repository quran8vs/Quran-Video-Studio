import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: 'var(--color-studio-bg)',
          panel: 'var(--color-studio-panel)',
          border: 'var(--color-studio-border)',
          text: 'var(--color-studio-text)',
          textMuted: 'var(--color-studio-textMuted)',
          accent: 'var(--color-studio-accent)',
          accentHover: 'var(--color-studio-accentHover)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config;
