import { api } from "../api/client";

// ------------------------------------------------------------------
// Joriy foydalanuvchining natijalari, yangidan eskiga, sahifalab
// (GET /api/results?limit=&before=). Server faqat o'z natijalarini
// qaytaradi — `coll` va `uid` eski imzo bilan moslik uchun qoldirilgan.
// `cursor` — oxirgi natijaning createdAt vaqti (keyingi sahifa shundan oldingilar).
// ------------------------------------------------------------------
export async function fetchUserResults(_coll, _uid, { pageSize = 20, after = null } = {}) {
  const qs = new URLSearchParams({ limit: String(pageSize) });
  if (after) qs.set("before", after);
  const { items, hasMore } = await api.get(`/results?${qs}`);
  return { items, cursor: items.at(-1)?.createdAt || null, hasMore };
}

// Jami natijalar soni.
export async function countUserResults() {
  const { count } = await api.get("/results/count");
  return count;
}
