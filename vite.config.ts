import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
        'src/client/dom-walker.ts',
        'src/client/ui-switcher.ts',
        'src/client/rtl.ts',
        'src/server/index.ts',
        'src/next/index.ts',
        'src/react/useUrduMagic.tsx',
      ],
      outDir: 'dist',
      rollupTypes: false,
      exclude: ['**/*.test.ts', '**/demo/**'],
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/data/english-urdu-dictionary-flat.json',
          dest: '',
          rename: 'english-urdu-dictionary-flat.json'
        }
      ]
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'server/index': path.resolve(__dirname, 'src/server/index.ts'),
        'server/react-server': path.resolve(__dirname, 'src/server/react-server.tsx'),
        'next/index': path.resolve(__dirname, 'src/next/index.ts'),
        'next/plugin': path.resolve(__dirname, 'src/next/plugin.js'),
        'react/index': path.resolve(__dirname, 'src/react/useUrduMagic.tsx'),
      },
      name: 'UrduMagic',
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: ['node-html-parser', 'react', 'react-dom', 'next', 'next/server'],
      output: {
        exports: 'named',
        globals: {
          'node-html-parser': 'HTMLParser',
          react: 'React',
          'react-dom': 'ReactDOM',
          next: 'Next',
          'next/server': 'NextServer',
        },
      },
    },
  },
});
