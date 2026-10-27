import { useAuth } from "../context/AuthContext";

// ------------------------------------------------------------------
// Foydalanuvchi admin ekanligi — server `/auth/me` javobida qaytaradi.
// Admin huquqi serverda ham har bir so'rovda tekshiriladi, bu yerdagi
// qiymat faqat UI uchun.
//
// Yangi admin qo'shish (server papkasida):
//   npm run make-admin -- email@example.com
// ------------------------------------------------------------------

export function useIsAdmin() {
  const { user, loading } = useAuth();
  return { isAdmin: !!user?.isAdmin, checked: !loading };
}
