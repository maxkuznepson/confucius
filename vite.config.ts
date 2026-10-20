import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    // Важно для HMR и загрузки модулей
    hmr: {
      port: 5173,
    },
  },
  // Базовый путь для приложения
  base: '/',
});
