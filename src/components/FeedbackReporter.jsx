import { useCallback, useEffect, useRef, useState } from "react";
import { LuCamera, LuCheck, LuImagePlus, LuLoaderCircle, LuMessageSquareWarning, LuTrash2, LuX } from "react-icons/lu";
import { api } from "../api/client";
import { getLang, useI18n } from "../i18n";
import { compressImageToDataUrl } from "../utils/imageCompress";
import { getRecentLogs } from "../utils/errorLog";
import { Button } from "./ui";

// ------------------------------------------------------------------
// Shikoyat/taklif oynasi. Istalgan sahifada Ctrl+Shift+F (Mac: Cmd+Shift+F)
// → ko'rinib turgan ekran avtomatik screenshot qilinadi → oyna ochiladi.
// Boshqa joydan ochish (telefon: "Yana", Sozlamalar): openFeedback() —
// u holda screenshot olinmaydi (o'sha menyu sahifasining o'zi tushardi),
// foydalanuvchi rasm biriktira oladi. Server: server/src/routes/feedback.js.
// ------------------------------------------------------------------

const OPEN_EVENT = "pz:feedback";
const MAX_LEN = 2000;
// Base64 hajmi: server ≤900 KB rasm qabul qiladi (~1.2M belgi).
const MAX_DATA_URL = 1_150_000;

// eslint-disable-next-line react-refresh/only-export-components
export const openFeedback = () => window.dispatchEvent(new Event(OPEN_EVENT));

// <noscript> klonda matn bo'lib chiqib qoladi; skript/stil ko'rinmaydi.
const SKIP_TAGS = new Set(["NOSCRIPT", "SCRIPT", "TEMPLATE"]);

function isBlank(canvas) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  if (!w || !h) return true;
  const first = ctx.getImageData(0, 0, 1, 1).data.join();
  for (let y = 1; y < 8; y += 1) {
    for (let x = 1; x < 8; x += 1) {
      if (ctx.getImageData(Math.floor((w * x) / 8), Math.floor((h * y) / 8), 1, 1).data.join() !== first) return false;
    }
  }
  return true;
}

const isHotkey = (e) => (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.code === "KeyF";

async function captureViewport() {
  const { domToCanvas } = await import("modern-screenshot");
  const body = document.body;
  const rect = body.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Matn o'qiladigan darajada tiniq, lekin eni 1600px dan oshmaydi.
  const scale = Math.max(1, Math.min(window.devicePixelRatio || 1, 2, 1600 / vw));
  const options = {
    scale,
    timeout: 8000,
    maximumCanvasSize: 16384,
    backgroundColor: getComputedStyle(document.documentElement).backgroundColor || "#fff",
    filter: (node) =>
      !(node instanceof Element && (node.hasAttribute("data-feedback-ignore") || SKIP_TAGS.has(node.tagName))),
  };
  // Birinchi chaqiruvda brauzer SVG ichidagi rasm/shriftlarni hali tayyorlamagan
  // bo'lishi mumkin — natija bir xil rangli bo'sh rasm. Shunda qayta chiziladi.
  // Sahifa endigina ochilgan bo'lsa kirish animatsiyalari (opacity 0 → 1) hali
  // davom etadi va klon "ko'rinmas" bo'lib chiqadi — ularni oxiriga yetkazamiz.
  // Cheksiz animatsiyalar (spinner) tegilmaydi.
  for (const a of document.getAnimations?.() || []) {
    try {
      if (a.effect?.getComputedTiming?.().iterations !== Infinity) a.finish();
    } catch {
      /* ignore */
    }
  }
  let full = await domToCanvas(body, options);
  for (let i = 0; i < 2 && isBlank(full); i += 1) full = await domToCanvas(body, options);
  // Butun body chiziladi, keyin faqat ko'rinib turgan qism (viewport) kesib olinadi.
  const k = full.width / Math.max(rect.width, 1);
  const out = document.createElement("canvas");
  out.width = Math.round(vw * scale);
  out.height = Math.round(vh * scale);
  const ctx = out.getContext("2d");
  ctx.fillStyle = getComputedStyle(document.documentElement).backgroundColor || "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(full, -rect.left * k, -rect.top * k, vw * k, vh * k, 0, 0, out.width, out.height);
  let url = out.toDataURL("image/jpeg", 0.72);
  if (url.length > MAX_DATA_URL) url = out.toDataURL("image/jpeg", 0.5);
  return url.length > MAX_DATA_URL ? null : url;
}

function resolvedTheme() {
  const t = document.documentElement.dataset.theme;
  if (t === "dark" || t === "light") return t;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark (auto)" : "light (auto)";
}

export default function FeedbackReporter() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [shot, setShot] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");
  const pageRef = useRef("");
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const busyRef = useRef(false);

  const show = useCallback(async (withShot) => {
    if (busyRef.current) return;
    busyRef.current = true;
    pageRef.current = window.location.href;
    setMessage("");
    setError("");
    setStatus("idle");
    setShot(null);
    if (withShot) {
      setCapturing(true);
      try {
        setShot(await captureViewport());
      } catch (err) {
        console.warn("[feedback] screenshot olinmadi:", err);
      }
      setCapturing(false);
    }
    setOpen(true);
    busyRef.current = false;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!isHotkey(e)) return;
      e.preventDefault();
      e.stopPropagation();
      if (!open) show(true);
    };
    const onOpen = () => !open && show(false);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open, show]);

  const close = useCallback(() => {
    if (status === "sending") return;
    setOpen(false);
  }, [status]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => textRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  // "Rahmat" ko'rsatilgach oyna o'zi yopiladi.
  useEffect(() => {
    if (status !== "sent") return;
    const id = setTimeout(() => setOpen(false), 1800);
    return () => clearTimeout(id);
  }, [status]);

  const attach = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      let url = await compressImageToDataUrl(file, { maxWidth: 1600, quality: 0.72 });
      if (url.length > MAX_DATA_URL) url = await compressImageToDataUrl(file, { maxWidth: 1100, quality: 0.6 });
      setShot(url);
      setError("");
    } catch (err) {
      setError(err.message || t("common.error"));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length < 3 || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      await api.post("/feedback", {
        message: text,
        pageUrl: pageRef.current.slice(0, 500),
        viewport: `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio || 1}`,
        theme: resolvedTheme(),
        lang: getLang(),
        screenshot: shot,
        context: {
          logs: getRecentLogs(),
          version: document.querySelector('script[type="module"][src*="/assets/"]')?.getAttribute("src")?.slice(-40),
          referrer: document.referrer.slice(0, 500) || undefined,
        },
      });
      setStatus("sent");
    } catch (err) {
      setError(err.message || t("common.error"));
      setStatus("idle");
    }
  };

  return (
    <>
      {capturing && (
        <div
          data-feedback-ignore
          className="fixed left-1/2 top-4 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-on-ink shadow-lg"
          role="status"
        >
          <LuLoaderCircle size={15} className="animate-spin" /> {t("feedback.capturing")}
        </div>
      )}

      {open && (
        <div
          data-feedback-ignore
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
          onClick={close}
          // Test sahifasidagi tugma yorliqlari (A/B/C, strelkalar) yozish paytida ishlamasin.
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") close();
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="pz-shadow-lift flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[24px] bg-elevated text-ink"
          >
            {status === "sent" ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <LuCheck size={28} />
                </span>
                <h2 className="mt-4 font-display text-[22px] font-bold tracking-[-0.01em]">{t("feedback.thanksTitle")}</h2>
                <p className="mt-1.5 max-w-xs text-[15px] text-ink-2">{t("feedback.thanksText")}</p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 px-5 pb-3 pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <LuMessageSquareWarning size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id="feedback-title" className="font-display text-[17px] font-semibold tracking-[-0.01em]">
                      {t("feedback.title")}
                    </h2>
                    <p className="mt-0.5 text-[13px] leading-[18px] text-ink-2">{t("feedback.subtitle")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t("common.close")}
                    className="-mr-1 -mt-1 rounded-full p-2 text-ink-3 transition hover:bg-ink/[0.06] hover:text-ink"
                  >
                    <LuX size={18} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-2">
                  {shot ? (
                    <div className="relative overflow-hidden rounded-2xl border border-ink/[0.08] bg-fill">
                      <img src={shot} alt={t("feedback.screenshotAlt")} className="max-h-[38vh] w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setShot(null)}
                        className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur transition hover:bg-black/75"
                      >
                        <LuTrash2 size={13} /> {t("feedback.removeShot")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-fill/60 px-4 py-5 text-[14px] font-medium text-ink-2 transition hover:border-accent/50 hover:text-accent"
                    >
                      <LuImagePlus size={18} /> {t("feedback.attach")}
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={attach} />

                  <label className="block">
                    <span className="sr-only">{t("feedback.label")}</span>
                    <textarea
                      ref={textRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
                      }}
                      rows={4}
                      placeholder={t("feedback.placeholder")}
                      className="block w-full resize-none rounded-xl border border-ink/[0.12] bg-surface px-3.5 py-3 text-[16px] leading-6 text-ink outline-none transition placeholder:text-ink-3 hover:border-ink/25 focus:border-accent focus:ring-4 focus:ring-accent/15"
                    />
                  </label>
                  <div className="flex items-center justify-between text-[12px] text-ink-3">
                    <span className="inline-flex items-center gap-1.5">
                      <LuCamera size={13} /> {t("feedback.hint")}
                    </span>
                    <span className="tabular-nums">
                      {message.length}/{MAX_LEN}
                    </span>
                  </div>
                  {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-[13px] font-medium text-danger">{error}</p>}
                </div>

                <div className="flex justify-end gap-2 border-t border-ink/[0.06] px-5 py-4">
                  <Button type="button" variant="outline" onClick={close} disabled={status === "sending"}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={message.trim().length < 3 || status === "sending"}>
                    {status === "sending" && <LuLoaderCircle size={16} className="animate-spin" />}
                    {t("feedback.send")}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
