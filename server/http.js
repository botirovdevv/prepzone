import { HttpError } from "./firebaseAdmin.js";

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export async function readJson(request, maxBytes = 200_000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "So'rov juda katta");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "Noto'g'ri JSON");
  }
}

// Endpoint handler'ini o'raydi: HttpError -> tegishli status, qolgani 500.
export function handle(fn) {
  return async (request) => {
    try {
      return await fn(request);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Serverda xatolik yuz berdi" }, 500);
    }
  };
}

export const isPlainObject = (v) => v != null && typeof v === "object" && !Array.isArray(v);

// Javoblar massivi: faqat qisqa satr yoki null, uzunligi savollar soniga teng.
export function cleanAnswers(arr, length) {
  const src = Array.isArray(arr) ? arr : [];
  return Array.from({ length }, (_, i) => {
    const v = src[i];
    return typeof v === "string" && v.length <= 40 ? v : null;
  });
}

// Client yuboradigan attemptId (crypto.randomUUID) — natija hujjati id'si.
// Tarmoq xatosidan keyin qayta yuborilgan so'rov ikkinchi natija yaratmaydi.
export function attemptDocId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9-]{16,64}$/.test(value)) {
    throw new HttpError(400, "attemptId noto'g'ri");
  }
  return value;
}
