import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import TestHeader from "../components/TestHeader";
import QuestionPanel from "../components/QuestionPanel";
import BottomNav from "../components/BottomNav";
import QuestionNav from "../components/QuestionNav";
import DesmosCalculator from "../components/DesmosCalculator";
import { useAuth } from "../context/AuthContext";
import { LuCircleCheck } from "react-icons/lu";

export default function PracticeSet() {
  const { user, loading } = useAuth();
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
    getDoc(doc(db, "questionSets", id))
      .then((snap) => {
        if (!snap.exists()) {
          setSetMissing(true);
          return;
        }
        setSet({ id: snap.id, ...snap.data() });
      })
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

  if (loading || !user || setLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (setMissing || !set) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Bu to'plam topilmadi.
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Bu to'plamda hali savol yo'q.
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#F7F9FC]">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <LuCircleCheck size={30} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F1C30] mb-2">{set.title}</h1>
        <p className="text-[#0F1C30]/60 mb-8">
          {answeredCount}/{total} savolga javob berdingiz — {correctCount} tasi to'g'ri
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSummary(false);
              goTo(0);
            }}
            className="border border-[#0F1C30]/15 text-[#0F1C30] font-semibold px-5 py-2.5 rounded-full hover:bg-[#0F1C30]/5"
          >
            Qayta ko'rib chiqish
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#0076FC] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-[#0062d1]"
          >
            Bosh sahifa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <TestHeader
        sectionLabel="Amaliyot"
        title={`${set.title} — ${question._sectionTitle}`}
        hideTimer
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

      <div className="h-20" />

      <BottomNav
        total={total}
        currentIndex={safeIndex}
        answers={answersArray}
        marked={markedArray}
        studentName={user?.displayName || user?.email?.split("@")[0]}
        onOpenNav={() => setNavOpen(true)}
        onPrev={handlePrev}
        onNext={handleNext}
        isLastQuestion={safeIndex === total - 1}
        onFinishModule={() => setShowSummary(true)}
        finishLabel="Yakunlash"
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
          onGoToReview={() => goTo(total - 1)}
        />
      )}

      {calcOpen && <DesmosCalculator onClose={() => setCalcOpen(false)} />}
    </div>
  );
}
