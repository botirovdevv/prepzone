import { lazy, Suspense, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LuMail, LuQrCode } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import GoogleButton from "../components/auth/GoogleButton";
import { FormAlert, OrDivider, PrimaryButton } from "../components/auth/FormParts";
import { useI18n } from "../i18n";
// QR kutubxonasi faqat "QR kod" tabi ochilganda yuklanadi.
const QrLogin = lazy(() => import("../components/auth/QrLogin"));

// Kirgandan keyin qaytiladigan sahifa (masalan telefonda QR tasdiqlash).
// Faqat sayt ichidagi yo'l qabul qilinadi.
function safeFrom(from) {
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : null;
}

const TABS = [
  { id: "email", label: "tabEmail", icon: LuMail },
  { id: "qr", label: "tabQr", icon: LuQrCode },
];

export default function Login() {
  const { user, loading: authLoading, login } = useAuth();
  const { t } = useI18n();
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
      eyebrow={t("auth.login.eyebrow")}
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.noAccount")}{" "}
          <Link to="/register" className="font-semibold text-[#087fd1] hover:underline">
            {t("auth.login.signUp")}
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
              <Icon size={15} /> {t(`auth.login.${label}`)}
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
              label={t("auth.email")}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
            />
            <TextField
              label={t("auth.password")}
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
                  {t("auth.login.forgot")}
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
                      {t("auth.login.setPassword")}
                    </Link>
                  </>
                )}
              </FormAlert>
            )}

            <PrimaryButton loading={loading} loadingText={t("auth.login.submitting")} className="!mt-6">
              {t("auth.login.submit")}
            </PrimaryButton>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
