import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LuShare2, LuRotateCcw } from "react-icons/lu";
import { Button, Card, Badge } from "../ui";
import QuizCard from "../learn/QuizCard";
import { drawDuelCard } from "../../utils/duelCard";
import { promoted } from "../../utils/duelTitles";
import { play } from "../../utils/duelSound";
import { modeById } from "../../data/duelModes";
import { formatClock } from "../../utils/duelClock";

// ------------------------------------------------------------------
// Jang yakuni: g'olib, hisob, reyting (+ yangi unvon), XP, revansh,
// ulashish kartasi va savollarni ko'rib chiqish (har savolga ketgan vaqt).
// ------------------------------------------------------------------

export default function ResultView({ state, me, opp, myId, t, onRematch, rematchSent }) {
  const r = state.result;
  const mode = modeById(state.mode);
  const clocked = mode.id !== "classic";
  const [showReview, setShowReview] = useState(false);
  const [sharing, setSharing] = useState(false);
  const played = useRef(false);
  const mine = r.players.find((p) => p.id === myId);
  const theirs = r.players.find((p) => p.id !== myId);
  const myIdx = r.players.findIndex((p) => p.id === myId);
  const oppIdx = 1 - myIdx;
  const outcome = r.winner == null ? "draw" : r.winner === myId ? "win" : "loss";
  const title = outcome === "win" ? t("duel.youWon") : outcome === "loss" ? t("duel.youLost") : t("duel.itsDraw");
  const oppWantsRematch = opp && state.rematch.includes(opp.id) && !state.rematch.includes(myId);
  const newTitle = mine?.rating ? promoted(mine.rating.before, mine.rating.after) : null;
  const modeName = `${t(`duel.groups.${mode.group}`)} ${mode.short}`;

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    play(outcome === "win" ? "win" : outcome === "loss" ? "lose" : "move");
  }, [outcome]);

  const share = async () => {
    setSharing(true);
    try {
      const blob = await drawDuelCard({
        outcome,
        title,
        subtitle: modeName,
        me: { name: me?.name || "", score: clocked ? `${mine?.correct ?? 0}/${state.total}` : mine?.score ?? 0 },
        opp: { name: opp?.name || "", score: clocked ? `${theirs?.correct ?? 0}/${state.total}` : theirs?.score ?? 0 },
        rating: mine?.rating?.after ?? null,
        challenge: t("duel.cardChallenge"),
        url: `${window.location.host}/duel`,
      });
      const file = new File([blob], "prepzone-duel.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${t("duel.shareText")} ${window.location.origin}/duel` });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }
    } catch {
      /* foydalanuvchi bekor qildi */
    } finally {
      setSharing(false);
    }
  };

  const sideLine = (p) =>
    clocked
      ? `${t("duel.correctCount", { n: p?.correct ?? 0, total: state.total })} · ${p?.flagged ? t("duel.flagged") : formatClock(p?.clockMs ?? 0)}`
      : t("duel.correctCount", { n: p?.correct ?? 0, total: state.total });

  return (
    <div className="pz-duel-rise">
      <Card className="mt-2 overflow-hidden text-center">
        <div className={`px-6 pb-6 pt-8 ${outcome === "win" ? "bg-success/10" : outcome === "loss" ? "bg-danger/[0.06]" : "bg-fill/60"}`}>
          <p className="text-[13px] font-semibold text-ink-2">{modeName}</p>
          <p className="mt-2 text-[44px] leading-none">{outcome === "win" ? "🏆" : outcome === "loss" ? "💪" : "🤝"}</p>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-[34px] tracking-[-0.015em] text-ink">{title}</h1>
          {r.forfeitBy && (
            <p className="mt-1 text-[15px] text-ink-2">{r.forfeitBy === myId ? t("duel.forfeitLoss") : t("duel.forfeitWin")}</p>
          )}
          <p className="mt-4 font-display text-[48px] font-bold leading-none tabular-nums text-ink">
            {clocked ? mine?.correct ?? 0 : mine?.score ?? 0} <span className="text-ink-3">:</span> {clocked ? theirs?.correct ?? 0 : theirs?.score ?? 0}
          </p>
          <div className="mx-auto mt-3 grid max-w-sm grid-cols-2 gap-2 text-[13px] text-ink-2">
            <span className="truncate">
              <b className="font-semibold text-ink">{t("duel.you")}</b> · {sideLine(mine)}
            </span>
            <span className="truncate">
              <b className="font-semibold text-ink">{opp?.name}</b> · {sideLine(theirs)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-ink/[0.08] px-6 py-4">
          {mine?.rating ? (
            <Badge tone={mine.rating.delta >= 0 ? "emerald" : "red"}>
              {t("duel.ratingDelta", { before: mine.rating.before, after: mine.rating.after })} ({mine.rating.delta >= 0 ? "+" : ""}
              {mine.rating.delta})
            </Badge>
          ) : (
            <Badge>{t("duel.unrated")}</Badge>
          )}
          {mine?.xp > 0 && <Badge tone="amber">{t("duel.xpEarned", { n: mine.xp })}</Badge>}
        </div>
        {newTitle && (
          <div className="pz-duel-rise border-t border-ink/[0.08] px-6 py-4">
            <span className={`inline-flex items-center rounded-full px-4 py-2 text-[17px] font-bold ${newTitle.tone}`}>
              🎖 {t("duel.newTitle", { title: newTitle.label })}
            </span>
          </div>
        )}
      </Card>

      {oppWantsRematch && (
        <p className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-center text-[15px] font-semibold text-accent">{t("duel.rematchOffer")}</p>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Button size="lg" onClick={onRematch} disabled={rematchSent || !opp}>
          <LuRotateCcw size={18} /> {rematchSent && !state.bot ? t("duel.rematchWaiting") : t("duel.rematch")}
        </Button>
        <Button size="lg" variant="outline" onClick={share} disabled={sharing}>
          <LuShare2 size={18} /> {t("duel.share")}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px]">
        <button type="button" className="font-medium text-accent" onClick={() => setShowReview((v) => !v)}>
          {t("duel.review")}
        </button>
        <Link to="/duel" className="font-medium text-accent">
          {t("duel.toLobby")}
        </Link>
      </div>
      {/* Xatolar faqat XP berilganda saqlanadi (taslim bo'lganda — yo'q). */}
      {mine?.xp > 0 && (mine?.correct ?? 0) < r.questions.length && <p className="mt-3 text-center text-[13px] text-ink-2">{t("duel.mistakesNote")}</p>}

      {showReview && (
        <div className="mt-6 space-y-4">
          {r.questions.map((q, i) => {
            const myMs = r.times?.[myIdx]?.[i];
            const oppMs = r.times?.[oppIdx]?.[i];
            const oppChoice = r.answers[oppIdx]?.[i];
            return (
              <QuizCard key={q.id} question={q} number={i + 1} selected={r.answers[myIdx]?.[i] ?? null} reveal>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
                  <span>
                    {t("duel.you")}: {r.answers[myIdx]?.[i] ?? "—"}
                    {myMs != null && ` · ${t("duel.reviewTime", { s: (myMs / 1000).toFixed(1) })}`}
                  </span>
                  <span>
                    {opp?.name}: {oppChoice ?? "—"}
                    {oppMs != null && ` · ${t("duel.reviewTime", { s: (oppMs / 1000).toFixed(1) })}`}
                  </span>
                </div>
              </QuizCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
