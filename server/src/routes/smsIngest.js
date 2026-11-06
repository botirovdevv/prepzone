import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { one, query } from "../db/index.js";
import { config } from "../config.js";
import { HttpError, parseBody } from "../lib/errors.js";
import { parseBankSms } from "../lib/smsParser.js";
import { verifySignature } from "../lib/signature.js";
import { PLAN_NAMES, onSms } from "../lib/payments.js";

// ------------------------------------------------------------------
// Android SMS-agent (sms-agent/) uchun. Kartaga kelgan bank SMS'lari shu
// yerga keladi, summa ajratiladi va kutilayotgan to'lov bilan moslanadi.
// Ruxsat: HMAC imzo (lib/signature.js), token tarmoqda yuborilmaydi.
// ------------------------------------------------------------------

const router = Router();

router.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));

// Telefon soati noto'g'ri bo'lsa ham imzo ishlashi uchun agent server vaqtini oladi.
router.get("/time", (_req, res) => res.json({ now: Date.now() }));

// Noto'g'ri imzo — token topishga urinish: IP bo'yicha 15 daqiqada 10 ta xato.
const badSignature = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => res.status(429).json({ code: "resource-exhausted", message: "Juda ko'p xato urinish." }),
});

router.use(badSignature, (req, _res, next) => {
  const ok = verifySignature(config.smsIngestToken, {
    ts: req.get("x-pz-timestamp"),
    signature: req.get("x-pz-signature"),
    method: req.method,
    path: req.originalUrl.split("?")[0],
    body: req.rawBody || "",
  });
  if (!ok) throw new HttpError(401, "auth/unauthenticated", "Imzo noto'g'ri yoki eskirgan.");
  next();
});

async function smsView(row) {
  let payment = null;
  if (row.payment_id) {
    payment = await one(
      `SELECT p.id, p.plan, p.months, p.status, u.email, u.display_name
       FROM payments p JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
      [row.payment_id]
    );
  }
  return {
    id: row.id,
    sender: row.sender,
    body: row.body,
    amount: row.amount,
    isIncome: row.is_income,
    receivedAt: row.received_at,
    payment: payment && {
      id: payment.id,
      status: payment.status,
      plan: PLAN_NAMES[payment.plan],
      months: payment.months,
      user: payment.display_name || payment.email,
    },
  };
}

router.post("/ingest", async (req, res) => {
  const body = parseBody(
    z.object({
      sender: z.string().max(100).default(""),
      body: z.string().min(1).max(2000),
      receivedAt: z.number().int().positive(), // ms epoch (telefon vaqti)
      ref: z.string().max(100).optional(), // qurilmadagi unikal id (retry dublikatlari uchun)
    }),
    req.body
  );
  // Telefon soati noto'g'ri bo'lsa — server vaqtini olamiz (5 daqiqadan katta farq).
  let receivedAt = new Date(body.receivedAt);
  if (Math.abs(receivedAt.getTime() - Date.now()) > 5 * 60_000 && receivedAt > new Date()) receivedAt = new Date();

  if (body.ref) {
    const dup = await one("SELECT * FROM sms_messages WHERE device_ref = $1", [body.ref]);
    if (dup) return res.json({ duplicate: true, sms: await smsView(dup) });
  }

  const parsed = parseBankSms(body.body);
  const sms = await one(
    `INSERT INTO sms_messages (sender, body, amount, is_income, received_at, device_ref)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [body.sender, body.body, parsed.amount, parsed.isIncome, receivedAt, body.ref || null]
  );
  const match = await onSms(sms);
  const fresh = await one("SELECT * FROM sms_messages WHERE id = $1", [sms.id]);
  res.status(201).json({
    sms: await smsView(fresh),
    matched: !!match,
    approved: !!match?.approved,
  });
});

// Agent asosiy ekrani: oxirgi SMS'lar va kutilayotgan cheklar.
router.get("/recent", async (_req, res) => {
  const { rows } = await query("SELECT * FROM sms_messages ORDER BY received_at DESC LIMIT 30");
  const { rows: waiting } = await query(
    `SELECT p.id, p.plan, p.months, p.amount, p.status, p.receipt_at, p.created_at, p.sms_id, u.email, u.display_name
     FROM payments p JOIN users u ON u.id = p.user_id
     WHERE p.status IN ('pending', 'receipt_sent') ORDER BY p.created_at DESC LIMIT 30`
  );
  res.json({
    sms: await Promise.all(rows.map(smsView)),
    waiting: waiting.map((p) => ({
      id: p.id,
      plan: PLAN_NAMES[p.plan],
      months: p.months,
      amount: p.amount,
      status: p.status,
      receiptAt: p.receipt_at,
      createdAt: p.created_at,
      smsFound: !!p.sms_id,
      user: p.display_name || p.email,
    })),
  });
});

export default router;
