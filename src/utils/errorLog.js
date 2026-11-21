// ------------------------------------------------------------------
// Brauzerdagi xatolar logi.
//   1. Oxirgi 20 ta yozuv (JS xato, console.error, muvaffaqiyatsiz API
//      so'rovi) xotirada turadi — shikoyat oynasi ularni o'zi qo'shib
//      yuboradi (getRecentLogs).
//   2. Tutilmagan JS xatolar avtomatik /api/feedback/errors ga boradi
//      (serverda guruhlanadi, o'qish: server/scripts/feedback-log.js).
// main.jsx'da eng birinchi bo'lib o'rnatiladi.
// ------------------------------------------------------------------
// api/client.js bilan bir xil (u bu fayldan import qiladi — aylanma import bo'lmasin).
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const MAX_LOGS = 20;
const MAX_SENT_PER_PAGE = 10;
const logs = [];
const sentKeys = new Set();
let queue = [];
let timer = null;
let sentCount = 0;

// Kengaytmalar, brauzerning o'z shovqini va tarmoq uzilishlari — bizning xato emas.
const IGNORE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /chrome-extension:|moz-extension:|safari-(web-)?extension:/i,
  /Failed to fetch$|NetworkError when attempting|Load failed$|network-error/i,
  /AbortError|The operation was aborted/i,
];

function text(value) {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function addLog(kind, message) {
  logs.push({ kind, message: String(message).slice(0, 600), at: Date.now() });
  if (logs.length > MAX_LOGS) logs.shift();
}

export const getRecentLogs = () => logs.slice();

function flush(useBeacon = false) {
  clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const body = JSON.stringify({ errors: queue.splice(0, 10) });
  const url = `${API_URL}/api/feedback/errors`;
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(url, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  } catch {
    /* log yuborilmasa — jim */
  }
}

function report(error, fallbackMessage) {
  const message = (error instanceof Error ? `${error.name}: ${error.message}` : text(error ?? fallbackMessage)).slice(0, 1000);
  const stack = String(error?.stack || "").slice(0, 4000);
  addLog("error", message);
  if (!message || IGNORE.some((re) => re.test(message) || re.test(stack))) return;
  const key = `${message}|${stack.split("\n")[1] || ""}`;
  if (sentKeys.has(key) || sentCount >= MAX_SENT_PER_PAGE) return;
  sentKeys.add(key);
  sentCount += 1;
  queue.push({ message, stack, pageUrl: location.href.slice(0, 500) });
  if (!timer) timer = setTimeout(flush, 3000);
}

export function reportError(error) {
  report(error, "Unknown error");
}

let installed = false;
export function installErrorLog() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    // Rasm/skript yuklanmasa ham "error" keladi (e.error bo'lmaydi).
    if (!e.error && e.target && e.target !== window) {
      addLog("resource", `${e.target.tagName} ${e.target.src || e.target.href || ""}`);
      return;
    }
    report(e.error, e.message);
  }, true);

  window.addEventListener("unhandledrejection", (e) => report(e.reason, "Unhandled promise rejection"));

  // console.error — faqat logga (serverga emas): React ogohlantirishlari ham shu yerga tushadi.
  const original = console.error;
  console.error = (...args) => {
    addLog("console", args.map(text).join(" "));
    original.apply(console, args);
  };

  window.addEventListener("pagehide", () => flush(true));
}
