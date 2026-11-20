import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserResults, countUserResults } from "../utils/userResults";
import { useAuth } from "../context/AuthContext";
import { getSatTestTitle } from "../data/testsCatalog";
import { toDate } from "../utils/dates";
import {
  LuCalendar,
  LuChevronRight,
  LuTrophy,
  LuChartLine,
  LuGlobe,
  LuClipboardCheck,
  LuArrowRight,
} from "react-icons/lu";
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  Button,
  IconTile,
  StatTile,
  Badge,
  EmptyState,
  PageLoader,
  ScoreTrend,
} from "../components/ui";
import { useI18n } from "../i18n";

function resultDate(a) {
  return toDate(a.createdAt) || toDate(a.finishedAt);
}

const PAGE_SIZE = 20;

export default function History() {
  const { user, loading } = useAuth();
  const { t, fmtDate } = useI18n();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    // Barcha natijalar (statik SAT testlar HAM admin qo'shgan sessiya
    // testlari, sessionId/sessionTitle bilan) — server yangisini birinchi
    // qilib, 20 tadan sahifalab qaytaradi.
    let cancelled = false;
    fetchUserResults("results", user.uid, { pageSize: PAGE_SIZE })
      .then((page) => {
        if (cancelled) return;
        setAttempts(page.items);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      })
      .catch((err) => {
        console.error("[History] natijalarni yuklashda xatolik:", err);
        if (!cancelled) setError(t("history.loadError"));
      })
      .finally(() => !cancelled && setFetching(false));
    countUserResults("results", user.uid)
      .then((n) => !cancelled && setTotalCount(n))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await fetchUserResults("results", user.uid, { pageSize: PAGE_SIZE, after: cursor });
      setAttempts((prev) => [...prev, ...page.items]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (err) {
      console.error(err);
      setError(t("history.loadMoreError"));
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading || fetching) return <PageLoader />;

  const bestScore = attempts.reduce((max, a) => Math.max(max, a.total || 0), 0);
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.total || 0), 0) / attempts.length)
    : 0;
  const trend = attempts
    .slice(0, 12)
    .reverse()
    .map((a) => ({
      value: a.total || 0,
      label: fmtDate(resultDate(a), { day: "2-digit", month: "short" }),
    }));

  return (
    <Page>
      <PageHeader
        eyebrow={t("history.eyebrow")}
        icon={LuChartLine}
        title={t("history.title")}
        subtitle={t("history.subtitle")}
        actions={
          <Button to="/sat/select" variant="outline">
            {t("history.newTest")} <LuArrowRight size={16} />
          </Button>
        }
      />

      {error && (
        <p className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</p>
      )}

      {attempts.length === 0 && !error ? (
        <EmptyState
          icon={LuTrophy}
          title={t("history.emptyTitle")}
          text={t("history.emptyText")}
          action={<Button to="/sat/select">{t("history.startTest")}</Button>}
        />
      ) : (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatTile icon={LuTrophy} tone="amber" label={t("history.best")} value={bestScore} />
            <StatTile icon={LuChartLine} label={t("history.average")} value={avgScore} />
            <StatTile icon={LuClipboardCheck} tone="emerald" label={t("history.attempts")} value={totalCount ?? attempts.length} />
          </section>

          {trend.length > 1 && (
            <Card className="mb-6">
              <CardHeader title={t("history.trendTitle")} subtitle={t("history.trendSubtitle")} />
              <div className="px-3 pb-4 pt-3 sm:px-4">
                <ScoreTrend scores={trend} />
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader title={t("history.allTitle")} subtitle={t("history.resultsCount", { n: totalCount ?? attempts.length })} />
            <div className="mt-4 divide-y divide-ink/[0.06] border-t border-ink/[0.06]">
              {attempts.map((a) => {
                const date = resultDate(a);
                const isBest = attempts.length > 1 && a.total === bestScore;
                const isSession = !!a.sessionId;
                const linkTo = isSession ? `/session/${a.sessionId}/results` : `/sat/results/${a.id}`;
                const label = isSession ? a.sessionTitle || t("history.sessionFallback") : getSatTestTitle(a.testId);
                return (
                  <Link
                    key={a.id}
                    to={linkTo}
                    // Sessiya natijasining nusxasi shu yerda bor — admin testni
                    // o'chirib yuborgan bo'lsa ham natija ochilaveradi.
                    state={
                      isSession && a.results
                        ? { results: a.results, total: a.total, sessionTitle: a.sessionTitle, terminated: a.terminated }
                        : undefined
                    }
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-canvas sm:px-6"
                  >
                    <IconTile icon={isSession ? LuGlobe : LuCalendar} tone="ink" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-ink">{label}</p>
                        {isBest && (
                          <Badge tone="amber" icon={LuTrophy}>
                            {t("history.record")}
                          </Badge>
                        )}
                        {a.terminated && <Badge tone="red">{t("history.stopped")}</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink/45">
                        {date
                          ? fmtDate(date, { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })
                          : t("history.unknownDate")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-extrabold tabular-nums text-ink">{a.total}</p>
                      <p className="text-[11px] font-medium text-ink/40">/ 1600</p>
                    </div>
                    <LuChevronRight
                      size={18}
                      className="text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <div className="border-t border-ink/[0.06] p-4 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? t("history.loadingMore") : t("history.showMore")}
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}
