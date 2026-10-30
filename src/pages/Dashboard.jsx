import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { getSatTestTitle } from "../data/testsCatalog";
import { toDate } from "../utils/dates";
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
import { Page, PageHeader, Card, CardHeader, Button, IconTile, StatTile, ScoreTrend, Skeleton, ErrorState } from "../components/ui";
import { useI18n } from "../i18n";

function greetingKey() {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "day";
  return "evening";
}

const QUICK_LINKS = [
  { to: "/sat/select", icon: LuNotebookPen, tone: "blue" },
  { to: "/practice", icon: LuLayers, tone: "emerald" },
  { to: "/sat/history", icon: LuHistory, tone: "ink" },
  { to: "/leaderboard", icon: LuTrophy, tone: "amber" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t, tr, fmtDate } = useI18n();
  const formatDate = (ts) => {
    const d = toDate(ts);
    return d ? fmtDate(d, { day: "2-digit", month: "short" }) : "—";
  };
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  // null — yuklanmoqda, [] — natija yo'q
  const [attempts, setAttempts] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [code, setCode] = useState("");

  const displayName = user?.displayName || user?.email?.split("@")[0] || t("nav.userFallback");

  useEffect(() => {
    if (!user) return;
    setLoadError(false);
    // Faqat oxirgi 12 ta natija (trend va ro'yxat uchun) + jami soni.
    api
      .get("/results?limit=12")
      .then(({ items }) => setAttempts(items))
      .catch(() => {
        setAttempts([]);
        setLoadError(true);
      });
    api
      .get("/results/count")
      .then(({ count }) => setTotalCount(count))
      .catch(() => setTotalCount(null));

    api
      .get("/leaderboard/me")
      .then((entry) => setBestScore(entry ? entry.bestScore : null))
      .catch(() => setBestScore(null));
  }, [user, reloadKey]);

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
        eyebrow={t(`dashboard.greet.${greetingKey()}`)}
        title={
          <span className="flex items-center gap-3">
            {t("dashboard.hello", { name: displayName })}
            <img src={HandIcon} alt="" className="h-8 w-8 object-contain" />
          </span>
        }
        subtitle={t("dashboard.subtitle")}
        actions={
          <Button to="/sat/select" size="lg">
            {t("dashboard.startMock")} <LuArrowRight size={18} />
          </Button>
        }
      />

      <TestCountdown />

      {loadError && (
        <ErrorState
          className="mb-6"
          onRetry={() => {
            setAttempts(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      {/* Statistika */}
      <section className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatTile icon={LuChartLine} label={t("dashboard.lastScore")} value={recent?.total} hint={recent ? formatDate(recent.createdAt) : t("dashboard.noTestYet")} />
        <StatTile icon={LuTrophy} tone="amber" label={t("dashboard.best")} value={best} hint={t("dashboard.scale")} />
        <StatTile icon={LuClipboardCheck} tone="emerald" label={t("dashboard.taken")} value={totalCount ?? (attempts ? attempts.length : null)} hint={t("dashboard.fullMocks")} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Chap ustun: dinamika + oxirgi natijalar */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title={t("dashboard.trendTitle")}
              subtitle={t("dashboard.trendSubtitle")}
              action={
                <Link to="/sat/history" className="flex items-center gap-1 text-sm font-semibold text-[#087fd1] hover:text-[#066fb8]">
                  {t("dashboard.all")} <LuArrowUpRight size={15} />
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
                  <p className="font-semibold text-[#12213D]/70">{t("dashboard.noData")}</p>
                  <p className="mt-1 text-sm text-[#12213D]/45">{t("dashboard.noDataHint")}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={t("dashboard.recent")} />
            <div className="mt-3 divide-y divide-[#12213D]/[0.06]">
              {loadingAttempts ? (
                <div className="space-y-2 px-5 pb-5">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : attempts.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-[#12213D]/50">{t("dashboard.noAttempts")}</p>
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
                        {a.terminated && <span className="font-normal text-red-500"> · {t("dashboard.stopped")}</span>}
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
              <h2 className="mt-4 font-display text-lg font-bold">{t("dashboard.codeTitle")}</h2>
              <p className="mt-1 text-sm text-white/55">{t("dashboard.codeText")}</p>
              <form onSubmit={handleJoin} className="mt-5 space-y-2.5">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="000000"
                  aria-label={t("dashboard.codeLabel")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 text-center font-mono text-xl font-black tracking-[0.4em] text-white outline-none transition placeholder:text-white/25 focus:border-[#087fd1] focus:bg-white/10"
                />
                <Button type="submit" className="w-full" disabled={code.length !== 6}>
                  {t("dashboard.continue")} <LuArrowRight size={17} />
                </Button>
              </form>
            </div>
          </div>

          <Card className="p-2">
            {QUICK_LINKS.map((link, i) => ({ ...link, ...tr("dashboard.quick")[i] })).map((l) => (
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
                  <p className="text-sm font-semibold text-[#12213D]">{t("dashboard.adminTitle")}</p>
                  <p className="text-xs text-[#12213D]/45">{t("dashboard.adminText")}</p>
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
