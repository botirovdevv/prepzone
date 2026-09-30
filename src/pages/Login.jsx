import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthFooter } from "../components/AuthLayout";
const logo = "/Logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(mapError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await googleLogin();
      navigate("/dashboard");
    } catch (err) {
      setError(mapError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fcfcfa] flex flex-col justify-between text-[#111827] overflow-hidden">
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
            to="/register"
            className="rounded-full border border-[#111827]/10 bg-white/80 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:shadow-sm"
          >
            Ro'yxatdan o'tish
          </Link>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-3xl border border-[#111827]/[0.08] bg-white/90 backdrop-blur-md p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-widest text-[#087fd1] uppercase">
              Xush kelibsiz
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
              Hisobingizga kiring
            </h1>
            <p className="mt-2 text-sm text-[#566176]">
              SAT va IELTS mock testlarida qatnashish va progressni kuzatish uchun platformaga kiring.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566176] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20"
                placeholder="nomingiz@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#566176]">
                  Parol
                </label>
                <Link
                  to="/forgot-password"
                  state={{ email }}
                  className="text-xs font-semibold text-[#087fd1] hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#111827]/15 bg-[#fcfcfa]/60 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#087fd1] focus:bg-white focus:ring-2 focus:ring-[#087fd1]/20"
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
              disabled={loading}
              className="w-full rounded-full bg-[#087fd1] py-3 text-sm font-bold text-white shadow-md shadow-[#087fd1]/20 transition hover:bg-[#066fb8] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>

          <div className="mt-8 border-t border-[#111827]/[0.08] pt-6 text-center text-sm text-[#566176]">
            Hisobingiz yo'qmi?{" "}
            <Link to="/register" className="font-semibold text-[#087fd1] hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}

function mapError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Email manzili noto'g'ri.";
    // Xavfsizlik: "user topilmadi" va "parol noto'g'ri" ataylab bir xil xabar —
    // aks holda qaysi email ro'yxatdan o'tganini bilib olish mumkin bo'ladi.
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email yoki parol noto'g'ri.";
    case "auth/too-many-requests":
      return "Juda ko'p urinish. Hisob vaqtincha bloklandi — birozdan keyin qayta urinib ko'ring.";
    case "auth/user-disabled":
      return "Bu hisob o'chirilgan. Administrator bilan bog'laning.";
    case "auth/popup-closed-by-user":
      return "Google orqali kirish oyna yopilgani uchun bekor qilindi.";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}