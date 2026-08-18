// ------------------------------------------------------------------
// Testni "pauza qilish / davom ettirish" holatini saqlash.
//
// MUHIM: bu faqat brauzer localStorage'da ishlaydi (Firestore'ga
// yozilmaydi) — shu qurilma/brauzerda ishlaydi va qo'shimcha yozish
// xarajati talab qilmaydi. Agar kelajakda qurilmalar orasida
// (masalan telefon -> kompyuter) davom ettirish kerak bo'lsa, xuddi
// shu formatdagi obyektni Firestore'ga ham yozish kifoya.
//
// ESLATMA: bu tekshiruv faqat mijoz (client) tomonida ishlaydi, ya'ni
// texnik jihatdan aylanib o'tish mumkin (masalan localStorage'ni
// tozalash orqali). Chinakam kafolatlangan himoya uchun bu holatni
// serverda (Firestore Security Rules yoki Cloud Function) ham
// tekshirish kerak bo'ladi.
// ------------------------------------------------------------------

const STORAGE_PREFIX = "sat_progress::";

// Chiqib ketilgan testni faqat shuncha vaqtdan keyin davom ettirish mumkin.
export const PAUSE_COOLDOWN_MS = 30 * 60 * 1000; // 30 daqiqa

function storageKey(uid, testId) {
  return `${STORAGE_PREFIX}${uid}::${testId}`;
}

// reason: "paused" (user "Chiqish" tugmasini bosdi yoki sahifani yopdi)
export function saveLocalProgress(uid, testId, snapshot, reason = "paused") {
  try {
    localStorage.setItem(
      storageKey(uid, testId),
      JSON.stringify({ reason, pausedAt: Date.now(), snapshot })
    );
  } catch (err) {
    console.error("Progressni saqlashda xatolik:", err);
  }
}

export function loadLocalProgress(uid, testId) {
  try {
    const raw = localStorage.getItem(storageKey(uid, testId));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function clearLocalProgress(uid, testId) {
  try {
    localStorage.removeItem(storageKey(uid, testId));
  } catch (err) {
    /* ignore */
  }
}

export function getCooldownRemainingMs(pausedAt) {
  return Math.max(0, PAUSE_COOLDOWN_MS - (Date.now() - pausedAt));
}
