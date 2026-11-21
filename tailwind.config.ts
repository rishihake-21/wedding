import type { Config } from 'tailwindcss';
import { colors, fonts } from './src/theme/tokens';

// Colours and fonts come only from src/theme/tokens.ts.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...colors },
      fontFamily: {
        marathi: [...fonts.marathiDisplay],
        display: [...fonts.englishDisplay],
        body: [...fonts.body],
      },
    },
  },
  plugins: [],
} satisfies Config;
