import { useEffect, useState } from "react";
import { loadSatTest } from "../data/satTest";
import { loadIeltsTest } from "../data/ielts";

// Test ma'lumotini (alohida chunk) yuklaydi.
// Qaytaradi: undefined — yuklanmoqda, null — topilmadi/xato, obyekt — test.
function useAsyncContent(load, id) {
  const [state, setState] = useState({ id: undefined, value: undefined });
  useEffect(() => {
    let cancelled = false;
    load(id)
      .then((value) => !cancelled && setState({ id, value: value || null }))
      .catch((err) => {
        console.error("Test ma'lumotini yuklashda xatolik:", err);
        if (!cancelled) setState({ id, value: null });
      });
    return () => {
      cancelled = true;
    };
  }, [load, id]);
  return state.id === id ? state.value : undefined;
}

export const useSatTest = (id) => useAsyncContent(loadSatTest, id);
export const useIeltsTest = (id) => useAsyncContent(loadIeltsTest, id);
