import { config } from "../config.js";
import { HttpError } from "./errors.js";

// ------------------------------------------------------------------
// Google Gemini API (structured output): admin uchun savollarni PDF/rasm/
// matndan ajratib olish va yangi savol yaratish (natija admin ko'rib
// chiqishidan o'tadi), hamda Study Plan uchun haftalik reja.
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
    number: { type: "INTEGER", description: "Question number as printed in the source; 0 if none." },
    module: { type: "STRING", description: "Module/part the question belongs to as printed (e.g. \"1\", \"2\"); empty if unknown." },
    section: { type: "STRING", enum: ["rw", "math"], description: "Only for full tests: rw = Reading and Writing, math = Math." },
    variant: { type: "STRING", description: "\"easy\" / \"hard\" if the module is labelled so; otherwise empty." },
    hasFigure: { type: "BOOLEAN", description: "True if the question relies on a graph, chart, diagram or picture that text cannot reproduce (tables you transcribe as HTML do not count)." },
  },
  required: ["passage", "prompt", "type", "choices", "correctAnswer", "domain", "difficulty", "confidence"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const RETRIABLE = [500, 503, 504];

async function callModel(model, body, timeoutMs) {
  try {
    const res = await fetch(`${API}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.geminiApiKey },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { res, data: await res.json().catch(() => null) };
  } catch (err) {
    // Javob kelmadi (timeout/tarmoq) — band model kabi keyingisiga o'tiladi.
    if (err.name !== "TimeoutError") console.error("[gemini]", err.message);
    return { res: { ok: false, status: 504 }, data: null };
  }
}

// Kunlik tekin limiti (RPD) tugagan modellar: model -> qayta ochiladigan vaqt.
// Tekin tarifda ba'zi modellarga kuniga atigi ~20 so'rov beriladi — limit
// tugagach, har so'rovda ularni sinab vaqt yo'qotmaymiz.
const exhaustedUntil = new Map();

function noteQuota(model, data) {
  const details = data?.error?.details || [];
  const daily = details.some((d) => (d.violations || []).some((v) => /PerDay/i.test(v.quotaId || "")));
  if (!daily) return;
  const delay = Number.parseFloat(details.find((d) => d.retryDelay)?.retryDelay) || 3600;
  exhaustedUntil.set(model, Date.now() + delay * 1000);
  console.warn(`[gemini] ${model} kunlik limiti tugadi (~${Math.round(delay / 3600)} soatdan keyin ochiladi)`);
}

const isExhausted = (m) => (exhaustedUntil.get(m) || 0) > Date.now();

// Kunlik limit tugagan bo'lsa — qachon ochilishi (soat), aks holda null.
function dailyLimitHours(models) {
  if (!models.length || !models.every(isExhausted)) return null;
  const soonest = Math.min(...models.map((m) => exhaustedUntil.get(m)));
  return Math.max(1, Math.round((soonest - Date.now()) / 3_600_000));
}

// Model vaqtincha band (500/503) yoki javob bermasa — bir marta qayta urinadi
// (timeout'da qayta urinmaydi), so'ng zaxira modellarga o'tadi. Tekin limit
// (429) har model uchun alohida — u ham keyingi modelga o'tkaziladi; hamma
// modellar limitda bo'lsa, foydalanuvchiga aytiladi.
// `maxModels` — navbat uzunligi. `preferLite` (OCR) — yengil "lite" modellar
// birinchi: matnni ko'chirishga yetarli, tez va kunlik limiti kattaroq.
function modelQueue({ maxModels, preferLite }) {
  let all = [config.geminiModel, ...config.geminiFallbackModels.filter((m) => m !== config.geminiModel)];
  if (preferLite) all = [...all.filter((m) => /lite/.test(m)), ...all.filter((m) => !/lite/.test(m))];
  const available = all.filter((m) => !isExhausted(m));
  return { all, queue: available.slice(0, maxModels) };
}

async function callWithFallback(body, opts) {
  const { queue } = modelQueue(opts);
  let last = { res: { ok: false, status: 429 }, data: null };
  let retried = false;
  for (let i = 0; i < queue.length; i++) {
    last = await callModel(queue[i], body, opts.timeoutMs);
    if (last.res.ok) return last;
    if (last.res.status === 429) {
      noteQuota(queue[i], last.data);
      console.warn(`[gemini] ${queue[i]} limitda (429)`);
      continue;
    }
    if (!RETRIABLE.includes(last.res.status)) return last;
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
// fast — matnni ko'chirish (OCR) kabi vazifalar: model kam "o'ylaydi",
// javob bir necha barobar tez keladi. Model buni qo'llamasa (400) —
// oddiy rejimda qayta yuboriladi.
export async function generateJson(
  parts,
  schema,
  { temperature = 0.2, timeoutMs = 100_000, maxModels = Infinity, fast = false } = {}
) {
  if (!aiEnabled()) throw new HttpError(503, "ai/disabled", "AI sozlanmagan: serverda GEMINI_API_KEY yo'q.");

  const body = (thinking) =>
    JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        responseSchema: schema,
        ...(thinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
      },
    });
  const opts = { timeoutMs, maxModels, preferLite: fast };
  let { res, data } = await callWithFallback(body(fast), opts);
  if (fast && res.status === 400 && /thinking/i.test(data?.error?.message || "")) {
    ({ res, data } = await callWithFallback(body(false), opts));
  }

  if (res.status === 429) {
    const hours = dailyLimitHours(modelQueue({ ...opts, maxModels: Infinity }).all);
    if (hours) {
      throw new HttpError(
        429,
        "ai/daily-limit",
        `Bugungi tekin AI limiti tugadi (~${hours} soatdan keyin tiklanadi). Doimiy ishlashi uchun Google AI Studio'da to'lovni yoqing.`
      );
    }
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
