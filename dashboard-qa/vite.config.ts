import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
    proxy: {
      '/docs/TEST_AUDIT.json': 'http://localhost:5173',
    },
  },
  preview: {
    port: 5175,
  },
});
