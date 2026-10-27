// ------------------------------------------------------------------
// Firebase (Auth + Firestore) -> PostgreSQL bir martalik ko'chirish.
//
// Foydalanish (server papkasida):
//   1. Firebase Console -> Project settings -> Service accounts ->
//      "Generate new private key" -> faylni server/firebase-service-account.json
//      sifatida saqlang (u .gitignore'da, hech qachon commit qilmang!).
//   2. DATABASE_URL yangi bazaga qaratilgan bo'lsin.
//   3. Avval sinov:     npm run migrate:firestore -- --dry-run
//      Keyin haqiqiy:   npm run migrate:firestore
//
// Skript idempotent — qayta ishga tushirilsa yozuvlar yangilanadi,
// dublikat yaratilmaydi. Firebase UID va hujjat ID'lari saqlanadi.
//
// MUHIM: Firebase parol hashlarini ko'chirib bo'lmaydi. Email/parol bilan
// ro'yxatdan o'tganlar birinchi kirishda "Parolni unutdingizmi?" orqali
// yangi parol o'rnatadi. Google foydalanuvchilar darhol kira oladi.
// ------------------------------------------------------------------
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { pool } from "../src/db/index.js";
import { migrate } from "../src/db/migrate.js";

const DRY_RUN = process.argv.includes("--dry-run");
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || "./firebase-service-account.json";

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const fsdb = getFirestore();

const stats = {};
const count = (key, n = 1) => (stats[key] = (stats[key] || 0) + n);
const warn = (msg) => {
  count("ogohlantirishlar");
  console.warn(`  ! ${msg}`);
};

// Firestore Timestamp'larini ISO satrga aylantiradi (JSONB uchun).
function plain(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  }
  return value;
}

const toDate = (v) => (v instanceof Timestamp ? v.toDate() : v ? new Date(v) : null);

function omit(obj, keys) {
  const copy = { ...obj };
  for (const k of keys) delete copy[k];
  return plain(copy);
}

async function write(sql, params) {
  if (!DRY_RUN) await pool.query(sql, params);
}

// ------------------------------------------------------------------

async function migrateUsers() {
  console.log("Foydalanuvchilar...");
  const admins = new Set((await fsdb.collection("admins").get()).docs.map((d) => d.id));
  const verified = new Set(
    (await fsdb.collection("otpStatus").get()).docs
      .filter((d) => d.data().verified === true)
      .map((d) => d.id)
  );

  const ids = new Set();
  const emails = new Set();
  let pageToken;
  do {
    const page = await getAuth().listUsers(1000, pageToken);
    for (const u of page.users) {
      if (!u.email) {
        warn(`${u.uid}: email yo'q — o'tkazib yuborildi`);
        continue;
      }
      const email = u.email.toLowerCase();
      if (emails.has(email)) {
        warn(`${u.uid}: ${email} takroriy email — o'tkazib yuborildi`);
        continue;
      }
      emails.add(email);
      const google = u.providerData.find((p) => p.providerId === "google.com");
      await write(
        `INSERT INTO users (id, email, google_id, display_name, email_verified, is_admin, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, google_id = EXCLUDED.google_id,
           display_name = EXCLUDED.display_name, email_verified = EXCLUDED.email_verified,
           is_admin = EXCLUDED.is_admin`,
        [
          u.uid,
          email,
          google?.uid || null,
          u.displayName || "",
          verified.has(u.uid) || !!google,
          admins.has(u.uid),
          new Date(u.metadata.creationTime),
        ]
      );
      ids.add(u.uid);
      count(google ? "users (Google)" : "users (email/parol)");
      if (admins.has(u.uid)) count("adminlar");
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return ids;
}

async function migrateResults(userIds) {
  console.log("Natijalar...");
  for (const d of (await fsdb.collection("results").get()).docs) {
    const r = d.data();
    if (!userIds.has(r.uid)) {
      warn(`results/${d.id}: foydalanuvchi ${r.uid} topilmadi`);
      continue;
    }
    await write(
      `INSERT INTO results (id, user_id, total, session_id, data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET total = EXCLUDED.total, data = EXCLUDED.data`,
      [
        d.id,
        r.uid,
        Math.round(r.total || 0),
        r.sessionId || null,
        omit(r, ["uid", "total", "sessionId", "createdAt"]),
        toDate(r.createdAt) || new Date(),
      ]
    );
    count("results");
  }

  for (const d of (await fsdb.collection("leaderboard").get()).docs) {
    const r = d.data();
    if (!userIds.has(d.id)) continue;
    await write(
      `INSERT INTO leaderboard (user_id, name, best_score, updated_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, best_score = EXCLUDED.best_score`,
      [d.id, r.name || "Foydalanuvchi", Math.round(r.bestScore || 0), toDate(r.updatedAt) || new Date()]
    );
    count("leaderboard");
  }
}

async function migrateSessions(userIds) {
  console.log("Sessiya testlari...");
  for (const d of (await fsdb.collection("testSessions").get()).docs) {
    const s = d.data();
    const content = (await d.ref.collection("secure").doc("content").get()).data() || {};
    await write(
      `INSERT INTO test_sessions (id, code, access_type, status, scheduled_at, meta, content, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, access_type = EXCLUDED.access_type,
         status = EXCLUDED.status, scheduled_at = EXCLUDED.scheduled_at,
         meta = EXCLUDED.meta, content = EXCLUDED.content`,
      [
        d.id,
        s.code,
        s.accessType === "open" ? "open" : "code",
        s.status || "scheduled",
        toDate(s.scheduledAt),
        omit(s, ["code", "accessType", "status", "scheduledAt", "createdAt"]),
        plain(content),
        toDate(s.createdAt) || new Date(),
      ]
    );
    count("testSessions");

    for (const p of (await d.ref.collection("participants").get()).docs) {
      if (!userIds.has(p.id)) continue;
      const data = p.data();
      await write(
        `INSERT INTO session_participants (session_id, user_id, data, joined_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (session_id, user_id) DO UPDATE SET data = EXCLUDED.data`,
        [d.id, p.id, omit(data, ["uid", "joinedAt", "enteredCode"]), toDate(data.joinedAt) || new Date()]
      );
      count("participants");
    }

    for (const e of (await d.ref.collection("events").get()).docs) {
      const data = e.data();
      if (!userIds.has(data.uid)) continue;
      await write(
        `INSERT INTO session_events (id, session_id, user_id, data, at) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, d.id, data.uid, omit(data, ["uid", "at"]), toDate(data.at) || new Date()]
      );
      count("events");
    }

    for (const r of (await d.ref.collection("results").get()).docs) {
      if (!userIds.has(r.id)) continue;
      const data = r.data();
      await write(
        `INSERT INTO session_results (session_id, user_id, total, data, finished_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (session_id, user_id) DO UPDATE SET total = EXCLUDED.total, data = EXCLUDED.data`,
        [d.id, r.id, Math.round(data.total || 0), omit(data, ["uid", "total", "finishedAt"]), toDate(data.finishedAt) || new Date()]
      );
      count("session results");
    }
  }
}

async function migrateContent() {
  console.log("O'quv kontenti...");
  for (const d of (await fsdb.collection("questionSets").get()).docs) {
    const data = d.data();
    await write(
      `INSERT INTO question_sets (id, data, created_at) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [d.id, omit(data, ["createdAt"]), toDate(data.createdAt) || new Date()]
    );
    count("questionSets");
  }
  for (const d of (await fsdb.collection("desmosTutorials").get()).docs) {
    const data = d.data();
    await write(
      `INSERT INTO desmos_tutorials (id, sort_order, data, created_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET sort_order = EXCLUDED.sort_order, data = EXCLUDED.data`,
      [d.id, Math.round(Number(data.order) || 0), omit(data, ["order", "createdAt"]), toDate(data.createdAt) || new Date()]
    );
    count("desmosTutorials");
  }
}

// ------------------------------------------------------------------

console.log(DRY_RUN ? "SINOV REJIMI (--dry-run): bazaga hech narsa yozilmaydi\n" : "Ko'chirish boshlandi\n");
if (!DRY_RUN) await migrate();

const userIds = await migrateUsers();
await migrateResults(userIds);
await migrateSessions(userIds);
await migrateContent();

console.log("\nNatija:");
for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(22)} ${v}`);
await pool.end();
