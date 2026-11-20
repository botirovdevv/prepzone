import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LuBookOpen,
  LuCheck,
  LuClock,
  LuLayers,
  LuRotateCcw,
  LuArrowLeft,
  LuArrowRight,
  LuTrophy,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { VOCAB_SETS, ALL_WORDS } from "../data/vocabulary";
import {
  loadVocabProgress,
  saveVocabProgress,
  gradeWord,
  isDue,
  isMastered,
} from "../utils/vocabProgress";
import { Page, PageHeader, Card, StatTile, Badge, Button } from "../components/ui";
import { useI18n } from "../i18n";

// ---------------- Flashcard ----------------
function Flashcard({ word, flipped, onFlip }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onFlip}
      className="block w-full [perspective:1200px] focus:outline-none"
      aria-label={flipped ? t("vocab.showWord") : t("vocab.showDefinition")}
    >
      <div
        className="relative h-[300px] w-full transition-transform duration-500 [transform-style:preserve-3d] sm:h-[320px]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Old tomon */}
        <Card className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center [backface-visibility:hidden]">
          <Badge tone="blue">{word.pos}</Badge>
          <p className="mt-4 font-display text-[34px] font-bold tracking-[-0.02em] text-ink sm:text-[42px]">
            {word.word}
          </p>
          <p className="mt-6 text-[13px] text-ink/40">{t("vocab.reveal")}</p>
        </Card>

        {/* Orqa tomon */}
        <Card className="absolute inset-0 flex flex-col justify-center px-6 text-left [backface-visibility:hidden] [transform:rotateY(180deg)] sm:px-10">
          <div className="flex items-center gap-2">
            <p className="font-display text-[22px] font-bold text-ink">{word.word}</p>
            <Badge tone="blue">{word.pos}</Badge>
          </div>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/85">{word.definition}</p>
          <p className="mt-2 text-[14px] font-semibold text-accent">🇺🇿 {word.uz}</p>
          <p className="mt-5 border-l-2 border-accent/30 pl-3 text-[14px] italic leading-relaxed text-ink/60">
            {word.example}
          </p>
        </Card>
      </div>
    </button>
  );
}

// ---------------- Mashq sessiyasi ----------------
function StudySession({ title, words, onGrade, onExit }) {
  const { t } = useI18n();
  const [queue] = useState(words);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState([]);
  const [knownCount, setKnownCount] = useState(0);

  const done = index >= queue.length;
  const current = queue[index];

  const grade = useCallback(
    (known) => {
      if (!current) return;
      onGrade(current.id, known);
      if (known) setKnownCount((c) => c + 1);
      else setMissed((m) => [...m, current]);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [current, onGrade]
  );

  useEffect(() => {
    if (done) return;
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        grade(true);
      } else if (e.key === "ArrowLeft") {
        grade(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, grade]);

  if (done) {
    return (
      <Card className="px-6 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <LuTrophy size={26} />
        </span>
        <p className="mt-4 font-display text-[24px] font-bold text-ink">{t("vocab.complete")}</p>
        <p className="mt-1 text-sm text-ink/55">{t("vocab.knew", { known: knownCount, total: queue.length })}</p>
        {missed.length > 0 && (
          <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-1.5">
            {missed.map((w) => (
              <Badge key={w.id} tone="amber">
                {w.word}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Button onClick={onExit}>{t("vocab.backToSets")}</Button>
        </div>
      </Card>
    );
  }

  const percent = Math.round((index / queue.length) * 100);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <LuArrowLeft size={15} /> {t("vocab.back")}
        </Button>
        <p className="truncate text-sm font-semibold text-ink/60">{title}</p>
        <p className="text-sm font-bold tabular-nums text-ink">
          {index + 1} / {queue.length}
        </p>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
        <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>

      <Flashcard word={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={() => grade(false)}>
          <LuRotateCcw size={17} /> {t("vocab.stillLearning")}
        </Button>
        <Button size="lg" onClick={() => grade(true)}>
          <LuCheck size={17} /> {t("vocab.know")}
        </Button>
      </div>
      <p className="mt-4 hidden text-center text-xs text-ink/40 sm:block">
        {t("vocab.shortcuts")}
      </p>
    </div>
  );
}

// ---------------- Sahifa ----------------
export default function Vocabulary() {
  const { user } = useAuth();
  const { t } = useI18n();
  const uid = user?.uid || "guest";
  const [progress, setProgress] = useState(() => loadVocabProgress(uid));
  const [session, setSession] = useState(null); // { key, title, words }

  const handleGrade = useCallback(
    (wordId, known) => {
      setProgress((prev) => {
        const next = gradeWord(prev, wordId, known);
        saveVocabProgress(uid, next);
        return next;
      });
    },
    [uid]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    let mastered = 0;
    const due = [];
    for (const w of ALL_WORDS) {
      if (isMastered(progress[w.id])) mastered += 1;
      if (isDue(progress[w.id], now)) due.push(w);
    }
    return { mastered, due };
  }, [progress]);

  const startSet = (set) => {
    // Avval o'zlashtirilmagan so'zlar; hammasi o'zlashtirilgan bo'lsa — butun set.
    const pending = set.words.filter((w) => !isMastered(progress[w.id]));
    setSession({
      key: `${set.id}-${Date.now()}`,
      title: set.title,
      words: pending.length > 0 ? pending : set.words,
    });
  };

  const startDue = () =>
    setSession({ key: `due-${Date.now()}`, title: t("vocab.dueTitle"), words: stats.due });

  if (session) {
    return (
      <Page width="form">
        <StudySession
          key={session.key}
          title={session.title}
          words={session.words}
          onGrade={handleGrade}
          onExit={() => setSession(null)}
        />
      </Page>
    );
  }

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={t("vocab.eyebrow")}
        icon={LuBookOpen}
        title={t("vocab.title")}
        subtitle={t("vocab.subtitle")}
        actions={
          <Button onClick={startDue} disabled={stats.due.length === 0}>
            <LuClock size={16} /> {t("vocab.reviewDue", { n: stats.due.length })}
          </Button>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <StatTile icon={LuTrophy} tone="emerald" label={t("vocab.mastered")} value={stats.mastered} />
        <StatTile icon={LuClock} tone="amber" label={t("vocab.dueToday")} value={stats.due.length} />
        <StatTile icon={LuLayers} label={t("vocab.totalWords")} value={ALL_WORDS.length} />
      </div>
      <p className="mb-8 text-[13px] text-ink/45">{t("vocab.localNote")}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {VOCAB_SETS.map((set) => {
          const learned = set.words.filter((w) => isMastered(progress[w.id])).length;
          const seen = set.words.filter((w) => progress[w.id]).length;
          const pct = Math.round((learned / set.words.length) * 100);
          return (
            <Card
              key={set.id}
              as="button"
              type="button"
              interactive
              onClick={() => startSet(set)}
              className="group p-5 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-[16px] font-bold text-ink">{set.title}</h3>
                  <p className="mt-0.5 text-[13px] text-ink/45">
                    {t("vocab.setMeta", { n: set.words.length, seen })}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink/25 transition group-hover:bg-accent group-hover:text-white">
                  <LuArrowRight size={17} />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[12px] font-bold tabular-nums text-ink/55">
                  {learned}/{set.words.length}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
