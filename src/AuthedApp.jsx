import { lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { PageLoader } from "./components/ui";
import NotFound from "./pages/NotFound";
import { onIdle, prefetchAll } from "./utils/idle";

// ------------------------------------------------------------------
// Login qilingan foydalanuvchi sahifalari. Bu modul alohida chunk — bosh sahifa (Home) va kirish sahifalari uni yuklamaydi.
// Har bir sahifa ham alohida chunk bo'lib, faqat ochilganda yuklanadi.
// ------------------------------------------------------------------
const pages = {
  Dashboard: () => import("./pages/Dashboard"),
  SATTest: () => import("./pages/SATTest"),
  Results: () => import("./pages/Results"),
  History: () => import("./pages/History"),
  TestSelect: () => import("./pages/TestSelect"),
  AccountSettings: () => import("./pages/AccountSettings"),
  JoinSession: () => import("./pages/JoinSession"),
  SessionTest: () => import("./pages/SessionTest"),
  SessionResults: () => import("./pages/SessionResults"),
  PracticeIndex: () => import("./pages/PracticeIndex"),
  Leaderboard: () => import("./pages/Leaderboard"),
  PracticeSet: () => import("./pages/PracticeSet"),
  Vocabulary: () => import("./pages/Vocabulary"),
  StudyPlan: () => import("./pages/StudyPlan"),
  StudyRoomLobby: () => import("./pages/StudyRoomLobby"),
  StudyRoom: () => import("./pages/StudyRoom"),
  AdminDashboard: () => import("./pages/admin/AdminDashboard"),
  SessionForm: () => import("./pages/admin/SessionForm"),
  SessionMonitor: () => import("./pages/admin/SessionMonitor"),
  SetsDashboard: () => import("./pages/admin/SetsDashboard"),
  SetForm: () => import("./pages/admin/SetForm"),
  Analytics: () => import("./pages/admin/Analytics"),
  ChooseExam: () => import("./pages/ChooseExam"),
  DesmosIndex: () => import("./pages/DesmosIndex"),
  DesmosDashboard: () => import("./pages/admin/DesmosDashboard"),
  DesmosForm: () => import("./pages/admin/DesmosForm"),
};
const Dashboard = lazy(pages.Dashboard);
const SATTest = lazy(pages.SATTest);
const Results = lazy(pages.Results);
const History = lazy(pages.History);
const TestSelect = lazy(pages.TestSelect);
const AccountSettings = lazy(pages.AccountSettings);
const JoinSession = lazy(pages.JoinSession);
const SessionTest = lazy(pages.SessionTest);
const SessionResults = lazy(pages.SessionResults);
const PracticeIndex = lazy(pages.PracticeIndex);
const Leaderboard = lazy(pages.Leaderboard);
const PracticeSet = lazy(pages.PracticeSet);
const Vocabulary = lazy(pages.Vocabulary);
const StudyPlan = lazy(pages.StudyPlan);
const StudyRoomLobby = lazy(pages.StudyRoomLobby);
const StudyRoom = lazy(pages.StudyRoom);
const AdminDashboard = lazy(pages.AdminDashboard);
const SessionForm = lazy(pages.SessionForm);
const SessionMonitor = lazy(pages.SessionMonitor);
const SetsDashboard = lazy(pages.SetsDashboard);
const SetForm = lazy(pages.SetForm);
const Analytics = lazy(pages.Analytics);
const ChooseExam = lazy(pages.ChooseExam);
const DesmosIndex = lazy(pages.DesmosIndex);
const DesmosDashboard = lazy(pages.DesmosDashboard);
const DesmosForm = lazy(pages.DesmosForm);

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

function AdminDashboardRoute({ perm, children }) {
  return (
    <AdminRoute perm={perm}>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminRoute>
  );
}

// Onboarding so'rovnomasini hali to'ldirmagan foydalanuvchi avval o'shanga.
function HomeDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user?.onboarding) return <Navigate to="/onboarding" replace />;
  return <Dashboard />;
}

// Admin bo'lmagan sahifalar fonda oldindan yuklanadi.
const ADMIN_PAGES = [
  "AdminDashboard",
  "SessionForm",
  "SessionMonitor",
  "SetsDashboard",
  "SetForm",
  "Analytics",
  "DesmosDashboard",
  "DesmosForm",
];
const PREFETCH = Object.entries(pages)
  .filter(([name]) => !ADMIN_PAGES.includes(name))
  .map(([, load]) => load);

export default function AuthedApp() {
  // Birinchi sahifa chizilgach, qolgan sahifalar chunk'larini fonda yuklab
  // qo'yamiz — menyu bosilganda sahifa darhol ochiladi (Next.js prefetch kabi).
  useEffect(() => onIdle(() => prefetchAll(PREFETCH)), []);

  return (
    <>
      <AnalyticsTracker />
      <Routes>
        <Route path="choose-exam" element={<Navigate to="/onboarding" replace />} />
        <Route
          path="onboarding"
          element={
            <ProtectedRoute>
              <ChooseExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <DashboardRoute>
              <HomeDashboard />
            </DashboardRoute>
          }
        />

        <Route
          path="join"
          element={
            <DashboardRoute>
              <JoinSession />
            </DashboardRoute>
          }
        />

        <Route
          path="sat/select"
          element={
            <DashboardRoute>
              <TestSelect />
            </DashboardRoute>
          }
        />
        <Route
          path="sat/test"
          element={
            <ProtectedRoute>
              <SATTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="sat/results"
          element={
            <DashboardRoute>
              <Results />
            </DashboardRoute>
          }
        />
        <Route
          path="sat/results/:id"
          element={
            <DashboardRoute>
              <Results />
            </DashboardRoute>
          }
        />
        <Route
          path="sat/history"
          element={
            <DashboardRoute>
              <History />
            </DashboardRoute>
          }
        />
        <Route
          path="study-plan"
          element={
            <DashboardRoute>
              <StudyPlan />
            </DashboardRoute>
          }
        />
        <Route
          path="study-room"
          element={
            <DashboardRoute>
              <StudyRoomLobby />
            </DashboardRoute>
          }
        />
        <Route
          path="study-room/:code"
          element={
            <ProtectedRoute>
              <StudyRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="vocabulary"
          element={
            <DashboardRoute>
              <Vocabulary />
            </DashboardRoute>
          }
        />
        <Route
          path="leaderboard"
          element={
            <DashboardRoute>
              <Leaderboard />
            </DashboardRoute>
          }
        />
        <Route
          path="account"
          element={
            <DashboardRoute>
              <AccountSettings />
            </DashboardRoute>
          }
        />

        {/* Admin tashkil qilgan, kirish kodi bilan ochiladigan testlar */}
        <Route
          path="session/:id/test"
          element={
            <ProtectedRoute>
              <SessionTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="session/:id/results"
          element={
            <DashboardRoute>
              <SessionResults />
            </DashboardRoute>
          }
        />

        {/* Vaqt cheklanmagan, darhol javob ko'rsatiladigan amaliyot to'plamlari */}
        <Route
          path="practice"
          element={
            <DashboardRoute>
              <PracticeIndex />
            </DashboardRoute>
          }
        />
        <Route
          path="practice/:id"
          element={
            <ProtectedRoute>
              <PracticeSet />
            </ProtectedRoute>
          }
        />

        {/* Admin panel */}
        <Route
          path="admin"
          element={
            <AdminDashboardRoute perm="sessions">
              <AdminDashboard />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sessions/new"
          element={
            <AdminDashboardRoute perm="sessions">
              <SessionForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sessions/:id/edit"
          element={
            <AdminDashboardRoute perm="sessions">
              <SessionForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sessions/:id/monitor"
          element={
            <AdminDashboardRoute perm="sessions">
              <SessionMonitor />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <AdminDashboardRoute perm={["analytics", "users"]}>
              <Analytics />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sets"
          element={
            <AdminDashboardRoute perm="sets">
              <SetsDashboard />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sets/new"
          element={
            <AdminDashboardRoute perm="sets">
              <SetForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sets/:id/edit"
          element={
            <AdminDashboardRoute perm="sets">
              <SetForm />
            </AdminDashboardRoute>
          }
        />
        {/* Desmos darsliklari */}
        <Route
          path="desmos"
          element={
            <DashboardRoute>
              <DesmosIndex />
            </DashboardRoute>
          }
        />
        {/* Desmos bo'limi hali yopiq (sidebar'da "Tez orada") — darslik
            havolalari ro'yxat sahifasidagi ogohlantirishga olib boradi. */}
        <Route path="desmos/:id" element={<Navigate to="/desmos" replace />} />
        <Route
          path="admin/desmos"
          element={
            <AdminDashboardRoute perm="desmos">
              <DesmosDashboard />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/desmos/new"
          element={
            <AdminDashboardRoute perm="desmos">
              <DesmosForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/desmos/:id/edit"
          element={
            <AdminDashboardRoute perm="desmos">
              <DesmosForm />
            </AdminDashboardRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
