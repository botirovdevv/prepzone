import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LuNotebookPen, LuRotateCcw, LuTrash2, LuCircleCheck } from "react-icons/lu";
import { api } from "../api/client";
import { isAnswerCorrect } from "../utils/irtScoring";
import { RW_DOMAINS } from "../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../data/mathDomains";
import { Page, PageHeader, Card, Button, EmptyState, PageLoader, StatTile, Badge } from "../components/ui";
import QuizCard from "../components/learn/QuizCard";
import AiExplain from "../components/learn/AiExplain";
import { useI18n, formatDate } from "../i18n";

const DOMAIN_LABELS = Object.fromEntries([...RW_DOMAINS, ...MATH_DOMAINS].map((d) => [d.id, d.label]));

function Review({ items, onDone }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const item = items[i];

  if (!item) {
    return (
      <Card className="p-8 text-center">
        <LuCircleCheck size={44} className="mx-auto text-emerald-500" />
        <h2 className="mt-3 text-xl font-bold text-[#12213D]">{t("mistakes.sessionDone")}</h2>
        <p className="mt-1 text-[#12213D]/60">{t("mistakes.sessionStats", { correct: score, total: items.length })}</p>
        <Button className="mt-6" onClick={onDone}>
          {t("mistakes.backToList")}
        </Button>
      </Card>
    );
  }

  const q = item.question;
  const check = async () => {
    const ok = isAnswerCorrect(q, selected);
    setLastCorrect(ok);
    setRevealed(true);
    if (ok) setScore((s) => s + 1);
    api.post("/learn/mistakes/review", { key: item.key, correct: ok }).catch(() => {});
  };
  const next = () => {
    setI(i + 1);
    setSelected(null);
    setRevealed(false);
    setLastCorrect(null);
  };
  const answerText = q.type === "spr" ? (q.answers || []).join(" / ") : q.correctAnswer;

  return (
    <div className="space-y-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-[#12213D]/[0.06]">
        <div className="h-full rounded-full bg-[#087fd1] transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <QuizCard question={q} selected={selected} onSelect={setSelected} reveal={revealed} number={i + 1}>
        {revealed && (
          <div className="mt-4 space-y-3">
            <p className={`text-sm font-bold ${lastCorrect ? "text-emerald-600" : "text-red-600"}`}>
              {lastCorrect ? t("mistakes.correct") : t("mistakes.wrong", { answer: answerText })}
            </p>
            {q.explanation && <p className="rounded-xl bg-[#F6F7FB] p-3 text-sm text-[#12213D]/75">{q.explanation}</p>}
            <AiExplain question={q} userAnswer={selected} />
          </div>
        )}
      </QuizCard>
      <div className="flex justify-end">
        {revealed ? (
          <Button onClick={next}>{t("mistakes.next")}</Button>
        ) : (
          <Button onClick={check} disabled={!selected}>
            {t("mistakes.check")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Mistakes() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [reviewing, setReviewing] = useState(null);

  const load = () => api.get("/learn/mistakes").then(setData).catch(() => setData({ items: [], due: 0, open: 0, mastered: 0 }));
  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => (data?.items || []).filter((m) => !m.masteredAt && (filter === "all" || m.section === filter)),
    [data, filter]
  );

  if (!data) return <PageLoader />;

  const dueItems = data.items.filter((m) => !m.masteredAt && new Date(m.dueAt) <= new Date()).slice(0, 20);

  if (reviewing) {
    return (
      <Page width="narrow">
        <Review
          items={reviewing}
          onDone={() => {
            setReviewing(null);
            load();
          }}
        />
      </Page>
    );
  }

  const remove = async (key) => {
    await api.delete(`/learn/mistakes/${encodeURIComponent(key)}`).catch(() => {});
    load();
  };

  return (
    <Page>
      <PageHeader
        eyebrow={t("mistakes.eyebrow")}
        icon={LuNotebookPen}
        title={t("mistakes.title")}
        subtitle={t("mistakes.subtitle")}
        actions={
          <Button onClick={() => setReviewing(dueItems)} disabled={!dueItems.length}>
            <LuRotateCcw size={16} /> {dueItems.length ? t("mistakes.start", { n: dueItems.length }) : t("mistakes.nothingDue")}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label={t("mistakes.due")} value={data.due} tone="amber" />
        <StatTile label={t("mistakes.open")} value={data.open} tone="red" />
        <StatTile label={t("mistakes.mastered")} value={data.mastered} tone="emerald" />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={LuNotebookPen}
          title={t("mistakes.eyebrow")}
          text={t("mistakes.empty")}
          action={<Button to="/daily">{t("daily.cta")}</Button>}
        />
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            {[
              ["all", t("mistakes.all")],
              ["rw", t("mistakes.filterRw")],
              ["math", t("mistakes.filterMath")],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === id ? "bg-[#12213D] text-white" : "bg-white text-[#12213D]/60 border border-[#12213D]/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {visible.map((m) => (
              <Card key={m.key} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#12213D]">
                    {(m.question.prompt || "").replace(/<[^>]+>/g, " ").slice(0, 140)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#12213D]/50">
                    <Badge tone={m.section === "math" ? "blue" : "amber"}>{DOMAIN_LABELS[m.domain] || m.domain || m.section}</Badge>
                    <span>{t(`mistakes.sources.${m.source.split(":")[0] || "mock"}`)}</span>
                    <span>· {t("mistakes.wrongTimes", { n: m.wrongCount })}</span>
                    <span>· {t("mistakes.nextReview", { date: formatDate(m.dueAt, { day: "numeric", month: "short" }) })}</span>
                  </div>
                </div>
                <button
                  onClick={() => remove(m.key)}
                  title={t("mistakes.remove")}
                  aria-label={t("mistakes.remove")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#12213D]/35 hover:bg-red-50 hover:text-red-600"
                >
                  <LuTrash2 size={16} />
                </button>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[#12213D]/45">
            <Link to="/daily" className="font-semibold text-[#087fd1]">
              {t("daily.title")} →
            </Link>
          </p>
        </>
      )}
    </Page>
  );
}
