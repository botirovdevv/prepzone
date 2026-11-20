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
import modules from "./messages";

export const LANGS = ["uz", "en"];
// Asosiy lug'at (uz.js / en.js) + sahifa bo'yicha modullar
// (messages/*.js — har birida { uz: {...}, en: {...} }).
const DICTS = {
  uz: Object.assign({}, uz, ...modules.map((m) => m.uz)),
  en: Object.assign({}, en, ...modules.map((m) => m.en)),
};
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
  // HIG segmented control: kulrang "quduq" ichida tanlangan segment ko'tarilib turadi.
  const base = tone === "dark" ? "border-white/15 bg-white/5 text-white/60" : "border-transparent bg-fill text-ink-2";
  const active =
    tone === "dark"
      ? "bg-white text-ink"
      : "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)] dark:bg-ink/25";
  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={`inline-flex items-center rounded-full border p-[3px] text-[12px] font-semibold ${base} ${className}`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition ${lang === l ? active : "hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
