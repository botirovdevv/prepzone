import { fetchUserResults } from "./userResults";

// Userning oxirgi IELTS natijalari, yangidan eskiga (o'qishlarni cheklash uchun limit bilan).
export async function fetchIeltsResults(uid, pageSize = 50) {
  return (await fetchUserResults("ieltsResults", uid, { pageSize })).items;
}

export const MODE_LABELS = {
  full: "Full mock",
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
};

export function formatResultDate(ts, withTime = false) {
  const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
  if (!d) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    ...(withTime ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
  });
}
