import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { satTest, getModuleQuestions } from "../data/satTest";
import { countCorrect } from "../utils/scoring";
import { buildResponses, decideRouteIrt, scoreSection } from "../utils/irtScoring";
import {
  saveLocalProgress,
  loadLocalProgress,
  clearLocalProgress,
  getCooldownRemainingMs,
} from "../utils/testProgress";
import { useProctoring } from "../hooks/useProctoring";
import { maybeUpdateLeaderboard } from "../utils/leaderboard";
import TestHeader from "../components/TestHeader";
import QuestionPanel from "../components/QuestionPanel";
import BottomNav from "../components/BottomNav";
import QuestionNav from "../components/QuestionNav";
import ModuleReview from "../components/ModuleReview";
import DesmosCalculator from "../components/DesmosCalculator";
import BreakScreen from "../components/BreakScreen";
import RulesGate from "../components/RulesGate";
import TestLockedScreen from "../components/TestLockedScreen";
import TestTerminatedScreen from "../components/TestTerminatedScreen";
import CheatWarningToast from "../components/CheatWarningToast";
import ExitTestModal from "../components/ExitTestModal";
import { HighlightsProvider } from "../context/HighlightsContext";
import { useAuth } from "../context/AuthContext";

const MAX_WARNINGS = 3;
const TEST_ID = satTest.id;

const emptyModuleState = (count) => ({
  answers: Array(count).fill(null),
  marked: Array(count).fill(false),
  crossedOut: Array(count).fill(null).map(() => []),
});

// Bitta bo'lim (R&W yoki Math) natijasini yangilaydi.
//  - Module 1 tugaganda: IRT bo'yicha Module 2 yo'nalishi tanlanadi.
//  - Module 2 tugaganda: ikkala modul javoblari bo'yicha IRT bali.
//  - `incomplete` (test majburan to'xtatilganda): shu paytgacha bo'lgan
//    javoblar bo'yicha taxminiy bal.
function buildGroupResult(group, prev, stage, route, answers, incomplete = false) {
  const m1Questions = group.module1.questions;

  if (stage === "module1") {
    const result = {
      module1Correct: countCorrect(m1Questions, answers),
      module1Total: m1Questions.length,
      module1Answers: answers,
      route: decideRouteIrt(m1Questions, answers),
    };
    if (!incomplete) return result;
    return {
      ...result,
      scaledScore: scoreSection(buildResponses(m1Questions, answers)),
      incomplete: true,
    };
  }

  const m2Questions = getModuleQuestions(group, "module2", route);
  const responses = [
    ...buildResponses(m1Questions, prev.module1Answers || []),
    ...buildResponses(m2Questions, answers),
  ];
  return {
    ...prev,
    module2Correct: countCorrect(m2Questions, answers),
    module2Total: m2Questions.length,
    module2Answers: answers,
    scaledScore: scoreSection(responses),
    ...(incomplete ? { incomplete: true } : {}),
  };
}

export default function SATTest() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const studentName = user?.displayName || user?.email?.split("@")[0] || "Student";

  // ------------------------------------------------------------
  // Test "bosqichi": null (aniqlanmoqda) | "locked" | "rules" |
  // "active" | "terminated"
  // ------------------------------------------------------------
  const [phase, setPhase] = useState(null);
  const [pausedAt, setPausedAt] = useState(null);
  const [resumeSnapshot, setResumeSnapshot] = useState(null);
  const [terminationReason, setTerminationReason] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exiting, setExiting] = useState(false);
  const terminatingRef = useRef(false);
  // Modul ikki marta topshirilmasligi uchun (tugma + taymer bir vaqtda).
  const finishingRef = useRef(false);

  // qaysi bo'lim (0 = Reading&Writing, 1 = Math)
  const [groupIndex, setGroupIndex] = useState(0);
  // "module1" | "module2"
  const [stage, setStage] = useState("module1");
  // module2 uchun tanlangan yo'nalish: "easy" | "hard" | null
  const [route, setRoute] = useState(null);
  // bo'limlar orasidagi 10 daqiqalik tanaffus ko'rsatilyaptimi
  const [onBreak, setOnBreak] = useState(false);
  // modul oxiridagi "Check Your Work" sahifasi ochiqmi
  const [reviewing, setReviewing] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const group = satTest.groups[groupIndex];
  const questions = getModuleQuestions(group, stage, route);
  const totalQuestions = questions.length;

  const [moduleState, setModuleState] = useState(() => emptyModuleState(totalQuestions));
  const [secondsLeft, setSecondsLeft] = useState(group.durationMin * 60);

  // natijalarni yig'ib boruvchi obyekt: { rw: {...}, math: {...} }
  const [results, setResults] = useState({});
  const [savingResult, setSavingResult] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  // ------------------------------------------------------------
  // Sahifa ochilganda: oldin saqlangan (pauza qilingan) progress
  // bormi tekshiramiz va shunga qarab bosqichni belgilaymiz.
  // ------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    const saved = loadLocalProgress(user.uid, TEST_ID);
    if (saved && saved.reason === "paused") {
      const remaining = getCooldownRemainingMs(saved.pausedAt);
      if (remaining > 0) {
        setPausedAt(saved.pausedAt);
        setPhase("locked");
        return;
      }
      setResumeSnapshot(saved.snapshot);
      setPhase("rules");
      return;
    }
    setPhase("rules");
  }, [user]);

  const handleUnlocked = () => {
    const saved = loadLocalProgress(user.uid, TEST_ID);
    if (saved && saved.reason === "paused") {
      setResumeSnapshot(saved.snapshot);
    }
    setPhase("rules");
  };

  // ------------------------------------------------------------
  // Proktoring (xavfsizlik nazorati)
  // ------------------------------------------------------------
  const handleForceTerminate = (reasonCode) => {
    if (phase !== "active" || terminatingRef.current) return;
    terminatingRef.current = true;
    setTerminationReason(reasonCode);
    setPhase("terminated");
    const finalResults = {
      ...results,
      [group.id]: buildGroupResult(group, results[group.id] || {}, stage, route, moduleState.answers, true),
    };
    saveResultAndNavigate(finalResults, { terminated: true, reason: reasonCode });
  };

  const proctoring = useProctoring({
    active: phase === "active",
    onForceTerminate: handleForceTerminate,
    maxWarnings: MAX_WARNINGS,
  });

  // Yangi modulga o'tganda javoblar, taymer va joriy savol noldan boshlanadi.
  const startModule = (count, durationMin) => {
    setModuleState(emptyModuleState(count));
    setSecondsLeft(durationMin * 60);
    setCurrentIndex(0);
    setReviewing(false);
    setNavOpen(false);
    finishingRef.current = false;
  };

  // Taymer — tanaffus paytida to'xtab turadi.
  useEffect(() => {
    if (phase !== "active" || onBreak) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [groupIndex, stage, route, onBreak, phase]);

  const safeIndex = Math.min(currentIndex, totalQuestions - 1);
  const question = questions[safeIndex];

  const updateModule = (updater) => setModuleState((prev) => updater({ ...prev }));

  const handleSelectAnswer = (value) => {
    updateModule((s) => {
      const answers = [...s.answers];
      answers[safeIndex] = value;
      return { ...s, answers };
    });
  };

  const handleToggleMark = () => {
    updateModule((s) => {
      const marked = [...s.marked];
      marked[safeIndex] = !marked[safeIndex];
      return { ...s, marked };
    });
  };

  const handleToggleCrossOut = (label) => {
    updateModule((s) => {
      const crossedOut = s.crossedOut.map((arr) => [...arr]);
      const arr = crossedOut[safeIndex];
      const idx = arr.indexOf(label);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(label);
      return { ...s, crossedOut };
    });
  };

  const goTo = (i) => {
    setCurrentIndex(i);
    setNavOpen(false);
    setReviewing(false);
  };

  const handleNext = () => {
    if (safeIndex < totalQuestions - 1) goTo(safeIndex + 1);
  };
  const handlePrev = () => {
    if (safeIndex > 0) goTo(safeIndex - 1);
  };

  const openReview = () => {
    setNavOpen(false);
    setReviewing(true);
  };

  // Keyingi bo'limga o'tish (tanaffusdan keyin yoki darhol)
  const advanceToNextGroup = () => {
    const nextGroup = satTest.groups[groupIndex + 1];
    setOnBreak(false);
    setGroupIndex((i) => i + 1);
    setStage("module1");
    setRoute(null);
    setCalcOpen(false);
    startModule(nextGroup.module1.questions.length, nextGroup.durationMin);
  };

  // Modulni yakunlash: marshrutlash, bal hisoblash yoki keyingi bo'lim.
  const handleFinishModule = () => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    const groupResult = buildGroupResult(group, results[group.id] || {}, stage, route, moduleState.answers);
    const nextResults = { ...results, [group.id]: groupResult };
    setResults(nextResults);

    if (stage === "module1") {
      // Module 1 natijasiga qarab Module 2 (oson/qiyin) tanlanadi
      setRoute(groupResult.route);
      setStage("module2");
      startModule(getModuleQuestions(group, "module2", groupResult.route).length, group.durationMin);
      return;
    }

    if (groupIndex < satTest.groups.length - 1) {
      // Reading&Writing tugagach — 10 daqiqalik tanaffus
      if (group.type === "rw") setOnBreak(true);
      else advanceToNextGroup();
      return;
    }
    // barcha bo'limlar tugadi -> saqlab, natijalar sahifasiga o'tamiz
    saveResultAndNavigate(nextResults);
  };

  // Vaqt tugasa, Bluebook'dagi kabi modul avtomatik topshiriladi.
  useEffect(() => {
    if (phase === "active" && !onBreak && !savingResult && secondsLeft === 0) {
      handleFinishModule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const saveResultAndNavigate = async (finalResults, extraState = {}) => {
    // Test tugadi (yakunlandi yoki chetlatildi) — fullscreen'dan chiqamiz
    // va saqlangan pauza holatini tozalaymiz.
    await proctoring.exitFullscreenIntentionally();
    if (user) clearLocalProgress(user.uid, TEST_ID);

    const total = satTest.groups.reduce(
      (sum, g) => sum + (finalResults[g.id]?.scaledScore || 0),
      0
    );
    setSavingResult(true);
    try {
      const docRef = await addDoc(collection(db, "results"), {
        uid: user.uid,
        email: user.email,
        testId: TEST_ID,
        results: finalResults,
        total,
        createdAt: serverTimestamp(),
        ...(extraState.terminated
          ? { terminated: true, terminationReason: extraState.reason }
          : {}),
      });
      maybeUpdateLeaderboard(user, total);
      navigate("/sat/results", {
        state: { results: finalResults, resultId: docRef.id, ...extraState },
      });
    } catch (err) {
      // Firestore'ga saqlanmasa ham, natijani ko'rsatishda davom etamiz
      console.error("Natijani saqlashda xatolik:", err);
      navigate("/sat/results", {
        state: { results: finalResults, saveError: true, ...extraState },
      });
    } finally {
      setSavingResult(false);
    }
  };

  // ------------------------------------------------------------
  // Testni boshlash / davom ettirish (RulesGate tugmasi bosilganda)
  // ------------------------------------------------------------
  const handleStart = async () => {
    const ok = await proctoring.requestFullscreen();
    if (!ok) return false;

    if (resumeSnapshot) {
      const g = satTest.groups[resumeSnapshot.groupIndex ?? 0];
      const st = resumeSnapshot.stage ?? "module1";
      const count = getModuleQuestions(g, st, resumeSnapshot.route ?? null).length;
      setGroupIndex(resumeSnapshot.groupIndex ?? 0);
      setStage(st);
      setRoute(resumeSnapshot.route ?? null);
      setModuleState(resumeSnapshot.moduleState || emptyModuleState(count));
      setSecondsLeft(resumeSnapshot.secondsLeft ?? g.durationMin * 60);
      setCurrentIndex(resumeSnapshot.currentIndex ?? 0);
      setResults(resumeSnapshot.results || {});
      setOnBreak(!!resumeSnapshot.onBreak);
    }
    setPhase("active");
    return true;
  };

  // ------------------------------------------------------------
  // "Chiqish" tugmasi — hozirgi holat saqlanadi, 30 daqiqalik
  // pauza boshlanadi.
  // ------------------------------------------------------------
  const handleExitConfirm = async () => {
    setExiting(true);
    saveLocalProgress(
      user.uid,
      TEST_ID,
      { groupIndex, stage, route, moduleState, secondsLeft, currentIndex: safeIndex, results, onBreak },
      "paused"
    );
    await proctoring.exitFullscreenIntentionally();
    navigate("/sat/select");
  };

  const sectionLabel = `Section ${group.sectionNumber}, Module ${stage === "module1" ? "1" : "2"}`;
  const showPassage = group.type === "rw";

  if (loading || !user || phase === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (phase === "locked") {
    return <TestLockedScreen pausedAt={pausedAt} onUnlocked={handleUnlocked} />;
  }

  if (phase === "rules") {
    return <RulesGate onStart={handleStart} isResume={!!resumeSnapshot} />;
  }

  if (phase === "terminated") {
    return <TestTerminatedScreen reason={terminationReason} />;
  }

  if (savingResult) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Natijalar saqlanmoqda...
      </div>
    );
  }

  if (onBreak) {
    return <BreakScreen onContinue={advanceToNextGroup} />;
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Modul yuklanmoqda...
      </div>
    );
  }

  return (
    <HighlightsProvider>
    <div className="h-screen flex flex-col bg-white">
      <TestHeader
        sectionLabel={sectionLabel}
        title={group.title}
        secondsLeft={secondsLeft}
        showCalcButton={group.type === "math"}
        onToggleCalculator={() => setCalcOpen((c) => !c)}
        onExit={() => setShowExitModal(true)}
      />

      {reviewing ? (
        <ModuleReview
          sectionTitle={`${sectionLabel}: ${group.title}`}
          questions={questions}
          answers={moduleState.answers}
          marked={moduleState.marked}
          currentIndex={safeIndex}
          studentName={studentName}
          onSelect={goTo}
          onBack={() => setReviewing(false)}
          onSubmit={handleFinishModule}
        />
      ) : (
        <>
          <QuestionPanel
            question={question}
            index={safeIndex}
            selected={moduleState.answers[safeIndex]}
            marked={moduleState.marked[safeIndex]}
            crossedOut={moduleState.crossedOut[safeIndex]}
            onSelectAnswer={handleSelectAnswer}
            onToggleMark={handleToggleMark}
            onToggleCrossOut={handleToggleCrossOut}
            showPassage={showPassage}
          />

          <div className="h-20" />

          <BottomNav
            total={totalQuestions}
            currentIndex={safeIndex}
            answers={moduleState.answers}
            marked={moduleState.marked}
            studentName={studentName}
            onOpenNav={() => setNavOpen(true)}
            onPrev={handlePrev}
            onNext={handleNext}
            isLastQuestion={safeIndex === totalQuestions - 1}
            onFinishModule={openReview}
            finishLabel="Next"
          />
        </>
      )}

      {navOpen && (
        <QuestionNav
          questions={questions}
          currentIndex={safeIndex}
          answers={moduleState.answers}
          marked={moduleState.marked}
          sectionTitle={`${sectionLabel}: ${group.title}`}
          onSelect={goTo}
          onClose={() => setNavOpen(false)}
          onGoToReview={openReview}
        />
      )}

      {calcOpen && <DesmosCalculator onClose={() => setCalcOpen(false)} />}

      <CheatWarningToast warning={proctoring.warning} maxWarnings={MAX_WARNINGS} />

      {showExitModal && (
        <ExitTestModal
          confirming={exiting}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExitConfirm}
        />
      )}
    </div>
    </HighlightsProvider>
  );
}
