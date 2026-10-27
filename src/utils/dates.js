// Backend sanalarni ISO string ko'rinishida qaytaradi (avval Firestore
// Timestamp obyekti edi). Bu yordamchilar ikkalasini ham tushunadi.
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toMillis(value) {
  return toDate(value)?.getTime() || 0;
}
