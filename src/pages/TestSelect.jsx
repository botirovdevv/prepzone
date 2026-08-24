import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuNotebookPen, LuArrowRight, LuTimer, LuGlobe, LuListChecks, LuClock, LuLayers } from "react-icons/lu";
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

function sessionMeta(session) {
  const sections = session.sections || [];
  const totalMinutes = sections.reduce((sum, sec) => sum + (sec.durationMin || 0) * 2, 0);
  const totalQuestions = sections.reduce((sum, sec) => sum + (sec.module1?.length || 0) * 2, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeLabel = hours > 0 ? `${hours} soat${mins ? ` ${mins} daqiqa` : ""}` : `${mins} daqiqa`;
  return { totalMinutes, totalQuestions, timeLabel };
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
    ...openSessions.map((s) => {
      const meta = sessionMeta(s);
      return {
        key: `session:${s.id}`,
        lockKey: `session:${s.id}`,
        title: s.title,
        description:
          meta.totalQuestions > 0
            ? `${meta.totalQuestions} ta savol · ${meta.timeLabel}`
            : "Reading&Writing + Math",
        go: () => navigate(`/session/${s.id}/test`),
        kind: "open",
      };
    }),
  ];

  return (
    <div className="px-5 sm:px-8 py-8 max-w-5xl mx-auto">
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

      {papers.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-[24px] border border-dashed border-[#12213D]/12">
          <div className="w-14 h-14 rounded-2xl bg-[#12213D]/[0.04] flex items-center justify-center text-[#12213D]/30 mb-4">
            <LuLayers size={26} />
          </div>
          <p className="font-semibold text-[#12213D]/70">Hozircha mock test mavjud emas</p>
          <p className="text-sm text-[#12213D]/40 mt-1 max-w-sm">
            Yangi to'liq mock testlar qo'shilishi bilan ular shu yerda paydo bo'ladi.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {papers.map((p) => {
            const locked = !!lockRemaining[p.lockKey];
            const available = !locked;
            return (
              <button
                key={p.key}
                disabled={!available}
                onClick={() => available && p.go()}
                className={`group relative flex flex-col text-left rounded-[24px] p-6 border transition-all duration-200 overflow-hidden
                  ${
                    available
                      ? "bg-white border-[#12213D]/7 hover:border-[#087fd1]/30 hover:shadow-[0_12px_32px_-12px_rgba(8,127,209,0.25)] hover:-translate-y-0.5"
                      : "bg-[#12213D]/[0.025] border-transparent opacity-70 cursor-not-allowed"
                  }`}
              >
                {/* Fon bezagi */}
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br from-[#087fd1]/10 to-transparent group-hover:scale-125 transition-transform duration-500" />

                <div className="relative flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      locked ? "bg-[#12213D]/8 text-[#12213D]/40" : "bg-[#087fd1]/10 text-[#087fd1]"
                    }`}
                  >
                    {locked ? (
                      <LuTimer size={22} />
                    ) : p.kind === "open" ? (
                      <LuGlobe size={22} />
                    ) : (
                      <LuNotebookPen size={22} />
                    )}
                  </div>
                  {p.kind === "open" && !locked && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      Ochiq
                    </span>
                  )}
                </div>

                <h3 className="relative font-display font-extrabold text-[#12213D] text-lg leading-tight mb-1.5">
                  {p.title}
                </h3>
                <p className="relative text-[#12213D]/45 text-sm flex items-center gap-1.5">
                  {locked && <LuClock size={13} className="shrink-0" />}
                  {locked
                    ? `${formatRemaining(lockRemaining[p.lockKey])} dan keyin davom ettirish mumkin`
                    : p.description}
                </p>

                {available && (
                  <div className="relative flex items-center gap-1.5 text-sm font-semibold text-[#087fd1] mt-5">
                    Boshlash
                    <LuArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
