import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SATTest from "./pages/SATTest";
import Results from "./pages/Results";
import History from "./pages/History";
import TestSelect from "./pages/TestSelect";
import AccountSettings from "./pages/AccountSettings";
import JoinSession from "./pages/JoinSession";
import SessionTest from "./pages/SessionTest";
import SessionResults from "./pages/SessionResults";
import PracticeIndex from "./pages/PracticeIndex";
import PracticeSet from "./pages/PracticeSet";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SessionForm from "./pages/admin/SessionForm";
import SessionMonitor from "./pages/admin/SessionMonitor";
import SetsDashboard from "./pages/admin/SetsDashboard";
import SetForm from "./pages/admin/SetForm";

// Sidebar bilan ko'rsatiladigan (dashboard uslubidagi) himoyalangan sahifalar.
// Imtihonning o'zi (SATTest/SessionTest) fullscreen/xavfsizlik rejimida
// ishlaydi, shuning uchun sidebar'siz qoldiriladi.
function DashboardRoute({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function AdminDashboardRoute({ children }) {
  return (
    <AdminRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminRoute>
  );
}

// "/" manzili: login qilmagan foydalanuvchiga ochiq bosh sahifa (Home),
// login qilgan foydalanuvchiga esa "/dashboard"ga yo'naltiriladi — login
// qilgan holatda ortga (Home'ga) qaytib kira olmasligi shu orqali ta'minlanadi.
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <DashboardRoute>
                <Dashboard />
              </DashboardRoute>
            }
          />
          <Route
            path="/join"
            element={
              <DashboardRoute>
                <JoinSession />
              </DashboardRoute>
            }
          />

          <Route
            path="/sat/select"
            element={
              <DashboardRoute>
                <TestSelect />
              </DashboardRoute>
            }
          />
          <Route
            path="/sat/test"
            element={
              <ProtectedRoute>
                <SATTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sat/results"
            element={
              <DashboardRoute>
                <Results />
              </DashboardRoute>
            }
          />
          <Route
            path="/sat/results/:id"
            element={
              <DashboardRoute>
                <Results />
              </DashboardRoute>
            }
          />
          <Route
            path="/sat/history"
            element={
              <DashboardRoute>
                <History />
              </DashboardRoute>
            }
          />
          <Route
            path="/account"
            element={
              <DashboardRoute>
                <AccountSettings />
              </DashboardRoute>
            }
          />

          {/* Admin tashkil qilgan, kirish kodi bilan ochiladigan testlar */}
          <Route
            path="/session/:id/test"
            element={
              <ProtectedRoute>
                <SessionTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session/:id/results"
            element={
              <DashboardRoute>
                <SessionResults />
              </DashboardRoute>
            }
          />

          {/* Vaqt cheklanmagan, darhol javob ko'rsatiladigan amaliyot to'plamlari */}
          <Route
            path="/practice"
            element={
              <DashboardRoute>
                <PracticeIndex />
              </DashboardRoute>
            }
          />
          <Route
            path="/practice/:id"
            element={
              <ProtectedRoute>
                <PracticeSet />
              </ProtectedRoute>
            }
          />

          {/* Admin panel */}
          <Route
            path="/admin"
            element={
              <AdminDashboardRoute>
                <AdminDashboard />
              </AdminDashboardRoute>
            }
          />
          <Route
            path="/admin/sessions/new"
            element={
              <AdminDashboardRoute>
                <SessionForm />
              </AdminDashboardRoute>
            }
          />
          <Route
            path="/admin/sessions/:id/edit"
            element={
              <AdminDashboardRoute>
                <SessionForm />
              </AdminDashboardRoute>
            }
          />
          <Route
            path="/admin/sessions/:id/monitor"
            element={
              <AdminDashboardRoute>
                <SessionMonitor />
              </AdminDashboardRoute>
            }
          />
          <Route
            path="/admin/sets"
            element={
              <AdminDashboardRoute>
                <SetsDashboard />
              </AdminDashboardRoute>
            }
          />
          <Route
            path="/admin/sets/new"
            element={
              <AdminDashboardRoute>
                <SetForm />
              </AdminDashboardRoute>
            }
          />
          <Route
            path="/admin/sets/:id/edit"
            element={
              <AdminDashboardRoute>
                <SetForm />
              </AdminDashboardRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
