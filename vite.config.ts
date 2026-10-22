import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site under /<repo>/; dev and tests stay at root.
  base: command === 'build' ? '/3d-visor-cost-wp/' : '/',
  plugins: [react()],
  // The 3D viewer chunk (three + drei) is lazy-loaded and ~565 kB minified.
  build: { chunkSizeWarningLimit: 600 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
  },
}));
