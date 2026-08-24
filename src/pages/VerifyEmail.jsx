import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LuMailCheck, LuRefreshCw, LuLogOut, LuPencil } from "react-icons/lu";

export default function VerifyEmail() {
  const { user, loading, logout, resendVerificationEmail, refreshEmailVerified, changeEmail } =
    useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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
    if (user.emailVerified) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleResend = async () => {
    setSending(true);
    setError("");
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (err) {
      setError(
        err.code === "auth/too-many-requests"
          ? "Juda ko'p urinish. Bir necha daqiqadan keyin qayta urinib ko'ring."
          : "Yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring."
      );
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    setError("");
    try {
      const verified = await refreshEmailVerified();
      if (verified) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Hali tasdiqlanmagan. Emailingizdagi havolani bosganingizga ishonch hosil qiling.");
      }
    } finally {
      setChecking(false);
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
      setSent(true);
      setFixPassword("");
      setFixEmail("");
    } catch (err) {
      setFixError(
        err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
          ? "Parol noto'g'ri."
          : err.code === "auth/email-already-in-use"
          ? "Bu email allaqachon band."
          : "Xatolik yuz berdi. Qaytadan urinib ko'ring."
      );
    } finally {
      setFixLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#F6F7FB]">
      <div className="w-16 h-16 rounded-full bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mb-6">
        <LuMailCheck size={28} />
      </div>
      <h1 className="text-2xl font-extrabold text-[#12213D] mb-2">Emailingizni tasdiqlang</h1>
      <p className="text-[#12213D]/55 max-w-md mb-1">
        <span className="font-semibold text-[#12213D]">{user.email}</span> manziliga tasdiqlash
        havolasi yuborildi.
      </p>
      <p className="text-[#12213D]/55 max-w-md mb-8">
        Emailingizni oching, havolani bosing, so'ng shu yerga qaytib "Tasdiqladim" tugmasini
        bosing.
      </p>

      {error && <p className="text-red-600 text-sm mb-4 max-w-md">{error}</p>}
      {sent && !error && (
        <p className="text-emerald-600 text-sm mb-4">Email yuborildi, iltimos tekshiring ✓</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCheck}
          disabled={checking}
          className="flex items-center justify-center gap-2 bg-[#087fd1] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#066fb8] disabled:opacity-60"
        >
          <LuRefreshCw size={16} className={checking ? "animate-spin" : ""} />
          {checking ? "Tekshirilmoqda..." : "Tasdiqladim, tekshirish"}
        </button>
        <button
          onClick={handleResend}
          disabled={sending}
          className="border border-[#12213D]/15 text-[#12213D] font-semibold px-6 py-3 rounded-full hover:bg-[#12213D]/5 disabled:opacity-60"
        >
          {sending ? "Yuborilmoqda..." : "Qayta yuborish"}
        </button>
      </div>

      <button
        onClick={() => setShowFix((s) => !s)}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/45 hover:text-[#12213D] mt-6"
      >
        <LuPencil size={14} /> Email manzilini noto'g'ri kiritdingizmi?
      </button>

      {showFix && (
        <form
          onSubmit={handleFixEmail}
          className="w-full max-w-sm bg-white rounded-2xl border border-[#12213D]/8 p-5 mt-4 text-left space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-[#12213D]/50 mb-1">
              Joriy parolingiz
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
              To'g'ri email manzil
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
            {fixLoading ? "Yangilanmoqda..." : "Emailni yangilash va qayta yuborish"}
          </button>
        </form>
      )}

      <button
        onClick={logout}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/40 hover:text-[#12213D] mt-8"
      >
        <LuLogOut size={14} /> Chiqish
      </button>
    </div>
  );
}
