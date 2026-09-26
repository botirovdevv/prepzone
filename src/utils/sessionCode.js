import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";

// ------------------------------------------------------------------
// Test sessiyasi kirish kodlari.
//
// Xavfsizlik: kod sessiya hujjatining o'zida saqlanmaydi (uni har qanday
// login qilgan user o'qiy oladi). Buning o'rniga:
//   sessionCodes/{code}          -> { sessionId }  (faqat aniq kod bilan
//                                    `get` mumkin, ro'yxatini olib bo'lmaydi)
//   testSessions/{id}/secure/admin -> { code }     (faqat admin o'qiydi)
// Eski sessiyalarda `code` maydoni hali asosiy hujjatda bo'lishi mumkin —
// admin paneli ochilganda ular avtomatik yangi formatga ko'chiriladi.
// ------------------------------------------------------------------

function randomCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

const codeRef = (code) => doc(db, "sessionCodes", code);
const adminRef = (sessionId) => doc(db, "testSessions", sessionId, "secure", "admin");

// Boshqa sessiyalar bilan to'qnashmaydigan 6 xonali kod (faqat admin).
export async function generateUniqueCode() {
  for (let i = 0; i < 20; i++) {
    const code = randomCode();
    const [mapped, legacy] = await Promise.all([
      getDoc(codeRef(code)),
      getDocs(query(collection(db, "testSessions"), where("code", "==", code))),
    ]);
    if (!mapped.exists() && legacy.empty) return code;
  }
  throw new Error("Yagona kod yaratib bo'lmadi. Qaytadan urinib ko'ring.");
}

// Sessiyaga kod biriktiradi (eski kod bo'lsa — bekor qiladi). Faqat admin.
export async function assignCode(sessionId, code, oldCode = null) {
  const batch = writeBatch(db);
  batch.set(codeRef(code), { sessionId, createdAt: serverTimestamp() });
  batch.set(adminRef(sessionId), { code });
  if (oldCode && oldCode !== code) batch.delete(codeRef(oldCode));
  batch.update(doc(db, "testSessions", sessionId), { code: deleteField() });
  await batch.commit();
}

// Admin uchun: sessiyaning joriy kodi (yangi yoki eski formatdan).
export async function getSessionCode(sessionId, legacyCode = null) {
  const snap = await getDoc(adminRef(sessionId));
  return snap.exists() ? snap.data().code : legacyCode;
}

// Sessiya o'chirilganda kodni ham bekor qilish. Faqat admin.
export async function releaseCode(sessionId) {
  const snap = await getDoc(adminRef(sessionId));
  if (!snap.exists()) return;
  const batch = writeBatch(db);
  batch.delete(codeRef(snap.data().code));
  batch.delete(adminRef(sessionId));
  await batch.commit();
}

// Eski formatdagi (kodi asosiy hujjatda turgan) sessiyalarni ko'chirish.
const migrated = new Set();
export async function migrateLegacyCodes(sessions) {
  const legacy = sessions.filter((s) => s.code && !migrated.has(s.id));
  for (const s of legacy) {
    migrated.add(s.id);
    try {
      await assignCode(s.id, s.code);
    } catch (err) {
      console.error(`Sessiya kodini ko'chirishda xatolik (${s.id}):`, err);
    }
  }
}

// Talaba uchun: kod bo'yicha sessiyani topadi (topilmasa null).
export async function findSessionByCode(code) {
  const mapped = await getDoc(codeRef(code));
  if (mapped.exists()) {
    const snap = await getDoc(doc(db, "testSessions", mapped.data().sessionId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }
  // Hali ko'chirilmagan eski sessiyalar uchun.
  const legacy = await getDocs(query(collection(db, "testSessions"), where("code", "==", code)));
  if (legacy.empty) return null;
  const d = legacy.docs[0];
  return { id: d.id, ...d.data() };
}
