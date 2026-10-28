import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ADMIN_HOME, useIsAdmin } from "../hooks/useIsAdmin";

// `perm` — sahifa uchun kerakli bo'lim ruxsati (yoki ro'yxat, biri yetadi).
export default function AdminRoute({ perm, children }) {
  const { user, loading } = useAuth();
  const { isAdmin, checked, can } = useIsAdmin();

  if (loading || (user && !checked)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  if (!can(perm)) {
    const home = ADMIN_HOME.find(([p]) => can(p));
    return <Navigate to={home ? home[1] : "/dashboard"} replace />;
  }

  return children;
}
