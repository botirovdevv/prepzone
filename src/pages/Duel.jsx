import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuSwords } from "react-icons/lu";
import { api } from "../api/client";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";
import { Button, Card, PageLoader } from "../components/ui";
import Avatar from "../components/Avatar";
import { useI18n } from "../i18n";
import { modeById } from "../data/duelModes";
import { play } from "../utils/duelSound";
import { CenterCard, ConfirmSheet, ScoreBar, Shell, TitleBadge, WaitingCard } from "../components/duel/DuelParts";
import { clockOf, useNow } from "../utils/duelClock";
import ChatPanel from "../components/duel/ChatPanel";
import ClockGame from "../components/duel/ClockGame";
import ClassicGame from "../components/duel/ClassicGame";
import ResultView from "../components/duel/ResultView";

// ------------------------------------------------------------------
// SAT Duel — jang ekrani (/duel/:code). To'liq ekran, sidebar'siz.
// Holat serverdan keladi (duel:state, har o'yinchiga alohida); vaqt server
// soati bo'yicha (serverNow orqali farq hisoblanadi).
//   classic → ClassicGame (sinxron raundlar)
//   bullet/blitz/rapid → ClockGame (har kimning o'z soati)
// Chat: ChatPanel (do'st bilan erkin matn, notanish bilan faqat iboralar).
// ------------------------------------------------------------------

export default function Duel() {
  const { code } = useParams();
  // Revanshda kod o'zgaradi — sahifa holati noldan boshlanadi.
  return <DuelGame key={code} code={String(code || "").toUpperCase()} />;
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
  const [chat, setChat] = useState([]);
  const [confirmResign, setConfirmResign] = useState(false);
  const [rematchSent, setRematchSent] = useState(false);
  const offset = useRef(0);
  const joinedRef = useRef(false);
  const prevStatus = useRef(null);

  const applyState = useCallback((s) => {
    offset.current = s.serverNow - Date.now();
    setState(s);
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
    getSocket().emit("duel:join", code, (res) => {
      if (!res?.ok) {
        setError(res?.reason === "full" ? t("duel.full") : t("duel.notFound"));
        return;
      }
      joinedRef.current = true;
      setJoined(true);
      applyState(res.state);
      setChat(res.chat || []);
    });
  }, [code, t, applyState]);

  // O'rinda o'tirgan bo'lsa (yaratgan yoki revansh/navbat) — darhol ulanamiz.
  useEffect(() => {
    if (info?.seated && !joinedRef.current) join();
  }, [info, join]);

  useEffect(() => {
    const s = getSocket();
    const onState = (st) => st.code === code && applyState(st);
    const onAnswered = ({ playerId }) => {
      if (playerId !== myId) play("move");
      setState((st) => st && { ...st, players: st.players.map((p) => (p.id === playerId ? { ...p, answered: true } : p)) });
    };
    const onMove = ({ playerId }) => playerId !== myId && play("move");
    const onChat = (m) => setChat((c) => (c.some((x) => x.id === m.id) ? c : [...c.slice(-49), m]));
    const onRematch = ({ code: next }) => navigate(`/duel/${next}`, { replace: true });
    const onConnect = () => joinedRef.current && join();
    s.on("duel:state", onState);
    s.on("duel:answered", onAnswered);
    s.on("duel:move", onMove);
    s.on("duel:chat", onChat);
    s.on("duel:rematch", onRematch);
    s.on("connect", onConnect);
    return () => {
      s.off("duel:state", onState);
      s.off("duel:answered", onAnswered);
      s.off("duel:move", onMove);
      s.off("duel:chat", onChat);
      s.off("duel:rematch", onRematch);
      s.off("connect", onConnect);
      if (joinedRef.current) s.emit("duel:leave", { forfeit: false });
    };
  }, [code, join, navigate, applyState, myId]);

  // O'yin boshlanishi — ovoz.
  useEffect(() => {
    if (!state) return;
    if (prevStatus.current === "countdown" && ["round", "playing"].includes(state.status)) play("start");
    prevStatus.current = state.status;
  }, [state]);

  const live = Boolean(state && ["countdown", "round", "playing"].includes(state.status));
  const now = useNow(live, state?.status === "playing" ? 100 : 200) + offset.current;

  const me = state?.players.find((p) => p.id === myId);
  const opp = state?.players.find((p) => p.id !== myId);

  const resign = () => {
    setConfirmResign(false);
    getSocket().emit("duel:resign", () => {});
  };

  const rematch = () => {
    setRematchSent(true);
    getSocket().emit("duel:rematch", () => {});
  };

  // ---------------- Ekranlar ----------------

  if (error) {
    return (
      <Shell>
        <CenterCard title={error} action={<Button className="mt-6" to="/duel">{t("duel.toLobby")}</Button>} />
      </Shell>
    );
  }

  if (!info) return <PageLoader fullscreen />;

  const infoMode = modeById(info.mode);

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
          <p className="mt-2 flex items-center justify-center gap-2 text-[15px] text-ink-2">
            {t(`duel.groups.${infoMode.group}`)} {infoMode.short} · {t(`duel.sections.${info.section}`)} · {t("duel.questionsN", { n: infoMode.total })}
          </p>
          {info.host.rating != null && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-ink-2">
              {info.host.name}: {info.host.rating} <TitleBadge rating={info.host.rating} />
            </p>
          )}
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
        <CenterCard title={t("duel.cancelled")} action={<Button className="mt-6" to="/duel">{t("duel.toLobby")}</Button>} />
      </Shell>
    );
  }

  const mode = modeById(state.mode);
  const clocked = mode.id !== "classic";
  const myClock = clocked ? clockOf(me, state, now) : null;
  const oppClock = clocked ? clockOf(opp, state, now) : null;
  const modeLine = `${t(`duel.groups.${mode.group}`)} ${mode.short} · ${t("duel.questionsN", { n: state.total })}`;
  const names = Object.fromEntries(state.players.map((p) => [p.id, p.name]));

  const header = (
    <ScoreBar
      me={me}
      opp={opp}
      t={t}
      total={state.total}
      clocks={clocked && state.status !== "waiting" ? [myClock, oppClock] : null}
      onResign={["countdown", "round", "reveal", "playing"].includes(state.status) ? () => setConfirmResign(true) : null}
      showAnswered={state.status === "round"}
    />
  );
  const aside = <ChatPanel messages={chat} myId={myId} names={names} chatMode={state.chatMode} t={t} />;
  const sheet = (
    <ConfirmSheet
      open={confirmResign}
      text={t("duel.resignConfirm")}
      cancel={t("duel.stay")}
      confirm={t("duel.resignYes")}
      onCancel={() => setConfirmResign(false)}
      onConfirm={resign}
    />
  );

  let body;
  if (state.status === "waiting") {
    body = <WaitingCard code={code} t={t} bot={state.bot} modeLine={modeLine} />;
  } else if (state.status === "finished") {
    body = <ResultView state={state} me={me} opp={opp} myId={myId} t={t} onRematch={rematch} rematchSent={rematchSent} />;
  } else if (state.status === "countdown") {
    const left = Math.max(1, Math.ceil((state.startsAt - now) / 1000));
    body = (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[13px] font-semibold text-ink-2">{modeLine}</p>
        <p className="mt-4 text-[17px] font-medium text-ink-2">{t("duel.getReady")}</p>
        <p key={left} className="pz-duel-pop mt-2 font-display text-[96px] font-bold leading-none tabular-nums text-ink">
          {left}
        </p>
        {clocked && <p className="mx-auto mt-6 max-w-sm text-[13px] text-ink-2">{t("duel.clockRules")}</p>}
      </div>
    );
  } else if (clocked) {
    body = <ClockGame state={state} me={me} opp={opp} myClock={myClock} oppClock={oppClock} t={t} />;
  } else {
    body = <ClassicGame key={code} state={state} myId={myId} opp={opp} now={now} t={t} />;
  }

  return (
    <Shell header={header} aside={aside}>
      {body}
      {sheet}
    </Shell>
  );
}
