import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Firestore'dagi boshqa sessiyalar bilan to'qnashmaydigan 6 xonali kod topadi.
export async function generateUniqueCode() {
  for (let i = 0; i < 20; i++) {
    const code = randomCode();
    const snap = await getDocs(
      query(collection(db, "testSessions"), where("code", "==", code))
    );
    if (snap.empty) return code;
  }
  throw new Error("Yagona kod yaratib bo'lmadi. Qaytadan urinib ko'ring.");
}

// Berilgan 6 xonali kod bo'yicha sessiyani topadi (topilmasa null).
export async function findSessionByCode(code) {
  const snap = await getDocs(
    query(collection(db, "testSessions"), where("code", "==", code))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}
