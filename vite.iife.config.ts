import path from 'node:path';
import { defineConfig } from 'vite';

/** Builds `dist/urdumagic.js` only. Run after the main library build. */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/cdn.ts'),
      name: 'UrduMagic',
      formats: ['iife'],
      fileName: () => 'urdumagic.js',
    },
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    outDir: 'dist',
  },
});
