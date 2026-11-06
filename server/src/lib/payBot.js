import { config } from "../config.js";
import { one, query } from "../db/index.js";
import { botEnabled, esc, fmtSum, send, tg } from "./telegram.js";
import { OPEN, PLAN_NAMES, adminButtons, approvePayment, onReceipt, rejectPayment } from "./payments.js";

// ------------------------------------------------------------------
// To'lov boti (long polling). Bitta API jarayoni ishlaydi — ikkinchi nusxa
// (masalan lokal dev bir xil token bilan) 409 Conflict oladi.
//
//   /start pay_<id>  → karta raqami + aniq summa
//   rasm / hujjat    → chek sifatida qabul qilinadi
//   /id              → chat ID (TELEGRAM_ADMIN_IDS sozlash uchun)
//   /pending (admin) → tekshirilmagan cheklar
// ------------------------------------------------------------------

const isAdmin = (id) => config.telegramAdminIds.includes(String(id));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fmtCard = (n) => n.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

async function handleStart(msg, payload) {
  const chatId = msg.chat.id;
  const m = /^pay_([a-z0-9]{6,20})$/.exec(payload || "");
  if (!m) {
    return send(
      chatId,
      `👋 <b>PrepZone to'lov boti</b>\n\nTarif tanlash: ${config.publicUrl}/pricing\n` +
        `Saytda "To'lash" tugmasini bossangiz, shu yerga qaytasiz va to'lov ma'lumotlarini olasiz.`
    );
  }
  const p = await one("SELECT * FROM payments WHERE id = $1", [m[1]]);
  if (!p) return send(chatId, "To'lov topilmadi. Saytdan qaytadan boshlang.");
  if (p.status === "approved") return send(chatId, "✅ Bu to'lov allaqachon tasdiqlangan.");
  if (!OPEN.includes(p.status)) return send(chatId, `⌛ Bu to'lov yopilgan. Qaytadan boshlang: ${config.publicUrl}/pricing`);

  await query("UPDATE payments SET tg_chat_id = $2 WHERE id = $1", [p.id, chatId]);
  await query("UPDATE users SET telegram_chat_id = $2 WHERE id = $1", [p.user_id, chatId]);

  if (p.status === "receipt_sent") return send(chatId, "🧾 Chekingiz qabul qilingan, tekshirilmoqda.");

  const until = new Date(p.expires_at).toLocaleTimeString("ru-RU", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit" });
  await send(
    chatId,
    `💳 <b>${PLAN_NAMES[p.plan]}</b> — ${p.months} oy\n\n` +
      `1️⃣ Quyidagi kartaga <b>aynan shu summani</b> o'tkazing:\n\n` +
      `Summa: <code>${p.amount}</code> so'm  (<b>${fmtSum(p.amount)}</b>)\n` +
      `Karta: <code>${fmtCard(config.payCardNumber)}</code>\n` +
      (config.payCardHolder ? `Egasi: <b>${esc(config.payCardHolder)}</b>\n` : "") +
      `\n⚠️ Summaning oxirgi raqamlari (${String(p.amount).slice(-3)}) to'lovingizni aniqlash uchun — ` +
      `yaxlitlamang, aynan <b>${fmtSum(p.amount)}</b> so'm yuboring.\n\n` +
      `2️⃣ To'lovdan keyin <b>chek skrinshotini</b> shu yerga yuboring.\n\n` +
      `⏱ ${until} gacha amal qiladi. Tekshiruv odatda 1–5 daqiqa.`,
    { reply_markup: { inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: `cancel:${p.id}` }]] } }
  );
}

async function handleReceipt(msg) {
  const chatId = msg.chat.id;
  const p = await one(
    "SELECT * FROM payments WHERE tg_chat_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
    [chatId]
  );
  if (!p) {
    const sent = await one("SELECT 1 FROM payments WHERE tg_chat_id = $1 AND status = 'receipt_sent' LIMIT 1", [chatId]);
    return send(chatId, sent ? "🧾 Chekingiz allaqachon tekshirilmoqda." : `Avval saytda tarif tanlang: ${config.publicUrl}/pricing`);
  }
  const doc = msg.document;
  if (doc && !/^(image\/|application\/pdf)/.test(doc.mime_type || "")) {
    return send(chatId, "Chekni rasm (skrinshot) yoki PDF ko'rinishida yuboring.");
  }
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : doc.file_id;
  const kind = msg.photo ? "photo" : "document";
  const updated = await one(
    `UPDATE payments SET status = 'receipt_sent', receipt_file_id = $2, receipt_kind = $3, receipt_at = to_timestamp($4)
     WHERE id = $1 AND status = 'pending' RETURNING id`,
    [p.id, fileId, kind, msg.date]
  );
  if (!updated) return;
  const done = await onReceipt(p.id);
  if (!done) await send(chatId, "🧾 Chek qabul qilindi! Kartaga tushgan pulni tekshiryapmiz — odatda 1–5 daqiqa. Natijani shu yerga yozamiz.");
}

async function handleCallback(cb) {
  const [action, id] = String(cb.data || "").split(":");
  const answer = (text) => tg("answerCallbackQuery", { callback_query_id: cb.id, text }).catch(() => {});

  if (action === "cancel") {
    const p = await one(
      "UPDATE payments SET status = 'expired' WHERE id = $1 AND tg_chat_id = $2 AND status = 'pending' RETURNING id",
      [id, cb.message?.chat?.id]
    );
    await answer(p ? "Bekor qilindi" : "Bekor qilib bo'lmaydi");
    if (p) await send(cb.message.chat.id, "To'lov bekor qilindi.");
    return;
  }

  if (action !== "ok" && action !== "no") return answer("");
  if (!isAdmin(cb.from.id)) return answer("Ruxsat yo'q");
  const by = `tg:${cb.from.id}`;
  let label;
  if (action === "ok") {
    const out = await approvePayment(id, { decidedBy: by });
    label = out ? "✅ Tasdiqlandi" : "Allaqachon tasdiqlangan";
  } else {
    const p = await rejectPayment(id, { decidedBy: by });
    label = p ? "❌ Rad etildi" : "O'zgartirib bo'lmaydi";
  }
  await answer(label);
  // Tugmalarni olib, natijani yozib qo'yamiz.
  if (cb.message) {
    await tg("editMessageReplyMarkup", {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: [[{ text: `${label} — ${cb.from.first_name || ""}`, callback_data: "noop" }]] },
    }).catch(() => {});
  }
}

async function handlePending(msg) {
  const { rows } = await query(
    `SELECT p.*, u.email FROM payments p JOIN users u ON u.id = p.user_id
     WHERE p.status = 'receipt_sent' ORDER BY p.receipt_at LIMIT 10`
  );
  if (!rows.length) return send(msg.chat.id, "Tekshirilmagan chek yo'q ✨");
  for (const p of rows) {
    await send(
      msg.chat.id,
      `🧾 ${esc(p.email)} — ${PLAN_NAMES[p.plan]} ${p.months} oy — <b>${fmtSum(p.amount)} so'm</b>\nID: <code>${p.id}</code>`,
      adminButtons(p.id)
    );
  }
}

async function handleUpdate(u) {
  if (u.callback_query) return handleCallback(u.callback_query);
  const msg = u.message;
  if (!msg || msg.chat?.type !== "private") return;
  const text = msg.text || "";
  if (text.startsWith("/start")) return handleStart(msg, text.split(/\s+/)[1]);
  if (text === "/id") return send(msg.chat.id, `Sizning Telegram ID: <code>${msg.from.id}</code>`);
  if (text === "/pending" && isAdmin(msg.from.id)) return handlePending(msg);
  if (msg.photo || msg.document) return handleReceipt(msg);
  if (text && !isAdmin(msg.from.id)) {
    // Savol/e'tiroz — adminlarga yetkazamiz.
    const who = msg.from.username ? `@${msg.from.username}` : esc(msg.from.first_name || "");
    for (const id of config.telegramAdminIds) {
      await send(id, `💬 ${who} (<code>${msg.chat.id}</code>):\n${esc(text.slice(0, 1500))}`);
    }
    return send(msg.chat.id, "Xabaringiz adminga yuborildi. Tez orada javob beramiz.");
  }
}

let running = false;

export async function startPayBot() {
  if (!botEnabled() || running) return;
  running = true;
  await tg("deleteWebhook", {}).catch((e) => console.warn(e.message));
  console.log("[bot] to'lov boti ishga tushdi");

  let offset = 0;
  (async () => {
    while (running) {
      try {
        const updates = await tg("getUpdates", { offset, timeout: 50, allowed_updates: ["message", "callback_query"] }, { timeoutMs: 60_000 });
        for (const u of updates) {
          offset = u.update_id + 1;
          await handleUpdate(u).catch((e) => console.error("[bot]", e));
        }
      } catch (err) {
        console.warn(err.message);
        await sleep(err.status === 409 ? 30_000 : 5_000);
      }
    }
  })();
}

export function stopPayBot() {
  running = false;
}
