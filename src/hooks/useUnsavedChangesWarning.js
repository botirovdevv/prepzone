import { useEffect, useRef } from "react";

const DEFAULT_MESSAGE =
  "Saqlanmagan o'zgarishlar bor. Sahifadan chiqsangiz, ular yo'qoladi. Baribir chiqasizmi?";

/**
 * `isDirty` true bo'lganda foydalanuvchi sahifani tark etishga urinsa
 * (yangilash, yopish, brauzerning orqaga tugmasi yoki ilova ichidagi
 * havolalar orqali) ogohlantirish chiqaradi.
 *
 * Eslatma: dastur ichidagi `navigate(...)` chaqiruvlari (masalan,
 * muvaffaqiyatli saqlagandan keyin) bu tekshiruvdan ta'sirlanmaydi —
 * ular faqat haqiqiy sahifa tark etilishida (klik/orqaga/yopish) ishlaydi.
 */
export default function useUnsavedChangesWarning(isDirty, message = DEFAULT_MESSAGE) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Sahifani yopish / yangilash / manzilni qo'lda o'zgartirish.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Ilova ichidagi havolalar (Sidebar, "Amaliyot to'plamlari" kabi <a> teglar).
  useEffect(() => {
    const handleClick = (e) => {
      if (!isDirtyRef.current) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest("a[href]");
      if (!link || link.target === "_blank") return;
      let url;
      try {
        url = new URL(link.href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [message]);

  // Brauzerning "orqaga" / "oldinga" tugmalari.
  useEffect(() => {
    if (!isDirty) return;
    window.history.pushState(null, "", window.location.href);
    let bypass = false;
    const handlePopState = () => {
      if (bypass) return;
      if (!window.confirm(message)) {
        window.history.pushState(null, "", window.location.href);
      } else {
        bypass = true;
        window.history.back();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty, message]);
}
