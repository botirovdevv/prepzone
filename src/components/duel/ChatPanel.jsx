import { useEffect, useRef, useState } from "react";
import { LuMessageCircle, LuSend, LuX, LuEyeOff, LuEye } from "react-icons/lu";
import { getSocket } from "../../api/socket";
import { CHAT_EMOJIS, CHAT_PRESETS } from "../../data/duelModes";
import { play } from "../../utils/duelSound";

// ------------------------------------------------------------------
// SAT Duel chati. Kompyuterda o'ng tomonda panel, telefonda pastki tugma +
// bottom sheet (o'qilmaganlar soni bilan). chatMode: "text" — do'st bilan
// (erkin matn, serverda filtr), "preset" — faqat tayyor iboralar/emoji.
// Raqibni "mute" qilish — faqat klientda (uning xabarlari yashiriladi).
// ------------------------------------------------------------------

const cx = (...p) => p.filter(Boolean).join(" ");

function Messages({ messages, myId, names, t, muted }) {
  const endRef = useRef(null);
  const shown = muted ? messages.filter((m) => m.from === myId) : messages;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [shown.length]);
  if (!shown.length) {
    return <p className="px-2 py-6 text-center text-[13px] text-ink-2">{muted ? t("duel.muted") : t("duel.chatEmpty")}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {shown.map((m) => {
        const mine = m.from === myId;
        const body = m.preset ? t(`duel.presets.${m.preset}`) : m.text;
        const emojiOnly = m.preset && CHAT_EMOJIS[m.preset];
        return (
          <li key={m.id} className={cx("flex flex-col", mine ? "items-end" : "items-start")}>
            {!mine && <span className="mb-0.5 px-1 text-[11px] font-medium text-ink-3">{names[m.from] || ""}</span>}
            <span
              className={cx(
                "max-w-[85%] break-words rounded-2xl px-3 py-1.5",
                emojiOnly ? "text-[26px] leading-8" : "text-[15px] leading-5",
                emojiOnly ? "" : mine ? "bg-accent text-white" : "bg-fill text-ink"
              )}
            >
              {body}
            </span>
          </li>
        );
      })}
      <li ref={endRef} />
    </ul>
  );
}

function Composer({ chatMode, t, onError }) {
  const [text, setText] = useState("");
  const send = (payload) => {
    getSocket().emit("duel:chat", payload, (res) => {
      if (!res?.ok) onError(t(`duel.chatErrors.${res?.reason}`) || "");
      else onError("");
    });
  };
  const submit = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    send({ text: v });
    setText("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {CHAT_PRESETS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => send({ preset: id })}
            className="h-7 rounded-full bg-fill px-2.5 text-[12px] font-medium text-ink transition-colors hover:bg-ink/10"
          >
            {t(`duel.presets.${id}`)}
          </button>
        ))}
        {Object.entries(CHAT_EMOJIS).map(([id, e]) => (
          <button
            key={id}
            type="button"
            onClick={() => send({ preset: id })}
            aria-label={e}
            className="h-7 w-8 rounded-full bg-fill text-[15px] transition-colors hover:bg-ink/10"
          >
            {e}
          </button>
        ))}
      </div>
      {chatMode === "text" ? (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 140))}
            placeholder={t("duel.chatPlaceholder")}
            maxLength={140}
            className="h-10 min-w-0 flex-1 rounded-full bg-fill px-4 text-[16px] text-ink outline-none placeholder:text-ink-3 focus:ring-4 focus:ring-accent/15"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label={t("duel.chat")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40"
          >
            <LuSend size={16} />
          </button>
        </form>
      ) : (
        <p className="text-[12px] text-ink-3">{t("duel.chatPresetOnly")}</p>
      )}
    </div>
  );
}

export default function ChatPanel({ messages, myId, names, chatMode, t }) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [seen, setSeen] = useState(0);
  const lastRef = useRef(messages.length);

  // Raqibdan yangi xabar — yumshoq ovoz.
  useEffect(() => {
    const fresh = messages.slice(lastRef.current);
    lastRef.current = messages.length;
    if (!muted && fresh.some((m) => m.from !== myId)) play("move");
  }, [messages, myId, muted]);

  useEffect(() => {
    if (open) setSeen(messages.length);
  }, [open, messages.length]);

  const unread = muted ? 0 : messages.slice(seen).filter((m) => m.from !== myId).length;

  const header = (
    <div className="flex items-center justify-between gap-2 border-b border-ink/[0.08] px-4 py-3">
      <p className="text-[15px] font-semibold text-ink">{t("duel.chat")}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          aria-label={muted ? t("duel.unmute") : t("duel.mute")}
          title={muted ? t("duel.unmute") : t("duel.mute")}
          className={cx("flex h-8 w-8 items-center justify-center rounded-full", muted ? "bg-danger/10 text-danger" : "bg-fill text-ink-2 hover:text-ink")}
        >
          {muted ? <LuEyeOff size={15} /> : <LuEye size={15} />}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-ink-2 lg:hidden"
        >
          <LuX size={15} />
        </button>
      </div>
    </div>
  );

  const body = (
    <>
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <Messages messages={messages} myId={myId} names={names} t={t} muted={muted} />
      </div>
      <div className="border-t border-ink/[0.08] p-3">
        {error && <p className="mb-2 text-[12px] font-medium text-danger">{error}</p>}
        <Composer chatMode={chatMode} t={t} onError={setError} />
      </div>
    </>
  );

  return (
    <>
      {/* Kompyuter: yon panel */}
      <aside className="sticky top-[76px] hidden h-[calc(100dvh-100px)] flex-col overflow-hidden rounded-[20px] border border-ink/[0.06] bg-surface lg:flex">
        {body}
      </aside>

      {/* Telefon: tugma + bottom sheet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("duel.chat")}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-on-ink shadow-lg lg:hidden"
      >
        <LuMessageCircle size={22} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="flex h-[70dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-elevated" onClick={(e) => e.stopPropagation()}>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
