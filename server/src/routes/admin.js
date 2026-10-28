import { readFile } from "node:fs/promises";
import { Router } from "express";
import { z } from "zod";
import { one, query } from "../db/index.js";
import { HttpError, badRequest, forbidden, notFound, parseBody } from "../lib/errors.js";
import { dayKey } from "../lib/limits.js";
import { ADMIN_PERMS, effectivePerms } from "../lib/permissions.js";
import { requireOwner, requirePerm } from "../middleware/auth.js";

// ------------------------------------------------------------------
// Faqat admin (index.js'da requireAdmin bilan ulanadi): sayt analitikasi,
// foydalanuvchilar ro'yxati, bloklash/admin tayinlash va savol banki
// (to'g'ri javoblar bilan). Har bir endpoint o'z bo'limi ruxsatini talab qiladi.
// ------------------------------------------------------------------

const router = Router();

const RANGES = [7, 30, 90];
const SOURCES = ["instagram", "telegram", "friends", "other"];

// Oxirgi `n` kunning kalitlari (Toshkent vaqti), eskidan yangiga.
function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(Date.now() - i * 86400_000)));
  return out;
}

router.get("/analytics", requirePerm("analytics"), async (req, res) => {
  const range = RANGES.includes(Number(req.query.range)) ? Number(req.query.range) : 30;
  const keys = lastDays(range);
  const from = keys[0];
  const to = keys.at(-1);
  // Davr boshi: Toshkent vaqti bo'yicha `from` kunining 00:00 i.
  const start = new Date(`${from}T00:00:00+05:00`);
  const todayStart = new Date(`${to}T00:00:00+05:00`);

  const [counts, sources, pages, visitors] = await Promise.all([
    one(
      `SELECT
         (SELECT count(*) FROM users)::int AS "totalUsers",
         (SELECT count(*) FROM users WHERE created_at >= $1)::int AS "newUsers",
         (SELECT count(*) FROM users WHERE last_seen_at >= $1)::int AS "activeInRange",
         (SELECT count(*) FROM users WHERE last_seen_at >= $2)::int AS "activeToday",
         (SELECT count(*) FROM results WHERE created_at >= $1)::int AS "testsInRange"`,
      [start, todayStart]
    ),
    query(
      `SELECT onboarding->>'source' AS source, count(*)::int AS count FROM users
       WHERE onboarding->>'source' = ANY($1) GROUP BY 1 ORDER BY 2 DESC`,
      [SOURCES]
    ),
    query("SELECT date, page, views FROM analytics_pages WHERE date BETWEEN $1 AND $2", [from, to]),
    query(
      "SELECT date, count(*)::int AS active FROM analytics_visitors WHERE date BETWEEN $1 AND $2 GROUP BY date",
      [from, to]
    ),
  ]);

  const days = {};
  const day = (k) => (days[k] ||= { date: k, views: 0, pages: {}, active: 0 });
  for (const r of pages.rows) {
    const d = day(r.date);
    d.views += r.views;
    d.pages[r.page] = (d.pages[r.page] || 0) + r.views;
  }
  for (const r of visitors.rows) day(r.date).active = r.active;

  res.json({
    stats: counts,
    sources: sources.rows.map((r) => [r.source, r.count]),
    days,
  });
});

const USERS_PAGE = 50;

const USER_SELECT = `SELECT u.*, l.best_score,
    (SELECT count(*) FROM results r WHERE r.user_id = u.id)::int AS tests
  FROM users u LEFT JOIN leaderboard l ON l.user_id = u.id`;

const FILTERS = {
  admins: "u.is_admin",
  blocked: "u.blocked_at IS NOT NULL",
};

function userItem(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    provider: u.google_id ? "google.com" : "password",
    emailVerified: u.email_verified,
    isAdmin: u.is_admin,
    isOwner: u.is_owner,
    adminPerms: effectivePerms(u),
    blocked: !!u.blocked_at,
    blockedAt: u.blocked_at,
    blockedReason: u.blocked_reason,
    createdAt: u.created_at,
    lastSeenAt: u.last_seen_at,
    pageViews: u.page_views,
    pages: u.pages,
    onboarding: u.onboarding,
    bestScore: u.best_score ?? null,
    tests: u.tests,
  };
}

// Foydalanuvchilar: oxirgi faollik bo'yicha sahifalab (?offset=), email
// boshlanishi bo'yicha qidiruv (?search=) va ?filter=admins|blocked.
router.get("/users", requirePerm("analytics", "users"), async (req, res) => {
  const search = String(req.query.search || "").trim().toLowerCase().slice(0, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const params = [USERS_PAGE + 1, offset];
  const where = [];
  if (search) {
    params.push(search.replace(/[%_\\]/g, "\\$&"));
    where.push(`lower(u.email) LIKE $${params.length} || '%'`);
  }
  if (Object.hasOwn(FILTERS, req.query.filter)) where.push(FILTERS[req.query.filter]);
  const { rows } = await query(
    `${USER_SELECT}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY u.last_seen_at DESC NULLS LAST, u.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );
  res.json({
    items: rows.slice(0, USERS_PAGE).map(userItem),
    hasMore: rows.length > USERS_PAGE,
  });
});

const findUserItem = async (id) => userItem(await one(`${USER_SELECT} WHERE u.id = $1`, [id]));

// Bloklash va admin tayinlash uchun nishon: o'zingiz va owner hisobi o'zgarmaydi.
async function targetUser(req) {
  const user = await one("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!user) throw notFound("Foydalanuvchi topilmadi.");
  if (user.id === req.user.id) throw badRequest("invalid-argument", "O'zingizga bu amalni qo'llab bo'lmaydi.");
  if (user.is_owner) throw forbidden("Owner hisobini o'zgartirib bo'lmaydi.");
  return user;
}

// Bloklash / blokdan chiqarish. Bloklashda barcha sessiyalari bekor bo'ladi.
// Adminni faqat owner bloklay oladi.
router.patch("/users/:id/block", requirePerm("users"), async (req, res) => {
  const body = parseBody(
    z.object({ blocked: z.boolean(), reason: z.string().trim().max(300).optional() }),
    req.body
  );
  const user = await targetUser(req);
  if (user.is_admin && !req.user.is_owner) throw forbidden("Adminni faqat owner bloklay oladi.");
  if (body.blocked) {
    await query(
      `UPDATE users SET blocked_at = now(), blocked_reason = $2, token_version = token_version + 1
       WHERE id = $1`,
      [user.id, body.reason || null]
    );
  } else {
    await query("UPDATE users SET blocked_at = NULL, blocked_reason = NULL WHERE id = $1", [user.id]);
  }
  res.json({ user: await findUserItem(user.id) });
});

// Admin tayinlash va bo'lim ruxsatlari — faqat owner. Bo'sh ro'yxat = adminlikdan olish.
router.put("/users/:id/admin", requireOwner, async (req, res) => {
  const body = parseBody(z.object({ perms: z.array(z.enum(ADMIN_PERMS, "Noma'lum ruxsat.")).max(ADMIN_PERMS.length) }), req.body);
  const user = await targetUser(req);
  const perms = [...new Set(body.perms)];
  if (perms.length && user.blocked_at) {
    throw badRequest("failed-precondition", "Bloklangan userni admin qilib bo'lmaydi.");
  }
  await query("UPDATE users SET admin_perms = $2, is_admin = $3 WHERE id = $1", [
    user.id,
    perms,
    perms.length > 0,
  ]);
  res.json({ user: await findUserItem(user.id) });
});

// Admin savol banki: server/question-bank/<file>.json (to'g'ri javoblar bilan,
// shuning uchun public'da emas).
router.get("/question-bank", requirePerm("sets", "sessions"), async (req, res) => {
  const file = String(req.query.file || "");
  if (!/^(rw|math)-[a-z-]{2,40}$/.test(file)) throw new HttpError(400, "invalid-argument", "Noto'g'ri fayl nomi.");
  let body;
  try {
    body = await readFile(new URL(`../../question-bank/${file}.json`, import.meta.url), "utf8");
  } catch {
    throw new HttpError(404, "not-found", "Bu mavzu uchun savol banki topilmadi.");
  }
  res.set("Cache-Control", "private, max-age=3600").type("application/json").send(body);
});

export default router;
