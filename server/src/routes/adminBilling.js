import { Router } from "express";
import { z } from "zod";
import { one, query, tx } from "../db/index.js";
import { HttpError, notFound, parseBody } from "../lib/errors.js";
import { grantPlan, PLAN_IDS } from "../lib/plans.js";
import { approvePayment, paymentDoc, rejectPayment } from "../lib/payments.js";
import { botEnabled, downloadFile } from "../lib/telegram.js";

// ------------------------------------------------------------------
// Admin: to'lovlar, cheklar, SMS log, qo'lda tasdiqlash va tarif berish
// (index.js'da requirePerm("billing") bilan ulanadi).
// ------------------------------------------------------------------

const router = Router();
const STATUSES = ["pending", "receipt_sent", "approved", "rejected", "expired"];

router.get("/summary", async (_req, res) => {
  const stats = await one(
    `SELECT
       COALESCE(sum(amount) FILTER (WHERE status = 'approved' AND decided_at >= date_trunc('month', now())), 0)::int AS month_revenue,
       COALESCE(sum(amount) FILTER (WHERE status = 'approved'), 0)::bigint AS total_revenue,
       count(*) FILTER (WHERE status = 'receipt_sent')::int AS waiting,
       count(*) FILTER (WHERE status = 'approved' AND auto)::int AS auto_approved,
       count(*) FILTER (WHERE status = 'approved')::int AS approved
     FROM payments`
  );
  const { rows: plans } = await query(
    "SELECT plan, count(*)::int AS n FROM users WHERE plan <> 'free' AND plan_ends_at > now() GROUP BY plan"
  );
  res.json({
    monthRevenue: stats.month_revenue,
    totalRevenue: Number(stats.total_revenue),
    waiting: stats.waiting,
    approved: stats.approved,
    autoApproved: stats.auto_approved,
    activeByPlan: Object.fromEntries(plans.map((p) => [p.plan, p.n])),
  });
});

router.get("/payments", async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const { rows } = await query(
    `SELECT p.*, u.email, u.display_name, s.body AS sms_body, s.received_at AS sms_at
     FROM payments p JOIN users u ON u.id = p.user_id
     LEFT JOIN sms_messages s ON s.id = p.sms_id
     ${status ? "WHERE p.status = $1" : ""}
     ORDER BY (p.status = 'receipt_sent') DESC, p.created_at DESC LIMIT 100`,
    status ? [status] : []
  );
  res.json(
    rows.map((p) => ({
      ...paymentDoc(p),
      user: { id: p.user_id, email: p.email, name: p.display_name },
      sms: p.sms_body ? { body: p.sms_body, receivedAt: p.sms_at } : null,
    }))
  );
});

router.get("/payments/:id/receipt", async (req, res) => {
  const p = await one("SELECT receipt_file_id FROM payments WHERE id = $1", [req.params.id]);
  if (!p?.receipt_file_id) throw notFound("Chek yo'q.");
  if (!botEnabled()) throw new HttpError(503, "unavailable", "Bot sozlanmagan.");
  const file = await downloadFile(p.receipt_file_id);
  const type = /\.pdf$/i.test(file.path) ? "application/pdf" : /\.png$/i.test(file.path) ? "image/png" : "image/jpeg";
  res.set("Content-Type", type).set("Cache-Control", "private, max-age=3600").send(file.buffer);
});

router.post("/payments/:id/approve", async (req, res) => {
  await approvePayment(req.params.id, { decidedBy: req.user.id });
  res.json(paymentDoc(await one("SELECT * FROM payments WHERE id = $1", [req.params.id])));
});

router.post("/payments/:id/reject", async (req, res) => {
  const body = parseBody(z.object({ note: z.string().trim().max(300).optional() }), req.body || {});
  const p = await rejectPayment(req.params.id, { decidedBy: req.user.id, note: body.note || null });
  if (!p) throw new HttpError(400, "failed-precondition", "Tasdiqlangan to'lovni rad etib bo'lmaydi.");
  res.json(paymentDoc(p));
});

router.get("/sms", async (_req, res) => {
  const { rows } = await query("SELECT * FROM sms_messages ORDER BY received_at DESC LIMIT 100");
  res.json(
    rows.map((s) => ({
      id: s.id,
      sender: s.sender,
      body: s.body,
      amount: s.amount,
      isIncome: s.is_income,
      receivedAt: s.received_at,
      paymentId: s.payment_id,
    }))
  );
});

// Qo'lda tarif berish (masalan naqd to'lov, sovg'a, test).
router.post("/grant", async (req, res) => {
  const body = parseBody(
    z.object({
      email: z.string().trim().email("Email noto'g'ri."),
      plan: z.enum(PLAN_IDS.filter((p) => p !== "free")),
      months: z.number().int().min(1).max(12),
    }),
    req.body
  );
  const user = await one("SELECT id FROM users WHERE lower(email) = lower($1)", [body.email]);
  if (!user) throw notFound("Bu email bilan foydalanuvchi topilmadi.");
  const result = await tx((client) => grantPlan(client, user.id, body.plan, body.months, { grantedBy: req.user.id }));
  console.info(`[audit] plan ${body.plan} x${body.months} granted to ${user.id} by ${req.user.id}`);
  res.json(result);
});

export default router;
