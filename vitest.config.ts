import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'path';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.ts', '__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 20000,
    
    // Désactive la compatibilité avec Jest qui peut causer des problèmes
    compatibility: {
      jest: false
    },
    
    // Configuration de la couverture de code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '**/*.d.ts',
        '**/*.stories.{js,jsx,ts,tsx}',
        '**/stories/**',
      ],
    },
    
    // Configuration des alias
    resolve: {
      alias: [
        {
          find: /^@\/(.*)/,
          replacement: path.resolve(dirname, 'src/$1'),
        },
      ],
    },
  },
  plugins: [react()],
});
