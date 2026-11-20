import { useEffect, useState } from "react";
import { formatClock } from "../../utils/duelClock";
import { Link } from "react-router-dom";
import { LuSwords, LuCheck, LuCopy, LuSend, LuBot, LuFlag, LuVolume2, LuVolumeX } from "react-icons/lu";
import { Button, Card, Spinner } from "../ui";
import Avatar from "../Avatar";
import { titleFor } from "../../utils/duelTitles";
import { isSoundOn, onSoundChange, setSoundOn } from "../../utils/duelSound";

// ------------------------------------------------------------------
// SAT Duel jang ekranining umumiy qismlari: sahifa qobig'i, o'yinchi
// paneli (soat bilan), unvon belgisi, ovoz tugmasi, tasdiqlash oynasi,
// kutish kartasi.
// ------------------------------------------------------------------

const cx = (...p) => p.filter(Boolean).join(" ");

export function TitleBadge({ rating, className = "inline-flex" }) {
  const t = titleFor(rating);
  if (!t) return null;
  return (
    <span className={cx("shrink-0 items-center rounded-full px-1.5 py-px text-[10px] font-semibold leading-4", t.tone, className)}>
      {t.label}
    </span>
  );
}

export function SoundToggle({ label }) {
  const [on, setOn] = useState(isSoundOn);
  useEffect(() => onSoundChange(setOn), []);
  return (
    <button
      type="button"
      onClick={() => setSoundOn(!on)}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill text-ink-2 hover:text-ink"
    >
      {on ? <LuVolume2 size={16} /> : <LuVolumeX size={16} />}
    </button>
  );
}

export function Shell({ header, aside, children }) {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      {header}
      <div className={cx("mx-auto px-4 pb-24 pt-5 sm:px-6", aside ? "max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6" : "max-w-2xl")}>
        <main className={aside ? "mx-auto w-full max-w-2xl" : ""}>{children}</main>
        {aside}
      </div>
    </div>
  );
}

function Marks({ total, marks = [], idx, align }) {
  return (
    <span className={cx("mt-1 flex gap-[3px]", align === "right" && "justify-end")}>
      {Array.from({ length: total }, (_, i) => {
        const m = marks[i];
        return (
          <span
            key={i}
            className={cx(
              "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
              m === true ? "bg-success" : m === false ? "bg-danger" : i === idx ? "bg-ink/40" : "bg-ink/[0.12]"
            )}
          />
        );
      })}
    </span>
  );
}

// p — server playerDoc; clockMs — hozirgi qolgan vaqt (soatli rejim) yoki null.
export function PlayerChip({ p, align = "left", label, showAnswered, clockMs, total }) {
  const right = align === "right";
  if (!p) {
    return (
      <div className={cx("flex min-w-0 flex-1 items-center gap-2.5", right && "flex-row-reverse text-right")}>
        <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-fill" />
        <span className="text-[13px] text-ink-3">…</span>
      </div>
    );
  }
  const clocked = clockMs != null;
  const low = clocked && p.running && clockMs < 10_000;
  return (
    <div className={cx("flex min-w-0 flex-1 items-center gap-2.5", right && "flex-row-reverse text-right")}>
      <span className="relative shrink-0">
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
        {!p.connected && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-warning ring-2 ring-surface" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cx("flex items-center gap-1.5 text-[13px] font-medium text-ink-2", right && "flex-row-reverse")}>
          <span className="truncate">{label || p.name}</span>
          {/* Telefonda joy tor — unvon faqat kengroq ekranda. */}
          <TitleBadge rating={p.rating} className="hidden sm:inline-flex" />
        </p>
        {clocked ? (
          <Marks total={total} marks={p.marks} idx={p.done ? -1 : p.idx} align={align} />
        ) : (
          <p className="font-display text-[22px] font-bold leading-[26px] tabular-nums text-ink">{p.score}</p>
        )}
      </div>
      {clocked && (
        <span
          className={cx(
            "shrink-0 rounded-lg px-2 py-1 font-display text-[17px] font-bold tabular-nums transition-colors sm:px-2.5 sm:text-[20px]",
            p.flagged ? "bg-danger/10 text-danger" : low ? "bg-danger text-white" : p.running ? "bg-ink text-on-ink" : "bg-fill text-ink-2"
          )}
        >
          {formatClock(clockMs)}
        </span>
      )}
    </div>
  );
}

export function ScoreBar({ me, opp, t, onResign, showAnswered, clocks, total }) {
  return (
    <header className="pz-material sticky top-0 z-30 border-b border-ink/[0.08]">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
        <PlayerChip p={me} label={t("duel.you")} showAnswered={showAnswered} clockMs={clocks?.[0]} total={total} />
        <LuSwords size={18} className="hidden shrink-0 text-danger sm:block" />
        <PlayerChip p={opp} align="right" showAnswered={showAnswered} clockMs={clocks?.[1]} total={total} />
        <div className="ml-1 flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <SoundToggle label={t("duel.sound")} />
          {onResign && (
            <button
              type="button"
              onClick={onResign}
              aria-label={t("duel.resign")}
              title={t("duel.resign")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-ink-2 hover:text-danger"
            >
              <LuFlag size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function ConfirmSheet({ open, text, cancel, confirm, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-[28px] bg-elevated p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-[17px] font-semibold text-ink">{text}</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CenterCard({ title, action }) {
  return (
    <Card className="mx-auto mt-16 max-w-md p-8 text-center">
      <p className="font-display text-[20px] font-semibold text-ink">{title}</p>
      {action}
    </Card>
  );
}

export function WaitingCard({ code, t, bot, modeLine }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/duel/${code}`;
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
  const tg = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t("duel.shareText"))}`;
  return (
    <Card className="mt-6 p-6 text-center sm:p-8">
      <div className="flex justify-center">
        <Spinner />
      </div>
      <h1 className="mt-5 font-display text-[22px] font-bold tracking-[-0.01em] text-ink">{t("duel.waitingTitle")}</h1>
      {modeLine && <p className="mt-1 text-[13px] font-semibold text-ink-2">{modeLine}</p>}
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-2">{t("duel.waitingText")}</p>
      <div className="mx-auto mt-6 flex max-w-sm items-center gap-2 rounded-xl bg-fill px-4 py-3">
        <span className="min-w-0 flex-1 truncate text-left font-mono text-[13px] text-ink">{link}</span>
        <button type="button" onClick={copy} aria-label={t("duel.copy")} className="shrink-0 text-accent">
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
