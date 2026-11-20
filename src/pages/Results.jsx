import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuCheck, LuX, LuMinus, LuSearchX, LuChartColumn, LuRotateCcw, LuChevronDown } from "react-icons/lu";
import { getModuleQuestions } from "../data/satTest";
import { useSatTest } from "../hooks/useTestContent";
import { isAnswerCorrect } from "../utils/irtScoring";
import { api } from "../api/client";
import { getSatTestTitle } from "../data/testsCatalog";
import { sanitizeRichText } from "../utils/sanitizeHtml";
import { RW_DOMAINS } from "../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../data/mathDomains";
import { Page, PageHeader, Card, CardHeader, Button, Badge, EmptyState, PageLoader } from "../components/ui";
import { ScoreSummary, ModuleBreakdown } from "../components/ScoreSummary";
import { useI18n } from "../i18n";
import AiExplain from "../components/learn/AiExplain";

const DOMAIN_LABELS = Object.fromEntries([...RW_DOMAINS, ...MATH_DOMAINS].map((d) => [d.id, d.label]));

function Rich({ html, className }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html || "") }} />;
}

// Saqlangan javoblardan har bir modul savollarini natija bilan yig'adi.
// `keys` — serverdan olingan to'g'ri javoblar ({ [questionId]: {...} }).
// Eski natijalarda (javoblar saqlanmagan) bo'sh ro'yxat qaytadi.
function collectReviewItems(group, r, keys) {
  const modules = [
    { stage: "module1", label: "Module 1", answers: r.module1Answers },
    { stage: "module2", label: "Module 2", answers: r.module2Answers },
  ];
  return modules
    .filter((m) => Array.isArray(m.answers))
    .map((m) => ({
      ...m,
      items: getModuleQuestions(group, m.stage, r.route).map((pub, i) => {
        const q = { ...pub, ...keys[pub.id] };
        return { q, number: i + 1, answer: m.answers[i] ?? null, correct: isAnswerCorrect(q, m.answers[i]) };
      }),
    }));
}

function domainStats(modules) {
  const stats = {};
  for (const m of modules) {
    for (const { q, correct } of m.items) {
      if (!stats[q.domain]) stats[q.domain] = { correct: 0, total: 0 };
      stats[q.domain].total += 1;
      if (correct) stats[q.domain].correct += 1;
    }
  }
  return Object.entries(stats);
}

function ReviewQuestion({ item, showPassage }) {
  const { t } = useI18n();
  const { q, number, answer, correct } = item;
  const correctText = q.type === "spr" ? (q.answers || []).join(t("results.or")) : q.correctAnswer;
  return (
    <details className="group border border-gray-200 rounded-lg bg-surface">
      <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none text-sm list-none">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            correct ? "bg-emerald-500 text-white" : answer ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          {correct ? <LuCheck size={14} /> : answer ? <LuX size={14} /> : <LuMinus size={14} />}
        </span>
        <span className="font-semibold text-gray-900 w-8">{number}</span>
        <span className="text-gray-500 truncate flex-1">{q.skill}</span>
        <span className="text-gray-600 shrink-0">
          {t("results.yours")} <b className="text-gray-900">{answer || "—"}</b> · {t("results.correct")}{" "}
          <b className="text-emerald-700">{correctText}</b>
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1 text-[15px] leading-7 text-gray-900 border-t border-gray-100">
        {showPassage && q.passage && <Rich html={q.passage} className="sat-rich whitespace-pre-line mb-3" />}
        {!showPassage && q.passage && <Rich html={q.passage} className="sat-rich mb-3" />}
        <Rich html={q.prompt} className="sat-rich font-medium mb-3" />
        {q.image && <img src={q.image} alt={t("results.figure")} className="max-h-60 mb-3" />}
        {q.choices && (
          <ul className="space-y-1.5 mb-3">
            {q.choices.map((c) => (
              <li
                key={c.label}
                className={`flex gap-2 rounded-md px-3 py-1.5 ${
                  c.label === q.correctAnswer
                    ? "bg-emerald-50 border border-emerald-300"
                    : c.label === answer
                    ? "bg-red-50 border border-red-300"
                    : "border border-transparent"
                }`}
              >
                <b>{c.label}.</b>
                <Rich html={c.text} className="sat-rich" />
              </li>
            ))}
          </ul>
        )}
        {q.explanation && (
          <p className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
            <b className="text-gray-900">{t("results.explanation")} </b>
            {q.explanation}
          </p>
        )}
        {!correct && <AiExplain question={q} userAnswer={answer} className="mt-3" />}
      </div>
    </details>
  );
}

const RETIRED_GROUPS = [
  { id: "rw", title: "Reading and Writing", type: "rw" },
  { id: "math", title: "Math", type: "math" },
];

// Olib tashlangan statik test uchun bo'limlar "qobig'i" (savollarsiz).
function retiredTest(testId) {
  const empty = { questions: [] };
  return {
    id: testId,
    testTitle: getSatTestTitle(testId),
    groups: RETIRED_GROUPS.map((g) => ({ ...g, module1: empty, module2Easy: empty, module2Hard: empty })),
  };
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();

  const terminated = location.state?.terminated;
  const [results, setResults] = useState(location.state?.results || null);
  const [testId, setTestId] = useState(location.state?.testId || null);
  const [loading, setLoading] = useState(!location.state?.results && !!id);
  const [notFound, setNotFound] = useState(false);
  const [keys, setKeys] = useState(null);
  const [keysError, setKeysError] = useState(false);
  // Eski natijalarda testId saqlanmagan — ular birinchi statik testniki edi.
  const loadedTest = useSatTest(testId || (results ? "bluebook-1" : ""));
  // Test saytdan olib tashlangan bo'lsa — ballar ko'rinadi, savollar yo'q.
  const retired = loadedTest === null && !!results;
  const satTest = retired ? retiredTest(testId) : loadedTest;

  useEffect(() => {
    // Agar sahifa /sat/results/:id orqali ochilgan bo'lsa (masalan,
    // "Mening natijalarim" ro'yxatidan), natijani serverdan olib kelamiz.
    if (location.state?.results || !id) return;
    setLoading(true);
    api
      .get(`/results/${id}`)
      .then((r) => {
        setResults(r.results);
        setTestId(r.testId || null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, location.state]);

  // To'g'ri javoblar faqat serverda — natija egasiga ko'rib chiqish uchun beriladi.
  const resultId = id || location.state?.resultId;
  useEffect(() => {
    if (!resultId || !results || retired) return;
    let cancelled = false;
    setKeysError(false);
    api
      .get(`/sat/review?id=${encodeURIComponent(resultId)}`)
      .then((d) => !cancelled && setKeys(d.keys))
      .catch((err) => {
        console.error("To'g'ri javoblarni yuklashda xatolik:", err);
        if (!cancelled) setKeysError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [resultId, results, retired]);

  // Noto'g'ri javoblar xatolar daftariga (server takroriy yuborishni e'tiborsiz qoldiradi).
  useEffect(() => {
    if (!keys || !resultId || !satTest || retired) return;
    const items = [];
    for (const g of satTest.groups) {
      const r = results?.[g.id];
      if (!r) continue;
      for (const m of collectReviewItems(g, r, keys)) {
        for (const { q, correct } of m.items) {
          if (correct) continue;
          items.push({ key: `${testId || "bluebook-1"}:${q.id}`, section: g.type, domain: q.domain || "", question: q });
        }
      }
    }
    if (items.length) api.post("/learn/mistakes/sync", { source: `mock:${resultId}`, items: items.slice(0, 150) }).catch(() => {});
  }, [keys, resultId, satTest, retired, results, testId]);

  if (loading || (results && satTest === undefined)) return <PageLoader />;

  if (notFound || !results || !satTest) {
    // Sahifa to'g'ridan-to'g'ri ochilgan bo'lsa (masalan, refresh qilingan)
    // natija ma'lumoti yo'q bo'ladi.
    return (
      <Page width="narrow">
        <EmptyState
          icon={LuSearchX}
          title={t("results.notFoundTitle")}
          text={notFound ? t("results.notFoundText") : t("results.finishAgain")}
          action={
            <Button to={notFound ? "/sat/history" : "/sat/select"}>
              {notFound ? t("results.allResults") : t("results.backToTest")}
            </Button>
          }
        />
      </Page>
    );
  }

  const groupResults = satTest.groups.map((g) => results[g.id]).filter(Boolean);
  const total = groupResults.reduce((sum, r) => sum + (r.scaledScore || 0), 0);

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={t("results.eyebrow")}
        icon={LuChartColumn}
        title={satTest.testTitle}
        subtitle={t("results.subtitle")}
        actions={
          <Button onClick={() => navigate("/sat/select")}>
            <LuRotateCcw size={16} /> {t("results.restart")}
          </Button>
        }
      />

      <ScoreSummary
        total={total}
        terminated={terminated}
        sections={satTest.groups
          .filter((g) => results[g.id])
          .map((g) => ({ id: g.id, title: g.title, score: results[g.id].scaledScore }))}
      />

      <div className="space-y-6">
        {satTest.groups.map((g) => {
          const r = results[g.id];
          if (!r) return null;
          const totalCorrect = (r.module1Correct || 0) + (r.module2Correct || 0);
          const totalQ = (r.module1Total || 0) + (r.module2Total || 0);
          const reviewModules = keys ? collectReviewItems(g, r, keys) : [];
          const domains = keys
            ? domainStats(reviewModules)
            : Object.entries(r.domains || {}).map(([d, [correct, t]]) => [d, { correct, total: t }]);
          const moduleRows = [{ label: "Module 1", value: `${r.module1Correct}/${r.module1Total}` }];
          if (r.module2Total != null) {
            moduleRows.push({
              label: "Module 2",
              tag: <Badge tone={r.route === "hard" ? "red" : "emerald"}>{r.route === "hard" ? t("results.hard") : t("results.easy")}</Badge>,
              value: `${r.module2Correct}/${r.module2Total}`,
            });
          }
          moduleRows.push({ label: t("results.total"), value: `${totalCorrect}/${totalQ}` });

          return (
            <Card key={g.id}>
              <CardHeader
                title={g.title}
                subtitle={
                  r.route === "hard" ? t("results.routedHard") : t("results.routedEasy")
                }
                action={
                  <span className="font-display text-3xl font-bold tabular-nums text-accent">{r.scaledScore}</span>
                }
              />
              <div className="space-y-6 p-5 sm:p-6">
                <ModuleBreakdown rows={moduleRows} />

                {domains.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-ink">{t("results.byTopic")}</p>
                    <div className="space-y-3">
                      {domains.map(([domainId, s]) => {
                        const pct = Math.round((s.correct / s.total) * 100);
                        return (
                          <div key={domainId} className="text-sm">
                            <div className="mb-1.5 flex justify-between text-ink/70">
                              <span>{DOMAIN_LABELS[domainId] || domainId}</span>
                              <span className="font-semibold tabular-nums text-ink">
                                {s.correct}/{s.total}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!keys && (
                  <p className="rounded-xl bg-canvas px-4 py-3 text-sm text-ink/55">
                    {retired ? t("results.retired") : keysError ? t("results.keysError") : t("results.keysLoading")}
                  </p>
                )}
                {reviewModules.map((m) => (
                  <details key={m.stage} className="group/review rounded-xl border border-ink/[0.07]">
                    <summary className="flex cursor-pointer select-none list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink">
                      {t("results.reviewModule", { module: m.label })}
                      <LuChevronDown size={16} className="text-ink/40 transition group-open/review:rotate-180" />
                    </summary>
                    <div className="space-y-2 border-t border-ink/[0.06] p-3">
                      {m.items.map((item) => (
                        <ReviewQuestion key={item.q.id} item={item} showPassage={g.type === "rw"} />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-ink/40">
        {t("results.irtNote")}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" to="/dashboard">
          {t("results.home")}
        </Button>
        <Button variant="outline" to="/sat/history">
          {t("results.allResults")}
        </Button>
      </div>
    </Page>
  );
}
