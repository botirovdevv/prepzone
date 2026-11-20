import { useEffect, useRef, useState } from "react";
import { LuCheck, LuX, LuSkipForward } from "react-icons/lu";
import { getSocket } from "../../api/socket";
import { Card } from "../ui";
import QuizCard from "../learn/QuizCard";
import { formatClock } from "../../utils/duelClock";
import { play } from "../../utils/duelSound";

// ------------------------------------------------------------------
// Soatli rejim (Bullet / Blitz / Rapid): har kim o'z tezligida. Javob
// darhol yuboriladi, natija qisqa "flash" bilan ko'rsatiladi (keyingi savol
// shu zahoti ochiladi — soat kutmaydi). Tugatgan o'yinchi raqibni kutadi.
// ------------------------------------------------------------------

export default function ClockGame({ state, me, opp, myClock, oppClock, t }) {
  const [pending, setPending] = useState(null); // { index, choice }
  const [flash, setFlash] = useState(null); // { correct, skipped, answer, key }
  const flashTimer = useRef(null);
  const lastTick = useRef(null);

  const idx = me?.idx ?? 0;
  const q = state.question;

  // Kam vaqt — har soniya "tiq".
  useEffect(() => {
    if (!me?.running || myClock == null || myClock > 10_000) return;
    const sec = Math.ceil(myClock / 1000);
    if (lastTick.current !== sec) {
      lastTick.current = sec;
      play("tick");
    }
  }, [myClock, me?.running]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const send = (choice) => {
    if (!q || pending || !me?.running) return;
    setPending({ index: idx, choice });
    getSocket().emit("duel:answer", { round: idx, choice }, (res) => {
      setPending(null);
      if (!res?.ok) return;
      play(res.correct ? "correct" : "wrong");
      clearTimeout(flashTimer.current);
      setFlash({ correct: res.correct, skipped: choice === null, answer: res.correctAnswer, key: `${idx}-${Date.now()}` });
      flashTimer.current = setTimeout(() => setFlash(null), 1300);
    });
  };

  // Tugatdim — raqibni kutyapman.
  if (me?.done) {
    return (
      <Card className="mt-4 p-8 text-center">
        <p className="text-[44px] leading-none">{me.flagged ? "⏰" : "🏁"}</p>
        <h2 className="mt-3 font-display text-[22px] font-bold text-ink">{me.flagged ? t("duel.flagged") : t("duel.youFinished")}</h2>
        <p className="mt-1 text-[15px] text-ink-2">
          {t("duel.correctCount", { n: me.correct, total: state.total })}
          {!me.flagged && ` · ${t("duel.timeLeft", { t: formatClock(me.clockMs) })}`}
        </p>
        {opp && !opp.done && (
          <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-fill/70 p-4">
            <p className="text-[13px] font-medium text-ink-2">{t("duel.oppStill")}</p>
            <p className="mt-1 font-display text-[28px] font-bold tabular-nums text-ink">{formatClock(oppClock ?? 0)}</p>
            <p className="text-[13px] text-ink-2">
              {opp.idx}/{state.total} · ✓ {opp.correct}
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{t("duel.question", { n: idx + 1, total: state.total })}</p>
        <button
          type="button"
          onClick={() => send(null)}
          disabled={Boolean(pending)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fill px-3 text-[13px] font-medium text-ink-2 hover:text-ink disabled:opacity-40"
        >
          <LuSkipForward size={14} /> {t("duel.skip")}
        </button>
      </div>

      {/* Natija flash'i (bloklamaydi) */}
      <div className="relative">
        {flash && (
          <div
            key={flash.key}
            role="status"
            className={`pz-duel-flash pointer-events-none absolute inset-x-0 -top-1 z-10 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold text-white shadow-lg ${
              flash.correct ? "bg-success" : "bg-danger"
            }`}
          >
            {flash.correct ? <LuCheck size={16} strokeWidth={3} /> : <LuX size={16} strokeWidth={3} />}
            {flash.correct
              ? t("duel.feedbackRight")
              : flash.skipped
              ? t("duel.feedbackSkip", { c: flash.answer })
              : t("duel.feedbackWrong", { c: flash.answer })}
          </div>
        )}
        {q && (
          <QuizCard key={idx} question={q} selected={pending?.index === idx ? pending.choice : null} onSelect={send} />
        )}
      </div>
    </div>
  );
}
