import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { LuHeadphones, LuBookOpen, LuPenLine, LuVolume2, LuPlay, LuX, LuRadio, LuHourglass, LuCircleCheck } from "react-icons/lu";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { HighlightsProvider } from "../../context/HighlightsContext";
import HighlightableText from "../../components/HighlightableText";
import RulesGate from "../../components/RulesGate";
import TestLockedScreen from "../../components/TestLockedScreen";
import TestTerminatedScreen from "../../components/TestTerminatedScreen";
import ExitTestModal from "../../components/ExitTestModal";
import CheatWarningToast from "../../components/CheatWarningToast";
import IeltsHeader from "../../components/ielts/IeltsHeader";
import IeltsNavigator from "../../components/ielts/IeltsNavigator";
import QuestionGroup from "../../components/ielts/QuestionGroup";
import WritingChart from "../../components/ielts/WritingChart";
import { useProctoring } from "../../hooks/useProctoring";
import { useListeningAudio, playSoundCheck, questionRange, speechSupported } from "../../hooks/useListeningAudio";
import { getIeltsTest, IELTS_SECTIONS, sectionsFor } from "../../data/ielts";
import { scoreSection, listeningBand, readingBand, overallBand, wordCount } from "../../utils/ieltsScoring";
import { assessWriting } from "../../utils/ieltsWriting";
import {
  saveLocalProgress,
  loadLocalProgress,
  clearLocalProgress,
  getCooldownRemainingMs,
} from "../../utils/testProgress";

const MAX_WARNINGS = 3;
const MODES = ["full", "listening", "reading", "writing"];
const SECTION_ICONS = { listening: LuHeadphones, reading: LuBookOpen, writing: LuPenLine };

const SECTION_INSTRUCTIONS = {
  listening: [
    "Answer all the questions.",
    "You can change your answers at any time during the test.",
    "The recording is played ONCE only. It cannot be paused.",
    "Before each part you will have some time to read the questions.",
    "When the recording ends, you will have 2 minutes to check your answers.",
  ],
  reading: [
    "Answer all the questions.",
    "There are 40 questions in this test, based on three passages.",
    "You can highlight text in the passages: select the words with your mouse. Click a highlight to remove it.",
    "Drag the divider in the middle of the screen to resize the passage and question areas.",
  ],
  writing: [
    "Answer both parts.",
    "Task 1: write at least 150 words (about 20 minutes).",
    "Task 2: write at least 250 words (about 40 minutes).",
    "Task 2 contributes twice as much as Task 1 to the Writing score.",
  ],
};

function emptyAnswers() {
  return { listening: {}, reading: {}, writing: { task1: "", task2: "" } };
}

// ---------------- Bo'lim oldidan ko'rsatiladigan ekran ----------------
function SectionIntro({ sectionKey, index, total, volume, onVolume, onStart, resumed }) {
  const meta = IELTS_SECTIONS[sectionKey];
  const Icon = SECTION_ICONS[sectionKey];
  const noSpeech = sectionKey === "listening" && !speechSupported();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f2f2] px-4 py-10">
      <div className="w-full max-w-xl rounded-lg border border-[#d7d7d7] bg-white p-7 shadow-sm sm:p-9">
        <div className="flex items-center gap-3">
          <span className="rounded bg-[#e4002b] px-2 py-0.5 font-display text-[15px] font-black text-white">IELTS</span>
          <span className="text-[13px] font-semibold text-[#1d1d1b]/55">
            Academic · {total > 1 ? `Section ${index + 1} of ${total}` : "Section practice"}
          </span>
        </div>
        <h1 className="mt-6 flex items-center gap-3 font-display text-[28px] font-extrabold text-[#1d1d1b]">
          <Icon size={28} /> {meta.label}
        </h1>
        <p className="mt-1 text-[14px] text-[#1d1d1b]/60">
          Time: {sectionKey === "listening" ? "approximately 30 minutes (+2 minutes to check)" : `${meta.minutes} minutes`}
          {resumed && " · davom ettirilmoqda"}
        </p>

        <p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-[#1d1d1b]/50">Instructions to candidates</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-[#1d1d1b]/85">
          {SECTION_INSTRUCTIONS[sectionKey].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {sectionKey === "listening" && (
          <div className="mt-6 rounded border border-[#d7d7d7] bg-[#f7f7f7] p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-[#1d1d1b]">
              <LuVolume2 size={16} /> Sound check
            </p>
            {noSpeech ? (
              <p className="mt-2 text-[13px] text-red-600">
                Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi. Listening uchun Chrome, Edge yoki Safari'dan foydalaning.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => playSoundCheck(volume)}
                  className="flex h-9 items-center gap-2 rounded border border-[#1d1d1b]/30 bg-white px-3 text-[13px] font-semibold hover:bg-black/5"
                >
                  <LuPlay size={14} /> Play sound
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => onVolume(Number(e.target.value))}
                  className="w-40 accent-[#1d1d1b]"
                />
                <span className="text-[12px] text-[#1d1d1b]/50">Quloqchin taqishni tavsiya qilamiz.</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onStart}
          className="mt-8 flex h-11 w-full items-center justify-center rounded bg-[#1d1d1b] text-[15px] font-bold text-white hover:bg-[#1d1d1b]/85"
        >
          {sectionKey === "listening" ? "Start listening" : `Start ${meta.label.toLowerCase()}`}
        </button>
      </div>
    </div>
  );
}

// ---------------- Kichik modal ----------------
function Modal({ title, children, onClose, actions }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[17px] font-bold text-[#1d1d1b]">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="rounded p-1 text-[#1d1d1b]/50 hover:bg-black/5">
              <LuX size={18} />
            </button>
          )}
        </div>
        <div className="mt-3 text-[14px] leading-relaxed text-[#1d1d1b]/80">{children}</div>
        {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default function IeltsTest() {
  const { testId } = useParams();
  const [params] = useSearchParams();
  const mode = MODES.includes(params.get("section")) ? params.get("section") : "full";
  const test = getIeltsTest(testId);
  const sections = sectionsFor(mode);
  const PROGRESS_KEY = `ielts-${testId}-${mode}`;

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const candidate = user?.displayName || user?.email?.split("@")[0] || "Candidate";

  const [phase, setPhase] = useState(null); // null | locked | rules | intro | active | terminated | saving
  const [pausedAt, setPausedAt] = useState(null);
  const [resumeSnapshot, setResumeSnapshot] = useState(null);
  const [terminationReason, setTerminationReason] = useState(null);

  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [flags, setFlags] = useState({ listening: {}, reading: {} });
  const [partIdx, setPartIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerHidden, setTimerHidden] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [leftPct, setLeftPct] = useState(50);
  const [modal, setModal] = useState(null); // help | submit | exit
  const [exiting, setExiting] = useState(false);

  const finishingRef = useRef(false);
  const resumeRef = useRef(null);
  const stateRef = useRef({});

  const sectionKey = sections[sectionIdx];
  const audio = useListeningAudio({ parts: test?.listening.parts || [], volume });

  // Eng so'nggi holat — asinxron callback'lar (taymer, proktoring) uchun.
  stateRef.current = { answers, sectionIdx, partIdx, secondsLeft, flags };

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !test) return;
    const saved = loadLocalProgress(user.uid, PROGRESS_KEY);
    if (saved?.reason === "paused") {
      if (getCooldownRemainingMs(saved.pausedAt) > 0) {
        setPausedAt(saved.pausedAt);
        setPhase("locked");
        return;
      }
      setResumeSnapshot(saved.snapshot);
    }
    setPhase("rules");
  }, [user, test, PROGRESS_KEY]);

  // ---------------- Bo'lim tuzilmasi (navigator uchun) ----------------
  const navParts = useMemo(() => {
    if (!test) return [];
    if (sectionKey === "writing") {
      return [
        { label: "Part 1", questions: [1] },
        { label: "Part 2", questions: [2] },
      ];
    }
    return test[sectionKey].parts.map((p) => ({
      label: p.title,
      questions: p.groups.flatMap((g) => g.questions.map((q) => q.n)),
    }));
  }, [test, sectionKey]);

  const allQs = useMemo(() => navParts.flatMap((p) => p.questions), [navParts]);

  const isAnswered = useCallback(
    (n) => {
      if (sectionKey === "writing") return wordCount(answers.writing[n === 1 ? "task1" : "task2"]) > 0;
      const v = answers[sectionKey]?.[n];
      return v != null && String(v).trim() !== "";
    },
    [answers, sectionKey]
  );
  const isFlagged = useCallback((n) => !!flags[sectionKey]?.[n], [flags, sectionKey]);

  // ---------------- Natijani hisoblash va saqlash ----------------
  const finishTest = useCallback(
    async (extra = {}) => {
      const { answers: ans } = stateRef.current;
      audio.stop();
      setPhase((p) => (p === "terminated" ? p : "saving"));
      const result = { uid: user.uid, email: user.email || null, testId: test.id, testTitle: test.title, mode };
      const bands = [];
      if (sections.includes("listening")) {
        const s = scoreSection(test.listening.parts, ans.listening);
        result.listening = { raw: s.raw, band: listeningBand(s.raw), answers: ans.listening };
        bands.push(result.listening.band);
      }
      if (sections.includes("reading")) {
        const s = scoreSection(test.reading.parts, ans.reading);
        result.reading = { raw: s.raw, band: readingBand(s.raw), answers: ans.reading };
        bands.push(result.reading.band);
      }
      if (sections.includes("writing")) {
        const a = assessWriting(test.writing, ans.writing);
        result.writing = {
          band: a.band,
          task1Text: ans.writing.task1,
          task2Text: ans.writing.task2,
          task1: { band: a.task1.band, criteria: a.task1.criteria, wordCount: a.task1.wordCount },
          task2: { band: a.task2.band, criteria: a.task2.criteria, wordCount: a.task2.wordCount },
        };
        bands.push(a.band);
      }
      result.overall = overallBand(bands);
      if (extra.terminated) {
        result.terminated = true;
        result.terminationReason = extra.reason;
      }

      clearLocalProgress(user.uid, PROGRESS_KEY);
      await proctoringRef.current?.exitFullscreenIntentionally();
      try {
        const ref = await addDoc(collection(db, "ieltsResults"), { ...result, createdAt: serverTimestamp() });
        navigate(`/ielts/results/${ref.id}`, { state: { result: { id: ref.id, ...result } } });
      } catch (err) {
        console.error("IELTS natijasini saqlashda xatolik:", err);
        navigate("/ielts/results/local", { state: { result, saveError: true } });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, test, mode, PROGRESS_KEY]
  );

  const handleForceTerminate = (reason) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setTerminationReason(reason);
    setPhase("terminated");
    finishTest({ terminated: true, reason });
  };

  const proctoring = useProctoring({
    active: phase === "active" || phase === "intro",
    onForceTerminate: handleForceTerminate,
    maxWarnings: MAX_WARNINGS,
  });
  const proctoringRef = useRef(proctoring);
  proctoringRef.current = proctoring;

  // ---------------- Bo'limni yakunlash ----------------
  const submitSection = useCallback(() => {
    if (finishingRef.current) return;
    setModal(null);
    audio.stop();
    if (stateRef.current.sectionIdx < sections.length - 1) {
      setSectionIdx((i) => i + 1);
      setPartIdx(0);
      setCurrentQ(1);
      setPhase("intro");
      return;
    }
    finishingRef.current = true;
    finishTest();
  }, [audio, sections.length, finishTest]);

  // Taymer
  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase, sectionIdx]);

  useEffect(() => {
    if (phase === "active" && secondsLeft === 0) submitSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Listening: audio tugagach — 2 daqiqa tekshirish; audio part'i o'zgarsa ekran ham o'tadi.
  useEffect(() => {
    if (sectionKey !== "listening" || phase !== "active") return;
    if (audio.status === "done") setSecondsLeft((s) => Math.min(s, 120));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.status]);

  useEffect(() => {
    if (sectionKey !== "listening" || phase !== "active" || audio.status === "idle") return;
    setPartIdx(audio.partIndex);
    setCurrentQ(questionRange(test.listening.parts[audio.partIndex])[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.partIndex]);

  // ---------------- Boshlash / davom ettirish ----------------
  const handleRulesStart = async () => {
    const ok = await proctoring.requestFullscreen();
    if (!ok) return false;
    if (resumeSnapshot) {
      setSectionIdx(resumeSnapshot.sectionIdx ?? 0);
      setAnswers({ ...emptyAnswers(), ...resumeSnapshot.answers });
      setFlags(resumeSnapshot.flags || { listening: {}, reading: {} });
      setPartIdx(resumeSnapshot.partIdx ?? 0);
      resumeRef.current = resumeSnapshot;
    }
    setPhase("intro");
    return true;
  };

  const handleSectionStart = () => {
    const resume = resumeRef.current;
    resumeRef.current = null;
    const minutes = sectionKey === "listening" ? 40 : IELTS_SECTIONS[sectionKey].minutes;
    setSecondsLeft(resume?.secondsLeft ?? minutes * 60);
    finishingRef.current = false;
    const startPart = resume?.partIdx ?? 0;
    setPartIdx(startPart);
    setCurrentQ(navParts[startPart]?.questions[0] ?? 1);
    setPhase("active");
    if (sectionKey === "listening") audio.start(startPart);
  };

  const handleExitConfirm = async () => {
    setExiting(true);
    audio.stop();
    const s = stateRef.current;
    saveLocalProgress(
      user.uid,
      PROGRESS_KEY,
      { sectionIdx: s.sectionIdx, answers: s.answers, flags: s.flags, partIdx: s.partIdx, secondsLeft: s.secondsLeft },
      "paused"
    );
    await proctoring.exitFullscreenIntentionally();
    navigate("/ielts/tests");
  };

  // ---------------- Navigatsiya ----------------
  const focusQuestion = (n) => {
    setTimeout(() => {
      document.getElementById(`qwrap-${n}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      const el = document.getElementById(`q-${n}`);
      if (el && el.type !== "radio") el.focus({ preventScroll: true });
    }, 30);
  };

  const goToQ = (n) => {
    const p = navParts.findIndex((part) => part.questions.includes(n));
    if (p >= 0) setPartIdx(p);
    setCurrentQ(n);
    if (sectionKey !== "writing") focusQuestion(n);
  };

  const step = (dir) => {
    const i = allQs.indexOf(currentQ);
    const next = allQs[Math.min(allQs.length - 1, Math.max(0, i + dir))];
    if (next != null) goToQ(next);
  };

  const setAnswer = (n, v) => setAnswers((a) => ({ ...a, [sectionKey]: { ...a[sectionKey], [n]: v } }));
  const setWriting = (task, text) => setAnswers((a) => ({ ...a, writing: { ...a.writing, [task]: text } }));
  const toggleFlag = () =>
    setFlags((f) => ({ ...f, [sectionKey]: { ...f[sectionKey], [currentQ]: !f[sectionKey]?.[currentQ] } }));

  // Reading divider
  const splitRef = useRef(null);
  const startDrag = (e) => {
    e.preventDefault();
    const move = (ev) => {
      const box = splitRef.current?.getBoundingClientRect();
      if (!box) return;
      const pct = ((ev.clientX - box.left) / box.width) * 100;
      setLeftPct(Math.min(75, Math.max(25, pct)));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // ---------------- Render ----------------
  if (!test) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-[#1d1d1b]/60">
        Test topilmadi.
        <button onClick={() => navigate("/ielts/tests")} className="font-semibold text-[#087fd1]">
          Testlar ro'yxatiga qaytish
        </button>
      </div>
    );
  }
  if (loading || !user || phase === null) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Yuklanmoqda...</div>;
  }
  if (phase === "locked") {
    return (
      <TestLockedScreen
        pausedAt={pausedAt}
        onUnlocked={() => {
          const saved = loadLocalProgress(user.uid, PROGRESS_KEY);
          if (saved?.reason === "paused") setResumeSnapshot(saved.snapshot);
          setPhase("rules");
        }}
      />
    );
  }
  if (phase === "rules") return <RulesGate onStart={handleRulesStart} isResume={!!resumeSnapshot} />;
  if (phase === "terminated") return <TestTerminatedScreen reason={terminationReason} />;
  if (phase === "saving") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-[#1d1d1b]/60">
        <LuCircleCheck size={32} className="text-emerald-600" />
        Javoblaringiz baholanmoqda va saqlanmoqda...
      </div>
    );
  }
  if (phase === "intro") {
    return (
      <>
        <SectionIntro
          sectionKey={sectionKey}
          index={sectionIdx}
          total={sections.length}
          volume={volume}
          onVolume={setVolume}
          onStart={handleSectionStart}
          resumed={!!resumeRef.current}
        />
        <CheatWarningToast warning={proctoring.warning} maxWarnings={MAX_WARNINGS} />
      </>
    );
  }

  const unanswered = allQs.filter((n) => !isAnswered(n)).length;
  const sectionLabel = `${IELTS_SECTIONS[sectionKey].label}${sections.length > 1 ? ` · ${sectionIdx + 1}/${sections.length}` : ""}`;

  let body;
  if (sectionKey === "writing") {
    const taskKey = partIdx === 0 ? "task1" : "task2";
    const task = test.writing[taskKey];
    const text = answers.writing[taskKey];
    const wc = wordCount(text);
    body = (
      <>
        <div className="shrink-0 border-b border-[#d7d7d7] bg-[#f1f2f2] px-6 py-3">
          <p className="text-[15px] font-bold text-[#1d1d1b]">Part {partIdx + 1}</p>
          <p className="text-[13px] text-[#1d1d1b]/75">
            You should spend about {task.recommendedMinutes} minutes on this task. Write at least {task.minWords} words.
          </p>
        </div>
        <div ref={splitRef} className="flex min-h-0 flex-1">
          <div className="passage-scroll overflow-y-auto p-6 sm:p-8" style={{ width: `${leftPct}%` }}>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#1d1d1b]">{task.prompt}</p>
            {task.chart && (
              <div className="mt-5">
                <WritingChart chart={task.chart} />
              </div>
            )}
          </div>
          <div onMouseDown={startDrag} className="w-1.5 shrink-0 cursor-col-resize bg-[#d7d7d7] hover:bg-[#1d1d1b]/40" />
          <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-8">
            <textarea
              key={taskKey}
              value={text}
              onChange={(e) => setWriting(taskKey, e.target.value)}
              spellCheck={false}
              autoFocus
              className="min-h-0 w-full flex-1 resize-none rounded border border-[#1d1d1b]/30 p-4 text-[15px] leading-relaxed text-[#1d1d1b] outline-none focus:border-[#1d1d1b]"
              placeholder="Type your answer here..."
            />
            <p className={`mt-2 text-right text-[13px] font-semibold ${wc < task.minWords ? "text-[#1d1d1b]/60" : "text-emerald-700"}`}>
              Word count: {wc}
            </p>
          </div>
        </div>
      </>
    );
  } else {
    const part = test[sectionKey].parts[partIdx];
    const [from, to] = questionRange(part);
    const questionsPane = (
      <div className="passage-scroll min-w-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {part.groups.map((g, i) => (
          <QuestionGroup
            key={`${part.id}-${i}`}
            group={g}
            answers={answers[sectionKey]}
            onAnswer={setAnswer}
            currentQ={currentQ}
            onFocus={setCurrentQ}
          />
        ))}
      </div>
    );
    body = (
      <>
        <div className="shrink-0 border-b border-[#d7d7d7] bg-[#f1f2f2] px-6 py-3">
          <p className="text-[15px] font-bold text-[#1d1d1b]">{part.title}</p>
          <p className="text-[13px] text-[#1d1d1b]/75">
            {sectionKey === "listening" ? "Listen and answer" : "Read the text and answer"} questions {from}–{to}.
          </p>
        </div>

        {sectionKey === "listening" && (
          <div className="flex shrink-0 items-center gap-2 border-b border-[#d7d7d7] bg-white px-6 py-2 text-[13px] text-[#1d1d1b]/75">
            {audio.status === "unsupported" ? (
              <span className="text-red-600">Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi — Chrome yoki Edge'dan foydalaning.</span>
            ) : audio.status === "preparing" ? (
              <>
                <LuHourglass size={15} /> {test.listening.parts[audio.partIndex].title}: savollarni o'qib chiqing —{" "}
                <b className="tabular-nums">{audio.prepLeft}s</b>
              </>
            ) : audio.status === "playing" ? (
              <>
                <LuRadio size={15} className="animate-pulse text-[#e4002b]" /> Playing{" "}
                {test.listening.parts[audio.partIndex].title}
                {audio.speaker && <span className="text-[#1d1d1b]/45">· {audio.speaker}</span>}
              </>
            ) : audio.status === "done" ? (
              <>
                <LuCircleCheck size={15} className="text-emerald-600" /> Audio tugadi — javoblaringizni tekshiring.
              </>
            ) : (
              <span>Audio tayyorlanmoqda...</span>
            )}
          </div>
        )}

        {sectionKey === "reading" ? (
          <div ref={splitRef} className="flex min-h-0 flex-1">
            <div className="passage-scroll select-text overflow-y-auto px-6 py-6 sm:px-8" style={{ width: `${leftPct}%` }}>
              <h2 className="text-center font-display text-[20px] font-bold text-[#1d1d1b]">{part.passageTitle}</h2>
              <p className="mt-1 text-center text-[12px] italic text-[#1d1d1b]/55">{part.intro}</p>
              <div className="mt-5 space-y-4">
                {part.paragraphs.map((p) => (
                  <div key={p.label} className="flex gap-3">
                    <span className="w-4 shrink-0 pt-0.5 text-[15px] font-bold text-[#1d1d1b]">{p.label}</span>
                    <HighlightableText
                      text={p.text}
                      highlightKey={`r${part.id}-${p.label}`}
                      highlightLabel={`${part.passageTitle} · ${p.label}`}
                      className="text-[15px] leading-7 text-[#1d1d1b]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div onMouseDown={startDrag} className="w-1.5 shrink-0 cursor-col-resize bg-[#d7d7d7] hover:bg-[#1d1d1b]/40" />
            {questionsPane}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden">
            <div className="flex w-full max-w-3xl">{questionsPane}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <HighlightsProvider>
      <div className="flex h-screen flex-col bg-white">
        <IeltsHeader
          candidate={candidate}
          sectionLabel={sectionLabel}
          secondsLeft={secondsLeft}
          timerHidden={timerHidden}
          onToggleTimer={() => setTimerHidden((h) => !h)}
          onHelp={() => setModal("help")}
          onExit={() => setModal("exit")}
          volume={volume}
          onVolume={sectionKey === "listening" ? setVolume : null}
        />
        {body}
        <IeltsNavigator
          parts={navParts}
          activePart={partIdx}
          currentQ={sectionKey === "writing" ? partIdx + 1 : currentQ}
          isAnswered={isAnswered}
          isFlagged={isFlagged}
          onSelectPart={(i) => goToQ(navParts[i].questions[0])}
          onSelectQ={goToQ}
          onPrev={() => (sectionKey === "writing" ? setPartIdx(0) : step(-1))}
          onNext={() => (sectionKey === "writing" ? setPartIdx(1) : step(1))}
          onToggleFlag={toggleFlag}
          onSubmit={() => setModal("submit")}
          showReview={sectionKey !== "writing"}
        />
      </div>

      {modal === "help" && (
        <Modal title={`${IELTS_SECTIONS[sectionKey].label} — Help`} onClose={() => setModal(null)}>
          <ul className="list-disc space-y-1.5 pl-5">
            {SECTION_INSTRUCTIONS[sectionKey].map((t) => (
              <li key={t}>{t}</li>
            ))}
            {sectionKey !== "writing" && <li>Pastdagi raqamlar orqali istalgan savolga o'ting. "Review" — savolni keyin qaytish uchun belgilaydi.</li>}
          </ul>
        </Modal>
      )}

      {modal === "submit" && (
        <Modal
          title={`Submit ${IELTS_SECTIONS[sectionKey].label}?`}
          onClose={() => setModal(null)}
          actions={
            <>
              <button onClick={() => setModal(null)} className="h-10 rounded border border-[#1d1d1b]/25 px-4 text-[14px] font-semibold">
                Cancel
              </button>
              <button onClick={submitSection} className="h-10 rounded bg-[#1d1d1b] px-4 text-[14px] font-bold text-white">
                Submit
              </button>
            </>
          }
        >
          {unanswered > 0 ? (
            <p>
              Sizda <b>{unanswered}</b> ta javobsiz {sectionKey === "writing" ? "topshiriq" : "savol"} bor.
            </p>
          ) : (
            <p>Barcha savollarga javob berdingiz.</p>
          )}
          <p className="mt-2">Topshirgandan keyin bu bo'limga qaytib bo'lmaydi.</p>
          {sectionKey === "listening" && audio.status !== "done" && (
            <p className="mt-2 font-semibold text-[#e4002b]">Audio hali tugamagan!</p>
          )}
        </Modal>
      )}

      {modal === "exit" && (
        <ExitTestModal confirming={exiting} onCancel={() => setModal(null)} onConfirm={handleExitConfirm} />
      )}

      <CheatWarningToast warning={proctoring.warning} maxWarnings={MAX_WARNINGS} />
    </HighlightsProvider>
  );
}
