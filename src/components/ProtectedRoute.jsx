import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./ui";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader fullscreen />;
  }

  if (!user) return <Navigate to="/login" replace />;
  // Email/parol bilan ro'yxatdan o'tgan, lekin hali tasdiqlamagan
  // foydalanuvchilar ilovaning ichiga kira olmaydi — bu istalgan email
  // bilan (hatto o'zganikini yozib) ro'yxatdan o'tishning oldini oladi.
  // Google orqali kirganlar Google tomonidan allaqachon tasdiqlangan
  // bo'ladi, shuning uchun ular bu tekshiruvni avtomatik o'tadi.
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;

  return children;
}
