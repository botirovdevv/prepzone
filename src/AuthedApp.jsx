import { lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import { ExamProvider, useExam } from "./context/ExamContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { PageLoader } from "./components/ui";
import NotFound from "./pages/NotFound";
import { onIdle, prefetchAll } from "./utils/idle";

// ------------------------------------------------------------------
// Login qilingan foydalanuvchi sahifalari. Bu modul (va Firestore SDK)
// alohida chunk — bosh sahifa (Home) va kirish sahifalari uni yuklamaydi.
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
  AdminDashboard: () => import("./pages/admin/AdminDashboard"),
  SessionForm: () => import("./pages/admin/SessionForm"),
  SessionMonitor: () => import("./pages/admin/SessionMonitor"),
  SetsDashboard: () => import("./pages/admin/SetsDashboard"),
  SetForm: () => import("./pages/admin/SetForm"),
  Analytics: () => import("./pages/admin/Analytics"),
  ChooseExam: () => import("./pages/ChooseExam"),
  IeltsDashboard: () => import("./pages/ielts/IeltsDashboard"),
  IeltsTests: () => import("./pages/ielts/IeltsTests"),
  IeltsTest: () => import("./pages/ielts/IeltsTest"),
  IeltsResults: () => import("./pages/ielts/IeltsResults"),
  IeltsHistory: () => import("./pages/ielts/IeltsHistory"),
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
const AdminDashboard = lazy(pages.AdminDashboard);
const SessionForm = lazy(pages.SessionForm);
const SessionMonitor = lazy(pages.SessionMonitor);
const SetsDashboard = lazy(pages.SetsDashboard);
const SetForm = lazy(pages.SetForm);
const Analytics = lazy(pages.Analytics);
const ChooseExam = lazy(pages.ChooseExam);
const IeltsDashboard = lazy(pages.IeltsDashboard);
const IeltsTests = lazy(pages.IeltsTests);
const IeltsTest = lazy(pages.IeltsTest);
const IeltsResults = lazy(pages.IeltsResults);
const IeltsHistory = lazy(pages.IeltsHistory);

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

// "/dashboard" tanlangan imtihonga qarab SAT yoki IELTS dashboard'ini
// ko'rsatadi; imtihon hali tanlanmagan bo'lsa — tanlash sahifasiga.
function ExamDashboard() {
  const { exam, ready } = useExam();
  if (!ready) return <PageLoader />;
  if (!exam) return <Navigate to="/choose-exam" replace />;
  return exam === "ielts" ? <IeltsDashboard /> : <Dashboard />;
}

// Admin bo'lmagan sahifalar fonda oldindan yuklanadi.
const ADMIN_PAGES = ["AdminDashboard", "SessionForm", "SessionMonitor", "SetsDashboard", "SetForm", "Analytics"];
const PREFETCH = Object.entries(pages)
  .filter(([name]) => !ADMIN_PAGES.includes(name))
  .map(([, load]) => load);

export default function AuthedApp() {
  // Birinchi sahifa chizilgach, qolgan sahifalar chunk'larini fonda yuklab
  // qo'yamiz — menyu bosilganda sahifa darhol ochiladi (Next.js prefetch kabi).
  useEffect(() => onIdle(() => prefetchAll(PREFETCH)), []);

  return (
    <AdminProvider>
      <ExamProvider>
        <AnalyticsTracker />
        <Routes>

        <Route
          path="choose-exam"
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
              <ExamDashboard />
            </DashboardRoute>
          }
        />

        <Route
          path="ielts/tests"
          element={
            <DashboardRoute>
              <IeltsTests />
            </DashboardRoute>
          }
        />
        {["listening", "reading", "writing"].map((s) => (
          <Route
            key={s}
            path={`ielts/practice/${s}`}
            element={
              <DashboardRoute>
                <IeltsTests key={s} initialSection={s} />
              </DashboardRoute>
            }
          />
        ))}
        <Route
          path="ielts/test/:testId"
          element={
            <ProtectedRoute>
              <IeltsTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="ielts/results/:id"
          element={
            <DashboardRoute>
              <IeltsResults />
            </DashboardRoute>
          }
        />
        <Route
          path="ielts/history"
          element={
            <DashboardRoute>
              <IeltsHistory />
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
            <AdminDashboardRoute>
              <AdminDashboard />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sessions/new"
          element={
            <AdminDashboardRoute>
              <SessionForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sessions/:id/edit"
          element={
            <AdminDashboardRoute>
              <SessionForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sessions/:id/monitor"
          element={
            <AdminDashboardRoute>
              <SessionMonitor />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <AdminDashboardRoute>
              <Analytics />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sets"
          element={
            <AdminDashboardRoute>
              <SetsDashboard />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sets/new"
          element={
            <AdminDashboardRoute>
              <SetForm />
            </AdminDashboardRoute>
          }
        />
        <Route
          path="admin/sets/:id/edit"
          element={
            <AdminDashboardRoute>
              <SetForm />
            </AdminDashboardRoute>
          }
        />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ExamProvider>
    </AdminProvider>
  );
}
