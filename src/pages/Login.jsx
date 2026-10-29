import { lazy, Suspense, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LuMail, LuQrCode } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import GoogleButton from "../components/auth/GoogleButton";
import { FormAlert, OrDivider, PrimaryButton } from "../components/auth/FormParts";
// QR kutubxonasi faqat "QR kod" tabi ochilganda yuklanadi.
const QrLogin = lazy(() => import("../components/auth/QrLogin"));

// Kirgandan keyin qaytiladigan sahifa (masalan telefonda QR tasdiqlash).
// Faqat sayt ichidagi yo'l qabul qilinadi.
function safeFrom(from) {
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : null;
}

const TABS = [
  { id: "email", label: "Email yoki Google", icon: LuMail },
  { id: "qr", label: "QR kod", icon: LuQrCode },
];

export default function Login() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeFrom(location.state?.from);
  const [tab, setTab] = useState("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordNotSet, setPasswordNotSet] = useState(false);
  const [loading, setLoading] = useState(false);

  // Allaqachon kirgan foydalanuvchi login sahifasida turmaydi.
  if (!authLoading && user) {
    return <Navigate to={user.emailVerified ? from || "/dashboard" : "/verify-email"} replace />;
  }

  const goNext = (u) => navigate(u.emailVerified ? from || "/dashboard" : "/verify-email", { replace: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordNotSet(false);
    setLoading(true);
    try {
      goNext(await login(email.trim(), password));
    } catch (err) {
      // Firebase'dan ko'chirilgan yoki faqat Google bilan ochilgan hisob.
      if (err.code === "auth/password-not-set") setPasswordNotSet(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Xush kelibsiz"
      title="Hisobingizga kiring"
      subtitle="SAT mock testlari va natijalaringiz sizni kutmoqda."
      footer={
        <>
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="font-semibold text-[#087fd1] hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </>
      }
    >
      {/* QR faqat kompyuterda ma'noli; telefondan QR tasdiqlashga kelgan bo'lsa ko'rsatilmaydi. */}
      {!from && (
        <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-black/[0.05] p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setError("");
              }}
              className={`flex h-10 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition ${
                tab === id ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}

      {tab === "qr" && !from ? (
        <Suspense fallback={<div className="mx-auto aspect-square w-full max-w-[240px] animate-pulse rounded-[22px] bg-black/[0.05]" />}>
          <QrLogin onSuccess={goNext} />
        </Suspense>
      ) : (
        <>
          <GoogleButton onSuccess={goNext} onError={setError} disabled={loading} />

          <OrDivider />

          <form onSubmit={handleSubmit} className="space-y-3">
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nomingiz@email.com"
            />
            <TextField
              label="Parol"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              action={
                <Link
                  to="/forgot-password"
                  state={{ email }}
                  className="text-[13px] font-medium text-[#087fd1] hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              }
            />

            {error && (
              <FormAlert>
                {error}
                {passwordNotSet && (
                  <>
                    {" "}
                    <Link to="/forgot-password" state={{ email }} className="font-semibold underline">
                      Parol o'rnatish
                    </Link>
                  </>
                )}
              </FormAlert>
            )}

            <PrimaryButton loading={loading} loadingText="Kirilmoqda..." className="!mt-6">
              Kirish
            </PrimaryButton>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
