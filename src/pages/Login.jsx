import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../../public/Logo.png"; // Logo manzilingizni tekshiring

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/sat/select");
    } catch (err) {
      setError(mapError(err.code));
    } finally {
      setLoading(false);
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
              Bluebook mock testlarida qatnashish va progressni kuzatish uchun platformaga kiring.
            </p>
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
      <footer className="relative z-10 py-6 text-center text-xs text-[#566176]">
        &copy; {new Date().getFullYear()} Prepzone. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}

function mapError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Email manzili noto'g'ri.";
    case "auth/user-not-found":
      return "Bunday foydalanuvchi topilmadi.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email yoki parol noto'g'ri.";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}