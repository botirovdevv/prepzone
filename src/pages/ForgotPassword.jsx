import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import { FormAlert, PrimaryButton } from "../components/auth/FormParts";

const RESEND_COOLDOWN_S = 45;

// ------------------------------------------------------------------
// Parolni tiklash (2 qadam): email -> 6 xonali kod + yangi parol.
// Firebase'dan ko'chirilgan foydalanuvchilar ham shu yerda yangi parol
// o'rnatadi. Muvaffaqiyatli bo'lsa — darhol tizimga kiritiladi.
// ------------------------------------------------------------------
export default function ForgotPassword() {
  const { requestPasswordReset, resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setStep("code");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    sendCode();
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <Link to="/login" className="font-semibold text-accent hover:underline">
      Kirish sahifasiga qaytish
    </Link>
  );

  if (step === "email") {
    return (
      <AuthLayout
        eyebrow="Parolni tiklash"
        title="Parolni unutdingizmi?"
        subtitle="Emailingizni kiriting — yangi parol o'rnatish uchun 6 xonali kod yuboramiz."
        footer={footer}
      >
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nomingiz@email.com"
          />
          <FormAlert>{error}</FormAlert>
          <PrimaryButton loading={loading} loadingText="Yuborilmoqda..." className="!mt-6">
            Kod yuborish
          </PrimaryButton>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Parolni tiklash"
      title="Yangi parol o'rnating"
      subtitle={
        <>
          Agar <span className="font-semibold text-ink">{email}</span> ro'yxatdan o'tgan
          bo'lsa, unga 6 xonali kod yuborildi (10 daqiqa amal qiladi).
        </>
      }
      footer={footer}
    >
      <form onSubmit={handleResetSubmit} className="space-y-4">
        <TextField
          label="Tasdiqlash kodi"
          name="one-time-code"
          autoComplete="one-time-code"
          inputMode="numeric"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="[&_input]:text-center [&_input]:font-mono [&_input]:text-[22px] [&_input]:tracking-[0.4em]"
          action={
            <button
              type="button"
              onClick={sendCode}
              disabled={cooldown > 0 || loading}
              className="text-[13px] font-medium text-accent hover:underline disabled:text-ink-3 disabled:no-underline"
            >
              {cooldown > 0 ? `Qayta yuborish (${cooldown}s)` : "Qayta yuborish"}
            </button>
          }
        />
        <TextField
          label="Yangi parol"
          type="password"
          name="new-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kamida 8 ta belgi"
        />
        <FormAlert>{error}</FormAlert>
        <PrimaryButton
          loading={loading}
          loadingText="Saqlanmoqda..."
          disabled={code.length !== 6}
          className="!mt-6"
        >
          Parolni saqlash va kirish
        </PrimaryButton>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError("");
          }}
          className="pz-press w-full rounded-[14px] py-2 text-[14px] font-medium text-ink-2 hover:text-ink"
        >
          Boshqa email kiritish
        </button>
      </form>
    </AuthLayout>
  );
}
