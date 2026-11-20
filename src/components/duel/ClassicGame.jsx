import { useEffect, useRef, useState } from "react";
import { LuWifiOff } from "react-icons/lu";
import { getSocket } from "../../api/socket";
import { Badge } from "../ui";
import QuizCard from "../learn/QuizCard";
import { play } from "../../utils/duelSound";

// ------------------------------------------------------------------
// Klassik rejim: ikkalasi bir savolda, 90 s. Raund ikkalasi javob bergach
// yoki vaqt tugagach yopiladi, keyin to'g'ri javob ko'rsatiladi.
// ------------------------------------------------------------------

export default function ClassicGame({ state, myId, opp, now, t }) {
  const [choices, setChoices] = useState({}); // round -> choice
  const revealed = useRef(-1);

  const reveal = state.status === "reveal" ? state.reveal : null;
  const myReveal = reveal?.answers.find((a) => a.playerId === myId);
  const oppReveal = reveal?.answers.find((a) => a.playerId !== myId);

  // Raund yopilganda — ovoz.
  useEffect(() => {
    if (!reveal || revealed.current === reveal.round) return;
    revealed.current = reveal.round;
    play(myReveal?.correct ? "correct" : "wrong");
  }, [reveal, myReveal]);

  const answer = (choice) => {
    if (state.status !== "round" || choices[state.round]) return;
    const round = state.round;
    setChoices((c) => ({ ...c, [round]: choice }));
    getSocket().emit("duel:answer", { round, choice }, (res) => {
      if (!res?.ok && res?.reason !== "already") setChoices((c) => ({ ...c, [round]: undefined }));
    });
  };

  const q = state.question;
  const mine = choices[state.round] ?? state.myChoice ?? myReveal?.choice ?? null;
  const remaining = Math.max(0, state.deadline - now);
  const pct = state.status === "round" ? (remaining / state.roundMs) * 100 : 0;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{t("duel.question", { n: state.round + 1, total: state.total })}</p>
        {state.status === "round" ? (
          <p className={`font-display text-[17px] font-semibold tabular-nums ${remaining < 15_000 ? "text-danger" : "text-ink"}`}>
            {Math.ceil(remaining / 1000)}s
          </p>
        ) : (
          <Badge tone={myReveal?.correct ? "emerald" : "red"}>
            {myReveal?.correct
              ? `${t("duel.correct")} ${t("duel.points", { n: myReveal.points })}`
              : myReveal?.choice
              ? t("duel.wrong")
              : t("duel.noAnswer")}
          </Badge>
        )}
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-fill">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-linear ${remaining < 15_000 ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {opp && !opp.connected && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-[13px] font-medium text-warning">
          <LuWifiOff size={16} /> {t("duel.reconnecting")}
        </p>
      )}

      {q && (
        <QuizCard question={q} selected={mine} onSelect={answer} reveal={Boolean(reveal)} correctAnswer={reveal?.correctAnswer}>
          {reveal && oppReveal && (
            <p className="mt-4 text-[13px] text-ink-2">
              {opp?.name}: {oppReveal.choice ? `${oppReveal.choice} · ` : ""}
              {oppReveal.correct
                ? `${t("duel.correct")} ${t("duel.points", { n: oppReveal.points })}`
                : oppReveal.choice
                ? t("duel.wrong")
                : t("duel.noAnswer")}
            </p>
          )}
        </QuizCard>
      )}

      {state.status === "round" && mine && <p className="mt-4 text-center text-[15px] text-ink-2">{t("duel.waitingOpponent")}</p>}
    </>
  );
}
