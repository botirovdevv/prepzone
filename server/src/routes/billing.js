import { Router } from "express";
import { z } from "zod";
import { pool, query } from "../db/index.js";
import { config } from "../config.js";
import { HttpError, parseBody } from "../lib/errors.js";
import { PLANS, RANK, activePlan } from "../lib/plans.js";
import { createPayment, paymentDoc } from "../lib/payments.js";
import { quotaSummary } from "../lib/quota.js";
import { perUserLimit } from "../lib/limiters.js";
import { requireVerified } from "../middleware/auth.js";

// ------------------------------------------------------------------
// Tariflar va to'lov boshlash. To'lovning o'zi Telegram botda davom etadi.
// ------------------------------------------------------------------

const router = Router();

// Ochiq: narxlar sahifasi login'siz ham ko'rinadi.
router.get("/plans", (_req, res) => {
  res.json({
    plans: Object.values(PLANS).map((p) => ({ id: p.id, prices: p.prices, limits: p.limits, popular: !!p.popular })),
    botEnabled: !!(config.telegramBotToken && config.telegramBotUsername && config.payCardNumber),
  });
});

router.get("/me", requireVerified, async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
    [req.user.id]
  );
  res.json({ ...(await quotaSummary(pool, req.user)), payments: rows.map(paymentDoc) });
});

router.post(
  "/checkout",
  requireVerified,
  perUserLimit({ windowMs: 10 * 60_000, limit: 10 }),
  async (req, res) => {
    const body = parseBody(
      z.object({ plan: z.enum(["sprint", "pro", "elite"]), months: z.union([z.literal(1), z.literal(3)]) }),
      req.body
    );
    if (!config.telegramBotUsername || !config.payCardNumber) {
      throw new HttpError(503, "unavailable", "To'lov hozircha sozlanmagan. Admin bilan bog'laning.");
    }
    // Yuqori tarif amal qilayotganda arzonrog'ini sotib olib bo'lmaydi
    // (aks holda arzon to'lov bilan yuqori tarif uzaytirilardi).
    const current = activePlan(req.user);
    if (!req.user.is_admin && RANK[current] > RANK[body.plan]) {
      throw new HttpError(
        400,
        "failed-precondition",
        "Sizda hozir yuqoriroq tarif faol. Uni uzaytiring yoki muddati tugagach boshqa tarif tanlang."
      );
    }
    const p = await createPayment(req.user, body.plan, body.months);
    res.status(201).json({
      payment: paymentDoc(p),
      botUrl: `https://t.me/${config.telegramBotUsername}?start=pay_${p.id}`,
    });
  }
);

export default router;
