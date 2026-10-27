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

function resultDate(a) {
  return toDate(a.createdAt) || toDate(a.finishedAt);
}

const PAGE_SIZE = 20;

export default function History() {
  const { user, loading } = useAuth();
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
        if (!cancelled) setError("Natijalarni yuklashda xatolik yuz berdi.");
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
      setError("Qolgan natijalarni yuklab bo'lmadi.");
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
      label: resultDate(a)?.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" }) || "",
    }));

  return (
    <Page>
      <PageHeader
        eyebrow="Shaxsiy statistika"
        icon={LuChartLine}
        title="Mening natijalarim"
        subtitle="Barcha topshirgan testlaringiz shu yerda — vaqt bo'yicha tartiblangan."
        actions={
          <Button to="/sat/select" variant="outline">
            Yangi test <LuArrowRight size={16} />
          </Button>
        }
      />

      {error && (
        <p className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</p>
      )}

      {attempts.length === 0 && !error ? (
        <EmptyState
          icon={LuTrophy}
          title="Hali birorta test topshirmagansiz"
          text="Birinchi mock testni yeching — natijalaringiz va ball dinamikasi shu yerda ko'rinadi."
          action={<Button to="/sat/select">Testni boshlash</Button>}
        />
      ) : (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatTile icon={LuTrophy} tone="amber" label="Eng yaxshi" value={bestScore} />
            <StatTile icon={LuChartLine} label="O'rtacha" value={avgScore} />
            <StatTile icon={LuClipboardCheck} tone="emerald" label="Urinishlar" value={totalCount ?? attempts.length} />
          </section>

          {trend.length > 1 && (
            <Card className="mb-6">
              <CardHeader title="Ball dinamikasi" subtitle="Oxirgi 12 ta urinish" />
              <div className="px-3 pb-4 pt-3 sm:px-4">
                <ScoreTrend scores={trend} />
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader title="Barcha urinishlar" subtitle={`${totalCount ?? attempts.length} ta natija`} />
            <div className="mt-4 divide-y divide-[#12213D]/[0.06] border-t border-[#12213D]/[0.06]">
              {attempts.map((a) => {
                const date = resultDate(a);
                const isBest = attempts.length > 1 && a.total === bestScore;
                const isSession = !!a.sessionId;
                const linkTo = isSession ? `/session/${a.sessionId}/results` : `/sat/results/${a.id}`;
                const label = isSession ? a.sessionTitle || "To'liq mock test (sessiya)" : getSatTestTitle(a.testId);
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
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F7FB] sm:px-6"
                  >
                    <IconTile icon={isSession ? LuGlobe : LuCalendar} tone="ink" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-[#12213D]">{label}</p>
                        {isBest && (
                          <Badge tone="amber" icon={LuTrophy}>
                            Rekord
                          </Badge>
                        )}
                        {a.terminated && <Badge tone="red">To'xtatilgan</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-[#12213D]/45">
                        {date
                          ? date.toLocaleString("uz-UZ", {
                              day: "2-digit",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Noma'lum sana"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-extrabold tabular-nums text-[#12213D]">{a.total}</p>
                      <p className="text-[11px] font-medium text-[#12213D]/40">/ 1600</p>
                    </div>
                    <LuChevronRight
                      size={18}
                      className="text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]"
                    />
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <div className="border-t border-[#12213D]/[0.06] p-4 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "Yuklanmoqda..." : "Ko'proq ko'rsatish"}
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}
