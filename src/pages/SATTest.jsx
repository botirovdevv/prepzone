import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { satTest } from "../data/satTest";
import { decideRoute, calcSectionScaledScore, countCorrect } from "../utils/scoring";
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
import DesmosCalculator from "../components/DesmosCalculator";
import BreakScreen from "../components/BreakScreen";
import RulesGate from "../components/RulesGate";
import TestLockedScreen from "../components/TestLockedScreen";
import TestTerminatedScreen from "../components/TestTerminatedScreen";
import CheatWarningToast from "../components/CheatWarningToast";
import ExitTestModal from "../components/ExitTestModal";
import { useAuth } from "../context/AuthContext";

const MAX_WARNINGS = 3;

const emptyModuleState = (count) => ({
  answers: Array(count).fill(null),
  marked: Array(count).fill(false),
  crossedOut: Array(count).fill(null).map(() => []),
});

export default function SATTest() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const testId = location.state?.testId || "test1";
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

  // qaysi bo'lim (0 = Reading&Writing, 1 = Math)
  const [groupIndex, setGroupIndex] = useState(0);
  // "module1" | "module2"
  const [stage, setStage] = useState("module1");
  // module2 uchun tanlangan yo'nalish: "easy" | "hard" | null (hali aniqlanmagan)
  const [route, setRoute] = useState(null);
  // bo'limlar orasidagi 10 daqiqalik tanaffus ko'rsatilyaptimi
  const [onBreak, setOnBreak] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const group = satTest.groups[groupIndex];
  const activeModule =
    stage === "module1"
      ? group.module1
      : route === "hard"
      ? group.module2Hard
      : group.module2Easy;
  const questions = activeModule.questions;
  const totalQuestions = questions.length;

  const [moduleState, setModuleState] = useState(() =>
    emptyModuleState(totalQuestions)
  );
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
    const saved = loadLocalProgress(user.uid, testId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, testId]);

  const handleUnlocked = () => {
    const saved = loadLocalProgress(user.uid, testId);
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
    const finalResults = buildTerminationResults();
    saveResultAndNavigate(finalResults, { terminated: true, reason: reasonCode });
  };

  const proctoring = useProctoring({
    active: phase === "active",
    onForceTerminate: handleForceTerminate,
    maxWarnings: MAX_WARNINGS,
  });

  // module o'zgarganda taймерni va javoblarni qayta o'rnatish
  // (agar resume snapshot bo'lsa, birinchi marta shu bilan boshlanadi)
  useEffect(() => {
    if (phase !== "active") return;
    setModuleState(emptyModuleState(totalQuestions));
    setSecondsLeft(group.durationMin * 60);
    setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, stage, route]);

  // tanaffus paytida taймер to'xtab turadi
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

  const handleSelectAnswer = (label) => {
    updateModule((s) => {
      const answers = [...s.answers];
      answers[safeIndex] = label;
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
  };

  const handleNext = () => {
    if (safeIndex < totalQuestions - 1) goTo(safeIndex + 1);
  };
  const handlePrev = () => {
    if (safeIndex > 0) goTo(safeIndex - 1);
  };

  // Keyingi bo'limga o'tish (tanaffusdan keyin yoki Math'dan keyin darhol)
  const advanceToNextGroup = () => {
    setOnBreak(false);
    setGroupIndex((i) => i + 1);
    setStage("module1");
    setRoute(null);
    setCurrentIndex(0);
    setCalcOpen(false);
  };

  // Modulni yakunlash: hisoblash, marshrutlash yoki keyingi bo'limga o'tish
  const handleFinishModule = () => {
    const rawCorrect = countCorrect(questions, moduleState.answers);

    if (stage === "module1") {
      // Module 1 tugadi -> Module 1 natijasiga qarab Module 2 (oson/qiyin) tanlanadi
      const chosenRoute = decideRoute(rawCorrect, totalQuestions);
      setResults((prev) => ({
        ...prev,
        [group.id]: {
          ...prev[group.id],
          module1Correct: rawCorrect,
          module1Total: totalQuestions,
          route: chosenRoute,
        },
      }));
      setRoute(chosenRoute);
      setStage("module2");
      setCurrentIndex(0);
      return;
    }

    // Module 2 tugadi -> shu bo'lim uchun yakuniy scaled score hisoblanadi
    setResults((prev) => {
      const prevGroup = prev[group.id] || {};
      const maxRaw = (prevGroup.module1Total || 0) + totalQuestions;
      const totalCorrect = (prevGroup.module1Correct || 0) + rawCorrect;
      const scaled = calcSectionScaledScore({
        route: prevGroup.route,
        rawCorrect: totalCorrect,
        maxRaw,
      });
      return {
        ...prev,
        [group.id]: {
          ...prevGroup,
          module2Correct: rawCorrect,
          module2Total: totalQuestions,
          scaledScore: scaled,
        },
      };
    });

    if (groupIndex < satTest.groups.length - 1) {
      // Reading&Writing (English) bo'limi tugagach — 10 daqiqalik tanaffus
      if (group.type === "rw") {
        setOnBreak(true);
      } else {
        advanceToNextGroup();
      }
    } else {
      // barcha bo'limlar tugadi -> Firestore'ga saqlab, natijalar sahifasiga o'tish
      setResults((prev) => {
        saveResultAndNavigate(prev);
        return prev;
      });
    }
  };

  // Qoida buzilishi tufayli test to'xtatilganda, hozirgacha bo'lgan
  // javoblar asosida taxminiy (yakunlanmagan) natijani yig'ib beradi.
  const buildTerminationResults = () => {
    const rawCorrect = countCorrect(questions, moduleState.answers);
    let finalResults = { ...results };

    if (stage === "module1") {
      const chosenRoute = decideRoute(rawCorrect, totalQuestions);
      const scaled = calcSectionScaledScore({
        route: chosenRoute,
        rawCorrect,
        maxRaw: totalQuestions,
      });
      finalResults = {
        ...finalResults,
        [group.id]: {
          module1Correct: rawCorrect,
          module1Total: totalQuestions,
          route: chosenRoute,
          scaledScore: scaled,
          incomplete: true,
        },
      };
    } else {
      const prevGroup = finalResults[group.id] || {};
      const maxRaw = (prevGroup.module1Total || 0) + totalQuestions;
      const totalCorrect = (prevGroup.module1Correct || 0) + rawCorrect;
      const scaled = calcSectionScaledScore({
        route: prevGroup.route,
        rawCorrect: totalCorrect,
        maxRaw,
      });
      finalResults = {
        ...finalResults,
        [group.id]: {
          ...prevGroup,
          module2Correct: rawCorrect,
          module2Total: totalQuestions,
          scaledScore: scaled,
          incomplete: true,
        },
      };
    }
    return finalResults;
  };

  const saveResultAndNavigate = async (finalResults, extraState = {}) => {
    // Test tugadi (yakunlandi yoki chetlatildi) — fullscreen'dan chiqamiz
    // va saqlangan pauza holatini tozalaymiz.
    await proctoring.exitFullscreenIntentionally();
    if (user) clearLocalProgress(user.uid, testId);

    const total = satTest.groups.reduce(
      (sum, g) => sum + (finalResults[g.id]?.scaledScore || 0),
      0
    );
    setSavingResult(true);
    try {
      const docRef = await addDoc(collection(db, "results"), {
        uid: user.uid,
        email: user.email,
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
      setGroupIndex(resumeSnapshot.groupIndex ?? 0);
      setStage(resumeSnapshot.stage ?? "module1");
      setRoute(resumeSnapshot.route ?? null);
      setModuleState(
        resumeSnapshot.moduleState || emptyModuleState(totalQuestions)
      );
      setSecondsLeft(resumeSnapshot.secondsLeft ?? group.durationMin * 60);
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
      testId,
      { groupIndex, stage, route, moduleState, secondsLeft, results, onBreak },
      "paused"
    );
    await proctoring.exitFullscreenIntentionally();
    navigate("/sat/select");
  };

  const sectionLabel = `Section ${group.sectionNumber}, Module ${
    stage === "module1" ? "1" : "2"
  }`;
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
    <div className="h-screen flex flex-col bg-white">
      <TestHeader
        sectionLabel={sectionLabel}
        title={group.title}
        secondsLeft={secondsLeft}
        showCalcButton={group.type === "math"}
        onToggleCalculator={() => setCalcOpen((c) => !c)}
        onExit={() => setShowExitModal(true)}
      />

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
        onFinishModule={handleFinishModule}
      />

      {navOpen && (
        <QuestionNav
          questions={questions}
          currentIndex={safeIndex}
          answers={moduleState.answers}
          marked={moduleState.marked}
          sectionTitle={`${sectionLabel}: ${group.title}`}
          onSelect={goTo}
          onClose={() => setNavOpen(false)}
          onGoToReview={() => goTo(totalQuestions - 1)}
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
  );
}
