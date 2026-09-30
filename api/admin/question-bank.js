// GET /api/admin/question-bank?file=math-algebra — admin savol banki.
// Fayllar (to'g'ri javoblar bilan) server/question-bank/ da, public'da emas.
import { readFile } from "node:fs/promises";
import { requireAdmin, HttpError } from "../../server/firebaseAdmin.js";
import { handle } from "../../server/http.js";

export const GET = handle(async (request) => {
  await requireAdmin(request);
  const file = new URL(request.url).searchParams.get("file") || "";
  if (!/^(rw|math)-[a-z-]{2,40}$/.test(file)) throw new HttpError(400, "Noto'g'ri fayl nomi");
  let body;
  try {
    body = await readFile(new URL(`../../server/question-bank/${file}.json`, import.meta.url), "utf8");
  } catch {
    throw new HttpError(404, "Bu mavzu uchun savol banki topilmadi");
  }
  return new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, max-age=3600" },
  });
});
