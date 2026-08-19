import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  decideRoute,
  calcSectionScaledScore,
  calcSingleModuleScaledScore,
  countCorrect,
} from "../utils/scoring";
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
import DesmosCalculator from "../components/DesmosCalculator";
import BreakScreen from "../components/BreakScreen";
import RulesGate from "../components/RulesGate";
import TestLockedScreen from "../components/TestLockedScreen";
import TestTerminatedScreen from "../components/TestTerminatedScreen";
import CheatWarningToast from "../components/CheatWarningToast";
import ExitTestModal from "../components/ExitTestModal";
import SessionWaitingScreen from "../components/SessionWaitingScreen";
import { useAuth } from "../context/AuthContext";

const MAX_WARNINGS = 3;

const emptyModuleState = (count) => ({
  answers: Array(count).fill(null),
  marked: Array(count).fill(false),
  crossedOut: Array(count).fill(null).map(() => []),
});

const FALLBACK_SECTION = {
  id: "_",
  title: "",
  durationMin: 30,
  type: "custom",
  calculator: false,
  module1: [],
  module2Easy: [],
  module2Hard: [],
};

export default function SessionTest() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id: sessionId } = useParams();

  const studentName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const progressKey = `session:${sessionId}`;

  // ------------------------------------------------------------
  // Sessiya (admin tashkil qilgan test) ma'lumotini jonli kuzatish.
  // ------------------------------------------------------------
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionMissing, setSessionMissing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "testSessions", sessionId),
      (snap) => {
        if (!snap.exists()) {
          setSessionMissing(true);
          setSessionLoading(false);
          return;
        }
        setSession({ id: snap.id, ...snap.data() });
        setSessionLoading(false);
      },
      () => {
        setSessionMissing(true);
        setSessionLoading(false);
      }
    );
    return unsub;
  }, [sessionId]);

  const scheduledMs = session?.scheduledAt?.toMillis
    ? session.scheduledAt.toMillis()
    : session?.scheduledAt
    ? new Date(session.scheduledAt).getTime()
    : null;
  const scheduledDate = useMemo(
    () => (scheduledMs ? new Date(scheduledMs) : null),
    [scheduledMs]
  );

  // ------------------------------------------------------------
  // Bosqich: null | "waiting" | "locked" | "rules" | "active" |
  // "terminated" | "closed"
  // ------------------------------------------------------------
  const [phase, setPhase] = useState(null);
  const [pausedAt, setPausedAt] = useState(null);
  const [resumeSnapshot, setResumeSnapshot] = useState(null);
  const [terminationReason, setTerminationReason] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exiting, setExiting] = useState(false);
  const terminatingRef = useRef(false);
  const initializedRef = useRef(false);
  const participantInitRef = useRef(false);

  const [groupIndex, setGroupIndex] = useState(0);
  const [stage, setStage] = useState("module1");
  const [route, setRoute] = useState(null);
  const [onBreak, setOnBreak] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const section = session?.sections?.[groupIndex] || FALLBACK_SECTION;
  const hasModule2 =
    (section.module2Easy && section.module2Easy.length > 0) ||
    (section.module2Hard && section.module2Hard.length > 0);

  const pickModule2Questions = () => {
    const preferred = route === "hard" ? section.module2Hard : section.module2Easy;
    if (preferred && preferred.length > 0) return preferred;
    if (section.module2Hard && section.module2Hard.length > 0) return section.module2Hard;
    return section.module2Easy || [];
  };

  const questions = stage === "module1" ? section.module1 || [] : pickModule2Questions();
  const totalQuestions = questions.length;

  const [moduleState, setModuleState] = useState(() => emptyModuleState(totalQuestions));
  const [secondsLeft, setSecondsLeft] = useState((section.durationMin || 30) * 60);

  const [results, setResults] = useState({});
  const [savingResult, setSavingResult] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  // ------------------------------------------------------------
  // Ishtirokchi hujjatini yaratish (admin monitoring uchun) —
  // faqat bir marta.
  // ------------------------------------------------------------
  useEffect(() => {
    if (!user || !session || participantInitRef.current) return;
    participantInitRef.current = true;
    setDoc(
      doc(db, "testSessions", sessionId, "participants", user.uid),
      {
        uid: user.uid,
        name: studentName,
        email: user.email,
        status: "not_started",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session]);

  const updateParticipant = (data) => {
    if (!user) return;
    setDoc(doc(db, "testSessions", sessionId, "participants", user.uid), data, {
      merge: true,
    }).catch(() => {});
  };

  const logEvent = (type, message) => {
    if (!user) return;
    addDoc(collection(db, "testSessions", sessionId, "events"), {
      uid: user.uid,
      name: studentName,
      type,
      message,
      at: serverTimestamp(),
    }).catch(() => {});
  };

  // ------------------------------------------------------------
  // Boshlang'ich bosqichni aniqlash: sessiya yopilganmi, vaqti
  // kelmaganmi, pauza cooldown'i bormi — bir marta ishlaydi.
  // ------------------------------------------------------------
  const moveToRulesOrLocked = () => {
    const saved = loadLocalProgress(user.uid, progressKey);
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
  };

  useEffect(() => {
    if (!user || !session || initializedRef.current) return;
    initializedRef.current = true;
    if (session.status === "closed") {
      setPhase("closed");
      return;
    }
    if (scheduledMs && scheduledMs > Date.now()) {
      setPhase("waiting");
      return;
    }
    moveToRulesOrLocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session]);

  // Admin testni yopib qo'ysa — jonli kuzatib, mos ravishda reaksiya beramiz.
  useEffect(() => {
    if (!session) return;
    if (session.status !== "closed") return;
    if (phase === "active") {
      handleForceTerminate("closed_by_admin");
    } else if (phase === "waiting" || phase === "rules" || phase === "locked") {
      setPhase("closed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status]);

  const handleUnlocked = () => {
    const saved = loadLocalProgress(user.uid, progressKey);
    if (saved && saved.reason === "paused") {
      setResumeSnapshot(saved.snapshot);
    }
    setPhase("rules");
  };

  // ------------------------------------------------------------
  // Proktoring
  // ------------------------------------------------------------
  const handleForceTerminate = (reasonCode) => {
    if (phase !== "active" || terminatingRef.current) return;
    terminatingRef.current = true;
    setTerminationReason(reasonCode);
    setPhase("terminated");
    updateParticipant({
      status: "terminated",
      terminationReason: reasonCode,
      terminatedAt: serverTimestamp(),
    });
    const finalResults = buildTerminationResults();
    saveResultAndNavigate(finalResults, { terminated: true, reason: reasonCode });
  };

  const proctoring = useProctoring({
    active: phase === "active",
    onForceTerminate: handleForceTerminate,
    onViolationWarning: (type, count, message) => {
      logEvent(type, message);
      updateParticipant({ violationCount: count });
    },
    maxWarnings: MAX_WARNINGS,
  });

  useEffect(() => {
    if (phase !== "active") return;
    setModuleState(emptyModuleState(totalQuestions));
    setSecondsLeft((section.durationMin || 30) * 60);
    setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, stage, route]);

  useEffect(() => {
    if (phase !== "active" || onBreak) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [groupIndex, stage, route, onBreak, phase]);

  const safeIndex = Math.min(currentIndex, Math.max(totalQuestions - 1, 0));
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

  const proceedAfterSection = () => {
    if (groupIndex < session.sections.length - 1) {
      setOnBreak(true);
    } else {
      setResults((prev) => {
        saveResultAndNavigate(prev);
        return prev;
      });
    }
  };

  const advanceToNextGroup = () => {
    setOnBreak(false);
    setGroupIndex((i) => i + 1);
    setStage("module1");
    setRoute(null);
    setCurrentIndex(0);
    setCalcOpen(false);
  };

  const handleFinishModule = () => {
    const rawCorrect = countCorrect(questions, moduleState.answers);

    if (stage === "module1" && hasModule2) {
      const chosenRoute = decideRoute(rawCorrect, totalQuestions);
      setResults((prev) => ({
        ...prev,
        [section.id]: {
          ...prev[section.id],
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

    if (stage === "module1") {
      const scaled = calcSingleModuleScaledScore({ rawCorrect, maxRaw: totalQuestions });
      setResults((prev) => ({
        ...prev,
        [section.id]: {
          module1Correct: rawCorrect,
          module1Total: totalQuestions,
          scaledScore: scaled,
          singleModule: true,
        },
      }));
    } else {
      setResults((prev) => {
        const prevSection = prev[section.id] || {};
        const maxRaw = (prevSection.module1Total || 0) + totalQuestions;
        const totalCorrect = (prevSection.module1Correct || 0) + rawCorrect;
        const scaled = calcSectionScaledScore({
          route: prevSection.route,
          rawCorrect: totalCorrect,
          maxRaw,
        });
        return {
          ...prev,
          [section.id]: {
            ...prevSection,
            module2Correct: rawCorrect,
            module2Total: totalQuestions,
            scaledScore: scaled,
          },
        };
      });
    }

    proceedAfterSection();
  };

  const buildTerminationResults = () => {
    const rawCorrect = countCorrect(questions, moduleState.answers);
    let finalResults = { ...results };

    if (stage === "module1") {
      if (hasModule2) {
        const chosenRoute = decideRoute(rawCorrect, totalQuestions);
        const scaled = calcSectionScaledScore({
          route: chosenRoute,
          rawCorrect,
          maxRaw: totalQuestions,
        });
        finalResults = {
          ...finalResults,
          [section.id]: {
            module1Correct: rawCorrect,
            module1Total: totalQuestions,
            route: chosenRoute,
            scaledScore: scaled,
            incomplete: true,
          },
        };
      } else {
        const scaled = calcSingleModuleScaledScore({ rawCorrect, maxRaw: totalQuestions });
        finalResults = {
          ...finalResults,
          [section.id]: {
            module1Correct: rawCorrect,
            module1Total: totalQuestions,
            scaledScore: scaled,
            singleModule: true,
            incomplete: true,
          },
        };
      }
    } else {
      const prevSection = finalResults[section.id] || {};
      const maxRaw = (prevSection.module1Total || 0) + totalQuestions;
      const totalCorrect = (prevSection.module1Correct || 0) + rawCorrect;
      const scaled = calcSectionScaledScore({
        route: prevSection.route,
        rawCorrect: totalCorrect,
        maxRaw,
      });
      finalResults = {
        ...finalResults,
        [section.id]: {
          ...prevSection,
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
    await proctoring.exitFullscreenIntentionally();
    if (user) clearLocalProgress(user.uid, progressKey);

    const total = session.sections.reduce(
      (sum, s) => sum + (finalResults[s.id]?.scaledScore || 0),
      0
    );
    const sectionsMeta = session.sections.map((s) => ({ id: s.id, title: s.title }));

    setSavingResult(true);
    try {
      await setDoc(doc(db, "testSessions", sessionId, "results", user.uid), {
        uid: user.uid,
        name: studentName,
        email: user.email,
        results: finalResults,
        total,
        finishedAt: serverTimestamp(),
        ...(extraState.terminated
          ? { terminated: true, terminationReason: extraState.reason }
          : {}),
      });
      updateParticipant({
        totalScore: total,
        ...(extraState.terminated ? {} : { status: "finished", finishedAt: serverTimestamp() }),
      });
      navigate(`/session/${sessionId}/results`, {
        state: { results: finalResults, sections: sectionsMeta, total, sessionTitle: session.title, ...extraState },
      });
    } catch (err) {
      console.error("Natijani saqlashda xatolik:", err);
      navigate(`/session/${sessionId}/results`, {
        state: {
          results: finalResults,
          sections: sectionsMeta,
          total,
          sessionTitle: session.title,
          saveError: true,
          ...extraState,
        },
      });
    } finally {
      setSavingResult(false);
    }
  };

  const handleStart = async () => {
    const ok = await proctoring.requestFullscreen();
    if (!ok) return false;

    if (resumeSnapshot) {
      setGroupIndex(resumeSnapshot.groupIndex ?? 0);
      setStage(resumeSnapshot.stage ?? "module1");
      setRoute(resumeSnapshot.route ?? null);
      setModuleState(resumeSnapshot.moduleState || emptyModuleState(totalQuestions));
      setSecondsLeft(resumeSnapshot.secondsLeft ?? (section.durationMin || 30) * 60);
      setResults(resumeSnapshot.results || {});
      setOnBreak(!!resumeSnapshot.onBreak);
    }
    setPhase("active");
    updateParticipant({ status: "active", startedAt: serverTimestamp() });
    return true;
  };

  const handleExitConfirm = async () => {
    setExiting(true);
    saveLocalProgress(
      user.uid,
      progressKey,
      { groupIndex, stage, route, moduleState, secondsLeft, results, onBreak },
      "paused"
    );
    updateParticipant({ status: "paused" });
    await proctoring.exitFullscreenIntentionally();
    navigate("/dashboard");
  };

  const sectionLabel = `Bo'lim ${groupIndex + 1}, Modul ${stage === "module1" ? "1" : "2"}`;
  const showPassage = section.type === "rw";

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (loading || !user || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (sessionMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Bunday test topilmadi. Kodni tekshirib qayta urinib ko'ring.
      </div>
    );
  }

  if (phase === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Bu test yakunlangan.
      </div>
    );
  }

  if (phase === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <SessionWaitingScreen
        title={session.title}
        scheduledAt={scheduledDate}
        onReady={moveToRulesOrLocked}
      />
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
        title={section.title}
        secondsLeft={secondsLeft}
        showCalcButton={!!section.calculator}
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
          sectionTitle={`${sectionLabel}: ${section.title}`}
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
