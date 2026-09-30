// Brauzer bo'sh qolganda (sahifa render bo'lib bo'lgach) fn'ni chaqiradi.
// Sahifa chunk'larini oldindan yuklash (prefetch) uchun — Next.js'dagidek
// keyingi sahifa bosilganda darhol ochiladi. Qaytgan funksiya bekor qiladi.
export function onIdle(fn, timeout = 3000) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(fn, 1500);
  return () => clearTimeout(t);
}

// import() funksiyalarini ketma-ket, bittadan yuklaydi — tarmoqni birdaniga
// band qilmaslik uchun. Xatolar e'tiborsiz (sahifa ochilganda qayta urinadi).
export async function prefetchAll(loaders) {
  for (const load of loaders) {
    try {
      await load();
    } catch {
      /* ignore */
    }
  }
}
