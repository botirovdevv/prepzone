import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuKeyRound, LuArrowRight } from "react-icons/lu";
import { api } from "../api/client";

export default function JoinSession() {
  const location = useLocation();
  const [code, setCode] = useState(location.state?.prefillCode || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("Kod 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    try {
      const session = await api.post("/sessions/lookup", { code: code.trim() }).catch((err) => {
        if (err.status === 404) return null;
        throw err;
      });
      if (!session) {
        setError("Bunday kod bilan test topilmadi.");
        return;
      }
      if (session.status === "closed") {
        setError("Bu test allaqachon yakunlangan.");
        return;
      }
      navigate(`/session/${session.id}/test`, { state: { code: code.trim() } });
    } catch (err) {
      console.error(err);
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mx-auto mb-4">
          <LuKeyRound size={24} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#12213D] mb-1">
          Kirish kodi bilan test
        </h1>
        <p className="text-sm text-[#12213D]/50">
          O'qituvchingiz yoki tashkilotchi bergan 6 xonali kodni kiriting.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#12213D]/8 p-6 space-y-4"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoFocus
          placeholder="000000"
          className="w-full text-center tracking-[0.5em] text-3xl font-black font-mono rounded-xl border border-[#12213D]/15 py-4 outline-none focus:border-[#087fd1]"
        />
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#087fd1] text-white font-semibold py-3 rounded-full hover:bg-[#066fb8] disabled:opacity-60"
        >
          {loading ? "Tekshirilmoqda..." : "Davom etish"}
          {!loading && <LuArrowRight size={17} />}
        </button>
      </form>
    </div>
  );
}
