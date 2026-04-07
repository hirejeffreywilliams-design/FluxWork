# © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
          950: '#052e16',
        },
        surface: {
          950: '#030712',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
