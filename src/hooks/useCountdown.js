import { useEffect, useRef, useState } from "react";

// Taymerlar mutlaq muddat (endAt, ms) bilan ishlaydi: tab fonda
// sekinlashtirilsa ham vaqt "suzmaydi", va sahifa har soniyada qayta
// render bo'lmaydi — faqat soniyalarni ko'rsatadigan kichik komponent.

// Qolgan soniyalar (har soniyada yangilanadi). endAt == null -> null.
export function useSecondsLeft(endAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endAt == null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endAt]);
  return endAt == null ? null : Math.max(0, Math.ceil((endAt - now) / 1000));
}

// Muddat tugaganda onExpire bir marta chaqiriladi.
export function useDeadline(endAt, onExpire) {
  const cb = useRef(onExpire);
  cb.current = onExpire;
  useEffect(() => {
    if (endAt == null) return;
    const id = setTimeout(() => cb.current?.(), Math.max(0, endAt - Date.now()));
    return () => clearTimeout(id);
  }, [endAt]);
}

export const secondsUntil = (endAt) => (endAt == null ? null : Math.max(0, Math.round((endAt - Date.now()) / 1000)));
