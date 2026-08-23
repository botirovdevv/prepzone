import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { LuCalendar, LuChevronRight, LuTrophy, LuClock, LuChartLine, LuGlobe } from "react-icons/lu";
import PageHero from "../components/PageHero";

export default function History() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    // Barcha natijalar (statik SAT testlar HAM admin qo'shgan sessiya
    // testlari) shu bitta ildiz "results" kolleksiyasida saqlanadi.
    // Sessiya orqali tugatilgan testlar uchun asosiy nusxa
    // "testSessions/{id}/results/{uid}" ostida saqlanadi, shu bilan birga
    // shu yerga ham (sessionId/sessionTitle maydonlari bilan) nusxalab
    // yoziladi — shunda tarix sahifasi oddiy, bitta so'rov bilan ishlayveradi.
    const unsub = onSnapshot(
      query(collection(db, "results"), where("uid", "==", user.uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tb - ta;
        });
        setAttempts(list);
        setFetching(false);
      },
      (err) => {
        console.error("[History] natijalarni yuklashda xatolik:", err);
        setError("Natijalarni yuklashda xatolik yuz berdi.");
        setFetching(false);
      }
    );
    return unsub;
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-[#12213D]/10 border-t-[#087fd1]" />
      </div>
    );
  }

  const bestScore = attempts.reduce((max, a) => Math.max(max, a.total || 0), 0);
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.total || 0), 0) / attempts.length)
    : 0;

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHero
        eyebrow="SHAXSIY STATISTIKA"
        icon={LuChartLine}
        title="Mening natijalarim"
        subtitle="Barcha topshirgan testlaringiz shu yerda — vaqt bo'yicha tartiblangan."
        stats={
          attempts.length > 0
            ? [
                { icon: LuTrophy, value: bestScore, label: "eng yaxshi", iconClass: "bg-amber-500/10 text-amber-600" },
                { icon: LuChartLine, value: avgScore, label: "o'rtacha", iconClass: "bg-[#087fd1]/10 text-[#087fd1]" },
              ]
            : undefined
        }
      />

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-100 p-4 rounded-2xl mb-4 text-sm">{error}</p>
      )}

      {attempts.length === 0 && !error ? (
        <div className="bg-white rounded-[24px] border border-[#12213D]/7 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mx-auto mb-5">
            <LuTrophy size={28} />
          </div>
          <p className="text-[#12213D]/55 font-medium mb-6">Hali birorta test topshirmagansiz.</p>
          <button
            onClick={() => navigate("/sat/select")}
            className="bg-[#087fd1] text-white px-7 py-3 rounded-full font-semibold hover:bg-[#066fb8] transition shadow-[0_10px_24px_-10px_rgba(47,111,237,0.6)]"
          >
            Testni boshlash
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {attempts.map((a) => {
            const date = a.createdAt?.toDate ? a.createdAt.toDate() : a.finishedAt?.toDate ? a.finishedAt.toDate() : null;
            const isBest = attempts.length > 1 && a.total === bestScore;
            const isSession = !!a.sessionId;
            const linkTo = isSession ? `/session/${a.sessionId}/results` : `/sat/results/${a.id}`;
            const label = isSession
              ? a.sessionTitle || "To'liq mock test (sessiya)"
              : "SAT Practice Test";
            return (
              <Link
                key={a.id}
                to={linkTo}
                className="group flex items-center gap-4 bg-white rounded-[20px] border border-[#12213D]/7 p-4 sm:p-5 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(8,127,209,0.18)] transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#087fd1]/10 flex items-center justify-center text-[#087fd1] shrink-0">
                  {isSession ? <LuGlobe size={20} /> : <LuCalendar size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-[#12213D] truncate">
                      {a.terminated ? `${label} (to'xtatildi)` : label}
                    </p>
                    {isBest && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <LuTrophy size={10} /> Rekord
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#12213D]/40 mt-1">
                    <LuClock size={12} />
                    {date
                      ? date.toLocaleString("uz-UZ", {
                          day: "2-digit",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Noma'lum"}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wide text-[#12213D]/35">Ball</p>
                    <p className="font-display text-2xl font-black text-[#12213D]">{a.total}</p>
                  </div>
                  <LuChevronRight
                    size={18}
                    className="text-[#12213D]/25 group-hover:text-[#087fd1] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
