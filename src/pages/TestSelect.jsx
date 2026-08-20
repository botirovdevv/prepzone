import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuFileText, LuLock, LuArrowRight, LuTimer, LuGlobe } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { testsCatalog } from "../data/testsCatalog";
import { loadLocalProgress, getCooldownRemainingMs } from "../utils/testProgress";

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TestSelect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // testId -> qolgan pauza vaqti (ms). 0/yo'q bo'lsa — bloklanmagan.
  const [lockRemaining, setLockRemaining] = useState({});
  const [openSessions, setOpenSessions] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  // Admin tashkil qilgan, doimiy ochiq (kodsiz) testlar. Faqat bitta "where"
  // ishlatamiz (accessType) — status bo'yicha mijoz tomonida filtrlaymiz,
  // shunda Firestore'da qo'shimcha composite index kerak bo'lmaydi.
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

  // Har bir test uchun "chiqish" pauzasi hali tugamaganmi, tekshiramiz
  // va sekundiga yangilab boramiz.
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-14 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#0F1C30]">
              Qaysi testni topshirmoqchisiz?
            </h1>
            <p className="text-sm text-[#0F1C30]/55 mt-1">
              Testni tanlang — u boshlangandan so'ng vaqt hisoblanadi.
            </p>
          </div>
          <Link to="/" className="text-sm text-[#0076FC] font-medium shrink-0">
            ← Bosh sahifa
          </Link>
        </div>

        <div className="space-y-3">
          {testsCatalog.map((t) => {
            const locked = !!lockRemaining[t.id];
            const available = t.status === "available" && !locked;
            return (
              <button
                key={t.id}
                disabled={!available}
                onClick={() => available && navigate("/sat/test", { state: { testId: t.id } })}
                className={`w-full flex items-center gap-4 text-left bg-white rounded-2xl p-5 border transition
                  ${
                    available
                      ? "border-[#0F1C30]/8 hover:border-[#0076FC]/40 hover:shadow-md cursor-pointer"
                      : "border-[#0F1C30]/6 opacity-60 cursor-not-allowed"
                  }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    available ? "bg-[#0076FC]/10 text-[#0076FC]" : "bg-[#0F1C30]/6 text-[#0F1C30]/35"
                  }`}
                >
                  {locked ? (
                    <LuTimer size={18} />
                  ) : available ? (
                    <LuFileText size={20} />
                  ) : (
                    <LuLock size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#0F1C30]">{t.title}</p>
                  <p className="text-sm text-[#0F1C30]/50 mt-0.5">
                    {locked
                      ? `Testdan chiqdingiz — ${formatRemaining(lockRemaining[t.id])} dan keyin davom ettirish mumkin`
                      : t.description}
                  </p>
                </div>
                {available && <LuArrowRight size={20} className="text-[#0F1C30]/30 shrink-0" />}
              </button>
            );
          })}
        </div>

        {openSessions.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0F1C30]/40 mb-3">
              Doimiy ochiq testlar
            </p>
            <div className="space-y-3">
              {openSessions.map((s) => {
                const lockKey = `session:${s.id}`;
                const locked = !!lockRemaining[lockKey];
                const available = !locked;
                return (
                  <button
                    key={s.id}
                    disabled={!available}
                    onClick={() => available && navigate(`/session/${s.id}/test`)}
                    className={`w-full flex items-center gap-4 text-left bg-white rounded-2xl p-5 border transition
                      ${
                        available
                          ? "border-[#0F1C30]/8 hover:border-[#0076FC]/40 hover:shadow-md cursor-pointer"
                          : "border-[#0F1C30]/6 opacity-60 cursor-not-allowed"
                      }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        available ? "bg-emerald-50 text-emerald-600" : "bg-[#0F1C30]/6 text-[#0F1C30]/35"
                      }`}
                    >
                      {locked ? <LuTimer size={18} /> : <LuGlobe size={19} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F1C30]">{s.title}</p>
                      <p className="text-sm text-[#0F1C30]/50 mt-0.5">
                        {locked
                          ? `Testdan chiqdingiz — ${formatRemaining(lockRemaining[lockKey])} dan keyin davom ettirish mumkin`
                          : "Har doim ochiq"}
                      </p>
                    </div>
                    {available && <LuArrowRight size={20} className="text-[#0F1C30]/30 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
