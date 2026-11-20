import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import { FormAlert, PrimaryButton } from "../components/auth/FormParts";
import { useI18n } from "../i18n";
import { MIN_PASSWORD_LENGTH } from "../utils/passwordPolicy";

const RESEND_COOLDOWN_S = 45;

// ------------------------------------------------------------------
// Parolni tiklash (2 qadam): email -> 6 xonali kod + yangi parol.
// Firebase'dan ko'chirilgan foydalanuvchilar ham shu yerda yangi parol
// o'rnatadi. Muvaffaqiyatli bo'lsa — darhol tizimga kiritiladi.
// ------------------------------------------------------------------
export default function ForgotPassword() {
  const { requestPasswordReset, resetPassword } = useAuth();
  const { t } = useI18n();
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
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.passwordTooShort", { n: MIN_PASSWORD_LENGTH }));
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
      {t("auth.forgot.back")}
    </Link>
  );

  if (step === "email") {
    return (
      <AuthLayout
        eyebrow={t("auth.forgot.eyebrow")}
        title={t("auth.forgot.title")}
        subtitle={t("auth.forgot.subtitle")}
        footer={footer}
      >
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <TextField
            label={t("auth.email")}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
          />
          <FormAlert>{error}</FormAlert>
          <PrimaryButton loading={loading} loadingText={t("auth.forgot.sending")} className="!mt-6">
            {t("auth.forgot.send")}
          </PrimaryButton>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={t("auth.forgot.eyebrow")}
      title={t("auth.forgot.resetTitle")}
      subtitle={
        <>
          {t("auth.forgot.resetSubtitleBefore")} <span className="font-semibold text-ink">{email}</span>{" "}
          {t("auth.forgot.resetSubtitleAfter")}
        </>
      }
      footer={footer}
    >
      <form onSubmit={handleResetSubmit} className="space-y-4">
        <TextField
          label={t("auth.forgot.code")}
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
              {cooldown > 0 ? t("auth.forgot.resendIn", { s: cooldown }) : t("auth.forgot.resend")}
            </button>
          }
        />
        <TextField
          label={t("auth.forgot.newPassword")}
          type="password"
          name="new-password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.minChars", { n: MIN_PASSWORD_LENGTH })}
        />
        <FormAlert>{error}</FormAlert>
        <PrimaryButton
          loading={loading}
          loadingText={t("auth.forgot.saving")}
          disabled={code.length !== 6}
          className="!mt-6"
        >
          {t("auth.forgot.save")}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError("");
          }}
          className="pz-press w-full rounded-[14px] py-2 text-[14px] font-medium text-ink-2 hover:text-ink"
        >
          {t("auth.forgot.otherEmail")}
        </button>
      </form>
    </AuthLayout>
  );
}
