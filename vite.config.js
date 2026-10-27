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
    // Dev server ishga tushishi bilan barcha sahifalar oldindan transform
    // qilinadi — sahifa birinchi ochilganda kutib qolmaslik uchun.
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/AuthedApp.jsx',
        './src/pages/**/*.jsx',
        './src/components/**/*.jsx',
      ],
    },
  },
  optimizeDeps: {
    // Oldindan bundle qilinadi — sessiya o'rtasida "new dependencies
    // optimized, reloading" bo'lib sahifa qayta yuklanmasligi uchun.
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'react-router-dom',
      'react-icons/lu',
      '@react-oauth/google',
      'socket.io-client',
    ],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Kam o'zgaradigan kutubxonalar alohida chunk'da — brauzer ularni
        // uzoq muddat keshlaydi, ilova yangilanganda qayta yuklanmaydi.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
