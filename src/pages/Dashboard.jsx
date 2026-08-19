import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import {
  LuFileText,
  LuKeyRound,
  LuHistory,
  LuArrowRight,
  LuShieldCheck,
} from "react-icons/lu";

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [recent, setRecent] = useState(null);
  const [code, setCode] = useState("");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";

  useEffect(() => {
    if (!user) return;
    // History.jsx kabi — Firestore'da qo'shimcha composite index talab
    // qilmasligi uchun faqat "where" bilan olib, mijoz tomonida saralaymiz.
    getDocs(query(collection(db, "results"), where("uid", "==", user.uid)))
      .then((snap) => {
        if (snap.empty) {
          setRecent(false);
          return;
        }
        const all = snap.docs.map((d) => d.data());
        all.sort(
          (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
        );
        setRecent(all[0]);
      })
      .catch(() => setRecent(false));
  }, [user]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    navigate("/join", { state: { prefillCode: code.trim() } });
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0076FC] mb-1">
          Xush kelibsiz
        </p>
        <h1 className="text-2xl font-extrabold text-[#0F1C30]">
          Salom, {displayName} 👋
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Link
          to="/sat/select"
          className="flex items-center gap-4 bg-white rounded-2xl border border-[#0F1C30]/8 p-5 hover:border-[#0076FC]/40 hover:shadow-md transition"
        >
          <div className="w-11 h-11 rounded-xl bg-[#0076FC]/10 text-[#0076FC] flex items-center justify-center shrink-0">
            <LuFileText size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#0F1C30]">Mock testlar</p>
            <p className="text-sm text-[#0F1C30]/50">To'liq adaptiv SAT testlarini yeching</p>
          </div>
          <LuArrowRight size={18} className="text-[#0F1C30]/30 shrink-0" />
        </Link>

        <Link
          to="/sat/history"
          className="flex items-center gap-4 bg-white rounded-2xl border border-[#0F1C30]/8 p-5 hover:border-[#0076FC]/40 hover:shadow-md transition"
        >
          <div className="w-11 h-11 rounded-xl bg-[#0076FC]/10 text-[#0076FC] flex items-center justify-center shrink-0">
            <LuHistory size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#0F1C30]">Mening natijalarim</p>
            <p className="text-sm text-[#0F1C30]/50">
              {recent ? `Oxirgi natija: ${recent.total} ball` : "Hali test topshirmagansiz"}
            </p>
          </div>
          <LuArrowRight size={18} className="text-[#0F1C30]/30 shrink-0" />
        </Link>
      </div>

      {/* Kod bilan kirish */}
      <div className="bg-[#0F1C30] rounded-2xl p-6 sm:p-8 text-white mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <LuKeyRound size={18} />
          </div>
          <h2 className="font-bold text-lg">Kirish kodi bilan test</h2>
        </div>
        <p className="text-white/60 text-sm mb-5">
          O'qituvchingiz yoki tashkilotchi bergan 6 xonali kodni kiritib, vaqti
          belgilangan testga qo'shiling.
        </p>
        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="flex-1 text-center sm:text-left tracking-[0.4em] text-xl font-black font-mono rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-white/30 placeholder:text-white/30"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#0076FC] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0062d1] transition"
          >
            Davom etish <LuArrowRight size={17} />
          </button>
        </form>
      </div>

      {isAdmin && (
        <Link
          to="/admin"
          className="flex items-center gap-4 bg-white rounded-2xl border border-[#0F1C30]/8 p-5 hover:border-[#0076FC]/40 hover:shadow-md transition"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#0F1C30]">Admin panel</p>
            <p className="text-sm text-[#0F1C30]/50">
              Vaqti belgilangan testlar tashkil qiling va nazorat qiling
            </p>
          </div>
          <LuArrowRight size={18} className="text-[#0F1C30]/30 shrink-0" />
        </Link>
      )}
    </div>
  );
}
