// ------------------------------------------------------------------
// Vocabulary progressi (Leitner usulidagi takrorlash).
//
// Faqat brauzer localStorage'da saqlanadi (testProgress.js kabi) —
// Firestore'ga yozilmaydi. Har bir so'z uchun: { box, due }.
//   box 0 — hali o'rganilmoqda (darhol qayta chiqadi)
//   box 4 — o'zlashtirilgan ("mastered")
// "I know it" -> box + 1, "Still learning" -> box = 0.
// ------------------------------------------------------------------

const STORAGE_PREFIX = "vocab_progress::";
const DAY_MS = 24 * 60 * 60 * 1000;

// Har bir box uchun keyingi takrorlashgacha bo'lgan kunlar.
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14];
export const MASTERED_BOX = BOX_INTERVAL_DAYS.length - 1;

export function loadVocabProgress(uid) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + uid);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveVocabProgress(uid, progress) {
  try {
    localStorage.setItem(STORAGE_PREFIX + uid, JSON.stringify(progress));
  } catch (err) {
    console.error("Vocabulary progressni saqlashda xatolik:", err);
  }
}

// Yangi progress obyektini qaytaradi (eskisini o'zgartirmaydi).
export function gradeWord(progress, wordId, known) {
  const prevBox = progress[wordId]?.box ?? -1;
  const box = known ? Math.min(prevBox + 1, MASTERED_BOX) : 0;
  return {
    ...progress,
    [wordId]: { box, due: Date.now() + BOX_INTERVAL_DAYS[box] * DAY_MS },
  };
}

export function isDue(entry, now = Date.now()) {
  return !!entry && entry.due <= now;
}

export function isMastered(entry) {
  return !!entry && entry.box >= MASTERED_BOX;
}
