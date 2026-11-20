import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuSwords, LuX, LuCopy, LuCheck, LuSend, LuShare2, LuRotateCcw, LuWifiOff, LuBot } from "react-icons/lu";
import { api } from "../api/client";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";
import { Button, Card, PageLoader, Spinner, Badge } from "../components/ui";
import Avatar from "../components/Avatar";
import QuizCard from "../components/learn/QuizCard";
import { useI18n } from "../i18n";
import { drawDuelCard } from "../utils/duelCard";

// ------------------------------------------------------------------
// SAT Duel — jang ekrani (/duel/:code). To'liq ekran, sidebar'siz.
// Holat serverdan keladi (duel:state); vaqt server soati bo'yicha
// (serverNow orqali farq hisoblanadi). Kalit faqat raund yopilganda keladi.
// ------------------------------------------------------------------

export default function Duel() {
  const { code } = useParams();
  // Revanshda kod o'zgaradi — sahifa holati noldan boshlanadi.
  return <DuelGame key={code} code={String(code || "").toUpperCase()} />;
}

function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function DuelGame({ code }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const myId = String(user?.uid ?? "");

  const [info, setInfo] = useState(null); // REST: taklif ma'lumoti
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [state, setState] = useState(null);
  const [choices, setChoices] = useState({}); // round -> choice
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [rematchSent, setRematchSent] = useState(false);
  const offset = useRef(0);
  const joinedRef = useRef(false);

  const applyState = useCallback((s) => {
    offset.current = s.serverNow - Date.now();
    setState(s);
    if (s.myChoice != null && s.round >= 0) setChoices((c) => ({ ...c, [s.round]: s.myChoice }));
  }, []);

  useEffect(() => {
    api
      .get(`/duel/${code}`)
      .then((r) => {
        setInfo(r);
        if (!r.open) setError(t("duel.full"));
      })
      .catch(() => setError(t("duel.notFound")));
  }, [code, t]);

  const join = useCallback(() => {
    const s = getSocket();
    s.emit("duel:join", code, (res) => {
      if (!res?.ok) {
        setError(res?.reason === "full" ? t("duel.full") : t("duel.notFound"));
        return;
      }
      joinedRef.current = true;
      setJoined(true);
      applyState(res.state);
    });
  }, [code, t, applyState]);

  // O'rinda o'tirgan bo'lsa (yaratgan yoki revansh/navbat) — darhol ulanamiz.
  useEffect(() => {
    if (info?.seated && !joinedRef.current) join();
  }, [info, join]);

  useEffect(() => {
    const s = getSocket();
    const onState = (st) => st.code === code && applyState(st);
    const onAnswered = ({ playerId }) =>
      setState((st) => st && { ...st, players: st.players.map((p) => (p.id === playerId ? { ...p, answered: true } : p)) });
    const onRematch = ({ code: next }) => navigate(`/duel/${next}`, { replace: true });
    const onConnect = () => joinedRef.current && join();
    s.on("duel:state", onState);
    s.on("duel:answered", onAnswered);
    s.on("duel:rematch", onRematch);
    s.on("connect", onConnect);
    return () => {
      s.off("duel:state", onState);
      s.off("duel:answered", onAnswered);
      s.off("duel:rematch", onRematch);
      s.off("connect", onConnect);
      if (joinedRef.current) s.emit("duel:leave", { forfeit: false });
    };
  }, [code, join, navigate, applyState]);

  const live = state && ["countdown", "round"].includes(state.status);
  const now = useNow(Boolean(live)) + offset.current;

  const me = state?.players.find((p) => p.id === myId);
  const opp = state?.players.find((p) => p.id !== myId);

  const answer = (choice) => {
    if (!state || state.status !== "round" || choices[state.round]) return;
    const round = state.round;
    setChoices((c) => ({ ...c, [round]: choice }));
    getSocket().emit("duel:answer", { round, choice }, (res) => {
      if (!res?.ok && res?.reason !== "already") setChoices((c) => ({ ...c, [round]: undefined }));
    });
  };

  const leave = () => {
    getSocket().emit("duel:leave", { forfeit: true });
    joinedRef.current = false;
    navigate("/duel");
  };

  const rematch = () => {
    setRematchSent(true);
    getSocket().emit("duel:rematch", () => {});
  };

  const leaveDialog = () => {
    if (!confirmLeave) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setConfirmLeave(false)}>
        <div className="w-full max-w-sm rounded-[28px] bg-elevated p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-[17px] font-semibold text-ink">{t("duel.leaveConfirm")}</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>
              {t("duel.stay")}
            </Button>
            <Button variant="danger" onClick={leave}>
              {t("duel.leaveYes")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- Ekranlar ----------------

  if (error) {
    return (
      <Shell>
        <Card className="mx-auto mt-16 max-w-md p-8 text-center">
          <p className="font-display text-[20px] font-semibold text-ink">{error}</p>
          <Button className="mt-6" to="/duel">
            {t("duel.toLobby")}
          </Button>
        </Card>
      </Shell>
    );
  }

  if (!info) return <PageLoader fullscreen />;

  // Taklif: hali o'rinda emas.
  if (!joined && !info.seated) {
    return (
      <Shell>
        <Card className="mx-auto mt-10 max-w-md p-8 text-center sm:mt-16">
          <div className="flex items-center justify-center gap-4">
            <Avatar name={info.host.name} src={info.host.avatarUrl} className="h-16 w-16 rounded-full bg-accent text-lg" />
            <LuSwords size={28} className="text-danger" />
            <Avatar user={user} className="h-16 w-16 rounded-full bg-ink-3 text-lg" />
          </div>
          <h1 className="mt-6 font-display text-[22px] font-bold leading-[28px] tracking-[-0.01em] text-ink">
            {t("duel.invitedBy", { name: info.host.name })}
          </h1>
          <p className="mt-2 text-[15px] text-ink-2">
            {t("duel.inviteSection", { section: t(`duel.sections.${info.section}`) })}
          </p>
          <Button size="lg" className="mt-7 w-full" onClick={join}>
            <LuSwords size={18} /> {t("duel.accept")}
          </Button>
        </Card>
      </Shell>
    );
  }

  if (!state) return <PageLoader fullscreen />;

  if (state.status === "cancelled") {
    return (
      <Shell>
        <Card className="mx-auto mt-16 max-w-md p-8 text-center">
          <p className="font-display text-[20px] font-semibold text-ink">{t("duel.cancelled")}</p>
          <Button className="mt-6" to="/duel">
            {t("duel.toLobby")}
          </Button>
        </Card>
      </Shell>
    );
  }

  const header = (
    <ScoreBar
      me={me}
      opp={opp}
      t={t}
      onLeave={live || state.status === "reveal" ? () => setConfirmLeave(true) : null}
      showAnswered={state.status === "round"}
    />
  );

  if (state.status === "waiting") {
    return (
      <Shell header={header}>
        <WaitingCard code={code} t={t} bot={state.bot} />
      </Shell>
    );
  }

  if (state.status === "finished") {
    return (
      <Shell header={header}>
        <ResultView state={state} me={me} opp={opp} myId={myId} t={t} onRematch={rematch} rematchSent={rematchSent} />
      </Shell>
    );
  }

  if (state.status === "countdown") {
    const left = Math.max(1, Math.ceil((state.startsAt - now) / 1000));
    return (
      <Shell header={header}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[17px] font-medium text-ink-2">{t("duel.getReady")}</p>
          <p key={left} className="pz-duel-pop mt-2 font-display text-[96px] font-bold leading-none tabular-nums text-ink">
            {left}
          </p>
        </div>
        {leaveDialog()}
      </Shell>
    );
  }

  // round | reveal
  const q = state.question;
  const reveal = state.status === "reveal" ? state.reveal : null;
  const mine = choices[state.round] ?? reveal?.answers.find((a) => a.playerId === myId)?.choice ?? null;
  const remaining = Math.max(0, state.deadline - now);
  const pct = state.status === "round" ? (remaining / state.roundMs) * 100 : 0;
  const myReveal = reveal?.answers.find((a) => a.playerId === myId);
  const oppReveal = reveal?.answers.find((a) => a.playerId !== myId);

  return (
    <Shell header={header}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">
          {t("duel.question", { n: state.round + 1, total: state.total })}
        </p>
        {state.status === "round" ? (
          <p className={`font-display text-[17px] font-semibold tabular-nums ${remaining < 15_000 ? "text-danger" : "text-ink"}`}>
            {Math.ceil(remaining / 1000)}s
          </p>
        ) : (
          <Badge tone={myReveal?.correct ? "emerald" : "red"}>
            {myReveal?.correct ? `${t("duel.correct")} ${t("duel.points", { n: myReveal.points })}` : myReveal?.choice ? t("duel.wrong") : t("duel.noAnswer")}
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
        <QuizCard
          question={q}
          selected={mine}
          onSelect={answer}
          reveal={Boolean(reveal)}
          correctAnswer={reveal?.correctAnswer}
        >
          {reveal && oppReveal && (
            <p className="mt-4 text-[13px] text-ink-2">
              {opp?.name}: {oppReveal.choice ? `${oppReveal.choice} · ` : ""}
              {oppReveal.correct ? `${t("duel.correct")} ${t("duel.points", { n: oppReveal.points })}` : oppReveal.choice ? t("duel.wrong") : t("duel.noAnswer")}
            </p>
          )}
        </QuizCard>
      )}

      {state.status === "round" && mine && (
        <p className="mt-4 text-center text-[15px] text-ink-2">{t("duel.waitingOpponent")}</p>
      )}
      {leaveDialog()}
    </Shell>
  );
}

// ---------------- Qismlar ----------------

function Shell({ header, children }) {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      {header}
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-5 sm:px-6">{children}</main>
    </div>
  );
}

function PlayerChip({ p, align = "left", label, showAnswered }) {
  if (!p) {
    return (
      <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
        <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-fill" />
        <span className="text-[13px] text-ink-3">…</span>
      </div>
    );
  }
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <span className="relative">
        {p.bot ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple text-white">
            <LuBot size={20} />
          </span>
        ) : (
          <Avatar name={p.name} src={p.avatarUrl} className="h-10 w-10 rounded-full bg-ink-3 text-xs" />
        )}
        {showAnswered && p.answered && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success text-white ring-2 ring-surface">
            <LuCheck size={10} strokeWidth={3} />
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-ink-2">{label || p.name}</p>
        <p className="font-display text-[22px] font-bold leading-[26px] tabular-nums text-ink">{p.score}</p>
      </div>
    </div>
  );
}

function ScoreBar({ me, opp, t, onLeave, showAnswered }) {
  return (
    <header className="pz-material sticky top-0 z-30 border-b border-ink/[0.08]">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
        <PlayerChip p={me} label={t("duel.you")} showAnswered={showAnswered} />
        <LuSwords size={20} className="shrink-0 text-danger" />
        <PlayerChip p={opp} align="right" showAnswered={showAnswered} />
        {onLeave && (
          <button
            type="button"
            onClick={onLeave}
            aria-label={t("duel.leave")}
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill text-ink-2 hover:text-ink"
          >
            <LuX size={16} />
          </button>
        )}
      </div>
    </header>
  );
}

function WaitingCard({ code, t, bot }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/duel/${code}`;
  const text = t("duel.shareText");
  if (bot) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard ruxsati yo'q */
    }
  };
  const tg = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
  return (
    <Card className="mt-6 p-6 text-center sm:p-8">
      <div className="flex justify-center">
        <Spinner />
      </div>
      <h1 className="mt-5 font-display text-[22px] font-bold tracking-[-0.01em] text-ink">{t("duel.waitingTitle")}</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-2">{t("duel.waitingText")}</p>
      <div className="mx-auto mt-6 flex max-w-sm items-center gap-2 rounded-xl bg-fill px-4 py-3">
        <span className="min-w-0 flex-1 truncate text-left font-mono text-[13px] text-ink">{link}</span>
        <button type="button" onClick={copy} className="shrink-0 text-[13px] font-semibold text-accent">
          {copied ? <LuCheck size={16} /> : <LuCopy size={16} />}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={() => window.open(tg, "_blank", "noopener")}>
          <LuSend size={16} /> {t("duel.shareTelegram")}
        </Button>
        <Button variant="outline" onClick={copy}>
          {copied ? t("duel.copied") : t("duel.copy")}
        </Button>
      </div>
      <Link to="/duel" className="mt-6 inline-block text-[15px] font-medium text-accent">
        {t("duel.toLobby")}
      </Link>
    </Card>
  );
}

function ResultView({ state, me, opp, myId, t, onRematch, rematchSent }) {
  const r = state.result;
  const [showReview, setShowReview] = useState(false);
  const [sharing, setSharing] = useState(false);
  const mine = r.players.find((p) => p.id === myId);
  const theirs = r.players.find((p) => p.id !== myId);
  const myIdx = r.players.findIndex((p) => p.id === myId);
  const outcome = r.winner == null ? "draw" : r.winner === myId ? "win" : "loss";
  const title = outcome === "win" ? t("duel.youWon") : outcome === "loss" ? t("duel.youLost") : t("duel.itsDraw");
  const oppWantsRematch = opp && state.rematch.includes(opp.id) && !state.rematch.includes(myId);

  const share = async () => {
    setSharing(true);
    try {
      const blob = await drawDuelCard({
        outcome,
        title,
        me: { name: me?.name || "", score: mine?.score ?? 0 },
        opp: { name: opp?.name || "", score: theirs?.score ?? 0 },
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

  return (
    <div>
      <Card className="mt-2 overflow-hidden text-center">
        <div className={`px-6 pb-6 pt-8 ${outcome === "win" ? "bg-success/10" : outcome === "loss" ? "bg-danger/[0.06]" : "bg-fill/60"}`}>
          <p className="text-[44px] leading-none">{outcome === "win" ? "🏆" : outcome === "loss" ? "💪" : "🤝"}</p>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-[34px] tracking-[-0.015em] text-ink">{title}</h1>
          {r.forfeitBy && (
            <p className="mt-1 text-[15px] text-ink-2">{r.forfeitBy === myId ? t("duel.forfeitLoss") : t("duel.forfeitWin")}</p>
          )}
          <p className="mt-4 font-display text-[48px] font-bold leading-none tabular-nums text-ink">
            {mine?.score ?? 0} <span className="text-ink-3">:</span> {theirs?.score ?? 0}
          </p>
          <p className="mt-2 text-[13px] text-ink-2">
            {t("duel.correctCount", { n: mine?.correct ?? 0 })} · {opp?.name} {t("duel.correctCount", { n: theirs?.correct ?? 0 })}
          </p>
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
      {(mine?.correct ?? 0) < r.questions.length && (
        <p className="mt-3 text-center text-[13px] text-ink-2">{t("duel.mistakesNote")}</p>
      )}

      {showReview && (
        <div className="mt-6 space-y-4">
          {r.questions.map((q, i) => (
            <QuizCard key={q.id} question={q} number={i + 1} selected={r.answers[myIdx]?.[i] ?? null} reveal />
          ))}
        </div>
      )}
    </div>
  );
}
