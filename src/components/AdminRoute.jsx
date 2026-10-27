import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useOtpVerified } from "../hooks/useOtpVerified";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { isAdmin, checked } = useIsAdmin();
  const { verified, checked: otpChecked } = useOtpVerified();

  if (loading || (user && !checked) || (user && !otpChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!verified) return <Navigate to="/verify-email" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
