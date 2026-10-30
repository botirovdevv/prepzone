import { useState } from "react";
import {
  LuMonitor,
  LuCamera,
  LuMousePointerClick,
  LuLogOut,
  LuArrowRight,
  LuClock,
  LuLayers,
  LuCoffee,
  LuBookmark,
  LuShieldCheck,
  LuInfo,
} from "react-icons/lu";
import { LanguageSwitch, useI18n } from "../i18n";

const ICONS = {
  timing: LuClock,
  adaptive: LuLayers,
  break: LuCoffee,
  tools: LuBookmark,
  fullscreen: LuMonitor,
  screenshot: LuCamera,
  copy: LuMousePointerClick,
  exit: LuLogOut,
};

function InfoList({ items, tone }) {
  const iconTone = tone === "blue" ? "bg-[#087fd1]/10 text-[#087fd1]" : "bg-amber-500/10 text-amber-600";
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon] || LuInfo;
        return (
          <li key={item.title} className="flex gap-3.5">
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
              <Icon size={17} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">{item.title}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#566176]">{item.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Test boshlanishidan oldingi ekran: test formati haqida ma'lumot va
// proktoring qoidalari. Rozilik belgilangach "Boshlash" fullscreen so'raydi.
export default function RulesGate({ onStart, isResume, title }) {
  const { t, tr } = useI18n();
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);

  const handleStart = async () => {
    if (!agreed || starting) return;
    setStarting(true);
    setError(false);
    const ok = await onStart();
    if (!ok) {
      setError(true);
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] text-[#111827]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-6 sm:px-8">
        <img src="/Logo.png" alt="Prepzone" className="h-7 w-auto" />
        <LanguageSwitch />
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-12 pt-10 sm:px-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#087fd1]">
          {t("proctor.rules.eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          {isResume ? t("proctor.rules.titleResume") : t("proctor.rules.title")}
        </h1>
        {title && <p className="mt-2 text-[15px] font-semibold text-[#344054]">{title}</p>}
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#566176]">{t("proctor.rules.subtitle")}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-[#111827]/[0.07] bg-white p-6 sm:p-7">
            <h2 className="mb-5 flex items-center gap-2 text-[17px] font-bold tracking-tight">
              <LuInfo size={18} className="text-[#087fd1]" />
              {t("proctor.rules.aboutTitle")}
            </h2>
            <InfoList items={tr("proctor.rules.about")} tone="blue" />
          </section>

          <section className="rounded-3xl border border-[#111827]/[0.07] bg-white p-6 sm:p-7">
            <h2 className="mb-5 flex items-center gap-2 text-[17px] font-bold tracking-tight">
              <LuShieldCheck size={18} className="text-amber-600" />
              {t("proctor.rules.rulesTitle")}
            </h2>
            <InfoList items={tr("proctor.rules.rules")} tone="amber" />
          </section>
        </div>

        <div className="mt-6 rounded-3xl border border-[#111827]/[0.07] bg-white p-5 sm:p-6">
          <label className="flex cursor-pointer select-none items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#087fd1]"
            />
            <span className="text-[15px] font-medium text-[#344054]">{t("proctor.rules.agree")}</span>
          </label>

          {error && <p className="mt-4 text-sm text-red-600">{t("proctor.rules.fullscreenError")}</p>}

          <button
            onClick={handleStart}
            disabled={!agreed || starting}
            className={`group mt-5 flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold transition sm:w-auto ${
              agreed
                ? "bg-[#087fd1] text-white hover:bg-[#066fb8]"
                : "cursor-not-allowed bg-[#111827]/[0.06] text-[#98a2b3]"
            }`}
          >
            {starting
              ? t("proctor.rules.starting")
              : isResume
              ? t("proctor.rules.resume")
              : t("proctor.rules.start")}
            {!starting && <LuArrowRight size={18} className="transition group-hover:translate-x-0.5" />}
          </button>
        </div>
      </main>
    </div>
  );
}
