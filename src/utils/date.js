// Mahalliy vaqt bo'yicha "YYYY-MM-DD" (hujjat ID sifatida ham ishlatiladi).
// Alohida modul: Firestore'ni tortmasdan (bosh sahifada ham) ishlatish uchun.
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
