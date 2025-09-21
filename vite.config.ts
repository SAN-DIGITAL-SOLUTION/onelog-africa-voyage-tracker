/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
// import viteCompression from 'vite-plugin-compression';
import { fileURLToPath } from 'node:url';
import { configDefaults } from 'vitest/config';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  server: {
    host: '::',
    port: 5173,
        // open: true,
    strictPort: false
  },
    plugins: [
      react(),
    ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/server': path.resolve(__dirname, './__tests__/mocks/next-server.ts'),
    },
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
    },
    exclude: [
      ...configDefaults.exclude,
      'vendor/**/*',
    ],
    alias: [
      {
        find: /^next\/server$/,
        replacement: path.resolve(__dirname, './__tests__/mocks/next-server.ts'),
      },
    ],
    // Note: Storybook test runner configuration will be added back when compatible with Storybook 9
  }
});