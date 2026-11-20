import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import TestHeader from "../components/TestHeader";
import QuestionPanel from "../components/QuestionPanel";
import BottomNav from "../components/BottomNav";
import QuestionNav from "../components/QuestionNav";
import DesmosCalculator from "../components/DesmosCalculator";
import { useAuth } from "../context/AuthContext";
import { analyzeTopics, buildTopicAdvice } from "../utils/topicAnalysis";
import { LuCircleCheck, LuTriangleAlert, LuSparkles, LuCircleAlert } from "react-icons/lu";
import { HighlightsProvider } from "../context/HighlightsContext";
import { PageLoader } from "../components/ui";
import TestStatusScreen from "../components/TestStatusScreen";
import { useI18n } from "../i18n";
import AiExplain from "../components/learn/AiExplain";
import { isAnswerCorrect } from "../utils/irtScoring";

export default function PracticeSet() {
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();

  const [set, setSet] = useState(null);
  const [setLoading, setSetLoading] = useState(true);
  const [setMissing, setSetMissing] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [crossedOut, setCrossedOut] = useState({});
  const [navOpen, setNavOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    // Rasmlar savollar ichida (siqilgan base64) — bitta so'rovda keladi.
    api
      .get(`/question-sets/${id}`)
      .then(setSet)
      .catch(() => setSetMissing(true))
      .finally(() => setSetLoading(false));
  }, [id]);

  // Barcha bo'limlardagi savollarni bitta uzluksiz ro'yxatga birlashtiramiz —
  // vaqt cheklanmagan ko'rib chiqish uchun modul/bo'lim ajratish shart emas.
  const questions = useMemo(() => {
    if (!set) return [];
    return (set.sections || []).flatMap((sec) =>
      (sec.questions || []).map((q) => ({
        ...q,
        _sectionTitle: sec.title,
        _sectionType: sec.type,
        _showPassage: sec.type === "rw",
      }))
    );
  }, [set]);

  const hasMath = (set?.sections || []).some((s) => s.type === "math");
  const total = questions.length;
  const safeIndex = Math.min(currentIndex, Math.max(total - 1, 0));
  const question = questions[safeIndex];

  const answersArray = questions.map((q) => answers[q.id] ?? null);
  const markedArray = questions.map((q) => !!marked[q.id]);

  const handleSelectAnswer = (label) => {
    setAnswers((prev) => ({ ...prev, [question.id]: label }));
  };
  const handleToggleMark = () => {
    setMarked((prev) => ({ ...prev, [question.id]: !prev[question.id] }));
  };
  const handleToggleCrossOut = (label) => {
    setCrossedOut((prev) => {
      const arr = prev[question.id] || [];
      const next = arr.includes(label) ? arr.filter((l) => l !== label) : [...arr, label];
      return { ...prev, [question.id]: next };
    });
  };

  const goTo = (i) => {
    setCurrentIndex(i);
    setNavOpen(false);
  };
  const handleNext = () => {
    if (safeIndex < total - 1) goTo(safeIndex + 1);
  };
  const handlePrev = () => {
    if (safeIndex > 0) goTo(safeIndex - 1);
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;

  const topicAnalysis = useMemo(() => analyzeTopics(questions, answers), [questions, answers]);
  // lang: maslahat matnlari tanlangan tilda qayta tuziladi.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const topicAdvice = useMemo(() => buildTopicAdvice(topicAnalysis), [topicAnalysis, lang]);

  // Yakunlanganda noto'g'ri javoblar xatolar daftariga.
  useEffect(() => {
    if (!showSummary || !set) return;
    const items = questions
      .filter((q) => answers[q.id] != null && !isAnswerCorrect(q, answers[q.id]))
      .map((q) => ({
        key: `set:${set.id}:${q.id}`,
        section: q._sectionType || "",
        domain: q.domain || "",
        question: Object.fromEntries(Object.entries(q).filter(([k]) => !k.startsWith("_"))),
      }));
    if (items.length) {
      const stamp = Object.keys(answers).length + ":" + items.map((i) => i.key).join(",").length;
      api.post("/learn/mistakes/sync", { source: `practice:${set.id}:${stamp}`, items: items.slice(0, 150) }).catch(() => {});
    }
  }, [showSummary, set, questions, answers]);

  if (loading || !user || setLoading) {
    return <PageLoader fullscreen />;
  }

  if (setMissing || !set) {
    return <TestStatusScreen title={t("practiceSet.notFound")} />;
  }

  if (total === 0) {
    return <TestStatusScreen title={t("practiceSet.empty")} />;
  }

  if (showSummary) {
    return (
      <div className="min-h-screen flex flex-col items-center px-6 py-12 bg-canvas">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <LuCircleCheck size={30} />
        </div>
        <h1 className="text-2xl font-extrabold text-ink mb-2 text-center">{set.title}</h1>
        <p className="text-ink/60 mb-8 text-center">
          {t("practiceSet.summary", { answered: answeredCount, total, correct: correctCount })}
        </p>

        {topicAnalysis.domainSummaries.length > 0 && (
          <div className="w-full max-w-xl bg-surface rounded-2xl border border-ink/8 p-5 mb-6 text-left">
            <h2 className="font-bold text-ink mb-4">{t("practiceSet.byTopic")}</h2>
            <div className="space-y-3">
              {topicAnalysis.domainSummaries.map((d) => {
                const pct = Math.round(d.accuracy * 100);
                const barColor =
                  d.accuracy >= 0.85 ? "bg-emerald-500" : d.accuracy >= 0.6 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={d.domainId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-ink/80">{d.label}</span>
                      <span className="text-ink/50">
                        {d.correct}/{d.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {topicAdvice.length > 0 && (
          <div className="w-full max-w-xl space-y-3 mb-8 text-left">
            {topicAdvice.map((a, i) => {
              const isWeak = a.type === "weak";
              const isStrong = a.type === "strong";
              const Icon = isWeak ? LuTriangleAlert : isStrong ? LuSparkles : LuCircleAlert;
              const styles = isWeak
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : isStrong
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-accent/5 border-accent/15 text-ink/70";
              return (
                <div key={i} className={`flex items-start gap-2.5 border rounded-xl p-4 text-sm ${styles}`}>
                  <Icon size={17} className="shrink-0 mt-0.5" />
                  <p>{a.text}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSummary(false);
              goTo(0);
            }}
            className="border border-ink/15 text-ink font-semibold px-5 py-2.5 rounded-full hover:bg-ink/5"
          >
            {t("practiceSet.reviewAgain")}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-accent text-white font-semibold px-5 py-2.5 rounded-full hover:bg-accent-press"
          >
            {t("practiceSet.home")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <HighlightsProvider>
    <div className="h-screen flex flex-col bg-surface">
      <TestHeader
        sectionLabel="Practice"
        title={`${set.title} — ${question._sectionTitle}`}
        sectionType={question._sectionType}
        hideTimer
        calcOpen={calcOpen}
        exitLabel="Exit"
        showCalcButton={hasMath}
        onToggleCalculator={() => setCalcOpen((c) => !c)}
        onExit={() => navigate("/dashboard")}
        practiceMode={false}
      />

      <QuestionPanel
        question={question}
        index={safeIndex}
        selected={answers[question.id] || null}
        marked={!!marked[question.id]}
        crossedOut={crossedOut[question.id] || []}
        onSelectAnswer={handleSelectAnswer}
        onToggleMark={handleToggleMark}
        onToggleCrossOut={handleToggleCrossOut}
        showPassage={question._showPassage}
        feedbackMode
      />
      {answers[question.id] && answers[question.id] !== question.correctAnswer && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <AiExplain key={question.id} question={question} userAnswer={answers[question.id]} />
        </div>
      )}

      <div className="h-16 shrink-0" />

      <BottomNav
        total={total}
        currentIndex={safeIndex}
        studentName={user?.displayName || user?.email?.split("@")[0]}
        navOpen={navOpen}
        onOpenNav={() => setNavOpen((o) => !o)}
        onPrev={handlePrev}
        onNext={handleNext}
        isLastQuestion={safeIndex === total - 1}
        onFinishModule={() => setShowSummary(true)}
        finishLabel="Finish"
      />

      {navOpen && (
        <QuestionNav
          questions={questions}
          currentIndex={safeIndex}
          answers={answersArray}
          marked={markedArray}
          sectionTitle={set.title}
          onSelect={goTo}
          onClose={() => setNavOpen(false)}
          onGoToReview={() => {
            setNavOpen(false);
            setShowSummary(true);
          }}
          reviewLabel="Finish and see results"
        />
      )}

      {calcOpen && <DesmosCalculator onClose={() => setCalcOpen(false)} />}
    </div>
    </HighlightsProvider>
  );
}
