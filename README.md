# Prepzone — Digital SAT mock test platformasi

Digital SAT (adaptiv, Bluebook formati) uchun online mock testlar, oylik amaliyot to'plamlari,
reyting, o'quv reja (Study Plan), lug'at, Desmos darsliklari va admin panel (kodli mock
sessiyalar, amaliyot to'plamlari, Desmos, analitika).

## Arxitektura

| Qism | Texnologiya |
|---|---|
| Frontend | React 19 + Vite + Tailwind (SPA) |
| Backend | Node.js + Express 5 (`server/`), Socket.IO (jonli monitoring) |
| Ma'lumotlar | PostgreSQL 16 (`server/src/db/migrations/*.sql`) |
| Auth | Email + parol (6 xonali kod bilan tasdiqlash, Resend) va Google; httpOnly JWT cookie |
| Deploy | Docker Compose: `db` + `api` + `web` (Caddy, avtomatik HTTPS) — qarang: `DEPLOY.md` |

**Ishonchli mantiq serverda.** Ball hisoblash (IRT), SAT routing (oson/qiyin Module 2), natija
va reyting yozish faqat backend orqali. To'g'ri javoblar brauzer bundle'iga tushmaydi:

- `content/sat/` — statik testlarning to'liq manbasi (kalitlar bilan), faqat server
  (`server/src/lib/satScoring.js`) va build skripti o'qiydi.
- `scripts/build-content.mjs` — `npm run dev`/`build` dan oldin avtomatik ishlaydi va
  `src/data/generated/` ga kalitsiz nusxa yozadi (git'ga kirmaydi).
- Admin sessiyalari: savollar kalitlar bilan bazada; ishtirokchi ularni faqat test vaqti
  kelganda va kalitsiz oladi.
- Admin savol banki: `server/question-bank/` (faqat `/api/admin/question-bank` orqali).

### Asosiy API endpointlar (`server/src/routes/`)

| Endpoint | Vazifa |
|---|---|
| `/api/auth/*` | Ro'yxatdan o'tish, kirish, Google, email kodi, parolni tiklash |
| `POST /api/sat/route`, `/api/sat/finish` | Statik test: Module 2 yo'nalishi, baholash va saqlash |
| `GET /api/sat/review?id=` | Natija egasiga to'g'ri javoblar (ko'rib chiqish uchun) |
| `/api/sessions/*` | Admin sessiyalari: yaratish, kod, qo'shilish, `/:id/route`, `/:id/finish` |
| `/api/question-sets/*`, `/api/desmos/*` | Amaliyot to'plamlari va Desmos darsliklari |
| `/api/results`, `/api/leaderboard` | "Mening natijalarim" (sahifalab) va reyting |
| `/api/me/*` | Onboarding so'rovnomasi, Study Plan |
| `POST /api/analytics/track` | Sahifa ko'rishlar (faqat login qilganlar) |
| `/api/admin/*` | Analitika, foydalanuvchilar, savol banki |

Natija yuboruvchi endpointlar idempotent (`attemptId`) — tarmoq xatosida qayta yuborish
ikkinchi natija yaratmaydi. Kodli sessiya bir marta topshiriladi, "doimiy ochiq" — qayta.

## Lokal ishga tushirish

```bash
npm install && (cd server && npm install)
cp .env.example .env              # VITE_GOOGLE_CLIENT_ID
cp server/.env.example server/.env

# 1-terminal: Docker'siz lokal PostgreSQL (PGlite)
cd server && npm run db:local
# 2-terminal: API (migratsiyalar avtomatik)
cd server && npm run dev
# 3-terminal: frontend — http://localhost:5173 (/api va /socket.io proxy orqali)
npm run dev
```

Amaliyot to'plamlarini bazaga yozish: `cd server && npm run seed:practice -- --write`.
Owner (to'liq huquqli admin) qilish: `cd server && npm run make-admin -- email@example.com`.
Boshqa adminlar va ularning bo'lim ruxsatlari (Testlar, To'plamlar, Desmos, Analitika,
Userlarni bloklash), shuningdek userlarni bloklash — saytda Analitika > Foydalanuvchilar bo'limida.

## Deploy

Oracle Cloud VM'ga joylash, `.env` sozlamalari, backup va yangilash — `DEPLOY.md`.

## Yangi statik test qo'shish

`content/sat/` da modul fayllarini yozing va `content/sat/index.js` dagi `SAT_TESTS` ga hamda
`src/data/testsCatalog.js` ga qo'shing. Admin panel orqali qo'shiladigan testlar uchun kod
yozish shart emas.
