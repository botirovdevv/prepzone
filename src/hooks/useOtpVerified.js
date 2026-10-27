import { useAuth } from "../context/AuthContext";

// Email tasdiqlanganmi — server `/auth/me` javobidagi emailVerified.
// Google orqali kirganlar avtomatik tasdiqlangan bo'ladi.
export function useOtpVerified() {
  const { user, loading } = useAuth();
  return { verified: !!user?.emailVerified, checked: !loading };
}
