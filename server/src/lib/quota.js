import { dayKey } from "./limits.js";
import { activePlan, planLimitError, planLimits } from "./plans.js";

// ------------------------------------------------------------------
// Tarif limitlari: to'liq mock (hafta/oy) va AI tutor (kun). Hisob
// Toshkent vaqti bo'yicha.
// ------------------------------------------------------------------

const TZ_MS = 5 * 3600_000;

// Joriy hafta (dushanba 00:00) / oy (1-kun 00:00) boshlanishi, UTC Date.
function periodStart(kind, now = new Date()) {
  const local = new Date(now.getTime() + TZ_MS);
  if (kind === "week") {
    const dow = (local.getUTCDay() + 6) % 7; // 0 = dushanba
    local.setUTCDate(local.getUTCDate() - dow);
  } else {
    local.setUTCDate(1);
  }
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - TZ_MS);
}

export async function mockQuota(client, user) {
  const limits = planLimits(user);
  const kind = limits.mocksPerWeek != null ? "week" : limits.mocksPerMonth != null ? "month" : null;
  if (!kind) return { limit: null, used: 0, remaining: null, period: null };
  const limit = kind === "week" ? limits.mocksPerWeek : limits.mocksPerMonth;
  const since = periodStart(kind);
  const { rows } = await client.query(
    "SELECT count(*)::int AS n FROM results WHERE user_id = $1 AND session_id IS NULL AND created_at >= $2",
    [user.id, since]
  );
  const used = rows[0].n;
  return { limit, used, remaining: Math.max(limit - used, 0), period: kind };
}

export async function assertMockQuota(client, user) {
  const q = await mockQuota(client, user);
  if (q.limit != null && q.used >= q.limit) {
    throw planLimitError(
      q.period === "week"
        ? "Bepul tarifda haftasiga 1 ta to'liq mock. Cheksiz mock uchun tarifni yangilang."
        : "Bu oy uchun mock limiti tugadi. Pro tarifda mocklar cheksiz.",
      "mock"
    );
  }
  return q;
}

export async function aiQuota(client, user) {
  const limit = planLimits(user).aiPerDay;
  const { rows } = await client.query(
    "SELECT count FROM rate_limits WHERE day = $1 AND user_id = $2 AND action = 'aiTutor'",
    [dayKey(), user.id]
  );
  const used = rows[0]?.count || 0;
  return { limit, used, remaining: limit == null ? null : Math.max(limit - used, 0) };
}

// AI tutor: limit tugagan bo'lsa 402 plan-limit, aks holda hisoblagichni oshiradi.
export async function consumeAi(client, user) {
  const limit = planLimits(user).aiPerDay;
  const { rows } = await client.query(
    `INSERT INTO rate_limits (day, user_id, action, count) VALUES ($1, $2, 'aiTutor', 1)
     ON CONFLICT (day, user_id, action) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [dayKey(), user.id]
  );
  if (limit != null && rows[0].count > limit) {
    await client.query(
      "UPDATE rate_limits SET count = count - 1 WHERE day = $1 AND user_id = $2 AND action = 'aiTutor'",
      [dayKey(), user.id]
    );
    throw planLimitError(
      activePlan(user) === "free"
        ? "Bugungi 3 ta bepul AI tushuntirish tugadi. Pro tarifda kuniga 50 ta."
        : "Bugungi AI tushuntirishlar limiti tugadi, ertaga davom eting.",
      "ai"
    );
  }
}

export async function quotaSummary(client, user) {
  const [mock, ai] = await Promise.all([mockQuota(client, user), aiQuota(client, user)]);
  return { plan: activePlan(user), planEndsAt: user.plan_ends_at || null, limits: planLimits(user), mock, ai };
}
