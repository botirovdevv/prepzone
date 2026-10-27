import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOtpVerified } from "../hooks/useOtpVerified";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { verified, checked } = useOtpVerified();

  if (loading || (user && !checked)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  // Email/parol bilan ro'yxatdan o'tgan, lekin hali 6 xonali kod bilan
  // tasdiqlamagan foydalanuvchilar ilovaning ichiga kira olmaydi — bu
  // istalgan email bilan (hatto o'zganikini yozib) ro'yxatdan o'tishning
  // oldini oladi.
  if (!verified) return <Navigate to="/verify-email" replace />;

  return children;
}
