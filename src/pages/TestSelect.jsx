import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuNotebookPen, LuArrowRight, LuTimer, LuGlobe, LuListChecks } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { testsCatalog } from "../data/testsCatalog";
import { loadLocalProgress, getCooldownRemainingMs } from "../utils/testProgress";
import PageHero from "../components/PageHero";

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TestSelect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [lockRemaining, setLockRemaining] = useState({});
  const [openSessions, setOpenSessions] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    const q = query(collection(db, "testSessions"), where("accessType", "==", "open"));
    const unsub = onSnapshot(
      q,
      (snap) =>
        setOpenSessions(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.status !== "closed")
        ),
      () => setOpenSessions([])
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const compute = () => {
      const next = {};
      testsCatalog.forEach((t) => {
        const saved = loadLocalProgress(user.uid, t.id);
        if (saved && saved.reason === "paused") {
          const remaining = getCooldownRemainingMs(saved.pausedAt);
          if (remaining > 0) next[t.id] = remaining;
        }
      });
      openSessions.forEach((s) => {
        const saved = loadLocalProgress(user.uid, `session:${s.id}`);
        if (saved && saved.reason === "paused") {
          const remaining = getCooldownRemainingMs(saved.pausedAt);
          if (remaining > 0) next[`session:${s.id}`] = remaining;
        }
      });
      setLockRemaining(next);
    };
    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [user, openSessions]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#12213D]/40">
        Yuklanmoqda...
      </div>
    );
  }

  // Statik va admin tomonidan qo'shilgan "doimiy ochiq" testlarni bitta
  // ro'yxatga birlashtiramiz — foydalanuvchi uchun ular bir xil toifa:
  // "to'liq mock testlar".
  const papers = [
    ...testsCatalog.map((t) => ({
      key: t.id,
      lockKey: t.id,
      title: t.title,
      description: t.description,
      go: () => navigate("/sat/test", { state: { testId: t.id } }),
      kind: "builtin",
    })),
    ...openSessions.map((s) => ({
      key: `session:${s.id}`,
      lockKey: `session:${s.id}`,
      title: s.title,
      description: "Doimiy ochiq mashg'ulot",
      go: () => navigate(`/session/${s.id}/test`),
      kind: "open",
    })),
  ];

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHero
        eyebrow="MOCK TESTLAR"
        icon={LuListChecks}
        title="Qaysi testni topshirasiz?"
        subtitle="Har biri to'liq, moslashuvchan (adaptiv) Reading&Writing va Math bo'limlaridan iborat. Boshlagach vaqt hisobi yuritiladi."
        stats={[
          { icon: LuNotebookPen, value: papers.length, label: "test mavjud", iconClass: "bg-[#087fd1]/10 text-[#087fd1]" },
          { icon: LuGlobe, value: openSessions.length, label: "doimiy ochiq", iconClass: "bg-emerald-500/10 text-emerald-600" },
        ]}
      />

      <div className="grid gap-3">
        {papers.map((p) => {
          const locked = !!lockRemaining[p.lockKey];
          const available = !locked;
          const iconWrap =
            locked
              ? "bg-[#087fd1]/10 text-[#087fd1]"
              : p.kind === "open"
              ? "bg-[#087fd1]/10 text-[#087fd1]"
              : "bg-[#087fd1]/10 text-[#087fd1]";
          return (
            <button
              key={p.key}
              disabled={!available}
              onClick={() => available && p.go()}
              className={`group flex items-center gap-5 p-5 sm:p-6 rounded-[22px] border text-left transition-all duration-200
                ${
                  available
                    ? "bg-white border-[#12213D]/7 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(47,111,237,0.18)]"
                    : "bg-[#12213D]/[0.025] border-transparent opacity-70 cursor-not-allowed"
                }`}
            >
              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconWrap}`}>
                {locked ? (
                  <LuTimer size={24} />
                ) : p.kind === "open" ? (
                  <LuGlobe size={24} />
                ) : (
                  <LuNotebookPen size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-[#12213D] text-[17px] leading-tight truncate">
                    {p.title}
                  </h3>
                  {p.kind === "open" && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#087fd1] bg-[#087fd1]/10 px-2 py-0.5 rounded-full">
                      Ochiq
                    </span>
                  )}
                </div>
                <p className="text-[#12213D]/50 text-sm mt-1">
                  {locked
                    ? `Testdan chiqdingiz — ${formatRemaining(lockRemaining[p.lockKey])} dan keyin davom ettirish mumkin`
                    : p.description}
                </p>
              </div>
              {available && (
                <div className="w-10 h-10 rounded-full bg-[#12213D]/[0.03] flex items-center justify-center text-[#12213D]/30 group-hover:bg-[#087fd1] group-hover:text-white transition-colors shrink-0">
                  <LuArrowRight size={18} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
