import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LuZap, LuTimer, LuHeart, LuCheck, LuX, LuArrowLeft, LuShare2, LuRotateCcw, LuInfinity } from "react-icons/lu";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Page, PageHeader, Card, Button, Badge, ListGroup } from "../components/ui";
import Avatar from "../components/Avatar";
import QuizCard from "../components/learn/QuizCard";
import { SoundToggle } from "../components/duel/DuelParts";
import { formatClock, useNow } from "../utils/duelClock";
import { RUSH_MODES } from "../data/duelModes";
import { play } from "../utils/duelSound";
import { drawRushCard } from "../utils/duelCard";
import { useI18n } from "../i18n";

// ------------------------------------------------------------------
// SAT Rush (/duel/rush) — yakka rejim, chess.com Puzzle Rush kabi.
// Server: /api/rush (vaqt, kalit va ball faqat serverda).
// Ekranlar: menyu → o'yin → yakun (rekord, XP, ulashish, reyting).
// ------------------------------------------------------------------

const MODE_ICONS = { rush3: LuZap, rush5: LuTimer, survival: LuInfinity };
const MAX_STRIKES = 3;

export default function Rush() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [run, setRun] = useState(null); // { runId, mode, question, endsAt, score, strikes }
  const [over, setOver] = useState(null); // { mode, finished, reason }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStats = () => api.get("/rush/me").then(setStats).catch(() => {});
  useEffect(() => {
    loadStats();
  }, []);

  const start = async (mode) => {
    setBusy(true);
    setError("");
    setOver(null);
    try {
      const r = await api.post("/rush/start", { mode });
      setRun({ ...r, offset: r.serverNow - Date.now() });
      play("start");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const end = (finished, reason) => {
    setOver({ mode: run.mode, finished, reason });
    setRun(null);
    play(finished?.newBest ? "win" : "lose");
    loadStats();
  };

  if (run) return <RushGame run={run} setRun={setRun} onEnd={end} t={t} />;

  return (
    <Page width="narrow">
      <Link to="/duel" className="mb-4 inline-flex items-center gap-1 text-[15px] font-medium text-accent">
        <LuArrowLeft size={16} /> SAT Duel
      </Link>
      <PageHeader eyebrow={t("duel.rush.eyebrow")} title={t("duel.rush.title")} subtitle={t("duel.rush.subtitle")} />

      {over && <RushOver over={over} t={t} onAgain={() => start(over.mode)} busy={busy} />}

      <div className="grid gap-3 sm:grid-cols-3">
        {RUSH_MODES.map((m) => {
          const Icon = MODE_ICONS[m];
          return (
            <Card key={m} className="flex flex-col p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Icon size={20} />
              </span>
              <h2 className="mt-4 font-display text-[17px] font-semibold text-ink">{t(`duel.rush.modes.${m}`)}</h2>
              <p className="mt-1 flex-1 text-[13px] text-ink-2">{t(`duel.rush.modeHint.${m}`)}</p>
              <p className="mt-3 text-[13px] font-semibold tabular-nums text-ink">{t("duel.rush.best", { n: stats?.[m]?.best ?? 0 })}</p>
              <Button className="mt-4" onClick={() => start(m)} disabled={busy}>
                {t("duel.rush.start")}
              </Button>
            </Card>
          );
        })}
      </div>
      {error && <p className="mt-4 text-[15px] font-medium text-danger">{error}</p>}
    </Page>
  );
}

function RushGame({ run, setRun, onEnd, t }) {
  const [pending, setPending] = useState(null);
  const [flash, setFlash] = useState(null);
  const flashTimer = useRef(null);
  const finishing = useRef(false);
  const lastTick = useRef(null);
  const timed = run.endsAt != null;
  const now = useNow(timed, 100) + run.offset;
  const left = timed ? Math.max(0, run.endsAt - now) : null;

  const finish = useCallback(
    async (reason) => {
      if (finishing.current) return;
      finishing.current = true;
      // Server soati biroz orqada bo'lishi mumkin — yakun kelguncha qayta so'raymiz.
      for (let i = 0; i < 6; i++) {
        try {
          const r = await api.post(`/rush/${run.runId}/finish`);
          if (r.finished) return onEnd(r.finished, reason);
        } catch {
          /* tarmoq — qayta urinamiz */
        }
        await new Promise((res) => setTimeout(res, 700));
      }
      onEnd({ score: run.score, strikes: run.strikes, xp: 0, best: null, newBest: false }, reason);
    },
    [run, onEnd]
  );

  useEffect(() => {
    if (!timed || left > 0) return;
    finish("time");
  }, [timed, left, finish]);

  useEffect(() => {
    if (!timed || left > 10_000 || left <= 0) return;
    const sec = Math.ceil(left / 1000);
    if (lastTick.current !== sec) {
      lastTick.current = sec;
      play("tick");
    }
  }, [timed, left]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const answer = async (choice) => {
    if (pending || finishing.current) return;
    setPending(choice);
    try {
      const r = await api.post(`/rush/${run.runId}/answer`, { choice });
      play(r.correct ? "correct" : "wrong");
      clearTimeout(flashTimer.current);
      setFlash({ correct: r.correct, answer: r.correctAnswer, key: Date.now() });
      flashTimer.current = setTimeout(() => setFlash(null), 1200);
      if (r.finished) {
        finishing.current = true;
        return onEnd(r.finished, r.strikes >= MAX_STRIKES ? "strikes" : "time");
      }
      setRun((cur) => ({ ...cur, question: r.question, score: r.score, strikes: r.strikes }));
    } catch {
      /* tarmoq xatosi — savol o'zgarmaydi */
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <header className="pz-material sticky top-0 z-30 border-b border-ink/[0.08]">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-ink-2">{t("duel.rush.score")}</p>
            <p key={run.score} className="pz-duel-pop font-display text-[28px] font-bold leading-8 tabular-nums text-ink">
              {run.score}
            </p>
          </div>
          <div className="flex items-center gap-1" aria-label={t("duel.rush.strikes")}>
            {Array.from({ length: MAX_STRIKES }, (_, i) => (
              <span
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full ${i < run.strikes ? "bg-danger text-white" : "bg-fill text-ink-3"}`}
              >
                {i < run.strikes ? <LuX size={15} strokeWidth={3} /> : <LuHeart size={14} />}
              </span>
            ))}
          </div>
          <span
            className={`rounded-lg px-2.5 py-1 font-display text-[20px] font-bold tabular-nums ${
              !timed ? "bg-fill text-ink-2" : left < 10_000 ? "bg-danger text-white" : "bg-ink text-on-ink"
            }`}
          >
            {timed ? formatClock(left) : "∞"}
          </span>
          <SoundToggle label={t("duel.sound")} />
          {!timed && (
            <button
              type="button"
              onClick={() => finish("stop")}
              className="h-8 rounded-full bg-fill px-3 text-[13px] font-medium text-ink-2 hover:text-ink"
            >
              {t("duel.rush.stop")}
            </button>
          )}
        </div>
      </header>
      <main className="relative mx-auto max-w-2xl px-4 pb-16 pt-5 sm:px-6">
        {flash && (
          <div
            key={flash.key}
            role="status"
            className={`pz-duel-flash pointer-events-none absolute inset-x-0 top-3 z-10 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold text-white shadow-lg ${
              flash.correct ? "bg-success" : "bg-danger"
            }`}
          >
            {flash.correct ? <LuCheck size={16} strokeWidth={3} /> : <LuX size={16} strokeWidth={3} />}
            {flash.correct ? t("duel.feedbackRight") : t("duel.feedbackWrong", { c: flash.answer })}
          </div>
        )}
        <QuizCard key={run.question.id} question={run.question} selected={pending} onSelect={answer} />
      </main>
    </div>
  );
}

function RushOver({ over, t, onAgain, busy }) {
  const { user } = useAuth();
  const f = over.finished;
  const [board, setBoard] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    api.get(`/rush/leaderboard?mode=${over.mode}`).then((l) => setBoard(l.slice(0, 10))).catch(() => setBoard([]));
  }, [over.mode]);

  const share = async () => {
    setSharing(true);
    try {
      const blob = await drawRushCard({
        score: f.score,
        modeLabel: t(`duel.rush.modes.${over.mode}`),
        best: f.best,
        newBest: f.newBest,
        challenge: t("duel.cardChallenge"),
        url: `${window.location.host}/duel/rush`,
      });
      const file = new File([blob], "prepzone-rush.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${t("duel.rush.cardTitle", { n: f.score })} ${window.location.origin}/duel/rush` });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }
    } catch {
      /* bekor qilindi */
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="pz-duel-rise mb-8">
      <Card className="overflow-hidden text-center">
        <div className={`px-6 pb-6 pt-8 ${f.newBest ? "bg-success/10" : "bg-fill/60"}`}>
          <p className="text-[13px] font-semibold text-ink-2">
            {t(`duel.rush.modes.${over.mode}`)} · {over.reason === "strikes" ? t("duel.rush.strikesOut") : over.reason === "time" ? t("duel.rush.timeUp") : t("duel.rush.over")}
          </p>
          <p className="mt-3 font-display text-[72px] font-bold leading-none tabular-nums text-ink">{f.score}</p>
          <h2 className="mt-3 font-display text-[22px] font-bold text-ink">{f.newBest ? t("duel.rush.newBest") : t("duel.rush.over")}</h2>
          {f.best != null && <p className="mt-1 text-[15px] text-ink-2">{t("duel.rush.yourBest", { n: f.best })}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-ink/[0.08] px-6 py-4">
          {f.xp > 0 && <Badge tone="amber">{t("duel.xpEarned", { n: f.xp })}</Badge>}
          {f.strikes > 0 && <Badge>{t("duel.mistakesNote")}</Badge>}
        </div>
      </Card>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button size="lg" onClick={onAgain} disabled={busy}>
          <LuRotateCcw size={18} /> {t("duel.rush.again")}
        </Button>
        <Button size="lg" variant="outline" onClick={share} disabled={sharing}>
          <LuShare2 size={18} /> {t("duel.share")}
        </Button>
      </div>

      {board?.length > 0 && (
        <>
          <h3 className="mb-3 mt-8 font-display text-[20px] font-semibold text-ink">{t("duel.rush.board")}</h3>
          <ListGroup className="divide-y divide-ink/[0.08]">
            {board.map((r, i) => (
              <div key={r.uid} className={`flex items-center gap-3 px-4 py-2.5 ${r.uid === user?.uid ? "bg-accent/[0.06]" : ""}`}>
                <span className="w-6 text-center font-display text-[15px] font-bold tabular-nums text-ink-3">{i + 1}</span>
                <Avatar name={r.name} src={r.avatarUrl} className="h-8 w-8 rounded-full bg-ink-3 text-[11px]" />
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{r.name}</span>
                <span className="font-display text-[17px] font-semibold tabular-nums text-ink">{r.best}</span>
              </div>
            ))}
          </ListGroup>
        </>
      )}
    </div>
  );
}
