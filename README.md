# Prepzone — SAT va IELTS mock test platformasi

Digital SAT (adaptiv, Bluebook formati) va IELTS Academic (Listening, Reading, Writing) uchun
online mock testlar, reyting, o'quv reja, lug'at va admin panel (kodli mock sessiyalar,
amaliyot to'plamlari, analitika).

## Arxitektura

| Qism | Texnologiya |
|---|---|
| Frontend | React 19 + Vite + Tailwind (SPA), Vercel'da |
| Auth, ma'lumotlar | Firebase Authentication + Firestore (Spark tarifi) |
| Server | Vercel Functions (`api/`) + `firebase-admin` |
| AI | Claude API (IELTS Writing baholash) |

**Ishonchli mantiq serverda.** Ball hisoblash, SAT routing (oson/qiyin Module 2), natija va
reyting yozish faqat `api/` orqali. Firestore rules bu kolleksiyalarga client yozuvini yopadi.
To'g'ri javoblar brauzer bundle'iga tushmaydi:

- `content/` — testlarning to'liq manbasi (kalitlar bilan), faqat server va build skripti o'qiydi.
- `scripts/build-content.mjs` — `npm run dev`/`build` dan oldin avtomatik ishlaydi va
  `src/data/generated/` ga kalitsiz nusxa yozadi (git'ga kirmaydi).
- Admin sessiyalari: `testSessions/{id}/secure/answers` (kalitlar, faqat admin/server) va
  `secure/content` (ishtirokchilar uchun, kalitsiz; faqat test vaqti kelganda o'qiladi).
- Admin savol banki: `server/question-bank/` (faqat `/api/admin/question-bank` orqali).

### API endpointlar (`api/`)

| Endpoint | Vazifa |
|---|---|
| `POST /api/sat/route` | Module 1 javoblaridan Module 2 yo'nalishi |
| `POST /api/sat/finish` | SAT natijasini baholash va saqlash, reyting |
| `POST /api/session/route`, `/api/session/finish` | Admin sessiyalari uchun xuddi shu |
| `POST /api/ielts/submit` | IELTS baholash (+ AI Writing, kuniga 3 ta) |
| `GET /api/review` | Natija egasiga to'g'ri javoblar (ko'rib chiqish uchun) |
| `GET /api/admin/question-bank` | Admin savol banki |

Hamma endpoint `Authorization: Bearer <Firebase ID token>` talab qiladi (`src/utils/api.js`).
Natija yuboruvchi endpointlar idempotent (`attemptId`) — tarmoq xatosida qayta yuborish
ikkinchi natija yaratmaydi.

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env   # qiymatlarni to'ldiring (pastga qarang)
npm run dev            # http://localhost:5173 — /api ham shu serverda ishlaydi
```

`.env` kalitlari (`.env.example` da izohlar bilan):

- `VITE_FIREBASE_*` — Firebase Console → Project settings → Your apps → Web app.
- `VITE_DESMOS_API_KEY` — https://www.desmos.com/my-api (bo'sh bo'lsa demo kalit).
- `FIREBASE_SERVICE_ACCOUNT` — Project settings → Service accounts → *Generate new private key*,
  JSON mazmuni bitta qatorda. **Maxfiy** — faqat `.env` va Vercel env'da.
- `ANTHROPIC_API_KEY` — https://console.anthropic.com. Bo'sh bo'lsa Writing avtomatik (taxminiy)
  baholanadi. `AI_WRITING_MODEL` — `claude-sonnet-5` (standart) yoki arzonroq `claude-haiku-4-5`.

## Deploy

1. **Vercel env**: yuqoridagi barcha kalitlarni Project → Settings → Environment Variables ga
   kiriting (Production va Preview).
2. **Firestore rules va indekslar**: `npm run deploy:rules` (firebase-tools orqali), yoki
   `firestore.rules` ni Console → Firestore → Rules ga qo'yib Publish qiling va
   `firestore.indexes.json` dagi indekslarni yarating (`results` va `ieltsResults`:
   `uid` ASC + `createdAt` DESC).
3. **Eski natijalar** (bir marta): `node --env-file=.env scripts/backfill-results.mjs --write`.
4. **Admin qo'shish**: Firestore'da `admins/{uid}` hujjatini qo'lda yarating.
5. Git push → Vercel avtomatik build qiladi.

## Firestore bepul tarifi (Spark) bo'yicha eslatmalar

Kunlik limit: 50k o'qish, 20k yozish. Shu uchun:

- ro'yxatlar sahifalab yuklanadi (`src/utils/userResults.js`), sonlar `count()` bilan;
- analitika kuniga ~3–5 yozuv/user (`src/utils/analytics.js`), admin analitikasi o'tgan kunlarni
  `analyticsDaily` ga yig'ib qo'yadi;
- amaliyot to'plamlari ro'yxati yengil `questionSetIndex` dan o'qiladi.

Kuniga ~1000+ faol user yoki pullik funksiyalar paydo bo'lsa — Blaze tarifiga o'ting (budget alert bilan).

## Yangi test qo'shish

- SAT: `content/sat/` da modul fayllarini yozing va `content/sat/index.js` dagi `SAT_TESTS` ga,
  `src/data/testsCatalog.js` ga qo'shing.
- IELTS: `content/ielts/test1.js` formatida fayl yozib, `content/ielts/index.js` ga qo'shing.
