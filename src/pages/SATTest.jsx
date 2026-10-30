import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getModuleQuestions } from "../data/satTest";
import { useSatTest } from "../hooks/useTestContent";
import { useDeadline, secondsUntil } from "../hooks/useCountdown";
import { api, withRetry } from "../api/client";
import {
  saveLocalProgress,
  loadLocalProgress,
  clearLocalProgress,
  getCooldownRemainingMs,
} from "../utils/testProgress";
import { useProctoring } from "../hooks/useProctoring";
import TestHeader from "../components/TestHeader";
import QuestionPanel from "../components/QuestionPanel";
import BottomNav from "../components/BottomNav";
import QuestionNav from "../components/QuestionNav";
import ModuleReview from "../components/ModuleReview";
import DesmosCalculator from "../components/DesmosCalculator";
import BreakScreen, { BREAK_SECONDS } from "../components/BreakScreen";
import ModuleTransition from "../components/ModuleTransition";
import RulesGate from "../components/RulesGate";
import TestLockedScreen from "../components/TestLockedScreen";
import TestTerminatedScreen from "../components/TestTerminatedScreen";
import CheatWarningToast from "../components/CheatWarningToast";
import ExitTestModal from "../components/ExitTestModal";
import SubmitErrorScreen from "../components/SubmitErrorScreen";
import { HighlightsProvider } from "../context/HighlightsContext";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/ui";
import { useI18n } from "../i18n";

const MAX_WARNINGS = 3;

const emptyModuleState = (count) => ({
  answers: Array(count).fill(null),
  marked: Array(count).fill(false),
  crossedOut: Array(count).fill(null).map(() => []),
});

// Eski formatdagi pauza snapshot'i (natijalar clientda hisoblangan) ->
// yangi `attempts` shakli: { [bo'lim]: { module1Answers, route, module2Answers } }.
function snapshotAttempts(snapshot) {
  if (snapshot.attempts) return snapshot.attempts;
  const out = {};
  for (const [id, r] of Object.entries(snapshot.results || {})) {
    if (Array.isArray(r.module1Answers)) out[id] = { module1Answers: r.module1Answers, route: r.route ?? null };
  }
  return out;
}

export default function SATTest() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  // Qaysi test ochilgani TestSelect sahifasidan state orqali keladi.
  const requestedId = location.state?.testId || "";
  const satTest = useSatTest(requestedId);
  const TEST_ID = satTest?.id || requestedId;

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
  // Takroriy yuborishda ikkinchi natija yaratilmasligi uchun (server idempotent).
  const attemptIdRef = useRef(crypto.randomUUID());

  // qaysi bo'lim (0 = Reading&Writing, 1 = Math)
  const [groupIndex, setGroupIndex] = useState(0);
  // "module1" | "module2"
  const [stage, setStage] = useState("module1");
  // module2 uchun server tanlagan yo'nalish: "easy" | "hard" | null
  const [route, setRoute] = useState(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakEndAt, setBreakEndAt] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const [moduleState, setModuleState] = useState(() => emptyModuleState(0));
  // Modul tugash vaqti (ms). Tanaffus va boshqa ekranlarda — null.
  const [endAt, setEndAt] = useState(null);

  // Topshirilgan javoblar: { rw: { module1Answers, route, module2Answers }, math: {...} }
  const [attempts, setAttempts] = useState({});
  // "routing" (Module 2 tanlanmoqda) | "saving" | null
  const [busy, setBusy] = useState(null);
  // Serverga yuborib bo'lmasa — qayta urinish tugmasi uchun.
  const [submitError, setSubmitError] = useState(null);

  const group = satTest?.groups[groupIndex];
  const questions = group ? getModuleQuestions(group, stage, route) : [];
  const totalQuestions = questions.length;

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
  }, [user, TEST_ID]);

  const handleUnlocked = () => {
    const saved = loadLocalProgress(user.uid, TEST_ID);
    if (saved && saved.reason === "paused") {
      setResumeSnapshot(saved.snapshot);
    }
    setPhase("rules");
  };

  // ------------------------------------------------------------
  // Natijani serverga yuborish (ball serverda hisoblanadi)
  // ------------------------------------------------------------
  const submitAttempts = async (finalAttempts, extraState = {}) => {
    setBusy("saving");
    setSubmitError(null);
    try {
      const data = await withRetry(() =>
        api.post("/sat/finish", {
          attemptId: attemptIdRef.current,
          testId: TEST_ID,
          attempts: finalAttempts,
          ...(extraState.terminated ? { terminated: true, terminationReason: extraState.reason } : {}),
        })
      );
      if (user) clearLocalProgress(user.uid, TEST_ID);
      navigate(`/sat/results/${data.resultId}`, {
        replace: true,
        state: { results: data.results, resultId: data.resultId, testId: TEST_ID, ...extraState },
      });
    } catch (err) {
      console.error("Natijani saqlashda xatolik:", err);
      setSubmitError({ message: err.message, retry: () => submitAttempts(finalAttempts, extraState) });
      setBusy(null);
    }
  };

  const finishTest = async (finalAttempts, extraState = {}) => {
    // Test tugadi (yakunlandi yoki chetlatildi) — fullscreen'dan chiqamiz.
    await proctoring.exitFullscreenIntentionally();
    submitAttempts(finalAttempts, extraState);
  };

  // Joriy modul javoblarini `attempts`ga qo'shadi.
  const withCurrentModule = (prev, answers) => {
    const current = prev[group.id] || {};
    return {
      ...prev,
      [group.id]:
        stage === "module1"
          ? { module1Answers: answers }
          : { ...current, module2Answers: answers },
    };
  };

  // ------------------------------------------------------------
  // Proktoring (xavfsizlik nazorati)
  // ------------------------------------------------------------
  const handleForceTerminate = (reasonCode) => {
    if (phase !== "active" || terminatingRef.current) return;
    terminatingRef.current = true;
    setTerminationReason(reasonCode);
    setPhase("terminated");
    finishTest(withCurrentModule(attempts, moduleState.answers), { terminated: true, reason: reasonCode });
  };

  const proctoring = useProctoring({
    active: phase === "active",
    onForceTerminate: handleForceTerminate,
    maxWarnings: MAX_WARNINGS,
  });

  // Yangi modulga o'tganda javoblar, taymer va joriy savol noldan boshlanadi.
  const startModule = (count, durationMin) => {
    setModuleState(emptyModuleState(count));
    setEndAt(Date.now() + durationMin * 60_000);
    setCurrentIndex(0);
    setReviewing(false);
    setNavOpen(false);
    finishingRef.current = false;
  };

  const safeIndex = Math.min(currentIndex, Math.max(totalQuestions - 1, 0));
  const question = questions[safeIndex];

  const handleSelectAnswer = useCallback(
    (value) =>
      setModuleState((s) => {
        const answers = [...s.answers];
        answers[safeIndex] = value;
        return { ...s, answers };
      }),
    [safeIndex]
  );

  const handleToggleMark = useCallback(
    () =>
      setModuleState((s) => {
        const marked = [...s.marked];
        marked[safeIndex] = !marked[safeIndex];
        return { ...s, marked };
      }),
    [safeIndex]
  );

  const handleToggleCrossOut = useCallback(
    (label) =>
      setModuleState((s) => {
        const crossedOut = s.crossedOut.map((arr) => [...arr]);
        const arr = crossedOut[safeIndex];
        const idx = arr.indexOf(label);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(label);
        return { ...s, crossedOut };
      }),
    [safeIndex]
  );

  const goTo = useCallback((i) => {
    setCurrentIndex(i);
    setNavOpen(false);
    setReviewing(false);
  }, []);

  const handleNext = () => {
    if (safeIndex < totalQuestions - 1) goTo(safeIndex + 1);
  };
  const handlePrev = () => {
    if (safeIndex > 0) goTo(safeIndex - 1);
  };

  const openReview = useCallback(() => {
    setNavOpen(false);
    setReviewing(true);
  }, []);

  // Keyingi bo'limga o'tish (tanaffusdan keyin yoki darhol)
  const advanceToNextGroup = () => {
    const nextGroup = satTest.groups[groupIndex + 1];
    setOnBreak(false);
    setBreakEndAt(null);
    setGroupIndex((i) => i + 1);
    setStage("module1");
    setRoute(null);
    setCalcOpen(false);
    startModule(nextGroup.module1.questions.length, nextGroup.durationMin);
  };

  // Module 1 tugagach — server javoblarga qarab Module 2'ni (oson/qiyin) tanlaydi.
  const routeToModule2 = async (nextAttempts) => {
    setBusy("routing");
    setSubmitError(null);
    setEndAt(null);
    try {
      const { route: nextRoute } = await withRetry(() =>
        api.post("/sat/route", {
          testId: TEST_ID,
          sectionId: group.id,
          module1Answers: nextAttempts[group.id].module1Answers,
        })
      );
      const r = nextRoute === "hard" ? "hard" : "easy";
      setAttempts((prev) => ({ ...prev, [group.id]: { ...prev[group.id], route: r } }));
      setRoute(r);
      setStage("module2");
      startModule(getModuleQuestions(group, "module2", r).length, group.durationMin);
      setBusy(null);
    } catch (err) {
      setSubmitError({ message: err.message, retry: () => routeToModule2(nextAttempts) });
      setBusy(null);
    }
  };

  // Modulni yakunlash: marshrutlash, keyingi bo'lim yoki natija.
  const handleFinishModule = () => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    const nextAttempts = withCurrentModule(attempts, moduleState.answers);
    setAttempts(nextAttempts);

    if (stage === "module1") {
      routeToModule2(nextAttempts);
      return;
    }

    if (groupIndex < satTest.groups.length - 1) {
      // Reading&Writing tugagach — 10 daqiqalik tanaffus
      setEndAt(null);
      if (group.type === "rw") {
        setBreakEndAt(Date.now() + BREAK_SECONDS * 1000);
        setOnBreak(true);
      } else advanceToNextGroup();
      return;
    }
    setEndAt(null);
    finishTest(nextAttempts);
  };

  // Vaqt tugasa, Bluebook'dagi kabi modul avtomatik topshiriladi.
  useDeadline(phase === "active" && !onBreak && !busy ? endAt : null, handleFinishModule);

  // ------------------------------------------------------------
  // Testni boshlash / davom ettirish (RulesGate tugmasi bosilganda)
  // ------------------------------------------------------------
  const handleStart = async () => {
    const ok = await proctoring.requestFullscreen();
    if (!ok) return false;

    if (resumeSnapshot) {
      const gi = resumeSnapshot.groupIndex ?? 0;
      const g = satTest.groups[gi];
      const st = resumeSnapshot.stage ?? "module1";
      const r = resumeSnapshot.route ?? null;
      const count = getModuleQuestions(g, st, r).length;
      setGroupIndex(gi);
      setStage(st);
      setRoute(r);
      setModuleState(resumeSnapshot.moduleState || emptyModuleState(count));
      setEndAt(resumeSnapshot.onBreak ? null : Date.now() + (resumeSnapshot.secondsLeft ?? g.durationMin * 60) * 1000);
      setCurrentIndex(resumeSnapshot.currentIndex ?? 0);
      setAttempts(snapshotAttempts(resumeSnapshot));
      setOnBreak(!!resumeSnapshot.onBreak);
      setBreakEndAt(
        resumeSnapshot.onBreak ? Date.now() + (resumeSnapshot.breakSecondsLeft ?? BREAK_SECONDS) * 1000 : null
      );
    } else {
      startModule(satTest.groups[0].module1.questions.length, satTest.groups[0].durationMin);
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
      {
        groupIndex,
        stage,
        route,
        moduleState,
        secondsLeft: secondsUntil(endAt) ?? group.durationMin * 60,
        currentIndex: safeIndex,
        attempts,
        onBreak,
        breakSecondsLeft: secondsUntil(breakEndAt),
      },
      "paused"
    );
    await proctoring.exitFullscreenIntentionally();
    navigate("/sat/select");
  };

  // Test topilmadi (masalan, olib tashlangan) — testlar ro'yxatiga qaytamiz.
  if (satTest === null) {
    return <Navigate to="/sat/select" replace />;
  }

  if (loading || !user || phase === null || satTest === undefined) {
    return <PageLoader fullscreen />;
  }

  if (submitError) {
    return <SubmitErrorScreen message={submitError.message} onRetry={submitError.retry} />;
  }

  if (phase === "locked") {
    return <TestLockedScreen pausedAt={pausedAt} onUnlocked={handleUnlocked} />;
  }

  if (phase === "rules") {
    return <RulesGate onStart={handleStart} isResume={!!resumeSnapshot} title={satTest.title} />;
  }

  if (phase === "terminated") {
    return <TestTerminatedScreen reason={terminationReason} />;
  }

  if (busy === "saving") {
    return <PageLoader fullscreen label={t("proctor.calculating")} />;
  }

  if (onBreak) {
    return <BreakScreen endAt={breakEndAt} onContinue={advanceToNextGroup} />;
  }

  if (busy === "routing" || !question) {
    return <ModuleTransition />;
  }

  const sectionLabel = `Section ${group.sectionNumber}, Module ${stage === "module1" ? "1" : "2"}`;
  const showPassage = group.type === "rw";

  return (
    <HighlightsProvider>
    <div className="h-screen flex flex-col bg-white">
      <TestHeader
        sectionLabel={sectionLabel}
        title={group.title}
        sectionType={group.type}
        endAt={endAt}
        showCalcButton={group.type === "math"}
        calcOpen={calcOpen}
        onToggleCalculator={() => setCalcOpen((c) => !c)}
        directionsKey={groupIndex}
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

          <div className="h-16 shrink-0" />

          <BottomNav
            total={totalQuestions}
            currentIndex={safeIndex}
            studentName={studentName}
            navOpen={navOpen}
            onOpenNav={() => setNavOpen((o) => !o)}
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
