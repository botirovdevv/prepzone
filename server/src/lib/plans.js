import { HttpError } from "./errors.js";

// ------------------------------------------------------------------
// Tariflar — yagona manba. Frontend narx va limitlarni GET /api/billing/plans
// orqali oladi. Narxlar so'mda; to'lov bir martalik (avto-yangilanish yo'q),
// yangi to'lov joriy muddat ustiga qo'shiladi.
//
// Limitlar: null = cheksiz. mocksPerWeek / mocksPerMonth — to'liq SAT mock
// topshirish; aiPerDay — AI tutor tushuntirishlari; practiceSets — ochiq
// amaliyot to'plamlari soni.
// ------------------------------------------------------------------

export const PLAN_IDS = ["free", "sprint", "pro", "elite"];

export const PLANS = {
  free: {
    id: "free",
    prices: {},
    limits: { mocksPerWeek: 1, mocksPerMonth: null, aiPerDay: 3, practiceSets: 3, roomMinutes: 40, mistakeReview: false, predictor: false, mentor: false },
  },
  sprint: {
    id: "sprint",
    prices: { 1: 59_000, 3: 149_000 },
    limits: { mocksPerWeek: null, mocksPerMonth: 4, aiPerDay: 10, practiceSets: null, roomMinutes: 40, mistakeReview: true, predictor: true, mentor: false },
  },
  pro: {
    id: "pro",
    popular: true,
    prices: { 1: 129_000, 3: 299_000 },
    limits: { mocksPerWeek: null, mocksPerMonth: null, aiPerDay: 50, practiceSets: null, roomMinutes: 90, mistakeReview: true, predictor: true, mentor: false },
  },
  elite: {
    id: "elite",
    prices: { 1: 249_000, 3: 599_000 },
    // "Cheksiz" AI — adolatli foydalanish chegarasi bilan.
    limits: { mocksPerWeek: null, mocksPerMonth: null, aiPerDay: 150, practiceSets: null, roomMinutes: 90, mistakeReview: true, predictor: true, mentor: true },
  },
};

export const RANK = { free: 0, sprint: 1, pro: 2, elite: 3 };

// Foydalanuvchining amaldagi tarifi (muddati o'tgan bo'lsa — free).
export function activePlan(user) {
  if (!user) return "free";
  if (user.is_admin) return "elite";
  if (user.plan && user.plan !== "free" && user.plan_ends_at && new Date(user.plan_ends_at) > new Date()) {
    return PLANS[user.plan] ? user.plan : "free";
  }
  return "free";
}

export function planLimits(user) {
  return PLANS[activePlan(user)].limits;
}

export function priceFor(plan, months) {
  const price = PLANS[plan]?.prices?.[months];
  if (!price) throw new HttpError(400, "invalid-argument", "Bunday tarif yoki muddat yo'q.");
  return price;
}

// Limit tugaganda frontend upgrade oynasini ochadi (code: "plan-limit").
export function planLimitError(message, feature) {
  const err = new HttpError(402, "plan-limit", message);
  err.feature = feature;
  return err;
}

// Tarif berish (tranzaksiya ichida). Bir xil yoki yuqori tarif joriy muddat
// ustiga qo'shiladi; boshqa tarifga o'tishda muddat hozirdan boshlanadi.
export async function grantPlan(client, userId, plan, months, { paymentId = null, grantedBy = null } = {}) {
  const { rows } = await client.query("SELECT plan, plan_ends_at FROM users WHERE id = $1 FOR UPDATE", [userId]);
  const cur = rows[0];
  if (!cur) throw new HttpError(404, "not-found", "Foydalanuvchi topilmadi.");
  const now = new Date();
  const curEnd = cur.plan_ends_at ? new Date(cur.plan_ends_at) : null;
  const stillActive = curEnd && curEnd > now && cur.plan !== "free";
  const start = stillActive && cur.plan === plan ? curEnd : now;
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  // Yuqoriroq tarifdan pastiga o'tilsa ham qolgan kunlar yo'qolmasin:
  // yuqori tarif amal qilayotgan bo'lsa, yangi muddat uning oxiridan boshlanadi
  // va tarif yuqorisi saqlanadi.
  let newPlan = plan;
  let newEnd = end;
  if (stillActive && cur.plan !== plan && RANK[cur.plan] > RANK[plan]) {
    newPlan = cur.plan;
    newEnd = new Date(curEnd);
    newEnd.setMonth(newEnd.getMonth() + months);
  }
  await client.query("UPDATE users SET plan = $2, plan_ends_at = $3 WHERE id = $1", [userId, newPlan, newEnd]);
  await client.query(
    `INSERT INTO subscriptions (user_id, plan, months, starts_at, ends_at, payment_id, granted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, newPlan, months, start, newEnd, paymentId, grantedBy]
  );
  return { plan: newPlan, endsAt: newEnd };
}
