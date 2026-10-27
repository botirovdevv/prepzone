import { API_URL } from "../api/client";
import { dayKey } from "./date";

// ------------------------------------------------------------------
// Sayt analitikasi (admin → Analitika sahifasi uchun ma'lumot yig'ish).
//
// Faqat login qilgan foydalanuvchilar kuzatiladi. Sahifa ko'rishlar
// xotirada yig'ilib, 5 daqiqada bir (yoki tab yopilganda) bitta so'rov
// bilan serverga yuboriladi: POST /api/analytics/track { views, pages }.
// Server kunlik sahifa statistikasi, "bugun faol" ro'yxati va user
// profilidagi hisoblagichlarni yangilaydi (server/src/routes/analytics.js).
// ------------------------------------------------------------------

const FLUSH_MS = 5 * 60_000;
// Tab yashirilganda (boshqa tabga o'tish) — oxirgi yuborishdan shuncha vaqt o'tgan bo'lsa.
const HIDDEN_FLUSH_MIN_MS = 2 * 60_000;

// Tartib muhim: birinchi mos kelgan pattern olinadi.
// Kalitlar: kichik lotin harflari va "_" (server shu formatni qabul qiladi).
const ROUTES = [
  { pattern: /^\/$/, key: "home", label: "Bosh sahifa" },
  { pattern: /^\/login$/, key: "login", label: "Kirish" },
  { pattern: /^\/register$/, key: "register", label: "Ro'yxatdan o'tish" },
  { pattern: /^\/verify-email$/, key: "verify_email", label: "Email tasdiqlash" },
  { pattern: /^\/dashboard$/, key: "dashboard", label: "Dashboard (Today)" },
  { pattern: /^\/join$/, key: "join", label: "Mock with key" },
  { pattern: /^\/sat\/select$/, key: "sat_select", label: "Practise tests" },
  { pattern: /^\/sat\/test$/, key: "sat_test", label: "SAT test (imtihon)" },
  { pattern: /^\/sat\/results(\/[^/]+)?$/, key: "sat_results", label: "Test natijasi" },
  { pattern: /^\/sat\/history$/, key: "sat_history", label: "Mock Scores" },
  { pattern: /^\/leaderboard$/, key: "leaderboard", label: "Leaderboard" },
  { pattern: /^\/vocabulary$/, key: "vocabulary", label: "Vocabulary" },
  { pattern: /^\/study-plan$/, key: "study_plan", label: "Study Plan" },
  { pattern: /^\/onboarding$/, key: "onboarding", label: "Onboarding so'rovnomasi" },
  { pattern: /^\/desmos$/, key: "desmos", label: "Desmos darslari" },
  { pattern: /^\/desmos\/[^/]+$/, key: "desmos_tutorial", label: "Desmos darsligi" },
  { pattern: /^\/account$/, key: "account", label: "Sozlamalar" },
  { pattern: /^\/session\/[^/]+\/test$/, key: "session_test", label: "Sessiya testi" },
  { pattern: /^\/session\/[^/]+\/results$/, key: "session_results", label: "Sessiya natijasi" },
  { pattern: /^\/practice$/, key: "practice", label: "Exam questions" },
  { pattern: /^\/practice\/[^/]+$/, key: "practice_set", label: "Amaliyot to'plami" },
];

const LABELS = Object.fromEntries(ROUTES.map((r) => [r.key, r.label]));

export function routeKey(pathname) {
  return ROUTES.find((r) => r.pattern.test(pathname))?.key || "other";
}

export function routeLabel(key) {
  return LABELS[key] || (key === "other" ? "Boshqa" : key);
}

export { dayKey };

// ---------------- Batching ----------------
let pending = { uid: null, views: 0, pages: {} };
let flushTimer = null;
let lastFlushAt = 0;
const visitedToday = new Set();

// "Bugun birinchi ko'rish" belgisi localStorage'da (barcha tablar uchun umumiy).
function alreadyVisited(marker) {
  if (visitedToday.has(marker)) return true;
  try {
    if (localStorage.getItem(`pz_visit::${marker}`)) {
      visitedToday.add(marker);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function rememberVisit(marker) {
  visitedToday.add(marker);
  try {
    localStorage.setItem(`pz_visit::${marker}`, "1");
    // Eski kunlarning belgilarini tozalash.
    const today = dayKey();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith("pz_visit::") && !k.includes(today)) localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

// Yig'ilgan ko'rishlarni serverga yuboradi. keepalive — tab yopilayotganda
// ham so'rov oxirigacha yetib borishi uchun.
export async function flushPageViews() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const batch = pending;
  if (!batch.uid || batch.views === 0) return;
  pending = { uid: batch.uid, views: 0, pages: {} };
  lastFlushAt = Date.now();
  rememberVisit(`${dayKey()}_${batch.uid}`);
  try {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ views: batch.views, pages: batch.pages }),
    });
  } catch (err) {
    console.error("Sahifa ko'rishlarni yuborishda xatolik:", err);
  }
}

export function trackPageView(user, pathname) {
  if (!user || pathname.startsWith("/admin")) return;
  // Boshqa user bilan kirilsa — avvalgisining ko'rishlarini alohida yuboramiz.
  if (pending.uid && pending.uid !== user.uid) flushPageViews();
  const key = routeKey(pathname);
  pending.uid = user.uid;
  pending.views += 1;
  pending.pages[key] = (pending.pages[key] || 0) + 1;
  // Birinchi ko'rish tezroq yuborilsin (admin "bugun faol"ni darhol ko'rsin).
  const firstOfDay = !alreadyVisited(`${dayKey()}_${user.uid}`);
  if (!flushTimer) flushTimer = setTimeout(flushPageViews, firstOfDay ? 3000 : FLUSH_MS);
}

// Tab yopilganda/yashirilganda qolgan ko'rishlarni yuborish.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && Date.now() - lastFlushAt >= HIDDEN_FLUSH_MIN_MS) flushPageViews();
  });
  window.addEventListener("pagehide", () => flushPageViews());
}
