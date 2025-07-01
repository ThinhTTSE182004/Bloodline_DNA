import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    allowedHosts: [
      'all',
      'broadband-powerseller-swim-floors.trycloudflare.com',
      '.trycloudflare.com',
    ],
  },
  define: {
    global: 'window',
    'jQuery': 'window.jQuery',
    '$': 'window.jQuery'
  }
});
