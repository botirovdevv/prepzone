import { Router } from "express";
import { z } from "zod";
import { tx } from "../db/index.js";
import { parseBody } from "../lib/errors.js";
import { dayKey } from "../lib/limits.js";
import { perUserLimit } from "../lib/limiters.js";

// ------------------------------------------------------------------
// Sayt analitikasi: brauzer sahifa ko'rishlarini xotirada yig'ib, bir
// necha daqiqada bir yuboradi (src/utils/analytics.js). Faqat login
// qilgan foydalanuvchilar kuzatiladi.
// ------------------------------------------------------------------

const router = Router();

const pageKey = z.string().regex(/^[a-z_]{1,40}$/);

// Brauzer bir necha daqiqada bir yuboradi — undan ko'pi statistikani sun'iy oshirish.
router.post("/track", perUserLimit({ windowMs: 10 * 60 * 1000, limit: 30 }), async (req, res) => {
  const { views, pages } = parseBody(
    z.object({
      views: z.number().int().min(1).max(1000),
      pages: z.record(pageKey, z.number().int().min(1).max(1000)).refine((p) => Object.keys(p).length <= 40),
    }),
    req.body
  );
  const day = dayKey();
  await tx(async (client) => {
    for (const [page, count] of Object.entries(pages)) {
      await client.query(
        `INSERT INTO analytics_pages (date, page, views) VALUES ($1, $2, $3)
         ON CONFLICT (date, page) DO UPDATE SET views = analytics_pages.views + EXCLUDED.views`,
        [day, page, count]
      );
    }
    await client.query(
      "INSERT INTO analytics_visitors (date, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [day, req.user.id]
    );
    // users.pages — har bir sahifa bo'yicha jami ko'rishlar (JSONB qo'shish).
    await client.query(
      `UPDATE users SET
         page_views = page_views + $2,
         last_seen_at = now(),
         pages = (
           SELECT COALESCE(jsonb_object_agg(k, v), '{}'::jsonb) FROM (
             SELECT key AS k, sum(value::int) AS v FROM (
               SELECT * FROM jsonb_each_text(users.pages)
               UNION ALL SELECT * FROM jsonb_each_text($3::jsonb)
             ) all_pages GROUP BY key
           ) merged
         )
       WHERE id = $1`,
      [req.user.id, views, pages]
    );
  });
  res.json({ ok: true });
});

export default router;
