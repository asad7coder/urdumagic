import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  server: {
    port: 5174,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyDirBeforeWrite: true,
  },
});
