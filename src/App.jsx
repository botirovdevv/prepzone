import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SATTest from "./pages/SATTest";
import Results from "./pages/Results";
import History from "./pages/History";
import TestSelect from "./pages/TestSelect";
import AccountSettings from "./pages/AccountSettings";

// Sidebar bilan ko'rsatiladigan (dashboard uslubidagi) himoyalangan sahifalar.
// Imtihonning o'zi (SATTest) fullscreen/xavfsizlik rejimida ishlaydi,
// shuning uchun sidebar'siz qoldiriladi.
function DashboardRoute({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

