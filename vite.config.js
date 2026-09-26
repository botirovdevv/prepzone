import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Xavfsizlik header'lari (CSP va boshqalar) — yagona manba vercel.json.
// `vite preview` ham xuddi shu header'lar bilan ishlaydi, shunda CSP
// muammolarini deploy'dan oldin lokal ko'rish mumkin.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
const securityHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value])
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Firebase SDK (Auth + Firestore + offline kesh) ataylab bitta vendor
    // chunk'da (~180 KB gzip) — uzoq muddat keshlanadi.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Kam o'zgaradigan kutubxonalar alohida chunk'larda — brauzer ularni
        // uzoq muddat keshlaydi, ilova yangilanganda qayta yuklanmaydi.
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
})
