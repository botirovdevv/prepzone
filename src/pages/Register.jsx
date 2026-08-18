import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../../public/Logo.png"; // Logo manzilingizni tekshiring

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, googleLogin } = useAuth(); // AuthContext'da googleLogin ham bo'lishi kerak
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Parollar mos kelmadi.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName.trim());
      navigate("/sat/select");
    } catch (err) {
      setError(mapError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await googleLogin();
      navigate("/sat/select");
    } catch (err) {
      setError(mapError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fcfcfa] flex flex-col justify-between text-[#111827] overflow-hidden">
      {/* Vercel-style Katakli va Nuqtali Background Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(8, 127, 209, 0.18) 0%, transparent 60%),
            radial-gradient(rgba(17, 24, 39, 0.22) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "100% 100%, 24px 24px"
        }}
      />

      {/* Header / Navbar */}
      <header className="relative z-10 border-b border-[#111827]/[0.08] bg-[#fcfcfa]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="Prepzone" className="w-36 h-auto object-contain" />
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-[#111827]/10 bg-white/80 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:shadow-sm"
          >
            Kirish
          </Link>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] rounded-3xl border border-[#111827]/[0.08] bg-white/90 backdrop-blur-md p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <div className="mb-6 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-widest text-[#087fd1] uppercase">
              Boshlash uchun
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
              Ro'yxatdan o'ting
            </h1>
            <p className="mt-2 text-sm text-[#566176]">
              Yangi hisob yarating va SAT mock testlarida qatnashing.
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#111827]/15 bg-white py-2.5 px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#f3f4f6] active:scale-[0.99] disabled:opacity-60 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? "Ulanmoqda..." : "Google orqali davom etish"}
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[#111827]/10"></div>
            <span className="absolute bg-white px-3 text-xs font-medium text-[#566176]">
              yoki email orqali
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566176] mb-1.5">
                To'liq ism
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20"
                placeholder="Ism Familiya"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566176] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20"
                placeholder="nomingiz@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566176] mb-1.5">
                Parol
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20"
                placeholder="Kamida 6 ta belgi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566176] mb-1.5">
                Parolni tasdiqlang
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-full bg-[#087fd1] py-3 text-sm font-bold text-white shadow-md shadow-[#087fd1]/20 transition hover:bg-[#066fb8] active:scale-[0.99] disabled:opacity-60 mt-2"
            >
              {loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#111827]/[0.08] pt-5 text-center text-sm text-[#566176]">
            Hisobingiz bormi?{" "}
            <Link to="/login" className="font-semibold text-[#087fd1] hover:underline">
              Kirish
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-[#566176]">
        &copy; {new Date().getFullYear()} Prepzone. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}

function mapError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu email allaqachon ro'yxatdan o'tgan.";
    case "auth/invalid-email":
      return "Email manzili noto'g'ri.";
    case "auth/weak-password":
      return "Parol juda zaif (kamida 6 ta belgi).";
    case "auth/popup-closed-by-user":
      return "Google orqali kirish oyna yopilgani uchun bekor qilindi.";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}