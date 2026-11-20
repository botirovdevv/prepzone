import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./i18n";
import ErrorBoundary from "./components/ErrorBoundary";
import PresencePing from "./components/PresencePing";
import { PageLoader } from "./components/ui";
import Home from "./pages/Home";
import { onIdle, prefetchAll } from "./utils/idle";

// Code splitting: har bir sahifa alohida chunk bo'lib, faqat ochilganda
// yuklanadi. Bosh sahifa (Home) tez ochilishi uchun asosiy bundle'da qoladi;
// u faqat Firebase Auth'ni yuklaydi — Firestore va login qilingan
// foydalanuvchi sahifalari AuthedApp chunk'ida.
const loadLogin = () => import("./pages/Login");
const loadRegister = () => import("./pages/Register");
const loadAuthedApp = () => import("./AuthedApp");
const Login = lazy(loadLogin);
const Register = lazy(loadRegister);
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const QrApprove = lazy(() => import("./pages/QrApprove"));
const AuthedApp = lazy(loadAuthedApp);

// "/" manzili: login qilmagan foydalanuvchiga ochiq bosh sahifa (Home),
// login qilgan foydalanuvchiga esa "/dashboard"ga yo'naltiriladi — login
// qilgan holatda ortga (Home'ga) qaytib kira olmasligi shu orqali ta'minlanadi.
function RootRoute() {
  const { user, loading } = useAuth();
  // Tekshiruv paytida ham bosh sahifa ko'rinadi: build vaqtida tayyorlangan HTML
  // (SEO) bilan bir xil bo'lgani uchun "miltillash" bo'lmaydi.
  if (user && !loading) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

// Fonda keyingi ehtimoliy sahifani oldindan yuklaydi: mehmonga — kirish
// sahifalari, login qilganga — ilovaning o'zi (Firestore bilan). Mehmon
// Firestore chunk'ini keraksiz yuklamaydi.
function Prefetch() {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    return onIdle(() => prefetchAll(user ? [loadAuthedApp] : [loadLogin, loadRegister]));
  }, [user, loading]);
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <Prefetch />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader fullscreen />}>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/qr" element={<QrApprove />} />
              <Route path="/terms" element={<LegalPage page="terms" />} />
              <Route path="/privacy" element={<LegalPage page="privacy" />} />
              <Route path="/contact" element={<LegalPage page="contact" />} />
              {/* Qolgan hamma sahifalar (login talab qiladi) va 404 */}
              <Route path="/*" element={<AuthedApp />} />
            </Routes>
          </Suspense>
          <PresencePing />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}
