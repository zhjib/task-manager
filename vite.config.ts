import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(rootDir, 'client'),
  plugins: [react()],
  resolve: {
    alias: {
      '@client': path.resolve(rootDir, 'client'),
      '@shared': path.resolve(rootDir, 'shared'),
      '@': path.resolve(rootDir, 'client/src'),
    },
  },
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    emptyOutDir: true,
  },
});
