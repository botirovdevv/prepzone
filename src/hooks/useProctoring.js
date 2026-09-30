import { useCallback, useEffect, useRef, useState } from "react";

// ------------------------------------------------------------------
// Test paytidagi xavfsizlik nazorati (proktoring).
//
// Bu yerdagi hamma narsa brauzerda, mijoz (client) tomonida ishlaydi.
// Bu shuni anglatadiki: odatiy foydalanuvchini tekin skrinshotdan yoki
// oyna almashtirishdan qaytaradi, lekin texnik bilimga ega odam buni
// aylanib o'tishi mumkin (masalan DevTools'ni operatsion tizim
// darajasida ochib, JS listenerlarni o'chirib qo'yish orqali).
// 100% kafolatlangan proktoring faqat serverda (masalan kamera bilan
// nazorat qiluvchi xizmat) mumkin bo'ladi.
//
// Qoidalar:
//  - Fullscreen'dan chiqish -> darhol "onForceTerminate('fullscreen')"
//  - Skrinshot urinishi / boshqa tab'ga o'tish / DevTools ochish ->
//    ogohlantirish (onViolationWarning). "maxWarnings" tagacha
//    to'planib qolsa, shuningdek "onForceTerminate('warnings')"
//    chaqiriladi.
// ------------------------------------------------------------------

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "");

export function useProctoring({
  active,
  onForceTerminate,
  onViolationWarning,
  maxWarnings = 3,
}) {
  const [warning, setWarning] = useState(null); // { type, message, count }
  const [warningCount, setWarningCount] = useState(0);

  const activeRef = useRef(active);
  const intentionalExitRef = useRef(false);
  const warnTimeoutRef = useRef(null);
  const exitTimeoutRef = useRef(null);
  const warningCountRef = useRef(0);
  // Callback'lar ref'da: sahifa har render'da yangi funksiya bersa ham
  // listener'lar qayta ulanmaydi (effektlar faqat `active`ga bog'liq).
  const terminateRef = useRef(onForceTerminate);
  const violationRef = useRef(onViolationWarning);
  terminateRef.current = onForceTerminate;
  violationRef.current = onViolationWarning;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(
    () => () => {
      clearTimeout(warnTimeoutRef.current);
      clearTimeout(exitTimeoutRef.current);
    },
    []
  );

  const requestFullscreen = useCallback(async () => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else return false;
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  // Test o'zi "toza" tugatayotganda (natural finish, chiqish tugmasi,
  // yoki test yakunlanib chetlatilgandan keyin) fullscreen'dan
  // chiqishdan oldin shuni chaqirish kerak — aks holda bu ham
  // "qoida buzilishi" deb hisoblanib qoladi.
  const exitFullscreenIntentionally = useCallback(async () => {
    intentionalExitRef.current = true;
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      }
    } catch (err) {
      /* ignore */
    }
    clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = setTimeout(() => {
      intentionalExitRef.current = false;
    }, 800);
  }, []);

  const pushWarning = useCallback(
    (type, message) => {
      if (!activeRef.current) return;
      // Sanoq ref'da yuritiladi: side-effectlar setState updater ichida
      // bo'lsa, StrictMode'da ikki marta chaqirilib qoladi.
      const next = warningCountRef.current + 1;
      warningCountRef.current = next;
      setWarningCount(next);
      setWarning({ type, message, count: next });
      violationRef.current?.(type, next, message);
      if (warnTimeoutRef.current) clearTimeout(warnTimeoutRef.current);
      warnTimeoutRef.current = setTimeout(() => setWarning(null), 5000);
      if (next >= maxWarnings) {
        terminateRef.current?.("warnings");
      }
    },
    [maxWarnings]
  );

  // 1) Fullscreen'dan chiqish -> darhol test tugaydi
  useEffect(() => {
    if (!active) return;
    const handleChange = () => {
      const inFullscreen = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      if (!inFullscreen && activeRef.current && !intentionalExitRef.current) {
        terminateRef.current?.("fullscreen");
      }
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, [active]);

  // 2) Skrinshot va DevTools klaviatura kombinatsiyalari (imkon qadar)
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      const key = (e.key || "").toLowerCase();
      const isWinSnip = e.shiftKey && e.metaKey && key === "s"; // Win+Shift+S
      const isMacShot = e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key); // Cmd+Shift+3/4/5

      if (key === "printscreen" || isWinSnip || isMacShot) {
        e.preventDefault?.();
        pushWarning(
          "screenshot",
          "Skrinshot olish taqiqlangan! Bu urinish qayd etildi."
        );
      }

      // Nusxa ko'chirish va manba kodini ko'rish yorliqlarini bloklash
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "u", "p"].includes(key)) {
        e.preventDefault();
      }

      // DevTools ochish urinishi (to'liq kafolat bermaydi, lekin qiyinlashtiradi)
      if (
        key === "f12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key))
      ) {
        e.preventDefault();
        pushWarning(
          "devtools",
          "Brauzer konsolini (DevTools) ochish taqiqlangan!"
        );
      }
    };

    const handleKeyUp = (e) => {
      if ((e.key || "").toLowerCase() === "printscreen") {
        pushWarning(
          "screenshot",
          "Skrinshot olish taqiqlangan! Bu urinish qayd etildi."
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active, pushWarning]);

  // 3) Boshqa tab/oynaga o'tish
  useEffect(() => {
    if (!active) return;
    const handleVisibility = () => {
      if (document.hidden) {
        pushWarning("tabswitch", "Boshqa oyna yoki tabga o'tish taqiqlangan!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [active, pushWarning]);

  // 4) O'ng tugma menyusi, nusxalash, kesish, joylashtirish, matn belgilash
  useEffect(() => {
    if (!active) return;
    const block = (e) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.body.classList.add("select-none");
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.body.classList.remove("select-none");
    };
  }, [active]);

  // 5) Sahifani tasodifan yopib/yangilab qo'yishdan ogohlantirish
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);

  const dismissWarning = useCallback(() => setWarning(null), []);

  return {
    requestFullscreen,
    exitFullscreenIntentionally,
    warning,
    warningCount,
    dismissWarning,
    isMac: IS_MAC,
  };
}
