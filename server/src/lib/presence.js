// ------------------------------------------------------------------
// "Hozir saytda" — kim onlayn ekanini xotirada saqlaydi (DB'ga yozilmaydi).
// Brauzer ochiq va ko'rinib turgan tabdan har 30 soniyada ping yuboradi
// (src/components/PresencePing.jsx); oxirgi ONLINE_MS ichida ping bergan
// tashrif buyuruvchi onlayn hisoblanadi. API bitta jarayonda ishlaydi —
// qayta ishga tushganda ro'yxat bir daqiqa ichida qayta to'ladi.
// ------------------------------------------------------------------

export const ONLINE_MS = 75_000;
const MAX_VISITORS = 5000;

// visitorId -> { userId, page, since, lastSeen }
const visitors = new Map();

function prune(now = Date.now()) {
  for (const [id, v] of visitors) if (now - v.lastSeen > ONLINE_MS) visitors.delete(id);
}

export function ping(visitorId, userId, page) {
  const now = Date.now();
  const prev = visitors.get(visitorId);
  const fresh = prev && now - prev.lastSeen <= ONLINE_MS;
  if (!prev && visitors.size >= MAX_VISITORS) prune(now);
  if (!prev && visitors.size >= MAX_VISITORS) return;
  visitors.set(visitorId, {
    userId: userId || null,
    page,
    // Login qilsa yoki chiqsa — yangi "seans" boshlanadi.
    since: fresh && prev.userId === (userId || null) ? prev.since : now,
    lastSeen: now,
  });
}

export function onlineSnapshot() {
  prune();
  return [...visitors.values()];
}
