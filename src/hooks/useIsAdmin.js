import { useAuth } from "../context/AuthContext";

// ------------------------------------------------------------------
// Foydalanuvchining admin huquqlari — server `/auth/me` javobida qaytaradi.
// Huquqlar serverda ham har bir so'rovda tekshiriladi, bu yerdagi
// qiymatlar faqat UI uchun.
//
// Owner hamma bo'limni boshqaradi va boshqa adminlarga bo'lim ruxsatlarini
// (Analitika > Userlar) beradi. Owner tayinlash (serverda):
//   docker compose exec api node scripts/make-admin.js email@example.com
// ------------------------------------------------------------------

export const ADMIN_PERM_LABELS = {
  sessions: "Testlar",
  sets: "To'plamlar",
  desmos: "Desmos",
  analytics: "Analitika",
  users: "Userlarni bloklash",
};

// Ruxsat bo'lmaganda o'tiladigan admin sahifalar (tartib bo'yicha birinchisi).
export const ADMIN_HOME = [
  ["sessions", "/admin"],
  ["sets", "/admin/sets"],
  ["desmos", "/admin/desmos"],
  ["analytics", "/admin/analytics"],
  ["users", "/admin/analytics"],
];

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const perms = user?.adminPerms || [];
  // `perm` — bitta ruxsat yoki ro'yxat (biri bo'lsa yetadi); bo'sh bo'lsa faqat admin bo'lish kifoya.
  const can = (perm) => {
    if (!user?.isAdmin) return false;
    if (!perm) return true;
    return (Array.isArray(perm) ? perm : [perm]).some((p) => perms.includes(p));
  };
  return { isAdmin: !!user?.isAdmin, isOwner: !!user?.isOwner, perms, can, checked: !loading };
}
