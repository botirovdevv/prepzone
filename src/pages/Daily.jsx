import { useEffect, useState } from "react";
import { LuFlame, LuSun } from "react-icons/lu";
import { api } from "../api/client";
import { Page, PageHeader, Card, Button, PageLoader, ErrorState } from "../components/ui";
import QuizCard from "../components/learn/QuizCard";
import AiExplain from "../components/learn/AiExplain";
import { useI18n } from "../i18n";

// Kun savollari: hamma uchun bir xil 5 ta savol (server: GET/POST /api/learn/daily).
export default function Daily() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState([null, null, null, null, null]);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const load = () => {
    setError("");
    api
      .get("/learn/daily")
      .then(setData)
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <Page width="narrow"><ErrorState text={error} onRetry={load} /></Page>;
  if (!data) return <PageLoader />;

  const submit = async () => {
    setSending(true);
    try {
      setResult(await api.post("/learn/daily", { answers }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const done = result || data.done;
  const questions = result?.questions || data.questions;

  return (
    <Page width="narrow">
      <PageHeader eyebrow={t("daily.eyebrow")} icon={LuSun} title={t("daily.title")} subtitle={t("daily.subtitle")} />

      {done && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex items-center gap-4 bg-[#12213D] p-6 text-white">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500">
              <LuFlame size={28} />
            </span>
            <div>
              <p className="text-lg font-bold">{t("daily.done")}</p>
              <p className="text-white/70">
                {result
                  ? t("daily.result", { correct: result.correct, xp: result.xp })
                  : t("daily.result", { correct: data.done.correct, xp: data.done.correct * 10 + 20 })}
                {result?.streak && ` · 🔥 ${result.streak.current} ${t("streak.days")}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm text-[#12213D]/60">
            <span>{t("daily.comeBack")} {t("daily.mistakesNote")}</span>
            <Button variant="outline" size="sm" to="/mistakes">
              {t("daily.toMistakes")}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => {
          const userAnswer = result ? answers[i] : null;
          return (
            <QuizCard
              key={q.id}
              question={q}
              number={i + 1}
              selected={done ? userAnswer : answers[i]}
              onSelect={(label) => setAnswers((a) => a.map((x, j) => (j === i ? label : x)))}
              reveal={!!done}
            >
              {done && (
                <div className="mt-4 space-y-3">
                  {q.explanation && <p className="rounded-xl bg-[#F6F7FB] p-3 text-sm text-[#12213D]/75">{q.explanation}</p>}
                  <AiExplain question={q} userAnswer={userAnswer} />
                </div>
              )}
            </QuizCard>
          );
        })}
      </div>

      {!done && (
        <div className="sticky bottom-4 mt-6 flex justify-end">
          <Button size="lg" onClick={submit} disabled={sending || answers.some((a) => !a)}>
            {answers.some((a) => !a) ? t("daily.answerAll") : t("daily.submit")}
          </Button>
        </div>
      )}
    </Page>
  );
}
