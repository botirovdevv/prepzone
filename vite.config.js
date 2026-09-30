import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { devApiPlugin } from './server/devApi.js'

// Xavfsizlik header'lari (CSP va boshqalar) — yagona manba vercel.json.
// `vite preview` ham xuddi shu header'lar bilan ishlaydi, shunda CSP
// muammolarini deploy'dan oldin lokal ko'rish mumkin.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
const securityHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value])
)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lokal /api (server/devApi.js) uchun server env'lari — FIREBASE_SERVICE_ACCOUNT,
  // ANTHROPIC_API_KEY — .env / .env.local dan. Production'da Vercel env'dan.
  for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ''))) {
    if (!(k in process.env)) process.env[k] = v
  }

  return {
    plugins: [react(), devApiPlugin()],
    server: {
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
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'react-icons/lu',
      ],
    },
    build: {
      chunkSizeWarningLimit: 700,
      rolldownOptions: {
        output: {
          // Kam o'zgaradigan kutubxonalar alohida chunk'larda — brauzer ularni
          // uzoq muddat keshlaydi, ilova yangilanganda qayta yuklanmaydi.
          // Firestore alohida: bosh sahifa faqat App + Auth'ni yuklaydi.
          codeSplitting: {
            // Aks holda firestore guruhi o'z bog'liqliklarini (@firebase/app,
            // util) ham o'ziga tortadi va bosh sahifa baribir uni yuklaydi.
            includeDependenciesRecursively: false,
            groups: [
              {
                // re2js — Firestore'ning bog'liqligi. U shu guruhda bo'lmasa, ilova
                // kodi bilan umumiy chunk'ga tushadi va chunk'lar orasida aylana
                // import paydo bo'ladi -> production'da "Service firestore is not available".
                name: 'firestore',
                test: /node_modules[\\/](@firebase[\\/](firestore|webchannel-wrapper)|firebase[\\/]firestore|re2js)[\\/]/,
                priority: 2,
              },
              { name: 'firebase', test: /node_modules[\\/](@firebase|firebase|idb|tslib)[\\/]/, priority: 1 },
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            ],
          },
        },
      },
    },
    preview: {
      headers: securityHeaders,
    },
  }
})
