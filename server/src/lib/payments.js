import { randomInt } from "node:crypto";
import { one, query, tx } from "../db/index.js";
import { HttpError } from "./errors.js";
import { grantPlan, priceFor } from "./plans.js";
import { esc, fmtSum, forwardReceiptToAdmins, send, sendToAdmins } from "./telegram.js";
import { config } from "../config.js";

// ------------------------------------------------------------------
// Karta-to'lovlar oqimi:
//   1. Saytda "To'lash" → createPayment(): unikal summa (narx + 1..999 so'm).
//   2. Telegram bot karta raqami va aniq summani beradi, user chek yuboradi
//      → onReceipt().
//   3. Android SMS-agent bank SMS'ini yuboradi → onSms().
//   4. Chek + summasi mos SMS (chek vaqti atrofida) bo'lsa → avtomatik
//      tasdiqlanadi. Chekdan keyin 10 daqiqada SMS topilmasa — adminga
//      ✅/❌ tugmalari bilan yuboriladi (sweep()).
// ------------------------------------------------------------------

export const PLAN_NAMES = { free: "Bepul", sprint: "Sprint", pro: "Pro 1600", elite: "Elite" };
export const OPEN = ["pending", "receipt_sent"];

const RECEIPT_WINDOW_MS = 2 * 60 * 60 * 1000; // chek yuborish uchun vaqt
const SMS_BEFORE_MS = 2 * 60 * 1000; // SMS to'lov yaratilishidan biroz oldin ham kelishi mumkin (soat farqi)
const SMS_AFTER_RECEIPT_MS = 15 * 60 * 1000; // bank SMS'i kechikishi
const ADMIN_AFTER_MS = 10 * 60 * 1000; // shuncha kutib SMS topilmasa — adminga

const newId = () => Date.now().toString(36).slice(-5) + randomInt(36 ** 5).toString(36).padStart(5, "0");

export function paymentDoc(p) {
  return {
    id: p.id,
    plan: p.plan,
    months: p.months,
    amount: p.amount,
    baseAmount: p.base_amount,
    status: p.status,
    auto: p.auto,
    hasReceipt: !!p.receipt_file_id,
    receiptAt: p.receipt_at,
    smsId: p.sms_id,
    note: p.note,
    createdAt: p.created_at,
    expiresAt: p.expires_at,
    decidedAt: p.decided_at,
  };
}

export async function createPayment(user, plan, months) {
  const base = priceFor(plan, months);
  // Avvalgi chek yuborilmagan to'lovlari bekor — summa band bo'lib turmasin.
  await query("UPDATE payments SET status = 'expired' WHERE user_id = $1 AND status = 'pending'", [user.id]);
  for (let attempt = 0; attempt < 20; attempt++) {
    const amount = base + randomInt(1, 1000);
    try {
      return await one(
        `INSERT INTO payments (id, user_id, plan, months, base_amount, amount, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, now() + $7 * interval '1 millisecond') RETURNING *`,
        [newId(), user.id, plan, months, base, amount, RECEIPT_WINDOW_MS]
      );
    } catch (err) {
      if (err.code !== "23505") throw err; // summa band — boshqasini sinaymiz
    }
  }
  throw new HttpError(503, "unavailable", "Hozir to'lov yaratib bo'lmadi, birozdan keyin urinib ko'ring.");
}

async function notifyApproved(payment, result) {
  const user = await one("SELECT email, display_name, telegram_chat_id FROM users WHERE id = $1", [payment.user_id]);
  const until = new Date(result.endsAt).toLocaleDateString("ru-RU");
  const text =
    `✅ <b>To'lov tasdiqlandi!</b>\n\n` +
    `Tarif: <b>${PLAN_NAMES[result.plan]}</b>\nAmal qiladi: <b>${until}</b> gacha\n\n` +
    `Saytga qayting: ${config.publicUrl}/dashboard`;
  await send(payment.tg_chat_id || user?.telegram_chat_id, text);
  await sendToAdmins(
    `💰 ${payment.auto ? "Avto-tasdiq" : "Tasdiqlandi"}: <b>${fmtSum(payment.amount)} so'm</b> — ` +
      `${esc(user?.display_name || user?.email)} → ${PLAN_NAMES[payment.plan]} (${payment.months} oy)`
  );
}

// Tasdiqlash (avto yoki admin). Allaqachon tasdiqlangan bo'lsa — null.
export async function approvePayment(paymentId, { auto = false, decidedBy = null, smsId = null } = {}) {
  const out = await tx(async (client) => {
    const { rows } = await client.query("SELECT * FROM payments WHERE id = $1 FOR UPDATE", [paymentId]);
    const p = rows[0];
    if (!p) throw new HttpError(404, "not-found", "To'lov topilmadi.");
    if (p.status === "approved") return null;
    const result = await grantPlan(client, p.user_id, p.plan, p.months, { paymentId: p.id, grantedBy: decidedBy });
    const { rows: upd } = await client.query(
      `UPDATE payments SET status = 'approved', auto = $2, decided_by = $3, decided_at = now(),
         sms_id = COALESCE($4, sms_id)
       WHERE id = $1 RETURNING *`,
      [p.id, auto, decidedBy, smsId]
    );
    if (smsId) await client.query("UPDATE sms_messages SET payment_id = $2 WHERE id = $1", [smsId, p.id]);
    return { payment: upd[0], result };
  });
  if (out) notifyApproved(out.payment, out.result).catch((e) => console.warn("[pay]", e.message));
  return out;
}

export async function rejectPayment(paymentId, { decidedBy = null, note = null } = {}) {
  const p = await one(
    `UPDATE payments SET status = 'rejected', decided_by = $2, decided_at = now(), note = $3
     WHERE id = $1 AND status <> 'approved' RETURNING *`,
    [paymentId, decidedBy, note]
  );
  if (p) {
    await send(
      p.tg_chat_id,
      `❌ <b>To'lov tasdiqlanmadi.</b>\n\nKartaga <b>${fmtSum(p.amount)} so'm</b> tushgani topilmadi.` +
        `${note ? `\nIzoh: ${esc(note)}` : ""}\n\nXato deb hisoblasangiz, shu yerga yozing — admin ko'rib chiqadi.`
    );
  }
  return p;
}

// Chekdan oldin yoki keyin kelgan, summasi mos va hali bog'lanmagan SMS.
async function findSmsFor(p) {
  return one(
    `SELECT * FROM sms_messages
     WHERE is_income AND amount = $1 AND payment_id IS NULL
       AND received_at >= $2::timestamptz - $3 * interval '1 millisecond'
       AND received_at <= COALESCE($4::timestamptz, now()) + $5 * interval '1 millisecond'
     ORDER BY received_at LIMIT 1`,
    [p.amount, p.created_at, SMS_BEFORE_MS, p.receipt_at, SMS_AFTER_RECEIPT_MS]
  );
}

// Bot chekni saqlagandan keyin chaqiriladi.
export async function onReceipt(paymentId) {
  const p = await one("SELECT * FROM payments WHERE id = $1", [paymentId]);
  if (!p || p.status !== "receipt_sent") return null;
  const sms = p.sms_id ? await one("SELECT * FROM sms_messages WHERE id = $1", [p.sms_id]) : await findSmsFor(p);
  if (!sms) return null;
  return approvePayment(p.id, { auto: true, smsId: sms.id });
}

// SMS-agent yangi SMS yuborganda. Natija: { payment, approved } yoki null.
export async function onSms(sms) {
  if (!sms.is_income || !sms.amount) return null;
  const p = await one(
    `SELECT * FROM payments
     WHERE amount = $1 AND status = ANY($2) AND sms_id IS NULL
       AND $3::timestamptz >= created_at - $4 * interval '1 millisecond'
       AND $3::timestamptz <= GREATEST(expires_at, COALESCE(receipt_at, expires_at) + $5 * interval '1 millisecond')
     ORDER BY created_at DESC LIMIT 1`,
    [sms.amount, OPEN, sms.received_at, SMS_BEFORE_MS, SMS_AFTER_RECEIPT_MS]
  );
  if (!p) return null;
  if (p.status === "receipt_sent") {
    const out = await approvePayment(p.id, { auto: true, smsId: sms.id });
    return { payment: out?.payment || p, approved: !!out };
  }
  // Chek hali kelmagan — SMS'ni bog'lab qo'yamiz, chek kelishi bilan tasdiqlanadi.
  await query("UPDATE payments SET sms_id = $2 WHERE id = $1", [p.id, sms.id]);
  await query("UPDATE sms_messages SET payment_id = $2 WHERE id = $1", [sms.id, p.id]);
  return { payment: p, approved: false };
}

export const adminButtons = (id) => ({
  reply_markup: {
    inline_keyboard: [[
      { text: "✅ Tasdiqlash", callback_data: `ok:${id}` },
      { text: "❌ Rad etish", callback_data: `no:${id}` },
    ]],
  },
});

async function escalate(p) {
  const user = await one("SELECT email, display_name FROM users WHERE id = $1", [p.user_id]);
  const { rows: near } = await query(
    `SELECT amount, received_at FROM sms_messages
     WHERE is_income AND payment_id IS NULL AND received_at BETWEEN $1::timestamptz - interval '1 hour' AND $1::timestamptz + interval '1 hour'
     ORDER BY abs(extract(epoch FROM received_at - $1::timestamptz)) LIMIT 5`,
    [p.receipt_at]
  );
  const t = (d) => new Date(d).toLocaleTimeString("ru-RU", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit" });
  const caption =
    `⚠️ <b>Chek tekshirilmadi</b> — SMS topilmadi\n\n` +
    `User: ${esc(user?.display_name || "")} ${esc(user?.email || "")}\n` +
    `Tarif: <b>${PLAN_NAMES[p.plan]}</b>, ${p.months} oy\n` +
    `Kutilgan summa: <b>${fmtSum(p.amount)} so'm</b>\nChek vaqti: ${t(p.receipt_at)}\n` +
    `To'lov ID: <code>${p.id}</code>\n\n` +
    (near.length
      ? `Yaqin vaqtdagi bog'lanmagan kirimlar:\n${near.map((s) => `• ${fmtSum(s.amount)} so'm — ${t(s.received_at)}`).join("\n")}`
      : "Yaqin vaqtda bog'lanmagan kirim SMS'i yo'q.");
  await forwardReceiptToAdmins(p, caption, adminButtons(p.id));
}

// Har daqiqada: muddati o'tganlarni yopish, SMS topilmagan cheklarni adminga
// yuborish, tarif tugashi haqida eslatish.
export async function sweep() {
  const { rows: expired } = await query(
    "UPDATE payments SET status = 'expired' WHERE status = 'pending' AND expires_at < now() RETURNING *"
  );
  for (const p of expired) {
    if (p.tg_chat_id) await send(p.tg_chat_id, "⌛ To'lov vaqti tugadi. Kerak bo'lsa saytdan qaytadan boshlang.");
  }

  const { rows: stale } = await query(
    `UPDATE payments SET admin_notified = TRUE
     WHERE status = 'receipt_sent' AND NOT admin_notified AND receipt_at < now() - $1 * interval '1 millisecond'
     RETURNING *`,
    [ADMIN_AFTER_MS]
  );
  for (const p of stale) {
    // Oxirgi imkon: shu orada SMS kelgan bo'lishi mumkin.
    const done = await onReceipt(p.id).catch(() => null);
    if (!done) await escalate(p).catch((e) => console.warn("[pay]", e.message));
  }

  // Tarif tugashiga 3 kundan kam qolganda bir marta eslatma.
  const { rows: ending } = await query(
    `INSERT INTO rate_limits (day, user_id, action, count)
     SELECT to_char(plan_ends_at, 'YYYY-MM-DD'), id, 'planReminder', 1 FROM users
     WHERE telegram_chat_id IS NOT NULL AND plan <> 'free'
       AND plan_ends_at BETWEEN now() AND now() + interval '3 days'
     ON CONFLICT DO NOTHING
     RETURNING user_id`
  );
  for (const { user_id } of ending) {
    const u = await one("SELECT plan, plan_ends_at, telegram_chat_id FROM users WHERE id = $1", [user_id]);
    await send(
      u.telegram_chat_id,
      `⏳ <b>${PLAN_NAMES[u.plan]}</b> tarifingiz ${new Date(u.plan_ends_at).toLocaleDateString("ru-RU")} da tugaydi.\n` +
        `Uzaytirish: ${config.publicUrl}/pricing`
    );
  }
}
