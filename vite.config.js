import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Lokal ishlab chiqishda API (server/) 4000-portda ishlaydi. Proxy orqali
    // frontend va API bitta originda bo'ladi — sessiya cookie muammosiz ishlaydi.
    proxy: {
      '/api': 'http://localhost:4000',
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
})
