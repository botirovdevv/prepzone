import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { LuCheck, LuX, LuMinus, LuSearchX, LuChartColumn, LuRotateCcw, LuChevronDown } from "react-icons/lu";
import { db } from "../firebase/config";
import { satTest, getModuleQuestions } from "../data/satTest";
import { isAnswerCorrect } from "../utils/irtScoring";
import { sanitizeRichText } from "../utils/sanitizeHtml";
import { RW_DOMAINS } from "../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../data/mathDomains";
import { Page, PageHeader, Card, CardHeader, Button, Badge, EmptyState, PageLoader } from "../components/ui";
import { ScoreSummary, ModuleBreakdown } from "../components/ScoreSummary";

const DOMAIN_LABELS = Object.fromEntries([...RW_DOMAINS, ...MATH_DOMAINS].map((d) => [d.id, d.label]));

function Rich({ html, className }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html || "") }} />;
}

// Saqlangan javoblardan har bir modul savollarini natija bilan yig'adi.
// Eski natijalarda (javoblar saqlanmagan) bo'sh ro'yxat qaytadi.
function collectReviewItems(group, r) {
  const modules = [
    { stage: "module1", label: "Module 1", answers: r.module1Answers },
    { stage: "module2", label: "Module 2", answers: r.module2Answers },
  ];
  return modules
    .filter((m) => Array.isArray(m.answers))
    .map((m) => ({
      ...m,
      items: getModuleQuestions(group, m.stage, r.route).map((q, i) => ({
        q,
        number: i + 1,
        answer: m.answers[i] ?? null,
        correct: isAnswerCorrect(q, m.answers[i]),
      })),
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
  const { q, number, answer, correct } = item;
  const correctText = q.type === "spr" ? q.answers.join(" yoki ") : q.correctAnswer;
  return (
    <details className="group border border-gray-200 rounded-lg bg-white">
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
          Siz: <b className="text-gray-900">{answer || "—"}</b> · To&apos;g&apos;ri:{" "}
          <b className="text-emerald-700">{correctText}</b>
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1 text-[15px] leading-7 text-gray-900 border-t border-gray-100">
        {showPassage && q.passage && <Rich html={q.passage} className="sat-rich whitespace-pre-line mb-3" />}
        {!showPassage && q.passage && <Rich html={q.passage} className="sat-rich mb-3" />}
        <Rich html={q.prompt} className="sat-rich font-medium mb-3" />
        {q.image && <img src={q.image} alt="Savolga oid rasm" className="max-h-60 mb-3" />}
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
            <b className="text-gray-900">Tushuntirish: </b>
            {q.explanation}
          </p>
        )}
      </div>
    </details>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const terminated = location.state?.terminated;
  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results && !!id);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Agar sahifa /sat/results/:id orqali ochilgan bo'lsa (masalan,
    // "Mening natijalarim" ro'yxatidan), natijani Firestore'dan olib kelamiz.
    if (location.state?.results || !id) return;
    setLoading(true);
    getDoc(doc(db, "results", id))
      .then((snap) => {
        if (snap.exists()) {
          setResults(snap.data().results);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, location.state]);

  if (loading) return <PageLoader />;

  if (notFound || !results) {
    // Sahifa to'g'ridan-to'g'ri ochilgan bo'lsa (masalan, refresh qilingan)
    // natija ma'lumoti yo'q bo'ladi.
    return (
      <Page width="narrow">
        <EmptyState
          icon={LuSearchX}
          title="Natija topilmadi"
          text={notFound ? "Bu natija mavjud emas yoki o'chirilgan." : "Iltimos, testni qaytadan tugating."}
          action={
            <Button to={notFound ? "/sat/history" : "/sat/select"}>
              {notFound ? "Barcha natijalarim" : "Testga qaytish"}
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
        eyebrow="Test natijasi"
        icon={LuChartColumn}
        title={satTest.testTitle}
        subtitle="Bo'limlar bo'yicha ball, mavzular tahlili va har bir savolni ko'rib chiqish."
        actions={
          <Button onClick={() => navigate("/sat/select")}>
            <LuRotateCcw size={16} /> Qayta boshlash
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
          const reviewModules = collectReviewItems(g, r);
          const domains = domainStats(reviewModules);
          const moduleRows = [{ label: "Module 1", value: `${r.module1Correct}/${r.module1Total}` }];
          if (r.module2Total != null) {
            moduleRows.push({
              label: "Module 2",
              tag: <Badge tone={r.route === "hard" ? "red" : "emerald"}>{r.route === "hard" ? "Qiyin" : "Oson"}</Badge>,
              value: `${r.module2Correct}/${r.module2Total}`,
            });
          }
          moduleRows.push({ label: "Jami", value: `${totalCorrect}/${totalQ}` });

          return (
            <Card key={g.id}>
              <CardHeader
                title={g.title}
                subtitle={
                  r.route === "hard"
                    ? "Module 1'dagi yaxshi natija tufayli qiyin Module 2'ga yo'naltirildingiz — bu maksimal ball olish imkonini ochadi."
                    : "Module 1 natijasiga ko'ra oson Module 2'ga yo'naltirildingiz — bu holatda bo'lim bali taxminan 600 atrofida cheklanadi."
                }
                action={
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#087fd1]">{r.scaledScore}</span>
                }
              />
              <div className="space-y-6 p-5 sm:p-6">
                <ModuleBreakdown rows={moduleRows} />

                {domains.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-[#12213D]">Mavzular bo'yicha</p>
                    <div className="space-y-3">
                      {domains.map(([domainId, s]) => {
                        const pct = Math.round((s.correct / s.total) * 100);
                        return (
                          <div key={domainId} className="text-sm">
                            <div className="mb-1.5 flex justify-between text-[#12213D]/70">
                              <span>{DOMAIN_LABELS[domainId] || domainId}</span>
                              <span className="font-semibold tabular-nums text-[#12213D]">
                                {s.correct}/{s.total}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#12213D]/[0.06]">
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

                {reviewModules.map((m) => (
                  <details key={m.stage} className="group/review rounded-xl border border-[#12213D]/[0.07]">
                    <summary className="flex cursor-pointer select-none list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#12213D]">
                      {m.label} savollarini ko'rib chiqish
                      <LuChevronDown size={16} className="text-[#12213D]/40 transition group-open/review:rotate-180" />
                    </summary>
                    <div className="space-y-2 border-t border-[#12213D]/[0.06] p-3">
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

      <p className="mt-8 text-center text-xs leading-relaxed text-[#12213D]/40">
        Bal real Digital SAT kabi IRT (Item Response Theory) usulida hisoblanadi: qiyinroq savollarga
        to'g'ri javob ko'proq bal beradi. College Board rasmiy savol parametrlarini e'lon qilmagani
        uchun bal taxminiy va real imtihon natijasidan farq qilishi mumkin.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" to="/dashboard">
          Bosh sahifa
        </Button>
        <Button variant="outline" to="/sat/history">
          Barcha natijalarim
        </Button>
      </div>
    </Page>
  );
}
