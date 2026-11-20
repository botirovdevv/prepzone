import { useEffect, useState } from "react";
import { loadSatTest } from "../data/satTest";

// SAT test ma'lumotini (alohida chunk, javob kalitlarisiz) yuklaydi.
// Qaytaradi: undefined — yuklanmoqda, null — topilmadi/xato, obyekt — test.
export function useSatTest(id) {
  const [state, setState] = useState({ id: undefined, value: undefined });
  useEffect(() => {
    let cancelled = false;
    let timer = null;
    // null — test haqiqatan yo'q (olib tashlangan). Tarmoq xatosida esa
    // "olib tashlangan" deb ko'rsatmaslik uchun bir necha marta qayta uriniladi.
    const attempt = (n) =>
      loadSatTest(id)
        .then((value) => !cancelled && setState({ id, value: value || null }))
        .catch((err) => {
          console.error("Test ma'lumotini yuklashda xatolik:", err);
          if (cancelled) return;
          if (n < 4) timer = setTimeout(() => attempt(n + 1), 1500 * (n + 1));
          else setState({ id, value: null });
        });
    attempt(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);
  return state.id === id ? state.value : undefined;
}
