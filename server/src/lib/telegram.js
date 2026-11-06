import { config } from "../config.js";

// ------------------------------------------------------------------
// Telegram Bot API — kutubxonasiz, fetch orqali. Bot long polling bilan
// ishlaydi (lib/payBot.js), shuning uchun webhook/HTTPS sozlash shart emas.
// ------------------------------------------------------------------

export const botEnabled = () => !!config.telegramBotToken;

const api = (method) => `https://api.telegram.org/bot${config.telegramBotToken}/${method}`;

export async function tg(method, params = {}, { timeoutMs = 15_000 } = {}) {
  const res = await fetch(api(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => null);
  if (!data?.ok) {
    const err = new Error(`[telegram] ${method}: ${data?.description || res.status}`);
    err.status = data?.error_code || res.status;
    throw err;
  }
  return data.result;
}

// Xabar yuborish: xato bo'lsa (user botni bloklagan va h.k.) jim log.
export async function send(chatId, text, extra = {}) {
  if (!botEnabled() || !chatId) return null;
  try {
    return await tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });
  } catch (err) {
    console.warn(err.message);
    return null;
  }
}

export async function sendToAdmins(text, extra = {}) {
  await Promise.all(config.telegramAdminIds.map((id) => send(id, text, extra)));
}

// Chek (rasm yoki hujjat) ni adminlarga qayta yuborish.
export async function forwardReceiptToAdmins(payment, caption, extra = {}) {
  const method = payment.receipt_kind === "document" ? "sendDocument" : "sendPhoto";
  const field = payment.receipt_kind === "document" ? "document" : "photo";
  await Promise.all(
    config.telegramAdminIds.map(async (id) => {
      try {
        await tg(method, { chat_id: id, [field]: payment.receipt_file_id, caption, parse_mode: "HTML", ...extra });
      } catch (err) {
        console.warn(err.message);
        await send(id, caption, extra);
      }
    })
  );
}

// Fayl (chek) ni yuklab olish — admin panelda ko'rsatish uchun.
export async function downloadFile(fileId) {
  const file = await tg("getFile", { file_id: fileId });
  const res = await fetch(`https://api.telegram.org/file/bot${config.telegramBotToken}/${file.file_path}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`[telegram] file ${res.status}`);
  return { buffer: Buffer.from(await res.arrayBuffer()), path: file.file_path };
}

export const esc = (s) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

export const fmtSum = (n) => Number(n).toLocaleString("ru-RU").replace(/,/g, " ").replace(/ /g, " ");
