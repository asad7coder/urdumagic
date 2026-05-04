import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: [
        'src/index.ts',
        'src/cdn.ts',
        'src/types.ts',
        'src/core/transliterator.ts',
        'src/core/roman-urdu-dict.ts',
        'src/core/detector.ts',
        'src/core/translator.ts',
        'src/core/cache.ts',
        'src/core/debounce.ts',
        'src/injector/magic.ts',
        'src/ui/switcher.ts',
        'src/ui/rtl.ts',
      ],
      outDir: 'dist',
      rollupTypes: true,
      exclude: ['**/*.test.ts', '**/demo/**'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UrduMagic',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'urdumagic.es.js';
        if (format === 'umd') return 'urdumagic.umd.js';
        return `urdumagic.${format}.js`;
      },
    },
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});
