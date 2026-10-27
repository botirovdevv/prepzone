import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import GoogleButton from "../components/auth/GoogleButton";
import { FormAlert, OrDivider, PrimaryButton } from "../components/auth/FormParts";

// Parol kuchi: uzunlik + belgilar xilma-xilligi (0–4).
function passwordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.floor(score));
}

const STRENGTH = [
  { label: "Juda qisqa", color: "#e5484d" },
  { label: "Zaif", color: "#e5484d" },
  { label: "O'rtacha", color: "#f5a524" },
  { label: "Yaxshi", color: "#30a46c" },
  { label: "Kuchli", color: "#30a46c" },
];

function StrengthMeter({ password }) {
  const score = password.length < 8 ? 0 : Math.max(1, passwordScore(password));
  const { label, color } = STRENGTH[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{ background: i <= score ? color : "rgba(17,24,39,0.08)" }}
          />
        ))}
      </div>
      <span className="w-20 text-right text-[12px] font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export default function Register() {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    return <Navigate to={user.emailVerified ? "/dashboard" : "/verify-email"} replace />;
  }

  // Inline tekshiruv — xato yuborishdan oldin, maydonning o'zida ko'rinadi.
  const confirmError =
    touchedConfirm && confirm && confirm !== password ? "Parollar mos kelmadi." : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (password !== confirm) {
      setTouchedConfirm(true);
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim());
      navigate("/verify-email", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Boshlash uchun"
      title="Hisob yarating"
      subtitle="Bir daqiqada ro'yxatdan o'ting va birinchi SAT mock testingizni boshlang."
      footer={
        <>
          Hisobingiz bormi?{" "}
          <Link to="/login" className="font-semibold text-[#087fd1] hover:underline">
            Kirish
          </Link>
        </>
      }
    >
      {/* Google bilan ro'yxatdan o'tganlar emailni tasdiqlamasdan to'g'ridan-to'g'ri kiradi. */}
      <GoogleButton
        onSuccess={() => navigate("/dashboard", { replace: true })}
        onError={setError}
        disabled={loading}
      />

      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="To'liq ism"
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ism Familiya"
        />
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
          name="new-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kamida 8 ta belgi"
          hint={password ? <StrengthMeter password={password} /> : null}
        />
        <TextField
          label="Parolni tasdiqlang"
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouchedConfirm(true)}
          placeholder="••••••••"
          error={confirmError}
        />

        <FormAlert>{error}</FormAlert>

        <PrimaryButton loading={loading} loadingText="Yaratilmoqda..." className="!mt-6">
          Ro'yxatdan o'tish
        </PrimaryButton>

        <p className="text-center text-[12px] leading-[1.5] text-[#667085]">
          Emailingizga 6 xonali tasdiqlash kodi yuboriladi.
        </p>
      </form>
    </AuthLayout>
  );
}
