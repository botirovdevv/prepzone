import { Router } from "express";
import { z } from "zod";
import { one, tx } from "../db/index.js";
import { HttpError, notFound, parseBody } from "../lib/errors.js";
import { getStaticSections, reviewKeys, routeFor, scoreAttempt } from "../lib/satScoring.js";
import { maybeUpdateLeaderboard } from "../lib/leaderboard.js";
import { consumeDaily } from "../lib/limits.js";
import { resultDoc } from "../lib/serialize.js";

// ------------------------------------------------------------------
// Statik SAT mock testlari (content/sat). Javob kalitlari faqat serverda:
// Module 2 yo'nalishi va ball shu yerda hisoblanadi, to'g'ri javoblar
// esa natija egasiga test topshirilgandan keyingina beriladi.
// ------------------------------------------------------------------

const router = Router();

const answers = z.array(z.string().max(40).nullable()).max(200);
const attempts = z.record(
  z.string().max(20),
  z.object({ module1Answers: answers, module2Answers: answers.optional() })
);

function staticTest(testId) {
  const data = getStaticSections(testId);
  if (!data) throw notFound("Test topilmadi.");
  return data;
}

// Module 1 javoblaridan Module 2 yo'nalishi (oson/qiyin). Hech narsa yozmaydi.
router.post("/route", (req, res) => {
  const body = parseBody(
    z.object({ testId: z.string().max(40), sectionId: z.string().max(20), module1Answers: answers }),
    req.body
  );
  const section = staticTest(body.testId).sections.find((s) => s.id === body.sectionId);
  if (!section) throw notFound("Bo'lim topilmadi.");
  res.json({ route: routeFor(section, body.module1Answers) });
});

// Testni serverda baholab saqlaydi. Reytingga shu testning BIRINCHI to'liq
// urinishi tushadi — natija sahifasi to'g'ri javoblarni ko'rsatgani uchun
// qayta topshirish adolatsiz bo'lardi.
router.post("/finish", async (req, res) => {
  const body = parseBody(
    z.object({
      attemptId: z.string().regex(/^[A-Za-z0-9-]{16,64}$/, "attemptId noto'g'ri."),
      testId: z.string().max(40),
      attempts,
      terminated: z.boolean().optional(),
      terminationReason: z.string().max(40).optional(),
    }),
    req.body
  );
  const data = staticTest(body.testId);

  // Tarmoq xatosidan keyin qayta yuborilgan so'rov — avvalgi natija qaytadi.
  const existing = await one("SELECT * FROM results WHERE attempt_id = $1", [body.attemptId]);
  if (existing) {
    if (existing.user_id !== req.user.id) throw new HttpError(409, "already-exists", "attemptId band.");
    const doc = resultDoc(existing);
    return res.json({ resultId: doc.id, results: doc.results, total: doc.total, complete: doc.complete, leaderboardUpdated: false });
  }

  const terminated = !!body.terminated;
  const { results, total, complete } = scoreAttempt(data.sections, body.attempts, { terminated });
  if (!Object.keys(results).length) throw new HttpError(400, "invalid-argument", "Javoblar yo'q.");

  const out = await tx(async (client) => {
    await consumeDaily(client, req.user.id, "satFinish", 15, "Bugun juda ko'p test topshirildi, ertaga davom eting.");
    const previous = complete
      ? await client.query(
          "SELECT 1 FROM results WHERE user_id = $1 AND test_id = $2 AND complete LIMIT 1",
          [req.user.id, body.testId]
        )
      : null;
    const { rows } = await client.query(
      `INSERT INTO results (id, user_id, total, test_id, complete, attempt_id, data)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.id,
        total,
        body.testId,
        complete,
        body.attemptId,
        {
          results,
          email: req.user.email,
          ...(terminated
            ? { terminated: true, terminationReason: String(body.terminationReason || "unknown").slice(0, 40) }
            : {}),
        },
      ]
    );
    const leaderboardUpdated =
      complete && previous.rowCount === 0 ? await maybeUpdateLeaderboard(client, req.user, total) : false;
    return { row: rows[0], leaderboardUpdated };
  });

  res.status(201).json({ resultId: out.row.id, results, total, complete, leaderboardUpdated: out.leaderboardUpdated });
});

// Natija sahifasida savollarni ko'rib chiqish uchun to'g'ri javoblar —
// faqat natija egasi (yoki admin) oladi.
router.get("/review", async (req, res) => {
  const id = String(req.query.id || "");
  if (!id || id.length > 64) throw new HttpError(400, "invalid-argument", "Noto'g'ri id.");
  const row = await one("SELECT * FROM results WHERE id = $1", [id]);
  if (!row) throw notFound("Natija topilmadi.");
  if (row.user_id !== req.user.id && !req.user.is_admin) {
    throw new HttpError(403, "permission-denied", "Bu natija sizga tegishli emas.");
  }
  if (row.session_id) {
    throw new HttpError(400, "invalid-argument", "Sessiya natijalari uchun ko'rib chiqish mavjud emas.");
  }
  res.json({ keys: reviewKeys(staticTest(row.test_id || "bluebook-1").sections) });
});

export default router;
