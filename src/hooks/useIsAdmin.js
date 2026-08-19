import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// ------------------------------------------------------------------
// Foydalanuvchi admin ekanligini tekshirish.
//
// Admin ro'yxati Firestore'dagi "admins" kolleksiyasida saqlanadi:
// admins/{uid} hujjati mavjud bo'lsa — o'sha foydalanuvchi admin.
//
// Yangi admin qo'shish uchun (bu ilovada admin yaratish UI'si yo'q,
// chunki bu xavfsizlik nuqtai nazaridan server/backend orqali
// qilinishi kerak):
//   1. Firebase Console -> Firestore Database'ga o'ting
//   2. "admins" nomli kolleksiya yarating (agar hali yo'q bo'lsa)
//   3. Hujjat ID sifatida foydalanuvchining UID'ini kiriting
//      (UID'ni Firebase Console -> Authentication bo'limidan olish mumkin)
//   4. Hujjat ichiga istalgan bitta maydon qo'shing, masalan:
//      { addedAt: <timestamp> }
// ------------------------------------------------------------------

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }
    setChecked(false);
    const unsub = onSnapshot(
      doc(db, "admins", user.uid),
      (snap) => {
        setIsAdmin(snap.exists());
        setChecked(true);
      },
      () => {
        setIsAdmin(false);
        setChecked(true);
      }
    );
    return unsub;
  }, [user]);

  return { isAdmin, checked };
}
