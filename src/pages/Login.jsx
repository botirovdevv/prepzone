import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen bg-[#0B2265] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[#0B2265] mb-1">SAT Mock — Kirish</h1>
        <p className="text-sm text-gray-500 mb-6">
          Bluebook mock testiga kirish uchun hisobingizga kiring.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#375DFB]"
              placeholder="siz@misol.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Parol</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#375DFB]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#375DFB] text-white font-semibold py-2.5 rounded-lg hover:bg-[#2b4bd9] transition disabled:opacity-60"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-[#375DFB] font-medium">
            Ro'yxatdan o'tish
          </Link>
        </p>
        <p className="text-sm text-gray-400 mt-2 text-center">
          <Link to="/">← Bosh sahifaga qaytish</Link>
        </p>
      </div>
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
