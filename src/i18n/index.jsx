// ------------------------------------------------------------------
// Ikki tilli interfeys (o'zbekcha / inglizcha).
//
// `t("dashboard.title", { name })` — lug'atdagi qatorni qaytaradi,
// `{name}` kabi joylarni almashtiradi. Inglizcha lug'atda kalit bo'lmasa
// o'zbekchasi, u ham bo'lmasa kalitning o'zi chiqadi.
// `tr(key)` — qatorni emas, xom qiymatni (massiv/obyekt) qaytaradi.
//
// Tanlangan til localStorage'da saqlanadi. React tashqarisidagi kod
// (api/client, utils) `getLang()` orqali joriy tilni oladi.
// Test ishlash ekrani (Bluebook) va admin panel bu tizimdan
// foydalanmaydi: birinchisi doim inglizcha, ikkinchisi o'zbekcha.
// ------------------------------------------------------------------
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import uz from "./uz";
import en from "./en";

export const LANGS = ["uz", "en"];
const DICTS = { uz, en };
const STORAGE_KEY = "pz-lang";
const LOCALES = { uz: "uz-UZ", en: "en-US" };

function readStoredLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(v) ? v : "uz";
  } catch {
    return "uz";
  }
}

let currentLang = readStoredLang();
export const getLang = () => currentLang;
export const getLocale = () => LOCALES[currentLang];

function lookup(dict, key) {
  let node = dict;
  for (const part of key.split(".")) {
    if (node == null) return undefined;
    node = node[part];
  }
  return node;
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] != null ? String(vars[name]) : m));
}

// Komponentlardan tashqarida ham ishlatsa bo'ladi (joriy til bo'yicha).
export function translate(key, vars, lang = currentLang) {
  const value = lookup(DICTS[lang], key) ?? lookup(DICTS.uz, key);
  if (typeof value !== "string") return value === undefined ? key : value;
  return interpolate(value, vars);
}

export function formatDate(value, options, lang = currentLang) {
  if (value == null) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(LOCALES[lang], options);
}

export function formatNumber(value, options, lang = currentLang) {
  return Number(value || 0).toLocaleString(LOCALES[lang], options);
}

const I18nContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(currentLang);

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next)) return;
    currentLang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private rejimda saqlanmasa ham til shu sessiyada almashadi.
    }
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        const v = translate(key, vars, lang);
        return typeof v === "string" ? v : key;
      },
      tr: (key) => translate(key, undefined, lang),
      fmtDate: (v, opts) => formatDate(v, opts, lang),
      fmtNumber: (v, opts) => formatNumber(v, opts, lang),
      locale: LOCALES[lang],
    }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n LanguageProvider ichida ishlatilishi kerak");
  return ctx;
}

// UZ | EN almashtirgich. `tone="dark"` — to'q fonli joylar uchun.
export function LanguageSwitch({ className = "", tone = "light" }) {
  const { lang, setLang, t } = useI18n();
  const base =
    tone === "dark"
      ? "border-white/15 bg-white/5 text-white/60"
      : "border-[#111827]/10 bg-white text-[#566176]";
  const active = tone === "dark" ? "bg-white text-[#111827]" : "bg-[#111827] text-white";
  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={`inline-flex items-center rounded-full border p-0.5 text-[12px] font-bold ${base} ${className}`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition ${lang === l ? active : "hover:opacity-80"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
