import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'jQuery': 'window.jQuery',
    '$': 'window.jQuery'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7113',
        changeOrigin: true,
        secure: false,
      }
    },
  }
});
