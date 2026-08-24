import { createContext, useCallback, useContext, useMemo, useState } from "react";

const HighlightsContext = createContext(null);

/**
 * Bitta test bo'limi (modul) davomida talaba qilgan barcha belgilashlarni
 * (highlight) va ularga yozilgan izohlarni (notes) saqlab turadi — shunda
 * savoldan-savolga o'tganda ham belgilashlar yo'qolmaydi, va "Highlights &
 * Notes" paneli ularning barchasini bitta ro'yxatda ko'rsata oladi.
 */
export function HighlightsProvider({ children }) {
  // store: { [key]: { label, html } } — key har bir maydon uchun (masalan
  // "q12-passage") o'ziga xos, html esa <mark> teglari bilan birga to'liq
  // matn (HighlightableText shu yerdan o'qiydi/yozadi).
  const [store, setStore] = useState({});
  // notes: { [highlightId]: string }
  const [notes, setNotes] = useState({});

  const getHtml = useCallback((key) => store[key]?.html, [store]);

  const setHtml = useCallback((key, label, html) => {
    setStore((s) => ({ ...s, [key]: { label, html } }));
  }, []);

  const setNote = useCallback((highlightId, text) => {
    setNotes((n) => ({ ...n, [highlightId]: text }));
  }, []);

  const resetAll = useCallback(() => {
    setStore({});
    setNotes({});
  }, []);

  // Ro'yxat: har bir saqlangan HTML ichidan <mark>...</mark> qismlarini
  // ajratib olib, panelga chiqarish uchun tekis ro'yxat quramiz.
  const list = useMemo(() => {
    const items = [];
    for (const [key, { label, html }] of Object.entries(store)) {
      const matches = [...html.matchAll(/<mark[^>]*>(.*?)<\/mark>/gs)];
      matches.forEach((m, i) => {
        const highlightId = `${key}::${i}`;
        items.push({
          id: highlightId,
          label,
          text: m[1].replace(/<[^>]+>/g, "").trim(),
          note: notes[highlightId] || "",
        });
      });
    }
    return items;
  }, [store, notes]);

  const value = useMemo(
    () => ({ getHtml, setHtml, list, notes, setNote, resetAll }),
    [getHtml, setHtml, list, notes, setNote, resetAll]
  );

  return <HighlightsContext.Provider value={value}>{children}</HighlightsContext.Provider>;
}

// Provider bo'lmagan joyda ishlatilsa ham (masalan eski/boshqa sahifalarda),
// HighlightableText komponenti buzilib qolmasligi uchun null qaytaramiz —
// chaqiruvchi tomon buni ixtiyoriy deb hisoblashi kerak.
export function useHighlights() {
  return useContext(HighlightsContext);
}
