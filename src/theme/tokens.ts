/**
 * Single source of truth for colours and fonts.
 * Everything else (Tailwind, three.js materials, canvas textures) reads from here.
 */

export const colors = {
  midnight: '#0B1530', // midnight indigo
  yamuna: '#0F6E7A', // Yamuna teal
  peacock: '#1B7F5C', // peacock green
  gold: '#D4A640',
  marigold: '#F28C28',
  lotus: '#E8A0B4', // lotus pink
  cream: '#FFF4DC',
} as const;

export type ColorName = keyof typeof colors;

/**
 * Font stacks. Phase 1 relies on installed/fallback fonts; self-hosted, subsetted
 * WOFF2 files for the first entry of each stack are added in Phase 10.
 */
export const fonts = {
  marathiDisplay: ['Tiro Devanagari Marathi', 'Yatra One', 'Noto Serif Devanagari', 'serif'],
  englishDisplay: ['Cormorant Garamond', 'Cinzel', 'Georgia', 'serif'],
  body: ['Mukta', 'Noto Sans Devanagari', 'Noto Sans', 'system-ui', 'sans-serif'],
} as const;
