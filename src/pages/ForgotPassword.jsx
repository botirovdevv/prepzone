import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuMailCheck } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20";

export default function ForgotPassword() {
  const location = useLocation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(location.state?.email || "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      // Xavfsizlik: email ro'yxatda yo'q bo'lsa ham "yuborildi" deymiz —
      // aks holda qaysi email ro'yxatdan o'tganini bilib olish mumkin.
      if (err.code === "auth/user-not-found") setSent(true);
      else setError(mapError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headerAction={
        <Link
          to="/login"
          className="rounded-full border border-[#111827]/10 bg-white/80 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:shadow-sm"
        >
          Kirish
        </Link>
      }
    >
      <div className="w-full max-w-[420px] rounded-3xl border border-[#111827]/[0.08] bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:p-10">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <LuMailCheck size={26} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Emailingizni tekshiring</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#566176]">
              Agar <b className="text-[#111827]">{email}</b> bilan hisob mavjud bo'lsa, unga parolni tiklash havolasi
              yuborildi. Xat kelmasa, "Spam" papkasini ham tekshiring.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-block w-full rounded-full bg-[#087fd1] py-3 text-sm font-bold text-white shadow-md shadow-[#087fd1]/20 transition hover:bg-[#066fb8]"
            >
              Kirish sahifasiga qaytish
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#087fd1]">Parolni tiklash</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Parolni unutdingizmi?</h1>
              <p className="mt-2 text-sm text-[#566176]">
                Hisobingiz emailini kiriting — yangi parol o'rnatish uchun havola yuboramiz.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#566176]">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="nomingiz@email.com"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#087fd1] py-3 text-sm font-bold text-white shadow-md shadow-[#087fd1]/20 transition hover:bg-[#066fb8] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Yuborilmoqda..." : "Havolani yuborish"}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-[#566176]">
              Google orqali ro'yxatdan o'tgan bo'lsangiz, parol shart emas —{" "}
              <Link to="/login" className="font-semibold text-[#087fd1] hover:underline">
                Google bilan kiring
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

function mapError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Email manzili noto'g'ri.";
    case "auth/too-many-requests":
      return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.";
    case "auth/network-request-failed":
      return "Internet aloqasini tekshiring.";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}
