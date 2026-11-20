// Ko'rinish (mavzu): "light" | "dark" | "system" (Auto — standart).
// HIG: tizim sozlamasini hurmat qilish — shuning uchun standart holat Auto.
// Tanlov localStorage'da saqlanadi; index.html'dagi kichik skript uni
// sahifa chizilishidan oldin qo'llaydi (oq miltillash bo'lmasligi uchun).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pz-theme";
const THEME_COLORS = { light: "#f5f5f7", dark: "#000000" };

const ThemeContext = createContext(null);

function readStored() {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStored);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Tizim mavzusi o'zgarsa (Auto rejimida kun davomida), darhol kuzatamiz.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute("content", THEME_COLORS[resolved]);
    });
  }, [theme, resolved]);

  const setTheme = useCallback((next) => {
    // Ranglar keskin almashmasligi uchun qisqa crossfade.
    const root = document.documentElement;
    root.classList.add("pz-theme-switching");
    window.setTimeout(() => root.classList.remove("pz-theme-switching"), 320);
    setThemeState(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* saqlab bo'lmasa ham joriy sessiyada ishlaydi */
    }
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme ThemeProvider ichida ishlatilishi kerak");
  return ctx;
}
