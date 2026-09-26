import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// ------------------------------------------------------------------
// Sayt analitikasi (admin → Analitika sahifasi uchun ma'lumot yig'ish).
//
// Faqat login qilgan foydalanuvchilar kuzatiladi. Ko'p user bir vaqtda
// ishlaganda bitta hujjatga yozish tiqilib qolmasligi (Firestore bitta
// hujjatga ~1 yozuv/soniya tavsiya qiladi) uchun:
//   analyticsShards/{kun}_{0..19} — kunlik hisoblagich 20 ta bo'lakka
//                                    bo'lingan (tasodifiy bo'lakka yoziladi)
//   analyticsVisitors/{kun}_{uid}  — shu kuni faol bo'lgan user (kuniga 1 marta)
//   users/{uid}                    — user profili + sahifa statistikasi
// Sahifa ko'rishlar xotirada yig'ilib, 30 soniyada yoki tab
// yashirilganda bitta yozuv bilan yuboriladi.
// Eski format (analytics/{kun} hujjati) admin sahifasida hali ham o'qiladi.
// ------------------------------------------------------------------

const SHARDS = 20;
const FLUSH_MS = 30_000;

// Tartib muhim: birinchi mos kelgan pattern olinadi.
// Kalitlarda "/" bo'lmasligi kerak (Firestore field nomi sifatida ishlatiladi).
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
  { pattern: /^\/choose-exam$/, key: "choose_exam", label: "Imtihon tanlash" },
  { pattern: /^\/ielts\/tests$/, key: "ielts_tests", label: "IELTS mock testlar" },
  { pattern: /^\/ielts\/practice\/[^/]+$/, key: "ielts_practice", label: "IELTS bo'lim mashqi" },
  { pattern: /^\/ielts\/test\/[^/]+$/, key: "ielts_test", label: "IELTS test (imtihon)" },
  { pattern: /^\/ielts\/results\/[^/]+$/, key: "ielts_results", label: "IELTS natija" },
  { pattern: /^\/ielts\/history$/, key: "ielts_history", label: "IELTS band scores" },
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

// Mahalliy vaqt bo'yicha "YYYY-MM-DD" (hujjat ID sifatida).
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function upsertUserProfile(user) {
  if (!user) return;
  try {
    const created = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName ? user.displayName.slice(0, 100) : null,
        provider: user.providerData?.[0]?.providerId || "password",
        emailVerified: !!user.emailVerified,
        ...(created ? { createdAt: created } : {}),
        lastSeenAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("User profilini saqlashda xatolik:", err);
  }
}

// ---------------- Batching ----------------
let pending = { uid: null, views: 0, pages: {} };
let flushTimer = null;
const visitedToday = new Set();

function alreadyVisited(marker) {
  if (visitedToday.has(marker)) return true;
  try {
    if (sessionStorage.getItem(`pz_visit::${marker}`)) {
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
    sessionStorage.setItem(`pz_visit::${marker}`, "1");
  } catch {
    /* ignore */
  }
}

// Yig'ilgan ko'rishlarni Firestore'ga yuboradi (bitta shard + user hujjati).
export async function flushPageViews() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const batch = pending;
  if (!batch.uid || batch.views === 0) return;
  pending = { uid: batch.uid, views: 0, pages: {} };

  const day = dayKey();
  const pages = Object.fromEntries(Object.entries(batch.pages).map(([k, v]) => [k, increment(v)]));
  const shard = Math.floor(Math.random() * SHARDS);
  const marker = `${day}_${batch.uid}`;
  const writes = [
    setDoc(
      doc(db, "analyticsShards", `${day}_${shard}`),
      { date: day, views: increment(batch.views), pages },
      { merge: true }
    ),
    setDoc(
      doc(db, "users", batch.uid),
      { pageViews: increment(batch.views), pages, lastSeenAt: serverTimestamp() },
      { merge: true }
    ),
  ];
  if (!alreadyVisited(marker)) {
    rememberVisit(marker);
    writes.push(setDoc(doc(db, "analyticsVisitors", marker), { date: day, uid: batch.uid }));
  }
  try {
    await Promise.all(writes);
  } catch (err) {
    console.error("Sahifa ko'rishlarni yozishda xatolik:", err);
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
    if (document.visibilityState === "hidden") flushPageViews();
  });
  window.addEventListener("pagehide", () => flushPageViews());
}
