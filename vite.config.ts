import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three-core';
          if (id.includes('node_modules/@react-three/postprocessing') || id.includes('node_modules/postprocessing')) {
            return 'r3f-post';
          }
          if (id.includes('node_modules/@react-three/')) return 'r3f-drei';
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/howler')) return 'howler';
          if (id.includes('node_modules/react') || id.includes('node_modules/zustand')) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
