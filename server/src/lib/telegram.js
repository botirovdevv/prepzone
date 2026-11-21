import { config } from "../config.js";

// ------------------------------------------------------------------
// Shikoyat/taklif xabarlarini Telegram bot orqali faqat bitta chat'ga
// (TELEGRAM_FEEDBACK_CHAT_ID) yuboradi. Xato bo'lsa so'rovni buzmaydi —
// shikoyat baribir bazada qoladi (scripts/feedback-log.js).
// ------------------------------------------------------------------

const CAPTION_MAX = 1024;
const MESSAGE_MAX = 4096;

export const telegramEnabled = () => Boolean(config.telegramBotToken && config.telegramFeedbackChatId);

export function escapeHtml(text = "") {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/${method}`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json().catch(() => null);
  if (!data?.ok) throw new Error(`Telegram ${method}: ${data?.description || res.status}`);
  return data;
}

function form(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

// HTML teglarini buzmasdan qisqartirish uchun matn oddiy qatorlarga bo'linadi.
function cut(html, max) {
  if (html.length <= max) return [html, ""];
  const at = html.lastIndexOf("\n", max);
  const i = at > max / 2 ? at : max;
  return [html.slice(0, i), html.slice(i)];
}

/** @param {{ html: string, photo?: { data: Buffer, mime: string } | null }} msg */
export async function sendFeedback({ html, photo }) {
  if (!telegramEnabled()) return false;
  const chat_id = config.telegramFeedbackChatId;
  let rest = html;
  if (photo) {
    const [caption, tail] = cut(html, CAPTION_MAX);
    const ext = photo.mime.split("/")[1] || "jpg";
    const fd = form({ chat_id, caption, parse_mode: "HTML" });
    fd.append("photo", new Blob([photo.data], { type: photo.mime }), `screenshot.${ext}`);
    await call("sendPhoto", fd);
    rest = tail;
  }
  while (rest.trim()) {
    const [part, tail] = cut(rest, MESSAGE_MAX);
    await call(
      "sendMessage",
      form({ chat_id, text: part, parse_mode: "HTML", disable_web_page_preview: "true" })
    );
    rest = tail;
  }
  return true;
}
