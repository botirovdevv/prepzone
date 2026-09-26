import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

// Userning IELTS natijalari, yangidan eskiga.
export async function fetchIeltsResults(uid) {
  const snap = await getDocs(query(collection(db, "ieltsResults"), where("uid", "==", uid)));
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  return list;
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
