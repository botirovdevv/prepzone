import { auth } from "../firebase/app";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Serverdagi /api/* endpoint'lariga so'rov: Firebase ID token qo'shiladi,
// xato bo'lsa server xabari bilan ApiError tashlanadi.
export async function apiFetch(path, { method = "POST", body, query } = {}, _refreshed = false) {
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, "Tizimga kiring");
  const token = await user.getIdToken(_refreshed);
  const qs = query ? `?${new URLSearchParams(query)}` : "";
  let res;
  try {
    res = await fetch(`/api/${path}${qs}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Internet aloqasini tekshiring");
  }
  const data = await res.json().catch(() => ({}));
  // Email yaqinda tasdiqlangan bo'lsa, eski token'da email_verified=false
  // qolgan bo'lishi mumkin — token'ni yangilab bir marta qayta urinamiz.
  if ((res.status === 401 || res.status === 403) && !_refreshed) {
    return apiFetch(path, { method, body, query }, true);
  }
  if (!res.ok) throw new ApiError(res.status, data.error || "Serverda xatolik yuz berdi");
  return data;
}

// Tarmoq uzilishi yoki server vaqtincha ishlamasa — bir necha marta qayta urinish.
export async function apiFetchRetry(path, options, attempts = 3) {
  for (let i = 0; ; i++) {
    try {
      return await apiFetch(path, options);
    } catch (err) {
      const retryable = err instanceof ApiError && (err.status === 0 || err.status >= 500);
      if (!retryable || i >= attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
}
