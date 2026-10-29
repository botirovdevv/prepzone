import { Router } from "express";
import { one } from "../db/index.js";
import { notFound } from "../lib/errors.js";

// ------------------------------------------------------------------
// Profil rasmlari — ochiq (reytingda boshqa foydalanuvchilarga ham
// ko'rinadi). URL'da `?v=` versiya bor, shuning uchun uzoq keshlanadi.
// ------------------------------------------------------------------

const router = Router();

router.get("/:id", async (req, res) => {
  const row = await one("SELECT mime, data FROM user_avatars WHERE user_id = $1", [req.params.id]);
  if (!row) throw notFound("Rasm topilmadi.");
  res.set({
    "Content-Type": row.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    // Frontend boshqa domenda bo'lsa ham <img> yuklana olsin (helmet standarti same-origin).
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  res.send(row.data);
});

export default router;
