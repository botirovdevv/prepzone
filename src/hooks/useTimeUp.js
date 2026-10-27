import { useEffect, useRef } from "react";

// ------------------------------------------------------------------
// Modul vaqti tugaganda `onTimeUp` ni bir marta chaqiradi (haqiqiy
// SAT'dagidek modul avtomatik yakunlanadi).
//
// moduleKey — joriy modulni bildiradi (masalan "0:module1"). Modul
// almashgan zahoti secondsLeft hali eski (0) qiymatda bo'lishi mumkin,
// shuning uchun taymer faqat shu modulda vaqt > 0 ekani ko'rilgandan
// keyingina "qurollanadi" — aks holda yangi modul darhol yakunlanib
// ketardi.
// ------------------------------------------------------------------
export function useTimeUp({ active, secondsLeft, moduleKey, onTimeUp }) {
  const armedKeyRef = useRef(null);
  const firedKeyRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!active) return;
    if (secondsLeft > 0) {
      armedKeyRef.current = moduleKey;
      return;
    }
    if (armedKeyRef.current !== moduleKey || firedKeyRef.current === moduleKey) return;
    firedKeyRef.current = moduleKey;
    onTimeUpRef.current();
  }, [active, secondsLeft, moduleKey]);
}
