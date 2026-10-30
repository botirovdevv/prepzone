import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import GoogleButton from "../components/auth/GoogleButton";
import { FormAlert, OrDivider, PrimaryButton } from "../components/auth/FormParts";
import { useI18n } from "../i18n";
import { MIN_PASSWORD_LENGTH } from "../utils/passwordPolicy";

// Parol kuchi: uzunlik + belgilar xilma-xilligi (0–4).
function passwordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= MIN_PASSWORD_LENGTH) score++;
  if (pw.length >= 14) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.floor(score));
}

const STRENGTH_COLORS = ["#e5484d", "#e5484d", "#f5a524", "#30a46c", "#30a46c"];

function StrengthMeter({ password }) {
  const { tr } = useI18n();
  const score = password.length < MIN_PASSWORD_LENGTH ? 0 : Math.max(1, passwordScore(password));
  const color = STRENGTH_COLORS[score];
  const label = tr("auth.register.strength")[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{ background: i <= score ? color : "rgba(0,0,0,0.08)" }}
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
  const { t } = useI18n();
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
    touchedConfirm && confirm && confirm !== password ? t("auth.register.mismatch") : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.passwordTooShort", { n: MIN_PASSWORD_LENGTH }));
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
      eyebrow={t("auth.register.eyebrow")}
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={
        <>
          {t("auth.register.haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-[#087fd1] hover:underline">
            {t("auth.register.login")}
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

      <form onSubmit={handleSubmit} className="space-y-3">
        <TextField
          label={t("auth.register.fullName")}
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("auth.register.fullNamePlaceholder")}
        />
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
          name="new-password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.minChars", { n: MIN_PASSWORD_LENGTH })}
          hint={password ? <StrengthMeter password={password} /> : t("auth.minChars", { n: MIN_PASSWORD_LENGTH })}
        />
        <TextField
          label={t("auth.register.confirm")}
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

        <PrimaryButton loading={loading} loadingText={t("auth.register.submitting")} className="!mt-6">
          {t("auth.register.submit")}
        </PrimaryButton>

        <p className="text-center text-[13px] leading-[1.5] text-[#86868b]">
          {t("auth.register.codeNote")}
        </p>
      </form>
    </AuthLayout>
  );
}
