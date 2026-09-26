import { arrayUnion, doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// ------------------------------------------------------------------
// Sayt analitikasi (admin → Analitika sahifasi uchun ma'lumot yig'ish).
//
// Faqat login qilgan foydalanuvchilar kuzatiladi. Har bir sahifa
// ko'rish 2 ta yozuv:
//   analytics/{YYYY-MM-DD} — kunlik yig'indi (views, pages, activeUsers)
//   users/{uid}            — user profili + uning sahifa statistikasi
// Firestore Security Rules'da bu ikki kolleksiyaga ruxsat berilishi
// kerak (README / admin analitika sahifasidagi izohga qarang).
// ------------------------------------------------------------------

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
        displayName: user.displayName || null,
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

export async function trackPageView(user, pathname) {
  if (!user || pathname.startsWith("/admin")) return;
  const key = routeKey(pathname);
  try {
    await Promise.all([
      setDoc(
        doc(db, "analytics", dayKey()),
        {
          date: dayKey(),
          views: increment(1),
          pages: { [key]: increment(1) },
          activeUsers: arrayUnion(user.uid),
        },
        { merge: true }
      ),
      setDoc(
        doc(db, "users", user.uid),
        {
          pageViews: increment(1),
          pages: { [key]: increment(1) },
          lastSeenAt: serverTimestamp(),
        },
        { merge: true }
      ),
    ]);
  } catch (err) {
    console.error("Sahifa ko'rishni yozishda xatolik:", err);
  }
}
