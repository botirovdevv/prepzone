import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuArrowUpRight,
  LuHeadphones,
  LuBookOpen,
  LuPenLine,
  LuTrendingUp,
  LuAward,
  LuClipboardCheck,
  LuLibrary,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import TestCountdown from "../../components/TestCountdown";
import { Page, PageHeader, Card, CardHeader, Button, IconTile, StatTile, ScoreTrend, Skeleton } from "../../components/ui";
import { fetchIeltsResults, MODE_LABELS, formatResultDate } from "../../utils/ieltsResults";
import { formatBand } from "../../utils/ieltsScoring";
import { IELTS_TESTS } from "../../data/ielts";

const HandIcon = "/waving-hand-icon.png";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Xayrli tun";
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  return "Xayrli kech";
}

const SECTION_LINKS = [
  { key: "listening", icon: LuHeadphones, title: "Listening", text: "4 part · 40 savol", tone: "red" },
  { key: "reading", icon: LuBookOpen, title: "Reading", text: "3 passage · 60 daq", tone: "blue" },
  { key: "writing", icon: LuPenLine, title: "Writing", text: "Task 1 + Task 2", tone: "emerald" },
];

export default function IeltsDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";
  const firstTest = IELTS_TESTS[0]?.id;

  useEffect(() => {
    if (!user) return;
    fetchIeltsResults(user.uid)
      .then(setResults)
      .catch(() => setResults([]));
  }, [user]);

  const loading = results === null;
  const latestOf = (key) => (results || []).find((r) => typeof r[key]?.band === "number")?.[key]?.band ?? null;
  const fulls = (results || []).filter((r) => r.mode === "full" && typeof r.overall === "number");
  const bestOverall = fulls.length ? Math.max(...fulls.map((r) => r.overall)) : null;
  const trend = fulls
    .slice(0, 10)
    .reverse()
    .map((r) => ({ value: r.overall, label: formatResultDate(r.createdAt) }));

  return (
    <Page>
      <PageHeader
        eyebrow={`${greeting()} · IELTS Academic`}
        title={
          <span className="flex items-center gap-3">
            Salom, {displayName}
            <img src={HandIcon} alt="" className="h-8 w-8 object-contain" />
          </span>
        }
        subtitle="IELTS on Computer formatidagi mock testlar bilan tayyorlaning va band'ingizni kuzating."
        actions={
          <Button to={`/ielts/test/${firstTest}?section=full`} size="lg">
            Full mock boshlash <LuArrowRight size={18} />
          </Button>
        }
      />

      <TestCountdown exam="ielts" />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={LuAward} label="Oxirgi overall" value={formatBand(fulls[0]?.overall)} hint={fulls[0] ? formatResultDate(fulls[0].createdAt) : "Hali full mock yo'q"} />
        <StatTile icon={LuTrendingUp} tone="amber" label="Eng yaxshi overall" value={formatBand(bestOverall)} hint="band 0–9" />
        <StatTile icon={LuClipboardCheck} tone="emerald" label="Urinishlar" value={results ? results.length : null} hint="full + bo'limlar" />
        <Card className="p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">Oxirgi bandlar</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              ["L", "listening"],
              ["R", "reading"],
              ["W", "writing"],
            ].map(([l, k]) => (
              <div key={k} className="rounded-lg bg-[#F6F7FB] py-1.5">
                <p className="text-[11px] font-bold text-[#12213D]/45">{l}</p>
                <p className="font-display text-[18px] font-extrabold tabular-nums text-[#12213D]">{formatBand(latestOf(k))}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Band dinamikasi"
              subtitle="Full mock testlar bo'yicha"
              action={
                <Link to="/ielts/history" className="flex items-center gap-1 text-sm font-semibold text-[#087fd1] hover:text-[#066fb8]">
                  Hammasi <LuArrowUpRight size={15} />
                </Link>
              }
            />
            <div className="px-3 pb-4 pt-3 sm:px-4">
              {loading ? (
                <Skeleton className="mx-2 h-36" />
              ) : trend.length > 0 ? (
                <ScoreTrend scores={trend} min={0} max={9} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="font-semibold text-[#12213D]/70">Hali ma'lumot yo'q</p>
                  <p className="mt-1 text-sm text-[#12213D]/45">Birinchi full mock testni yeching — grafik shu yerda paydo bo'ladi.</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Oxirgi natijalar" />
            <div className="mt-3 divide-y divide-[#12213D]/[0.06]">
              {loading ? (
                <div className="space-y-2 px-5 pb-5">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : results.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-[#12213D]/50">Hali birorta IELTS test topshirmagansiz.</p>
              ) : (
                results.slice(0, 4).map((r) => (
                  <Link
                    key={r.id}
                    to={`/ielts/results/${r.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#F6F7FB] sm:px-6"
                  >
                    <IconTile icon={LuLibrary} tone="ink" size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#12213D]">
                        {MODE_LABELS[r.mode]} · {r.testTitle}
                      </p>
                      <p className="text-xs text-[#12213D]/45">{formatResultDate(r.createdAt)}</p>
                    </div>
                    <p className="font-display text-lg font-extrabold tabular-nums text-[#12213D]">{formatBand(r.overall)}</p>
                    <LuArrowRight size={16} className="text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]" />
                  </Link>
                ))
              )}
            </div>
            <div className="h-2" />
          </Card>
        </div>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#12213D] p-6 text-white">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#e4002b]/30 blur-2xl" />
            <div className="relative">
              <span className="rounded bg-[#e4002b] px-2 py-0.5 font-display text-[13px] font-black">IELTS</span>
              <h2 className="mt-4 font-display text-lg font-bold">Real imtihon interfeysi</h2>
              <p className="mt-1 text-sm text-white/55">
                IELTS on Computer'dagidek: split-screen Reading, pastki navigator, highlight, Review belgisi va so'z sanagich.
              </p>
              <Button to="/ielts/tests" variant="light" className="mt-5 w-full">
                Barcha testlar <LuArrowRight size={17} />
              </Button>
            </div>
          </div>

          <Card className="p-2">
            <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-[#12213D]/40">Bo'lim bo'yicha mashq</p>
            {SECTION_LINKS.map((l) => (
              <Link
                key={l.key}
                to={`/ielts/test/${firstTest}?section=${l.key}`}
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
          </Card>
        </div>
      </section>
    </Page>
  );
}
