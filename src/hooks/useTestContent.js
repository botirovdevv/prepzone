import { useEffect, useState } from "react";
import { loadSatTest } from "../data/satTest";

// SAT test ma'lumotini (alohida chunk, javob kalitlarisiz) yuklaydi.
// Qaytaradi: undefined — yuklanmoqda, null — topilmadi/xato, obyekt — test.
export function useSatTest(id) {
  const [state, setState] = useState({ id: undefined, value: undefined });
  useEffect(() => {
    let cancelled = false;
    loadSatTest(id)
      .then((value) => !cancelled && setState({ id, value: value || null }))
      .catch((err) => {
        console.error("Test ma'lumotini yuklashda xatolik:", err);
        if (!cancelled) setState({ id, value: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return state.id === id ? state.value : undefined;
}
