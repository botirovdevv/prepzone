// ------------------------------------------------------------------
// Backend API bilan ishlash uchun yagona fetch o'rami.
//
// Sessiya httpOnly cookie'da saqlanadi — shuning uchun har bir so'rov
// `credentials: "include"` bilan yuboriladi va token bilan qo'lda
// ishlash shart emas. Xatolar `ApiError` (code + message) ko'rinishida
// tashlanadi; `code` qiymatlari server/src/lib/errors.js'dagi bilan bir xil.
// ------------------------------------------------------------------

// Bo'sh bo'lsa — API shu domenda (/api). Frontend alohida domenda
// joylashsa VITE_API_URL=https://api.example.com qilib beriladi.
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network-error", "Serverga ulanib bo'lmadi. Internetni tekshiring.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.code || "internal",
      data?.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring."
    );
  }
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body = {}) => request("POST", path, body),
  put: (path, body = {}) => request("PUT", path, body),
  patch: (path, body = {}) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

// Tarmoq uzilishi yoki server vaqtincha ishlamasa — bir necha marta qayta
// urinish (test natijasini yuborish kabi muhim so'rovlar uchun).
export async function withRetry(fn, attempts = 3) {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = err instanceof ApiError && (err.status === 0 || err.status >= 500);
      if (!retryable || i >= attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
}
