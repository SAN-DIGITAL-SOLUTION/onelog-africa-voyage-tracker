/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath } from 'node:url';
import { configDefaults } from 'vitest/config';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  server: {
    host: '::',
    port: 5173,
    open: true,
    strictPort: true
  },
  plugins: [react(), viteCompression({
    algorithm: 'brotliCompress'
  }), viteCompression({
    algorithm: 'gzip'
  })],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      // Alias pour les tests
      'vitest/utils': 'vitest/utils',
      'vitest': 'vitest',
    }
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'istanbul'
    }
    // Note: Storybook test runner configuration will be added back when compatible with Storybook 9
  }
});