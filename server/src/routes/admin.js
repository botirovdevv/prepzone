import { readFile } from "node:fs/promises";
import { disconnectUser } from "../lib/realtime.js";
import { Router } from "express";
import { endOtherSessions } from "../lib/session.js";
import { z } from "zod";
import { one, query } from "../db/index.js";
import { HttpError, badRequest, forbidden, notFound, parseBody } from "../lib/errors.js";
import { dayKey } from "../lib/limits.js";
import { ADMIN_PERMS, effectivePerms } from "../lib/permissions.js";
import { requireOwner, requirePerm } from "../middleware/auth.js";
import { onlineSnapshot } from "../lib/presence.js";
import { SAT_TESTS } from "../../../content/sat/index.js";
import { cleanAnswers, getStaticSections, module2For } from "../lib/satScoring.js";
import { isAnswerCorrect } from "../../../src/utils/irtScoring.js";

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

// "Hozir saytda": onlayn userlar (bir nechta tab — bitta qator) va mehmonlar soni.
router.get("/online", requirePerm("analytics"), async (_req, res) => {
  const all = onlineSnapshot();
  const byUser = new Map();
  let guests = 0;
  for (const v of all) {
    if (!v.userId) {
      guests += 1;
      continue;
    }
    const cur = byUser.get(v.userId);
    if (!cur) byUser.set(v.userId, { page: v.page, since: v.since, lastSeen: v.lastSeen, tabs: 1 });
    else {
      cur.tabs += 1;
      cur.since = Math.min(cur.since, v.since);
      if (v.lastSeen > cur.lastSeen) Object.assign(cur, { page: v.page, lastSeen: v.lastSeen });
    }
  }
  const ids = [...byUser.keys()];
  const { rows } = ids.length
    ? await query("SELECT id, email, display_name, is_admin, is_owner FROM users WHERE id = ANY($1)", [ids])
    : { rows: [] };
  const users = rows
    .map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.display_name,
      isAdmin: u.is_admin || u.is_owner,
      ...byUser.get(u.id),
      since: new Date(byUser.get(u.id).since).toISOString(),
      lastSeen: new Date(byUser.get(u.id).lastSeen).toISOString(),
    }))
    .sort((a, b) => a.since.localeCompare(b.since));
  res.set("Cache-Control", "no-store").json({ total: users.length + guests, users, guests, at: new Date().toISOString() });
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
    await endOtherSessions(user.id);
    disconnectUser(user.id);
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
  // Socket'dagi admin xonalari (session-admin:*) ulanishda beriladi — qayta ulansin.
  disconnectUser(user.id);
  res.json({ user: await findUserItem(user.id) });
});

// ------------------------------------------------------------------
// Barcha mock testlar bitta ro'yxatda: tayyor (content/sat) testlar va
// admin sessiyalari — bir xil ko'rinish, bir xil tahlil sahifasi.
// ------------------------------------------------------------------

const MODULE_KEYS = ["module1", "module2Easy", "module2Hard", "module2Mixed"];
const SECTION_TITLES = { rw: "Reading and Writing", math: "Math" };

// Bo'lim savollari soni (talaba ko'radigan: Module 1 + bitta Module 2).
const sectionQuestions = (sec) =>
  (sec.module1 || []).length +
  Math.max((sec.module2Mixed || []).length, (sec.module2Hard || []).length, (sec.module2Easy || []).length);

// id -> { kind, title, sections (kalitlar bilan), where (results filtri), session? }
async function loadTest(id) {
  if (SAT_TESTS[id]) {
    const test = SAT_TESTS[id];
    return {
      kind: "builtin",
      title: test.testTitle,
      sections: getStaticSections(id).sections.map((sec) => ({
        ...sec,
        title: test.groups.find((g) => g.id === sec.id)?.title || SECTION_TITLES[sec.id] || sec.id,
      })),
      where: ["r.test_id = $1", id],
    };
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const row = await one("SELECT id, access_type, status, code, meta, content FROM test_sessions WHERE id = $1", [id]);
  if (!row) return null;
  const metaSections = row.meta?.sections || [];
  return {
    kind: "session",
    title: row.meta?.title || "Test",
    session: { accessType: row.access_type, status: row.status, code: row.code },
    sections: (row.content?.sections || []).map((sec) => ({
      id: sec.id,
      title: metaSections.find((m) => m.id === sec.id)?.title || SECTION_TITLES[sec.id] || sec.id,
      ...Object.fromEntries(MODULE_KEYS.map((k) => [k, sec[k] || []])),
    })),
    where: ["r.session_id = $1", id],
  };
}

router.get("/tests", requirePerm("sessions"), async (_req, res) => {
  const ids = Object.keys(SAT_TESTS);
  const [{ rows: sessions }, { rows: stats }] = await Promise.all([
    query("SELECT id, access_type, status, code, scheduled_at, meta, created_at FROM test_sessions"),
    query(
      `SELECT coalesce(test_id, session_id::text) AS key,
              count(*)::int AS attempts,
              count(DISTINCT user_id)::int AS users,
              count(*) FILTER (WHERE complete)::int AS complete,
              round(avg(total) FILTER (WHERE complete))::int AS avg_total
       FROM results WHERE test_id = ANY($1) OR session_id IS NOT NULL
       GROUP BY 1`,
      [ids]
    ),
  ]);
  const byKey = Object.fromEntries(stats.map((r) => [r.key, r]));
  const withStats = (item) => {
    const r = byKey[item.id] || {};
    return { ...item, attempts: r.attempts || 0, users: r.users || 0, complete: r.complete || 0, avgTotal: r.avg_total ?? null };
  };
  // Tartib talabalar ko'radigan ro'yxat bilan bir xil: sessiyalar (eskidan
  // yangiga), keyin tayyor testlar.
  const items = [
    ...sessions
      .sort((x, y) => new Date(x.created_at) - new Date(y.created_at))
      .map((s) =>
        withStats({
          id: s.id,
          kind: "session",
          title: s.meta?.title || "Test",
          questions: (s.meta?.sections || []).reduce((n, sec) => n + (sec.questionCount || 0), 0),
          accessType: s.access_type,
          status: s.status,
          code: s.code,
          scheduledAt: s.scheduled_at,
        })
      ),
    ...ids.map((id) =>
      withStats({
        id,
        kind: "builtin",
        title: SAT_TESTS[id].testTitle,
        questions: getStaticSections(id).sections.reduce((n, sec) => n + sectionQuestions(sec), 0),
        accessType: "open",
        status: "open",
      })
    ),
  ];
  res.json(items);
});

const plain = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);

// Belgilangan qiyinlik real natijaga mos kelmasa — savol belgilanadi
// (kamida MIN_N urinishda). Kelajakda IRT parametrlarini kalibrlash uchun.
const MIN_N = 10;
function difficultyFlag(label, p, n) {
  if (n < MIN_N || p == null) return null;
  const l = String(label || "").toUpperCase()[0];
  if (l === "H" && p >= 0.85) return "easier";
  if (l === "E" && p <= 0.35) return "harder";
  if (l === "M" && (p >= 0.92 || p <= 0.15)) return p >= 0.92 ? "easier" : "harder";
  return null;
}

// Natijada saqlangan yo'nalishdan Module 2 kaliti.
const module2Key = (route) => (route === "hard" ? "module2Hard" : route === "easy" ? "module2Easy" : "module2Mixed");

router.get("/tests/:id", requirePerm("sessions"), async (req, res) => {
  const test = await loadTest(req.params.id);
  if (!test) throw notFound("Test topilmadi.");

  const { rows } = await query(
    `SELECT r.id, r.user_id, r.total, r.complete, r.created_at, r.data,
            u.display_name, u.email
     FROM results r JOIN users u ON u.id = r.user_id
     WHERE ${test.where[0]} ORDER BY r.created_at DESC LIMIT 2000`,
    [test.where[1]]
  );

  // Savollar tahlili: har modul/savol uchun to'g'ri yechganlar ulushi.
  const stats = {};
  const routes = {};
  const add = (key, questions, answers) => {
    const b = (stats[key] ||= questions.map(() => ({ n: 0, correct: 0 })));
    const clean = cleanAnswers(answers, questions.length);
    questions.forEach((q, i) => {
      if (!b[i]) return;
      b[i].n += 1;
      if (isAnswerCorrect(q, clean[i])) b[i].correct += 1;
    });
  };
  for (const r of rows) {
    for (const section of test.sections) {
      const sr = r.data?.results?.[section.id];
      if (!sr || !Array.isArray(sr.module1Answers)) continue;
      add(`${section.id}:module1`, section.module1, sr.module1Answers);
      if (sr.route === "hard" || sr.route === "easy") {
        const rt = (routes[section.id] ||= { hard: 0, easy: 0 });
        rt[sr.route] += 1;
      }
      if (Array.isArray(sr.module2Answers)) {
        const key = module2Key(sr.route);
        const questions = section[key]?.length ? section[key] : module2For(section, sr.route);
        add(`${section.id}:${key}`, questions, sr.module2Answers);
      }
    }
  }

  const modules = [];
  for (const section of test.sections) {
    for (const key of MODULE_KEYS) {
      const questions = section[key] || [];
      if (!questions.length) continue;
      const b = stats[`${section.id}:${key}`] || [];
      modules.push({
        sectionId: section.id,
        sectionTitle: section.title,
        module: key,
        questions: questions.map((q, i) => {
          const n = b[i]?.n || 0;
          const p = n ? b[i].correct / n : null;
          return {
            index: i + 1,
            id: q.id ?? `${section.id}-${key}-${i + 1}`,
            type: q.type,
            domain: q.domain || "",
            skill: q.skill || "",
            difficulty: q.difficulty || "",
            preview: plain(q.prompt || q.passage),
            n,
            pCorrect: p,
            flag: difficultyFlag(q.difficulty, p, n),
          };
        }),
      });
    }
  }

  const complete = rows.filter((r) => r.complete);
  const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const sectionAvg = (id) =>
    avg(complete.map((r) => r.data?.results?.[id]?.scaledScore).filter((v) => typeof v === "number"));
  const distribution = [];
  for (let lo = 400; lo < 1600; lo += 100) {
    distribution.push({
      from: lo,
      to: lo + 99,
      count: complete.filter((r) => r.total >= lo && (lo === 1500 ? r.total <= 1600 : r.total < lo + 100)).length,
    });
  }

  res.json({
    id: req.params.id,
    kind: test.kind,
    session: test.session || null,
    title: test.title,
    questions: test.sections.reduce((n, sec) => n + sectionQuestions(sec), 0),
    summary: {
      attempts: rows.length,
      users: new Set(rows.map((r) => r.user_id)).size,
      complete: complete.length,
      avgTotal: avg(complete.map((r) => r.total)),
      bestTotal: complete.length ? Math.max(...complete.map((r) => r.total)) : null,
      sections: test.sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        avg: sectionAvg(sec.id),
        hardShare: routes[sec.id] ? routes[sec.id].hard / (routes[sec.id].hard + routes[sec.id].easy) : null,
      })),
    },
    distribution,
    attempts: rows.slice(0, 200).map((r) => ({
      id: r.id,
      name: r.display_name || r.email.split("@")[0],
      email: r.email,
      total: r.total,
      totalLow: r.data?.totalLow ?? null,
      totalHigh: r.data?.totalHigh ?? null,
      sections: Object.fromEntries(
        test.sections.map((sec) => {
          const sr = r.data?.results?.[sec.id];
          return [sec.id, sr ? { score: sr.scaledScore, route: sr.route || null } : null];
        })
      ),
      complete: r.complete,
      terminated: Boolean(r.data?.terminated),
      createdAt: r.created_at,
    })),
    modules,
  });
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
