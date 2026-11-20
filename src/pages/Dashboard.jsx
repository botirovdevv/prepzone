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
  LuShieldCheck,
  LuTrophy,
  LuChartLine,
  LuClipboardCheck,
  LuClock,
} from "react-icons/lu";
import TestCountdown from "../components/TestCountdown";
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  Button,
  IconTile,
  StatTile,
  ScoreTrend,
  Skeleton,
  ErrorState,
  ListGroup,
  ListRow,
  SectionTitle,
} from "../components/ui";
import { useI18n } from "../i18n";
import { StreakDaily, Predictor, MistakesCard } from "../components/learn/GrowthWidgets";

function greetingKey() {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "day";
  return "evening";
}

const QUICK_LINKS = [
  { to: "/sat/select", icon: LuNotebookPen, tone: "blue" },
  { to: "/practice", icon: LuLayers, tone: "green" },
  { to: "/sat/history", icon: LuHistory, tone: "gray" },
  { to: "/leaderboard", icon: LuTrophy, tone: "orange" },
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
          <>
            {t("dashboard.hello", { name: displayName })}{" "}
            <img src={HandIcon} alt="" className="inline-block h-[0.9em] w-[0.9em] -translate-y-[0.08em] object-contain" />
          </>
        }
        subtitle={t("dashboard.subtitle")}
        actions={
          <Button to="/sat/select" size="lg">
            {t("dashboard.startMock")}
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
                <Link to="/sat/history" className="text-[15px] text-accent hover:underline">
                  {t("dashboard.all")}
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
                  <p className="text-[17px] font-semibold text-ink">{t("dashboard.noData")}</p>
                  <p className="mt-1 text-[15px] text-ink-2">{t("dashboard.noDataHint")}</p>
                </div>
              )}
            </div>
          </Card>

          <section>
            <SectionTitle
              action={
                <Link to="/sat/history" className="text-[13px] font-medium text-accent hover:underline">
                  {t("dashboard.all")}
                </Link>
              }
            >
              {t("dashboard.recent")}
            </SectionTitle>
            <ListGroup>
              {loadingAttempts ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                </div>
              ) : attempts.length === 0 ? (
                <p className="px-4 py-4 text-[15px] text-ink-2">{t("dashboard.noAttempts")}</p>
              ) : (
                attempts.slice(0, 4).map((a) => (
                  <ListRow
                    key={a.id}
                    to={a.sessionId ? `/session/${a.sessionId}/results` : `/sat/results/${a.id}`}
                    state={
                      a.sessionId && a.results
                        ? { results: a.results, total: a.total, sessionTitle: a.sessionTitle, terminated: a.terminated }
                        : undefined
                    }
                    icon={LuClock}
                    iconTone="gray"
                    title={a.sessionTitle || getSatTestTitle(a.testId)}
                    subtitle={
                      a.terminated ? `${formatDate(a.createdAt)} · ${t("dashboard.stopped")}` : formatDate(a.createdAt)
                    }
                    value={<span className="font-semibold text-ink">{a.total}</span>}
                  />
                ))
              )}
            </ListGroup>
          </section>
        </div>

        {/* O'ng ustun: streak, predictor, kod bilan kirish + tezkor havolalar */}
        <div className="space-y-6">
          <StreakDaily />
          <Predictor
            attempts={attempts}
            target={user?.onboarding?.targets?.sat ?? null}
          />
          <MistakesCard />
          <Card className="p-5 sm:p-6">
            <IconTile icon={LuKeyRound} tone="blue" />
            <h2 className="mt-4 font-display text-[20px] font-semibold leading-[25px] tracking-[-0.01em] text-ink">
              {t("dashboard.codeTitle")}
            </h2>
            <p className="mt-1 text-[15px] leading-[20px] text-ink-2">{t("dashboard.codeText")}</p>
            <form onSubmit={handleJoin} className="mt-5 space-y-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="000000"
                aria-label={t("dashboard.codeLabel")}
                className="h-12 w-full rounded-xl bg-fill px-4 text-center font-mono text-xl font-semibold tracking-[0.4em] text-ink outline-none transition placeholder:text-ink-3 focus:ring-4 focus:ring-accent/15"
              />
              <Button type="submit" className="w-full" disabled={code.length !== 6}>
                {t("dashboard.continue")}
              </Button>
            </form>
          </Card>

          <ListGroup>
            {QUICK_LINKS.map((link, i) => ({ ...link, ...tr("dashboard.quick")[i] })).map((l) => (
              <ListRow key={l.to} to={l.to} icon={l.icon} iconTone={l.tone} title={l.title} subtitle={l.text} />
            ))}
            {isAdmin && (
              <ListRow
                to="/admin"
                icon={LuShieldCheck}
                iconTone="gray"
                title={t("dashboard.adminTitle")}
                subtitle={t("dashboard.adminText")}
              />
            )}
          </ListGroup>
        </div>
      </section>
    </Page>
  );
}
