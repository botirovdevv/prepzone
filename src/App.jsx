import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ExamProvider, useExam } from "./context/ExamContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { PageLoader } from "./components/ui";
import Home from "./pages/Home";

// Code splitting: har bir sahifa alohida chunk bo'lib, faqat ochilganda
// yuklanadi. Bosh sahifa (Home) tez ochilishi uchun asosiy bundle'da qoladi.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SATTest = lazy(() => import("./pages/SATTest"));
const Results = lazy(() => import("./pages/Results"));
const History = lazy(() => import("./pages/History"));
const TestSelect = lazy(() => import("./pages/TestSelect"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const JoinSession = lazy(() => import("./pages/JoinSession"));
const SessionTest = lazy(() => import("./pages/SessionTest"));
const SessionResults = lazy(() => import("./pages/SessionResults"));
const PracticeIndex = lazy(() => import("./pages/PracticeIndex"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const PracticeSet = lazy(() => import("./pages/PracticeSet"));
const Vocabulary = lazy(() => import("./pages/Vocabulary"));
const StudyPlan = lazy(() => import("./pages/StudyPlan"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SessionForm = lazy(() => import("./pages/admin/SessionForm"));
const SessionMonitor = lazy(() => import("./pages/admin/SessionMonitor"));
const SetsDashboard = lazy(() => import("./pages/admin/SetsDashboard"));
const SetForm = lazy(() => import("./pages/admin/SetForm"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const ChooseExam = lazy(() => import("./pages/ChooseExam"));
const IeltsDashboard = lazy(() => import("./pages/ielts/IeltsDashboard"));
const IeltsTests = lazy(() => import("./pages/ielts/IeltsTests"));
const IeltsTest = lazy(() => import("./pages/ielts/IeltsTest"));
const IeltsResults = lazy(() => import("./pages/ielts/IeltsResults"));
const IeltsHistory = lazy(() => import("./pages/ielts/IeltsHistory"));

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

// "/dashboard" tanlangan imtihonga qarab SAT yoki IELTS dashboard'ini
// ko'rsatadi; imtihon hali tanlanmagan bo'lsa — tanlash sahifasiga.
function ExamDashboard() {
  const { exam, ready } = useExam();
  if (!ready) return <PageLoader />;
  if (!exam) return <Navigate to="/choose-exam" replace />;
  return exam === "ielts" ? <IeltsDashboard /> : <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
      <ExamProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/choose-exam"
            element={
              <ProtectedRoute>
                <ChooseExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardRoute>
                <ExamDashboard />
              </DashboardRoute>
            }
          />

          <Route
            path="/ielts/tests"
            element={
              <DashboardRoute>
                <IeltsTests />
              </DashboardRoute>
            }
          />
          {["listening", "reading", "writing"].map((s) => (
            <Route
              key={s}
              path={`/ielts/practice/${s}`}
              element={
                <DashboardRoute>
                  <IeltsTests key={s} initialSection={s} />
                </DashboardRoute>
              }
            />
          ))}
          <Route
            path="/ielts/test/:testId"
            element={
              <ProtectedRoute>
                <IeltsTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ielts/results/:id"
            element={
              <DashboardRoute>
                <IeltsResults />
              </DashboardRoute>
            }
          />
          <Route
            path="/ielts/history"
            element={
              <DashboardRoute>
                <IeltsHistory />
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
            path="/study-plan"
            element={
              <DashboardRoute>
                <StudyPlan />
              </DashboardRoute>
            }
          />
          <Route
            path="/vocabulary"
            element={
              <DashboardRoute>
                <Vocabulary />
              </DashboardRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <DashboardRoute>
                <Leaderboard />
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
            path="/admin/analytics"
            element={
              <AdminDashboardRoute>
                <Analytics />
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
        </Suspense>
      </BrowserRouter>
      </ExamProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
