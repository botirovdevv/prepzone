import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#0B2265] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[#0B2265] mb-1">Ro'yxatdan o'tish</h1>
        <p className="text-sm text-gray-500 mb-6">
          Yangi hisob yarating va SAT mock testni boshlang.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">To'liq ism</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#375DFB]"
              placeholder="Ism Familiya"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#375DFB]"
              placeholder="Kamida 6 ta belgi"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Parolni tasdiqlang</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="text-[#375DFB] font-medium">
            Kirish
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
    case "auth/email-already-in-use":
      return "Bu email allaqachon ro'yxatdan o'tgan.";
    case "auth/invalid-email":
      return "Email manzili noto'g'ri.";
    case "auth/weak-password":
      return "Parol juda zaif (kamida 6 ta belgi).";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}
