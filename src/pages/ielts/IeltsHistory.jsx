import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuTrendingUp, LuArrowRight, LuFileText } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { Page, PageHeader, Card, CardHeader, Badge, Button, Skeleton, EmptyState, ScoreTrend, StatTile } from "../../components/ui";
import { fetchIeltsResults, MODE_LABELS, formatResultDate } from "../../utils/ieltsResults";
import { formatBand } from "../../utils/ieltsScoring";

export default function IeltsHistory() {
  const { user } = useAuth();
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchIeltsResults(user.uid)
      .then(setResults)
      .catch((err) => {
        console.error(err);
        setResults([]);
      });
  }, [user]);

  const loading = results === null;
  const full = (results || []).filter((r) => r.mode === "full" && typeof r.overall === "number");
  const best = (key) => {
    const vals = (results || []).map((r) => (key === "overall" ? (r.mode === "full" ? r.overall : null) : r[key]?.band)).filter((v) => typeof v === "number");
    return vals.length ? Math.max(...vals) : null;
  };
  const trend = full
    .slice(0, 10)
    .reverse()
    .map((r) => ({ value: r.overall, label: formatResultDate(r.createdAt) }));

  return (
    <Page>
      <PageHeader
        eyebrow="IELTS Academic"
        icon={LuTrendingUp}
        title="Band scores"
        subtitle="Barcha IELTS urinishlaringiz va band dinamikasi."
        actions={<Button to="/ielts/tests">Yangi test</Button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Eng yaxshi overall" value={formatBand(best("overall"))} hint="full mock bo'yicha" />
        <StatTile label="Listening (eng yaxshi)" tone="red" value={formatBand(best("listening"))} />
        <StatTile label="Reading (eng yaxshi)" value={formatBand(best("reading"))} />
        <StatTile label="Writing (eng yaxshi)" tone="emerald" value={formatBand(best("writing"))} />
      </div>

      {trend.length > 1 && (
        <Card className="mb-6">
          <CardHeader title="Overall band dinamikasi" subtitle="Oxirgi full mock testlar" />
          <div className="px-3 pb-4 pt-3 sm:px-4">
            <ScoreTrend scores={trend} min={0} max={9} />
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[72px]" />
          <Skeleton className="h-[72px]" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={LuFileText}
          title="Hali IELTS test yechmagansiz"
          text="Birinchi mock testni yeching — natijalar shu yerda paydo bo'ladi."
          action={<Button to="/ielts/tests">Testni boshlash</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[#12213D]/[0.06]">
            {results.map((r) => (
              <Link
                key={r.id}
                to={`/ielts/results/${r.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F7FB] sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#12213D]">
                    {r.testTitle || "IELTS Mock"}
                    {r.terminated && <span className="font-normal text-red-500"> · to'xtatilgan</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-[#12213D]/45">{formatResultDate(r.createdAt, true)}</p>
                </div>
                <Badge tone={r.mode === "full" ? "blue" : "ink"} className="hidden sm:inline-flex">
                  {MODE_LABELS[r.mode]}
                </Badge>
                <div className="hidden items-center gap-3 text-xs text-[#12213D]/50 md:flex">
                  {["listening", "reading", "writing"].map((s) =>
                    r[s] ? (
                      <span key={s}>
                        {s[0].toUpperCase()} <b className="text-[#12213D]">{formatBand(r[s].band)}</b>
                      </span>
                    ) : null
                  )}
                </div>
                <p className="w-12 text-right font-display text-lg font-extrabold tabular-nums text-[#12213D]">{formatBand(r.overall)}</p>
                <LuArrowRight size={16} className="text-[#12213D]/25 transition group-hover:text-[#087fd1]" />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </Page>
  );
}
