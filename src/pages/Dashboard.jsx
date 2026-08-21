import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import HandIcon from "../../public/waving-hand-icon.png"
import {
  LuNotebookPen,
  LuKeyRound,
  LuHistory,
  LuLayers,
  LuArrowRight,
  LuShieldCheck,
  LuTrophy,
} from "react-icons/lu";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Xayrli tun";
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  return "Xayrli kech";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [recent, setRecent] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [code, setCode] = useState("");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "results"), where("uid", "==", user.uid)))
      .then((snap) => {
        if (snap.empty) {
          setRecent(false);
          return;
        }
        const all = snap.docs.map((d) => d.data());
        all.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setRecent(all[0]);
      })
      .catch(() => setRecent(false));

    getDoc(doc(db, "leaderboard", user.uid))
      .then((snap) => setMyRank(snap.exists() ? snap.data().bestScore : null))
      .catch(() => setMyRank(null));
  }, [user]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    navigate("/join", { state: { prefillCode: code.trim() } });
  };

  return (
    <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#12213D]/6 px-6 py-8 sm:px-9 sm:py-10 mb-6 bg-[linear-gradient(135deg,#eaf0ff_0%,#f6f7fb_55%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-16 -top-20 w-72 h-72 rounded-full bg-[#087fd1]/10" />
        <div className="pointer-events-none absolute right-28 bottom-[-60px] w-40 h-40 rounded-full bg-[#087fd1]/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#12213D]/45 mb-2">
              {greeting()}
            </p>
            <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#12213D] leading-[1.1] flex items-center gap-2">
              <span>Salom, {displayName}</span>
              <img
                src={HandIcon}
                alt="Waving hand"
                className="w-8 h-8 sm:w-9 sm:h-9 inline-block object-contain"
              />
            </h1>
          </div>
          {(recent || myRank) && (
            <div className="flex gap-2.5">
              {recent && (
                <div className="flex items-center gap-2.5 bg-white/90 rounded-2xl px-4 py-2.5 shadow-sm border border-white">
                  <span className="w-7 h-7 rounded-lg bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center">
                    <LuHistory size={14} />
                  </span>
                  <div className="leading-tight">
                    <p className="font-display text-base font-extrabold text-[#12213D]">{recent.total}</p>
                    <p className="text-[11px] text-[#12213D]/45 font-medium">oxirgi ball</p>
                  </div>
                </div>
              )}
              {myRank && (
                <div className="flex items-center gap-2.5 bg-white/90 rounded-2xl px-4 py-2.5 shadow-sm border border-white">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <LuTrophy size={14} />
                  </span>
                  <div className="leading-tight">
                    <p className="font-display text-base font-extrabold text-[#12213D]">{myRank}</p>
                    <p className="text-[11px] text-[#12213D]/45 font-medium">eng yaxshi</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5 mb-3.5">
        <Link
          to="/sat/select"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-[#12213D]/7 p-5 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(47,111,237,0.18)] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center shrink-0 group-hover:bg-[#087fd1] group-hover:text-white transition-colors">
            <LuNotebookPen size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#12213D]">Mock testlar</p>
            <p className="text-sm text-[#12213D]/45">To'liq adaptiv SAT testlarini yeching</p>
          </div>
          <LuArrowRight size={18} className="text-[#12213D]/25 shrink-0" />
        </Link>

        <Link
          to="/practice"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-[#12213D]/7 p-5 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(8,127,209,0.2)] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center shrink-0 group-hover:bg-[#087fd1] group-hover:text-white transition-colors">
            <LuLayers size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#12213D]">Amaliyot to'plamlari</p>
            <p className="text-sm text-[#12213D]/45">Vaqt cheklovisiz, darhol javob bilan</p>
          </div>
          <LuArrowRight size={18} className="text-[#12213D]/25 shrink-0" />
        </Link>

        <Link
          to="/sat/history"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-[#12213D]/7 p-5 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(8,127,209,0.18)] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center shrink-0 group-hover:bg-[#087fd1] group-hover:text-white transition-colors">
            <LuHistory size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#12213D]">Mening natijalarim</p>
            <p className="text-sm text-[#12213D]/45">
              {recent ? `Oxirgi natija: ${recent.total} ball` : "Hali test topshirmagansiz"}
            </p>
          </div>
          <LuArrowRight size={18} className="text-[#12213D]/25 shrink-0" />
        </Link>

        <Link
          to="/leaderboard"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-[#12213D]/7 p-5 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(8,127,209,0.2)] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center shrink-0 group-hover:bg-[#087fd1] group-hover:text-white transition-colors">
            <LuTrophy size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#12213D]">Reyting</p>
            <p className="text-sm text-[#12213D]/45">Eng yaxshi TOP-15 natija</p>
          </div>
          <LuArrowRight size={18} className="text-[#12213D]/25 shrink-0" />
        </Link>
      </div>

      {/* Kod bilan kirish */}
      <div className="relative overflow-hidden bg-[#12213D] rounded-2xl p-6 sm:p-8 text-white mb-3.5">
        <div className="pointer-events-none absolute -right-10 -bottom-16 w-52 h-52 rounded-full bg-[#087fd1]/20" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <LuKeyRound size={18} />
            </div>
            <h2 className="font-display font-bold text-lg">Kirish kodi bilan test</h2>
          </div>
          <p className="text-white/55 text-sm mb-5">
            O'qituvchingiz yoki tashkilotchi bergan 6 xonali kodni kiritib, vaqti belgilangan
            testga qo'shiling.
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
              className="flex items-center justify-center gap-2 bg-[#087fd1] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#066fb8] transition"
            >
              Davom etish <LuArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>

      {isAdmin && (
        <Link
          to="/admin"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-[#12213D]/7 p-5 hover:border-[#087fd1]/30 hover:shadow-md transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#12213D]/8 text-[#12213D]/70 flex items-center justify-center shrink-0">
            <LuShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#12213D]">Admin panel</p>
            <p className="text-sm text-[#12213D]/45">
              Mock testlar, amaliyot to'plamlari va nazoratni boshqaring
            </p>
          </div>
          <LuArrowRight size={18} className="text-[#12213D]/25 shrink-0" />
        </Link>
      )}
    </div>
  );
}
