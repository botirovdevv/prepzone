import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useSessionLive } from "../api/socket";
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
import { useTimeUp } from "../hooks/useTimeUp";
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
import { HighlightsProvider } from "../context/HighlightsContext";
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
  module2Mixed: [],
};

export default function SessionTest() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: sessionId } = useParams();
  // JoinSession sahifasidan o'tkazilgan kod — birinchi marta ishtirokchi
  // hujjati yaratilganda xavfsizlik qoidasi shuni tekshiradi (pastga qarang).
  const joinCode = location.state?.code || null;

  const studentName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const progressKey = `session:${sessionId}`;

  // ------------------------------------------------------------
  // Sessiya META ma'lumoti (nom, kod, jadval, holat) — bularni HAR
  // QANDAY login qilgan foydalanuvchi o'qiy oladi (Firestore qoidasi).
  // Savollarning o'zi (module1/2 massivlari) BU YERDA YO'Q — ular
  // alohida, faqat ishtirokchiga ochiladigan "secure/content"
  // hujjatida saqlanadi (pastga qarang). Shu ajratish orqali,
  // kodni bilmagan yoki hali qo'shilmagan foydalanuvchi hech qachon
  // Firestore orqali to'g'ridan-to'g'ri savollarni (va to'g'ri
  // javoblarni!) o'qiy olmaydi.
  // ------------------------------------------------------------
  const [sessionMeta, setSessionMeta] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionMissing, setSessionMissing] = useState(false);

  const loadMeta = () =>
    api
      .get(`/sessions/${sessionId}`)
      .then((s) => setSessionMeta(s))
      .catch(() => setSessionMissing(true))
      .finally(() => setSessionLoading(false));

  useEffect(() => {
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Admin testni yopsa — server Socket.IO orqali darhol xabar beradi.
  useSessionLive(sessionId, { "session:update": setSessionMeta }, loadMeta);

  // Savollarning o'zi (to'g'ri javoblar bilan) — faqat sessiyaga qo'shilgach
  // (server kodni tekshirgandan keyin) qaytariladi.
  const [sessionContent, setSessionContent] = useState(null);
  const [contentError, setContentError] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Meta va tarkibni birlashtirib, qolgan kod uchun bir xil "session"
  // shaklini beramiz (quyidagi barcha kod shu birlashtirilgan
  // obyektdan foydalanadi — module1/2 massivlari tarkib yuklangach
  // paydo bo'ladi).
  const session = useMemo(() => {
    if (!sessionMeta) return null;
    if (!sessionContent) return sessionMeta;
    return {
      ...sessionMeta,
      sections: (sessionMeta.sections || []).map((metaSec) => {
        const contentSec = (sessionContent.sections || []).find((c) => c.id === metaSec.id);
        return contentSec ? { ...metaSec, ...contentSec } : metaSec;
      }),
    };
  }, [sessionMeta, sessionContent]);

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
    (section.module2Mixed && section.module2Mixed.length > 0) ||
    (section.module2Easy && section.module2Easy.length > 0) ||
    (section.module2Hard && section.module2Hard.length > 0);

  // Module 2 savollarini tanlash:
  //  - Agar "Aralash" (filial qilinmagan) to'plam bo'lsa, barcha talabalar
  //    Module 1 natijasidan qat'iy nazar shu bitta to'plamni oladi.
  //  - Aks holda, Module 1 natijasiga qarab (decideRoute) Oson yoki Qiyin
  //    to'plamga yo'naltiriladi; agar tanlangan to'plam bo'sh bo'lsa,
  //    mavjud bo'lgan yagona to'plamga tushadi (yarim-adaptiv fallback).
  const pickModule2Questions = () => {
    if (section.module2Mixed && section.module2Mixed.length > 0) return section.module2Mixed;
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
    if (!user || !sessionMeta || participantInitRef.current) return;
    participantInitRef.current = true;
    // Server kodni sessiyaning haqiqiy kodi bilan solishtiradi (faqat "code"
    // turidagi testlar uchun) — kodni bilmagan foydalanuvchi ishtirokchi
    // bo'la olmaydi va savollarni ololmaydi, hatto sessiya ID'sini bilsa ham.
    api
      .post(`/sessions/${sessionId}/join`, {
        code: sessionMeta.accessType === "open" ? null : joinCode,
      })
      // Vaqti kelmagan kodli testda server savollarni bermaydi (content: null) —
      // ular test boshlanganda alohida olinadi (pastdagi effekt).
      .then(({ content }) => {
        if (content) setSessionContent(content);
        setJoined(true);
      })
      .catch((err) => {
        if (err.code === "already-finished") {
          navigate(`/session/${sessionId}/results`, { replace: true });
          return;
        }
        console.error("Ishtirokchi sifatida ro'yxatdan o'tishda xatolik:", err);
        if (err.code === "failed-precondition") {
          setPhase("closed");
          return;
        }
        setJoinError(err.code === "permission-denied" ? err.message : "");
        setContentError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionMeta]);

  // Qo'shilgandan keyin savollar hali yo'q bo'lsa (test vaqti endi keldi) —
  // serverdan olamiz. Qurilma soati biroz oldinda bo'lsa server "hali
  // boshlanmagan" deydi — shunda bir necha soniyadan keyin qayta urinamiz.
  useEffect(() => {
    if (phase !== "rules" || !joined || sessionContent || contentError) return;
    let cancelled = false;
    let timer = null;
    const load = () =>
      api
        .get(`/sessions/${sessionId}/content`)
        .then((content) => !cancelled && setSessionContent(content))
        .catch((err) => {
          if (cancelled) return;
          if (err.code === "not-started") timer = setTimeout(load, 3000);
          else if (err.code === "failed-precondition") setPhase("closed");
          else setContentError(true);
        });
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, joined, sessionContent, contentError, sessionId]);

  // Vaqt belgilari (startedAt, terminatedAt, ...) serverda qo'yiladi.
  const updateParticipant = (data) => {
    if (!user) return;
    api.patch(`/sessions/${sessionId}/participants/me`, data).catch(() => {});
  };

  const logEvent = (type, message) => {
    if (!user) return;
    api.post(`/sessions/${sessionId}/events`, { type, message }).catch(() => {});
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
    if (!user || !sessionMeta || initializedRef.current) return;
    initializedRef.current = true;
    if (sessionMeta.status === "closed") {
      setPhase("closed");
      return;
    }
    if (sessionMeta.accessType !== "open" && scheduledMs && scheduledMs > Date.now()) {
      setPhase("waiting");
      return;
    }
    moveToRulesOrLocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionMeta]);

  // Admin testni yopib qo'ysa — jonli kuzatib, mos ravishda reaksiya beramiz.
  useEffect(() => {
    if (!sessionMeta) return;
    if (sessionMeta.status !== "closed") return;
    if (phase === "active") {
      handleForceTerminate("closed_by_admin");
    } else if (phase === "waiting" || phase === "rules" || phase === "locked") {
      setPhase("closed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionMeta?.status]);

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

  // Modul almashganda javoblar va taymer yangilanadi. Pauzadan davom
  // ettirilganda esa (handleStart snapshot'ni tiklaydi) bir marta
  // o'tkazib yuboriladi — aks holda saqlangan javoblar va qolgan vaqt
  // o'chib ketardi.
  const skipModuleResetRef = useRef(false);
  useEffect(() => {
    if (phase !== "active") return;
    if (skipModuleResetRef.current) {
      skipModuleResetRef.current = false;
      return;
    }
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

  // Vaqt tugadi — modul avtomatik yakunlanadi (bergan javoblari bilan).
  useTimeUp({
    active: phase === "active" && !onBreak && !savingResult && totalQuestions > 0,
    secondsLeft,
    moduleKey: `${groupIndex}:${stage}:${route}`,
    onTimeUp: handleFinishModule,
  });

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
      // Server bitta tranzaksiyada: sessiya natijasi, "Mening natijalarim"
      // uchun nusxa, ishtirokchi holati va reytingni yangilaydi.
      await api.post(`/sessions/${sessionId}/results`, {
        results: finalResults,
        total,
        ...(extraState.terminated
          ? { terminated: true, terminationReason: extraState.reason }
          : {}),
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
      const g = resumeSnapshot.groupIndex ?? 0;
      const st = resumeSnapshot.stage ?? "module1";
      const r = resumeSnapshot.route ?? null;
      // Modul o'zgaradigan bo'lsa, "modul almashdi" effekti snapshot'ni o'chirmasin.
      skipModuleResetRef.current = g !== groupIndex || st !== stage || r !== route;
      setGroupIndex(resumeSnapshot.groupIndex ?? 0);
      setStage(resumeSnapshot.stage ?? "module1");
      setRoute(resumeSnapshot.route ?? null);
      setModuleState(resumeSnapshot.moduleState || emptyModuleState(totalQuestions));
      setSecondsLeft(resumeSnapshot.secondsLeft ?? (section.durationMin || 30) * 60);
      setResults(resumeSnapshot.results || {});
      setOnBreak(!!resumeSnapshot.onBreak);
    } else {
      // Komponent ochilganda savollar hali yuklanmagan edi (0 ta savol,
      // standart 30 daqiqa) — endi haqiqiy son va davomiylik bilan boshlaymiz.
      setModuleState(emptyModuleState(totalQuestions));
      setSecondsLeft((section.durationMin || 30) * 60);
      setCurrentIndex(0);
    }
    setPhase("active");
    updateParticipant({ status: "active" });
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
    if (contentError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-500 text-center px-6">
          {joinError
            ? `${joinError} Kodni "Mock with key" sahifasida qaytadan kiriting.`
            : "Savollarni yuklab bo'lmadi. Internet aloqasini tekshirib, sahifani qayta yuklang."}
        </div>
      );
    }
    if (!sessionContent) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Savollar tayyorlanmoqda...
        </div>
      );
    }
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
    </HighlightsProvider>
  );
}
