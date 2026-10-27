// Frontend xatolarni `code` bo'yicha tanib, o'zbekcha xabar ko'rsatadi.
// Express 5 async handler'lardagi xatolarni o'zi ushlaydi, shuning uchun
// routelarda shunchaki `throw new HttpError(...)` qilinadi.
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (code, message) => new HttpError(400, code, message);
export const unauthorized = (message = "Avval tizimga kiring.") =>
  new HttpError(401, "auth/unauthenticated", message);
export const forbidden = (message = "Bu amal uchun ruxsat yo'q.") =>
  new HttpError(403, "permission-denied", message);
export const notFound = (message = "Topilmadi.") => new HttpError(404, "not-found", message);

// Zod xatosini bitta tushunarli xabarga aylantiradi.
export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    throw badRequest("invalid-argument", first?.message || "Ma'lumotlar noto'g'ri.");
  }
  return result.data;
}
