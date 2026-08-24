import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { isAdmin, checked } = useIsAdmin();

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

  return children;
}
