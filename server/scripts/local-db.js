// ------------------------------------------------------------------
// Lokal ishlab chiqish uchun Docker'siz PostgreSQL: PGlite (WASM'da
// ishlaydigan haqiqiy Postgres) ni 5432-portda Postgres protokoli
// orqali ochadi. Ma'lumotlar server/.pglite papkasida saqlanadi.
// Production'da buning o'rniga docker-compose'dagi postgres ishlatiladi.
// ------------------------------------------------------------------
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.LOCAL_DB_PORT) || 5432;
const db = await PGlite.create("./.pglite");
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 20 });
await server.start();
console.log(`[local-db] Postgres (PGlite) 127.0.0.1:${port} da ishlayapti`);
console.log(`[local-db] DATABASE_URL=postgres://postgres:postgres@127.0.0.1:${port}/postgres`);

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
