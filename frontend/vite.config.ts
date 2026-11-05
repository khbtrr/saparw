import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendProxy = {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
  '/storage': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: backendProxy,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
    proxy: backendProxy,
  },
});
