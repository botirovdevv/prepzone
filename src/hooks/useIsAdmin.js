import { useAuth } from "../context/AuthContext";

// ------------------------------------------------------------------
// Foydalanuvchi admin ekanligi — server `/auth/me` javobida qaytaradi.
// Admin huquqi serverda ham har bir so'rovda tekshiriladi, bu yerdagi
// qiymat faqat UI uchun.
//
// Yangi admin qo'shish (serverda):
//   docker compose exec api node scripts/make-admin.js email@example.com
// ------------------------------------------------------------------

export function useIsAdmin() {
  const { user, loading } = useAuth();
  return { isAdmin: !!user?.isAdmin, checked: !loading };
}
