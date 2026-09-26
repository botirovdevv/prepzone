import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";

// ------------------------------------------------------------------
// Foydalanuvchi admin ekanligini tekshirish.
//
// Admin ro'yxati Firestore'dagi "admins" kolleksiyasida saqlanadi:
// admins/{uid} hujjati mavjud bo'lsa — o'sha foydalanuvchi admin.
// Holat AdminProvider'dagi yagona listener orqali keladi.
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
  return useContext(AdminContext) || { isAdmin: false, checked: true };
}
