import { config } from "../config.js";
import { HttpError } from "./errors.js";

// ------------------------------------------------------------------
// Google Gemini API (structured output). Faqat admin funksiyalari uchun:
// savollarni PDF/rasm/matndan ajratib olish va adaptiv test uchun yangi
// savol yaratish. Natija har doim admin ko'rib chiqishidan o'tadi.
// ------------------------------------------------------------------

const API = "https://generativelanguage.googleapis.com/v1beta/models";

// src/data/rwPromptTemplates.js va src/data/mathDomains.js dagi id'lar bilan
// bir xil (API image'iga src/data kirmaydi).
export const DOMAINS = {
  rw: ["craft-structure", "info-ideas", "conventions", "expression"],
  math: ["algebra", "advanced-math", "problem-solving-data", "geometry-trig"],
};

export const aiEnabled = () => !!config.geminiApiKey;

// Gemini responseSchema (OpenAPI subset) — bitta savol.
export const QUESTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    passage: { type: "STRING", description: "Reading passage or context; empty string if none." },
    prompt: { type: "STRING", description: "The question stem." },
    type: { type: "STRING", enum: ["mcq", "spr"] },
    choices: { type: "ARRAY", items: { type: "STRING" }, description: "Exactly 4 choices for mcq, without A)/B) labels; empty for spr." },
    correctAnswer: { type: "STRING", description: "A, B, C or D for mcq; empty string if the source has no answer key." },
    answers: { type: "ARRAY", items: { type: "STRING" }, description: "Accepted answers for spr (e.g. 3/4, .75)." },
    domain: { type: "STRING" },
    skill: { type: "STRING" },
    difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] },
    explanation: { type: "STRING", description: "Short explanation in Uzbek (Latin script)." },
    confidence: { type: "NUMBER", description: "0..1 — how sure you are the question and answer were read correctly." },
  },
  required: ["passage", "prompt", "type", "choices", "correctAnswer", "domain", "difficulty", "confidence"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const RETRIABLE = [500, 503, 504];

async function callModel(model, body) {
  try {
    const res = await fetch(`${API}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.geminiApiKey },
      body,
      signal: AbortSignal.timeout(100_000),
    });
    return { res, data: await res.json().catch(() => null) };
  } catch (err) {
    // Javob kelmadi (timeout/tarmoq) — band model kabi keyingisiga o'tiladi.
    if (err.name !== "TimeoutError") console.error("[gemini]", err.message);
    return { res: { ok: false, status: 504 }, data: null };
  }
}

// Model vaqtincha band (500/503) yoki javob bermasa — bir marta qayta urinadi
// (timeout'da qayta urinmaydi), so'ng zaxira modellarga o'tadi.
// Limit (429) — darhol foydalanuvchiga aytiladi.
async function callWithFallback(body) {
  const fallbacks = config.geminiFallbackModels.filter((m) => m !== config.geminiModel);
  const queue = [config.geminiModel, ...fallbacks];
  let last;
  let retried = false;
  for (let i = 0; i < queue.length; i++) {
    last = await callModel(queue[i], body);
    if (last.res.ok || !RETRIABLE.includes(last.res.status)) return last;
    console.warn(`[gemini] ${queue[i]} javob bermadi (${last.res.status})`);
    if (!retried && last.res.status !== 504) {
      retried = true;
      await sleep(1500);
      i -= 1;
    }
  }
  return last;
}

// parts: [{ text } | { inline_data: { mime_type, data } }]
export async function generateJson(parts, schema, { temperature = 0.2 } = {}) {
  if (!aiEnabled()) throw new HttpError(503, "ai/disabled", "AI sozlanmagan: serverda GEMINI_API_KEY yo'q.");

  const { res, data } = await callWithFallback(
    JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature, responseMimeType: "application/json", responseSchema: schema },
    })
  );

  if (res.status === 429) {
    throw new HttpError(429, "ai/rate-limited", "AI tekin limiti tugadi. Birozdan keyin qayta urinib ko'ring.");
  }
  if (RETRIABLE.includes(res.status)) {
    throw new HttpError(503, "ai/busy", "AI serverlari hozir band. Bir necha daqiqadan keyin qayta urinib ko'ring.");
  }
  if (!res.ok) {
    console.error("[gemini]", res.status, data?.error?.message);
    throw new HttpError(502, "ai/error", `AI xatosi: ${data?.error?.message || res.status}`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
  if (!text) throw new HttpError(502, "ai/empty", "AI bo'sh javob qaytardi (balki fayl o'qilmadi).");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(502, "ai/bad-json", "AI javobini o'qib bo'lmadi. Qayta urinib ko'ring.");
  }
}
