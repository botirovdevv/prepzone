import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { LuArrowLeft, LuUsers, LuListChecks, LuGauge, LuRoute, LuNotebookPen, LuTriangleAlert } from "react-icons/lu";
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  Badge,
  StatTile,
  EmptyState,
  ErrorState,
  PageLoader,
  SegmentedControl,
} from "../../components/ui";

// ------------------------------------------------------------------
// Tayyor (statik) test bo'yicha admin tahlili: urinishlar, ball taqsimoti
// va savollar tahlili (har savolni necha foiz to'g'ri yechgani). Savol
// belgilangan qiyinlikka (E/M/H) mos kelmasa — belgilanadi: IRT
// parametrlarini keyinchalik real ma'lumot bilan kalibrlash uchun asos.
// ------------------------------------------------------------------

const MODULES = [
  { value: "module1", label: "Module 1" },
  { value: "module2Easy", label: "M2 oson" },
  { value: "module2Hard", label: "M2 qiyin" },
];

const DIFF_LABEL = { E: "Oson", M: "O'rta", H: "Qiyin", easy: "Oson", medium: "O'rta", hard: "Qiyin" };
const FLAG_LABEL = { easier: "Belgidan oson", harder: "Belgidan qiyin" };

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const pct = (p) => (p == null ? "—" : `${Math.round(p * 100)}%`);

function Distribution({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="space-y-2 p-5 sm:p-6">
      {rows.map((r) => (
        <div key={r.from} className="flex items-center gap-3 text-[13px]">
          <span className="w-[86px] shrink-0 text-ink-2 tabular-nums">
            {r.from}–{r.to === 1599 ? 1600 : r.to + 1}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span className="w-8 shrink-0 text-right font-semibold text-ink tabular-nums">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

function QuestionTable({ questions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead>
          <tr className="border-y border-ink/[0.06] bg-canvas text-[11px] font-bold uppercase tracking-wide text-ink/45">
            <th className="w-12 px-5 py-2.5 sm:px-6">#</th>
            <th className="px-3 py-2.5">Savol</th>
            <th className="px-3 py-2.5">Mavzu</th>
            <th className="px-3 py-2.5">Belgi</th>
            <th className="px-3 py-2.5 text-right">Urinish</th>
            <th className="w-[160px] px-3 py-2.5">To'g'ri</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.06]">
          {questions.map((q) => (
            <tr key={q.id} className={q.flag ? "bg-warning/[0.04]" : undefined}>
              <td className="px-5 py-3 font-semibold text-ink-2 tabular-nums sm:px-6">{q.index}</td>
              <td className="max-w-[280px] px-3 py-3">
                <p className="truncate text-ink">{q.preview || q.id}</p>
                {q.flag && (
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-warning">
                    <LuTriangleAlert size={12} /> {FLAG_LABEL[q.flag]}
                  </p>
                )}
              </td>
              <td className="max-w-[180px] truncate px-3 py-3 text-ink-2">{q.skill || q.domain || "—"}</td>
              <td className="px-3 py-3">
                <Badge tone={/^h/i.test(q.difficulty) ? "red" : /^e/i.test(q.difficulty) ? "emerald" : "ink"}>
                  {DIFF_LABEL[q.difficulty] || q.difficulty || "—"}
                  {q.type === "spr" ? " · SPR" : ""}
                </Badge>
              </td>
              <td className="px-3 py-3 text-right text-ink-2 tabular-nums">{q.n}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{ width: `${q.pCorrect == null ? 0 : q.pCorrect * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold text-ink tabular-nums">{pct(q.pCorrect)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BuiltinTestStats() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [section, setSection] = useState("rw");
  const [module, setModule] = useState("module1");

  useEffect(() => {
    let cancelled = false;
    setError(false);
    api
      .get(`/admin/builtin-tests/${encodeURIComponent(id)}`)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const current = useMemo(
    () => data?.modules.find((m) => m.sectionId === section && m.module === module),
    [data, section, module]
  );

  if (error) {
    return (
      <Page>
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      </Page>
    );
  }
  if (!data) return <PageLoader />;

  const { summary } = data;
  const flagged = data.modules.reduce((n, m) => n + m.questions.filter((q) => q.flag).length, 0);
  const sections = summary.sections.map((s) => ({ value: s.id, label: s.id === "rw" ? "Reading & Writing" : "Math" }));

  return (
    <Page>
      <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
        <LuArrowLeft size={16} /> Mock testlar
      </Link>
      <PageHeader
        eyebrow="Tayyor test"
        icon={LuNotebookPen}
        title={data.title}
        subtitle={`${data.questions} savol · adaptiv · natijalar va savollar tahlili`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={LuListChecks} label="Urinishlar" value={summary.attempts} hint={`${summary.complete} ta to'liq`} />
        <StatTile icon={LuUsers} label="Talabalar" value={summary.users} tone="emerald" />
        <StatTile
          icon={LuGauge}
          label="O'rtacha ball"
          value={summary.avgTotal ?? "—"}
          hint={summary.bestTotal ? `Eng yuqori ${summary.bestTotal}` : "To'liq natija yo'q"}
          tone="amber"
        />
        <StatTile
          icon={LuRoute}
          label="Qiyin yo'nalish"
          value={summary.sections.map((s) => pct(s.hardShare)).join(" / ")}
          hint={summary.sections.map((s) => `${s.id.toUpperCase()}${s.avg ? ` · o'rt. ${s.avg}` : ""}`).join("  ")}
          tone="ink"
        />
      </div>

      {summary.attempts === 0 ? (
        <EmptyState
          icon={LuListChecks}
          title="Hali hech kim topshirmagan"
          text="Talabalar testni topshirgach, natijalar va savollar tahlili shu yerda paydo bo'ladi."
        />
      ) : (
        <>
          <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
            <Card>
              <CardHeader title="Ball taqsimoti" subtitle="Faqat to'liq topshirilgan urinishlar" />
              <Distribution rows={data.distribution} />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader title="Oxirgi urinishlar" subtitle={`${Math.min(200, data.attempts.length)} ta ko'rsatilgan`} />
              <div className="mt-4 max-h-[420px] overflow-auto">
                <table className="w-full min-w-[560px] text-left text-[13px]">
                  <thead className="sticky top-0">
                    <tr className="border-y border-ink/[0.06] bg-canvas text-[11px] font-bold uppercase tracking-wide text-ink/45">
                      <th className="px-5 py-2.5 sm:px-6">Talaba</th>
                      <th className="px-3 py-2.5 text-right">Ball</th>
                      <th className="px-3 py-2.5 text-right">RW</th>
                      <th className="px-3 py-2.5 text-right">Math</th>
                      <th className="px-3 py-2.5">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.06]">
                    {data.attempts.map((a) => (
                      <tr key={a.id}>
                        <td className="max-w-[200px] px-5 py-3 sm:px-6">
                          <p className="truncate font-medium text-ink">{a.name}</p>
                          <p className="truncate text-[12px] text-ink-2">{a.email}</p>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <p className="font-semibold text-ink tabular-nums">{a.total}</p>
                          {a.terminated ? (
                            <Badge tone="red">To'xtatilgan</Badge>
                          ) : !a.complete ? (
                            <Badge tone="amber">Chala</Badge>
                          ) : a.totalLow != null ? (
                            <p className="text-[11px] text-ink-2 tabular-nums">
                              {a.totalLow}–{a.totalHigh}
                            </p>
                          ) : null}
                        </td>
                        {["rw", "math"].map((sid) => (
                          <td key={sid} className="px-3 py-3 text-right tabular-nums">
                            {a.sections[sid] ? (
                              <>
                                <p className="text-ink">{a.sections[sid].score}</p>
                                {a.sections[sid].route && (
                                  <p className="text-[11px] text-ink-2">{a.sections[sid].route === "hard" ? "qiyin" : "oson"}</p>
                                )}
                              </>
                            ) : (
                              <span className="text-ink-3">—</span>
                            )}
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-3 py-3 text-ink-2">{formatDate(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader
              title="Savollar tahlili"
              subtitle={
                flagged
                  ? `${flagged} ta savol belgilangan qiyinligiga mos kelmayapti (kamida 10 urinishda)`
                  : "Har savolni necha foiz talaba to'g'ri yechgani"
              }
            />
            <div className="flex flex-wrap gap-2 px-5 pb-4 pt-4 sm:px-6">
              <SegmentedControl options={sections} value={section} onChange={setSection} label="Bo'lim" />
              <SegmentedControl options={MODULES} value={module} onChange={setModule} label="Modul" />
            </div>
            {current && <QuestionTable questions={current.questions} />}
          </Card>
        </>
      )}
    </Page>
  );
}
