import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { parseBody } from "../lib/errors.js";
import { ping } from "../lib/presence.js";

// ------------------------------------------------------------------
// POST /api/presence/ping — login qilmagan mehmonlar ham yuboradi (shuning
// uchun requireAuth yo'q); login qilgan bo'lsa req.user (loadUser) bog'lanadi.
// ------------------------------------------------------------------

const router = Router();

// Har tab daqiqasiga ~2 ping. Ko'p odam bitta IP ortida bo'lishi mumkin
// (mobil operator, maktab Wi-Fi) — limit shunga yetarli keng.
router.use(
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

router.post("/ping", (req, res) => {
  const body = parseBody(
    z.object({
      visitorId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
      page: z.string().regex(/^[a-z_]{1,40}$/),
    }),
    req.body
  );
  ping(body.visitorId, req.user?.id, body.page);
  res.status(204).end();
});

export default router;
