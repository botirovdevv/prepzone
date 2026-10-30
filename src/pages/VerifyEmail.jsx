import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOtpVerified } from "../hooks/useOtpVerified";
import { LuMailCheck, LuRefreshCw, LuLogOut, LuPencil } from "react-icons/lu";
import { PageLoader } from "../components/ui";
import { LanguageSwitch, useI18n } from "../i18n";

const RESEND_COOLDOWN_S = 60;

export default function VerifyEmail() {
  const { user, loading, logout, changeEmail, sendVerificationCode, verifyEmailCode } = useAuth();
  const { verified, checked } = useOtpVerified();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [sentOnce, setSentOnce] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentForEmailRef = useRef(null);

  const [showFix, setShowFix] = useState(false);
  const [fixPassword, setFixPassword] = useState("");
  const [fixEmail, setFixEmail] = useState("");
  const [fixLoading, setFixLoading] = useState(false);
  const [fixError, setFixError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (checked && verified) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, checked, verified, navigate]);

  // Sahifa ochilganda (yoki email o'zgarganda) avtomatik birinchi kodni yuboramiz.
  useEffect(() => {
    if (!user || !checked || verified) return;
    if (sentForEmailRef.current === user.email) return;
    sentForEmailRef.current = user.email;
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, checked, verified]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSend = async () => {
    if (!user || sending || cooldown > 0) return;
    setSending(true);
    setError("");
    try {
      await sendVerificationCode();
      setSentOnce(true);
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      // Sahifa yangilangan bo'lsa, avvalgi kod hali amal qiladi — kutish vaqtini ko'rsatamiz.
      if (err.code === "resource-exhausted") {
        setSentOnce(true);
        setCooldown(45);
        return;
      }
      console.error(err);
      setError(err.message || t("auth.verify.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      await verifyEmailCode(code.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || t("auth.verify.wrongCode"));
    } finally {
      setVerifying(false);
    }
  };

  const handleFixEmail = async (e) => {
    e.preventDefault();
    setFixError("");
    if (!fixEmail.trim() || !fixPassword) return;
    setFixLoading(true);
    try {
      await changeEmail(fixPassword, fixEmail.trim());
      setShowFix(false);
      setFixPassword("");
      setFixEmail("");
      setCode("");
      // useEffect user.email o'zgarganini ko'rib, avtomatik yangi kod yuboradi.
    } catch (err) {
      setFixError(
        err.code === "auth/wrong-password"
          ? t("auth.verify.wrongPassword")
          : err.code === "auth/email-already-in-use"
          ? t("auth.verify.emailTaken")
          : err.message || t("common.error")
      );
    } finally {
      setFixLoading(false);
    }
  };

  if (loading || !user || !checked) {
    return <PageLoader fullscreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#F6F7FB]">
      <LanguageSwitch className="absolute right-5 top-5" />
      <div className="w-16 h-16 rounded-full bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mb-6">
        <LuMailCheck size={28} />
      </div>
      <h1 className="text-2xl font-extrabold text-[#12213D] mb-2">{t("auth.verify.title")}</h1>
      <p className="text-[#12213D]/55 max-w-md mb-8">
        <span className="font-semibold text-[#12213D]">{user.email}</span> {t("auth.verify.sentTo")}
      </p>

      <form onSubmit={handleVerify} className="w-full max-w-xs space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoFocus
          placeholder="000000"
          aria-label={t("auth.verify.codeLabel")}
          className="w-full text-center tracking-[0.5em] text-2xl font-black font-mono rounded-xl border border-[#12213D]/15 py-3.5 outline-none focus:border-[#087fd1]"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={verifying || code.length !== 6}
          className="w-full bg-[#087fd1] text-white font-semibold py-3 rounded-full hover:bg-[#066fb8] disabled:opacity-60"
        >
          {verifying ? t("auth.verify.verifying") : t("auth.verify.verify")}
        </button>
      </form>

      <button
        onClick={handleSend}
        disabled={sending || cooldown > 0}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/50 hover:text-[#12213D] mt-5 disabled:opacity-50"
      >
        <LuRefreshCw size={14} className={sending ? "animate-spin" : ""} />
        {cooldown > 0
          ? t("auth.verify.resendIn", { s: cooldown })
          : sending
          ? t("auth.verify.sending")
          : sentOnce
          ? t("auth.verify.resend")
          : t("auth.verify.send")}
      </button>

      <button
        onClick={() => setShowFix((s) => !s)}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/45 hover:text-[#12213D] mt-3"
      >
        <LuPencil size={14} /> {t("auth.verify.wrongEmail")}
      </button>

      {showFix && (
        <form
          onSubmit={handleFixEmail}
          className="w-full max-w-sm bg-white rounded-2xl border border-[#12213D]/8 p-5 mt-4 text-left space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-[#12213D]/50 mb-1">
              {t("auth.verify.currentPassword")}
            </label>
            <input
              type="password"
              value={fixPassword}
              onChange={(e) => setFixPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#12213D]/15 px-3 py-2 text-sm outline-none focus:border-[#087fd1]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#12213D]/50 mb-1">
              {t("auth.verify.correctEmail")}
            </label>
            <input
              type="email"
              value={fixEmail}
              onChange={(e) => setFixEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#12213D]/15 px-3 py-2 text-sm outline-none focus:border-[#087fd1]"
            />
          </div>
          {fixError && <p className="text-xs text-red-600">{fixError}</p>}
          <button
            type="submit"
            disabled={fixLoading}
            className="w-full bg-[#12213D] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#1a2f52] disabled:opacity-60"
          >
            {fixLoading ? t("auth.verify.updating") : t("auth.verify.update")}
          </button>
        </form>
      )}

      <button
        onClick={logout}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/40 hover:text-[#12213D] mt-8"
      >
        <LuLogOut size={14} /> {t("auth.verify.logout")}
      </button>
    </div>
  );
}
