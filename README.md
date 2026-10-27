# Prepzone — Digital SAT mock test platformasi

Bluebook (real SAT) interfeysiga o'xshatilgan mock test platformasi: to'liq adaptiv SAT testlari, mavzu bo'yicha mashq to'plamlari, Desmos darsliklari, reyting va admin tashkil qiladigan kodli testlar (jonli proktoring monitoringi bilan).

## Arxitektura

```
prepzone/
  src/                  React 19 + Vite + Tailwind (frontend)
    api/client.js       Backend bilan ishlash (fetch, cookie sessiya)
    api/socket.js       Socket.IO — sessiya testlarining jonli yangilanishlari
    context/AuthContext Login / ro'yxatdan o'tish / Google / OTP
    components/auth/    Login & Register sahifalarining umumiy komponentlari
  server/               Node.js + Express + PostgreSQL (backend)
    src/routes/         auth, results, sessions, question-sets, desmos
    src/db/migrations/  SQL sxema (server ishga tushganda avtomatik qo'llanadi)
    scripts/            local-db, make-admin, migrate-from-firestore
  docker-compose.yml    Production: postgres + api + caddy (HTTPS)
  DEPLOY.md             Oracle Cloud'ga joylash qo'llanmasi
```

- **Autentifikatsiya:** email/parol (bcrypt) va Google; sessiya httpOnly cookie'dagi JWT. Email 6 xonali kod bilan tasdiqlanadi (Resend). Google foydalanuvchilar avtomatik tasdiqlangan.
- **Xavfsizlik:** test savollari va to'g'ri javoblar faqat admin va kod bilan qo'shilgan ishtirokchiga beriladi; sessiya kodi oddiy foydalanuvchiga ko'rsatilmaydi; login/OTP endpointlarida rate limit.

## Lokal ishga tushirish

Talab: Node.js 20+. Docker shart emas — lokal baza uchun PGlite (WASM Postgres) ishlatiladi.

```bash
npm install
cd server && npm install && cp .env.example .env && cd ..
```

Uchta terminalda:

```bash
cd server && npm run db:local   # 1) lokal PostgreSQL (127.0.0.1:5432)
cd server && npm run dev        # 2) API — http://localhost:4000
npm run dev                     # 3) frontend — http://localhost:5173
```

- `RESEND_API_KEY` bo'sh bo'lsa, tasdiqlash kodlari API terminaliga chiqadi.
- Google orqali kirishni sinash uchun root `.env`ga `VITE_GOOGLE_CLIENT_ID`, `server/.env`ga `GOOGLE_CLIENT_ID` yozing (Google Console'da `http://localhost:5173` origin qo'shilgan bo'lsin).
- Admin qilish: `cd server && npm run make-admin -- email@example.com`

## Production

[DEPLOY.md](./DEPLOY.md) — Oracle Cloud Always Free serveriga Docker bilan joylash, domen, HTTPS, Google OAuth, backup va Firebase'dan ma'lumot ko'chirish.

## Build

```bash
npm run build   # dist/
npm run lint
```
