import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { getSatTestTitle } from "../data/testsCatalog";
const HandIcon = "/waving-hand-icon.png";
import {
  LuNotebookPen,
  LuKeyRound,
  LuHistory,
  LuLayers,
  LuArrowRight,
  LuArrowUpRight,
  LuShieldCheck,
  LuTrophy,
  LuChartLine,
  LuClipboardCheck,
  LuClock,
} from "react-icons/lu";
import TestCountdown from "../components/TestCountdown";
import { Page, PageHeader, Card, CardHeader, Button, IconTile, StatTile, ScoreTrend, Skeleton } from "../components/ui";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Xayrli tun";
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  return "Xayrli kech";
}

function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  if (!d) return "—";
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
}

const QUICK_LINKS = [
  { to: "/sat/select", icon: LuNotebookPen, title: "Mock testlar", text: "To'liq adaptiv SAT", tone: "blue" },
  { to: "/practice", icon: LuLayers, title: "Amaliyot", text: "Vaqtsiz, darhol javob", tone: "emerald" },
  { to: "/sat/history", icon: LuHistory, title: "Natijalarim", text: "Barcha urinishlar", tone: "ink" },
  { to: "/leaderboard", icon: LuTrophy, title: "Reyting", text: "TOP-15 natija", tone: "amber" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  // null — yuklanmoqda, [] — natija yo'q
  const [attempts, setAttempts] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [code, setCode] = useState("");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "results"), where("uid", "==", user.uid)))
      .then((snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        all.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setAttempts(all);
      })
      .catch(() => setAttempts([]));

    getDoc(doc(db, "leaderboard", user.uid))
      .then((snap) => setBestScore(snap.exists() ? snap.data().bestScore : null))
      .catch(() => setBestScore(null));
  }, [user]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    navigate("/join", { state: { prefillCode: code.trim() } });
  };

  const loadingAttempts = attempts === null;
  const recent = attempts?.[0];
  const best = bestScore ?? (attempts?.length ? Math.max(...attempts.map((a) => a.total || 0)) : null);
  const trend = (attempts || [])
    .slice(0, 10)
    .reverse()
    .map((a) => ({ value: a.total || 0, label: formatDate(a.createdAt) }));

  return (
    <Page>
      <PageHeader
        eyebrow={greeting()}
        title={
          <span className="flex items-center gap-3">
            Salom, {displayName}
            <img src={HandIcon} alt="" className="h-8 w-8 object-contain" />
          </span>
        }
        subtitle="Bugun qayerdan davom etamiz? Mock test yechib, natijangizni kuzatib boring."
        actions={
          <Button to="/sat/select" size="lg">
            Mock testni boshlash <LuArrowRight size={18} />
          </Button>
        }
      />

      <TestCountdown exam="sat" />

      {/* Statistika */}
      <section className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatTile icon={LuChartLine} label="Oxirgi ball" value={recent?.total} hint={recent ? formatDate(recent.createdAt) : "Hali test yo'q"} />
        <StatTile icon={LuTrophy} tone="amber" label="Eng yaxshi" value={best} hint="400–1600 shkala" />
        <StatTile icon={LuClipboardCheck} tone="emerald" label="Topshirilgan" value={attempts ? attempts.length : null} hint="to'liq mock test" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Chap ustun: dinamika + oxirgi natijalar */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Ball dinamikasi"
              subtitle="Oxirgi 10 ta urinish"
              action={
                <Link to="/sat/history" className="flex items-center gap-1 text-sm font-semibold text-[#087fd1] hover:text-[#066fb8]">
                  Hammasi <LuArrowUpRight size={15} />
                </Link>
              }
            />
            <div className="px-3 pb-4 pt-3 sm:px-4">
              {loadingAttempts ? (
                <Skeleton className="h-36 mx-2" />
              ) : trend.length > 0 ? (
                <ScoreTrend scores={trend} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="font-semibold text-[#12213D]/70">Hali ma'lumot yo'q</p>
                  <p className="mt-1 text-sm text-[#12213D]/45">Birinchi mock testni yeching — grafik shu yerda paydo bo'ladi.</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Oxirgi natijalar" />
            <div className="mt-3 divide-y divide-[#12213D]/[0.06]">
              {loadingAttempts ? (
                <div className="space-y-2 px-5 pb-5">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : attempts.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-[#12213D]/50">Hali birorta test topshirmagansiz.</p>
              ) : (
                attempts.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    to={a.sessionId ? `/session/${a.sessionId}/results` : `/sat/results/${a.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#F6F7FB] sm:px-6"
                  >
                    <IconTile icon={LuClock} tone="ink" size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#12213D]">
                        {a.sessionTitle || getSatTestTitle(a.testId)}
                        {a.terminated && <span className="font-normal text-red-500"> · to'xtatilgan</span>}
                      </p>
                      <p className="text-xs text-[#12213D]/45">{formatDate(a.createdAt)}</p>
                    </div>
                    <p className="font-display text-lg font-extrabold tabular-nums text-[#12213D]">{a.total}</p>
                    <LuArrowRight size={16} className="text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]" />
                  </Link>
                ))
              )}
            </div>
            <div className="h-2" />
          </Card>
        </div>

        {/* O'ng ustun: kod bilan kirish + tezkor havolalar */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#12213D] p-6 text-white">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#087fd1]/25 blur-2xl" />
            <div className="relative">
              <IconTile icon={LuKeyRound} tone="solid" />
              <h2 className="mt-4 font-display text-lg font-bold">Kirish kodi bilan test</h2>
              <p className="mt-1 text-sm text-white/55">
                O'qituvchingiz bergan 6 xonali kodni kiriting.
              </p>
              <form onSubmit={handleJoin} className="mt-5 space-y-2.5">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="000000"
                  aria-label="Kirish kodi"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 text-center font-mono text-xl font-black tracking-[0.4em] text-white outline-none transition placeholder:text-white/25 focus:border-[#087fd1] focus:bg-white/10"
                />
                <Button type="submit" className="w-full" disabled={code.length !== 6}>
                  Davom etish <LuArrowRight size={17} />
                </Button>
              </form>
            </div>
          </div>

          <Card className="p-2">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group flex items-center gap-3.5 rounded-xl p-3 transition hover:bg-[#F6F7FB]"
              >
                <IconTile icon={l.icon} tone={l.tone} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#12213D]">{l.title}</p>
                  <p className="text-xs text-[#12213D]/45">{l.text}</p>
                </div>
                <LuArrowRight size={16} className="text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]" />
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="group mt-1 flex items-center gap-3.5 rounded-xl border-t border-[#12213D]/[0.06] p-3 transition hover:bg-[#F6F7FB]"
              >
                <IconTile icon={LuShieldCheck} tone="dark" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#12213D]">Admin panel</p>
                  <p className="text-xs text-[#12213D]/45">Testlar va to'plamlarni boshqarish</p>
                </div>
                <LuArrowRight size={16} className="text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]" />
              </Link>
            )}
          </Card>
        </div>
      </section>
    </Page>
  );
}
