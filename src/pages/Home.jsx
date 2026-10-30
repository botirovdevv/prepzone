import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuArrowRight,
  LuArrowUp,
  LuBookOpenCheck,
  LuCalculator,
  LuCalendarClock,
  LuChartColumn,
  LuCheck,
  LuChevronDown,
  LuClock,
  LuKeyRound,
  LuLayers,
  LuLanguages,
  LuListChecks,
  LuMenu,
  LuTarget,
  LuTrophy,
  LuX,
} from "react-icons/lu";
import { nextTestDate, daysLeft } from "../data/testDates";
import { LanguageSwitch, useI18n } from "../i18n";

const logo = "/Logo.png";

const NAV_LINKS = ["tests", "features", "how", "faq"];

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// Sahifadagi `.home-reveal` elementlarini ko'rinish maydoniga kirganda
// ko'rsatadi (bir marta). Animatsiya CSS'da, reduced-motion'da o'chadi.
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll(".home-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

const formatDay = (key) => key.split("-").reverse().join(".");

// ---------------- Navbar ----------------
// Yuqorida shaffof, sahifa pastga aylantirilganda markazda "suzuvchi"
// pill ko'rinishiga o'tadigan navbar. Mobil'da — ochiladigan menyu.
function Navbar({ onLogin, onRegister }) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto flex h-16 items-center justify-between rounded-full border px-3 transition-[max-width,background-color,border-color,box-shadow] duration-500 ease-out-strong sm:px-4 ${
          scrolled || menuOpen
            ? "max-w-[1040px] border-[#111827]/[0.08] bg-white/80 shadow-[0_10px_40px_-12px_rgba(17,24,39,0.18)] backdrop-blur-xl"
            : "max-w-[1280px] border-transparent bg-transparent"
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-10 shrink-0 items-center overflow-hidden pl-2"
          aria-label={t("home.toTop")}
        >
          <img src={logo} alt="Prepzone" className="w-32 max-h-full object-contain" />
        </button>

        <nav className="hidden items-center gap-1 rounded-full p-1 text-[14px] font-medium text-[#566176] lg:flex">
          {NAV_LINKS.map((id) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="rounded-full px-4 py-2 transition hover:bg-[#111827]/[0.05] hover:text-[#111827]"
            >
              {t(`home.nav.${id}`)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitch className="mr-1" />
          <button
            onClick={onLogin}
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#111827]/[0.05] sm:block"
          >
            {t("home.login")}
          </button>
          <button
            onClick={onRegister}
            className="group hidden items-center gap-1.5 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#087fd1] sm:inline-flex"
          >
            {t("home.start")}
            <LuArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? t("home.closeMenu") : t("home.openMenu")}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#111827] transition hover:bg-[#111827]/[0.05] lg:hidden"
          >
            {menuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobil menyu */}
      {menuOpen && (
        <div className="home-menu-in mx-auto mt-2 max-w-[1040px] rounded-3xl border border-[#111827]/[0.08] bg-white p-2 shadow-[0_20px_50px_-15px_rgba(17,24,39,0.25)] lg:hidden">
          {NAV_LINKS.map((id) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-semibold text-[#111827] transition hover:bg-[#111827]/[0.04]"
            >
              {t(`home.nav.${id}`)}
              <LuArrowRight size={16} className="text-[#111827]/30" />
            </button>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#111827]/[0.06] p-2 pt-3">
            <button
              onClick={onLogin}
              className="rounded-full border border-[#111827]/12 py-3 text-sm font-bold text-[#111827] transition hover:bg-[#111827]/[0.04]"
            >
              {t("home.login")}
            </button>
            <button
              onClick={onRegister}
              className="rounded-full bg-[#087fd1] py-3 text-sm font-bold text-white transition hover:bg-[#066fb8]"
            >
              {t("home.register")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------- Hero preview: SAT ----------------
function SatPreview() {
  const { t } = useI18n();
  return (
    <>
      <div className="flex h-11 items-center justify-between border-b border-[#e7ebef] bg-[#f8fafb] px-5 text-[11px]">
        <span className="font-semibold text-[#111827]">Section 1, Module 1: Reading and Writing</span>
        <span className="flex items-center gap-1.5 font-bold tabular-nums text-[#111827]">
          <LuClock size={12} /> 31:23
        </span>
      </div>
      <div className="grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-[#e8edf1] p-6 md:border-b-0 md:border-r">
          <p className="text-[13px] leading-6 text-[#303a46]">
            The mihrab (or niche) is one of many features that distinguish mosque architecture and is therefore
            considered <span className="rounded bg-[#fff3b0] px-0.5">______</span> aspect of mosque design.
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-[#e8edf1] pt-4 text-[11px]">
            <span className="text-[#9aa4b2]">Question 12 of 27</span>
            <span className="flex items-center gap-1 font-semibold text-[#087fd1]">
              <LuCalculator size={12} /> {t("home.desmosSoon")}
            </span>
          </div>
        </div>
        <div className="bg-[#fcfdfe] p-6">
          <p className="text-[13px] font-medium leading-6 text-[#202833]">
            Which choice completes the text with the most logical and precise word or phrase?
          </p>
          <div className="mt-5 space-y-2">
            {["an unprecedented", "an embellished", "an imposing", "a fundamental"].map((answer, i) => {
              const picked = i === 3;
              return (
                <div
                  key={answer}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[12px] ${
                    picked ? "border-[#087fd1] bg-[#087fd1]/[0.05] text-[#111827]" : "border-[#e1e6eb] bg-white text-[#657184]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                      picked ? "border-[#087fd1] bg-[#087fd1] text-white" : "border-[#cbd3dc] text-[#697586]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {answer}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function HeroPreview() {
  const { t } = useI18n();
  return (
    <div className="relative lg:pl-4">
      <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-[#087fd1]/15 via-transparent to-[#087fd1]/5 blur-3xl" />

      <div className="overflow-hidden rounded-[20px] border border-[#cfd7df] bg-white shadow-[0_30px_80px_rgba(24,54,78,0.13)]">
        <div className="min-h-[340px]">
          <SatPreview />
        </div>
      </div>

      <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-[#dce3e8] bg-white px-4 py-3 shadow-[0_15px_40px_rgba(24,54,78,0.10)] sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <LuTarget size={17} />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a2b3]">{t("home.goal")}</p>
          <p className="text-[15px] font-bold text-[#111827]">SAT 1400</p>
        </div>
      </div>
    </div>
  );
}

// Keyingi rasmiy test kunlari (src/data/testDates.js).
function TestDayPills() {
  const { t } = useI18n();
  const items = [["SAT", nextTestDate(), "bg-[#087fd1]"]].filter(([, d]) => d);
  if (!items.length) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {items.map(([label, date, dot]) => {
        const left = daysLeft(date);
        return (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-[#111827]/[0.08] bg-white px-3.5 py-2 text-[12.5px] text-[#566176]"
          >
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {t("home.nextTest", { label })} <b className="font-semibold tabular-nums text-[#111827]">{formatDay(date)}</b>
            <span className="text-[#111827]/30">·</span>
            <span className="font-semibold text-[#111827]">{left === 0 ? t("home.today") : t("home.daysLeft", { n: left })}</span>
          </span>
        );
      })}
    </div>
  );
}

// ---------------- Imkoniyatlar (bento) ----------------
function FeatureCard({ icon: Icon, tone = "blue", title, text, className = "", children, delay = 0 }) {
  const tones = {
    blue: "bg-[#087fd1]/10 text-[#087fd1]",
    red: "bg-[#e4002b]/10 text-[#e4002b]",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    ink: "bg-[#111827]/[0.06] text-[#111827]",
  };
  return (
    <div
      className={`home-reveal flex flex-col rounded-3xl border border-[#111827]/[0.07] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-25px_rgba(17,24,39,0.35)] sm:p-7 ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <h3 className="mt-5 text-[18px] font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-6 text-[#667085]">{text}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </div>
  );
}

function Features() {
  const { t, tr } = useI18n();
  return (
    <section id="features" className="scroll-mt-24 border-y border-[#111827]/[0.08] bg-[#f5f6f4]">
      <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="home-reveal max-w-[640px]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#087fd1]">{t("home.featuresEyebrow")}</p>
          <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            {t("home.featuresTitle")}
            <br />
            <span className="text-[#98a2b3]">{t("home.featuresTitleMuted")}</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={LuBookOpenCheck}
            title={t("home.fAdaptiveTitle")}
            text={t("home.fAdaptiveText")}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
              {[
                ["Module 1", "bg-[#111827] text-white"],
                ["Module 2 · Hard", "bg-[#087fd1] text-white"],
                ["Module 2 · Easy", "bg-[#111827]/[0.05] text-[#98a2b3]"],
              ].map(([label, cls]) => (
                <div key={label} className={`rounded-xl px-2 py-3 ${cls}`}>
                  {label}
                </div>
              ))}
              <div className="col-span-3 flex items-center justify-center gap-4 rounded-xl border border-dashed border-[#111827]/10 py-2.5 text-[#667085]">
                <span className="flex items-center gap-1.5">
                  <LuCalculator size={13} /> {t("home.desmosSoon")}
                </span>
                <span className="flex items-center gap-1.5">
                  <LuClock size={13} /> {t("home.timer")}
                </span>
                <span className="flex items-center gap-1.5">
                  <LuListChecks size={13} /> Mark for review
                </span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuLayers}
            tone="red"
            title={t("home.fSetsTitle")}
            text={t("home.fSetsText")}
            delay={80}
          >
            {/* Namuna: haqiqiy to'plamlar admin panelda qo'shiladi, shuning uchun son ko'rsatilmaydi. */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {tr("home.months").map((k) => (
                <div key={k} className="rounded-xl bg-[#f6f7f9] py-2.5">
                  <p className="text-[10px] font-bold text-[#98a2b3]">SAT</p>
                  <p className="text-[15px] font-bold">{k}</p>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuChartColumn}
            tone="emerald"
            title={t("home.fTopicsTitle")}
            text={t("home.fTopicsText")}
          >
            <div className="space-y-2.5">
              {[
                ["Algebra", 86],
                ["Advanced Math", 64],
                ["Craft & Structure", 52],
              ].map(([label, pct]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-[#566176]">
                    <span>{label}</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#111827]/[0.06]">
                    <div
                      className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuCalendarClock}
            tone="amber"
            title={t("home.fPlanTitle")}
            text={t("home.fPlanText")}
            delay={80}
          >
            <div className="flex items-end justify-between rounded-2xl bg-[#111827] p-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{t("home.planTarget")}</p>
                <p className="font-['Inter_Tight'] text-[30px] font-semibold leading-none">
                  24 <span className="text-[14px] font-medium text-white/60">{t("home.planDays")}</span>
                </p>
              </div>
              <LuTarget size={22} className="text-[#53b7f5]" />
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuLanguages}
            tone="ink"
            title={t("home.fVocabTitle")}
            text={t("home.fVocabText")}
            delay={160}
          >
            <div className="flex flex-wrap gap-1.5">
              {["meticulous", "ubiquitous", "mitigate", "coherent", "plausible"].map((w) => (
                <span key={w} className="rounded-full border border-[#111827]/10 px-3 py-1 text-[12px] font-medium text-[#344054]">
                  {w}
                </span>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuTrophy}
            tone="amber"
            title={t("home.fRankTitle")}
            text={t("home.fRankText")}
          />

          <FeatureCard
            icon={LuKeyRound}
            title={t("home.fCodeTitle")}
            text={t("home.fCodeText")}
            className="lg:col-span-2"
            delay={80}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5">
                {"482913".split("").map((d, i) => (
                  <span
                    key={i}
                    className="flex h-11 w-9 items-center justify-center rounded-lg border border-[#111827]/12 bg-[#fcfcfa] font-['Inter_Tight'] text-[18px] font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t("home.liveMonitor")}
              </span>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

// ---------------- Natija hisoboti (namuna) ----------------
function ReportPreview({ onStart }) {
  const { t, tr } = useI18n();
  return (
    <section className="bg-[#111827] text-white">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
        <div className="home-reveal">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#53b7f5]">{t("home.reportEyebrow")}</p>
          <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            {t("home.reportTitle")}
            <br />
            {t("home.reportTitle2")}
          </h2>
          <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-white/60">
            {t("home.reportText")}
          </p>
          <ul className="mt-7 space-y-3 text-[14px] text-white/80">
            {tr("home.reportList").map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#087fd1]">
                  <LuCheck size={12} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={onStart}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#111827] transition hover:bg-[#e8f3fb]"
          >
            {t("home.reportCta")}
            <LuArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="home-reveal rounded-[24px] border border-white/10 bg-white/[0.04] p-6 sm:p-8" style={{ "--reveal-delay": "120ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{t("home.reportSample")}</p>
              <p className="mt-2 font-['Inter_Tight'] text-[64px] font-semibold leading-none tracking-[-0.04em]">1380</p>
              <p className="mt-1 text-[13px] text-white/50">{t("home.scale")}</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[12px] font-bold text-emerald-300">{t("home.points")}</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ["Reading & Writing", 680],
              ["Math", 700],
            ].map(([label, v]) => (
              <div key={label} className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-[12px] text-white/55">{label}</p>
                <p className="mt-1 font-['Inter_Tight'] text-[28px] font-semibold tabular-nums">{v}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#53b7f5]" style={{ width: `${((v - 200) / 600) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex h-24 items-end gap-2">
            {[1180, 1210, 1260, 1250, 1320, 1380].map((s, i, arr) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-md ${i === arr.length - 1 ? "bg-[#087fd1]" : "bg-white/15"}`}
                  style={{ height: `${((s - 1000) / 400) * 80}px` }}
                />
                <span className="text-[10px] tabular-nums text-white/40">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- FAQ ----------------
function FaqItem({ q, a, open, onToggle, id }) {
  return (
    <div className="border-b border-[#dfe4e8]">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[16px] font-semibold text-[#111827] transition hover:text-[#087fd1] sm:text-[17px]"
        >
          {q}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#111827]/10 transition ${
              open ? "rotate-180 bg-[#111827] text-white" : ""
            }`}
          >
            <LuChevronDown size={16} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out-strong ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[680px] pb-6 text-[15px] leading-7 text-[#667085]">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const { t, tr } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-24 mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="home-reveal">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#087fd1]">{t("home.faqEyebrow")}</p>
          <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
            {t("home.faqTitle")}
            <br />
            {t("home.faqTitle2")}
          </h2>
        </div>
        <div className="home-reveal border-t border-[#dfe4e8]">
          {tr("home.faq").map(([q, a], i) => (
            <FaqItem key={q} id={`faq-${i}`} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Footer ----------------
function Footer({ onNavigate }) {
  const { t, tr } = useI18n();
  const [examA, examB, examC] = tr("home.footer.examLinks");
  const columns = [
    { title: t("home.footer.platform"), links: NAV_LINKS.map((id) => ({ label: t(`home.nav.${id}`), section: id })) },
    {
      title: t("home.footer.exams"),
      links: [
        { label: examA, section: "tests" },
        { label: examB, section: "tests" },
        { label: examC, section: "tests" },
      ],
    },
    {
      title: t("home.footer.account"),
      links: [
        { label: t("home.login"), route: "/login" },
        { label: t("home.register"), route: "/register" },
      ],
    },
    {
      title: t("home.footer.info"),
      links: [
        { label: t("home.footer.terms"), route: "/terms" },
        { label: t("home.footer.privacy"), route: "/privacy" },
        { label: t("home.footer.contact"), route: "/contact" },
      ],
    },
  ];
  return (
    <footer className="border-t border-[#111827]/[0.08] bg-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:py-20">
          <div className="max-w-[360px]">
            <img src={logo} alt="Prepzone" className="h-8 w-auto object-contain" />
            <p className="mt-5 text-[15px] leading-7 text-[#667085]">
              {t("home.footer.about")}
            </p>
            <button
              onClick={() => onNavigate("/register")}
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#087fd1] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#066fb8]"
            >
              {t("home.footer.startNow")}
              <LuArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#98a2b3]">{col.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.soon ? (
                        <span className="flex items-center gap-2 text-[15px] text-[#98a2b3]">
                          {link.label}
                          <span className="rounded-full bg-[#f1f3f5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8b95a3]">
                            {t("common.soon")}
                          </span>
                        </span>
                      ) : (
                        <button
                          onClick={() => (link.route ? onNavigate(link.route) : scrollToSection(link.section))}
                          className="text-[15px] text-[#344054] transition hover:text-[#087fd1]"
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-[#111827]/[0.08] py-7 sm:flex-row sm:items-center">
          <p className="text-[13px] text-[#98a2b3]">© {new Date().getFullYear()} Prepzone. {t("home.footer.rights")}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 text-[13px] font-semibold text-[#667085] transition hover:text-[#111827]"
          >
            {t("home.footer.backToTop")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#111827]/10 transition group-hover:border-[#111827]/25 group-hover:bg-[#111827]/[0.03]">
              <LuArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}

// Eslatma: bu sahifa faqat login QILMAGAN foydalanuvchilarga ko'rsatiladi.
// Login qilgan foydalanuvchi "/" ga kirsa, App.jsx'dagi RootRoute uni
// avtomatik "/dashboard"ga yo'naltiradi — shuning uchun bu yerda
// user-holatiga oid shart-sharoitlar shart emas.
export default function Home() {
  const { t, tr } = useI18n();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useReveal(rootRef);

  // Yangi user: ro'yxatdan o'tadi, so'ng /onboarding so'rovnomasida
  // maqsad ballini belgilaydi.
  const handleStart = () => navigate("/register");
  const handleLogin = () => navigate("/login");

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-clip bg-[#fcfcfa] text-[#111827] font-['Inter']">
      <Navbar onLogin={handleLogin} onRegister={handleStart} />

      {/* Hero */}
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-[-80px] -z-0 h-[640px] opacity-70"
          style={{
            backgroundImage: "radial-gradient(rgba(17,24,39,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse at 30% 30%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 30% 30%, black 20%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-5 pb-24 pt-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:pb-32 lg:pt-20">
          <div className="home-reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#087fd1]/20 bg-[#087fd1]/[0.06] px-3.5 py-1.5 text-[12px] font-bold text-[#087fd1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#087fd1]" />
              {t("home.heroBadge")}
            </span>

            <h1 className="mt-7 max-w-[640px] font-['Inter_Tight'] text-[46px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[64px] lg:text-[72px]">
              {t("home.heroTitle")}{" "}
              <span className="relative whitespace-nowrap text-[#087fd1]">
                {t("home.heroAccent")}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  className="absolute -bottom-2 left-0 h-3 w-full text-[#087fd1]/30"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9 C 80 2, 220 2, 298 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-[520px] text-[17px] leading-7 text-[#667085] sm:text-[18px]">
              {t("home.heroText")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStart}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#087fd1] px-7 py-4 text-[15px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(8,127,209,0.6)] transition hover:bg-[#066fb8] active:scale-[0.98]"
              >
                {t("home.register")}
                <LuArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center rounded-full border border-[#111827]/12 bg-white px-7 py-4 text-[15px] font-bold text-[#111827] transition hover:bg-[#f5f6f7] active:scale-[0.98]"
              >
                {t("home.heroLogin")}
              </button>
            </div>

            <TestDayPills />
          </div>

          <div className="home-reveal" style={{ "--reveal-delay": "120ms" }}>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Imtihonlar */}
      <section id="tests" className="scroll-mt-24 mx-auto max-w-[1280px] px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: LuBookOpenCheck, accent: "text-[#087fd1] bg-[#087fd1]/10", link: "text-[#087fd1]" },
            { icon: LuLayers, accent: "text-[#e07a5f] bg-[#e07a5f]/10", link: "text-[#e07a5f]" },
            { icon: LuKeyRound, accent: "text-[#12213D] bg-[#111827]/[0.06]", link: "text-[#12213D]" },
          ]
            .map((style, i) => ({ ...style, ...tr("home.tests")[i] }))
            .map((card, i) => (
            <div
              key={card.name}
              className={`home-reveal group flex flex-col rounded-3xl border border-[#111827]/[0.07] bg-white p-7 ${
                card.soon ? "" : "transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(17,24,39,0.4)]"
              }`}
              style={{ "--reveal-delay": `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
                  <card.icon size={22} />
                </span>
                {card.soon && (
                  <span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8b95a3]">
                    {t("common.soon")}
                  </span>
                )}
              </div>
              <h3 className={`mt-6 text-[21px] font-bold tracking-tight ${card.soon ? "text-[#667085]" : ""}`}>{card.name}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-6 text-[#667085]">{card.text}</p>
              {!card.soon && (
                <button
                  onClick={handleStart}
                  className={`mt-6 inline-flex items-center gap-2 self-start text-[14px] font-bold ${card.link}`}
                >
                  {t("home.startMock")}
                  <LuArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <Features />

      {/* Qanday ishlaydi */}
      <section id="how" className="scroll-mt-24 mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="home-reveal max-w-[560px]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#087fd1]">{t("home.howEyebrow")}</p>
          <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
            {t("home.howTitle")}
          </h2>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {tr("home.howSteps").map(([title, text], i) => (
            <li
              key={title}
              className="home-reveal relative rounded-3xl border border-[#111827]/[0.07] bg-white p-7"
              style={{ "--reveal-delay": `${i * 100}ms` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] font-['Inter_Tight'] text-[15px] font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-8 text-[19px] font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-[#667085]">{text}</p>
              {i < 2 && (
                <LuArrowRight
                  size={18}
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[#fcfcfa] text-[#98a2b3] md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      <ReportPreview onStart={handleStart} />

      <Faq />

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="home-reveal relative overflow-hidden rounded-[32px] bg-[#087fd1] px-7 py-16 text-white sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#111827]/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-[640px] font-['Inter_Tight'] text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
                {t("home.ctaTitle")}
              </h2>
              <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-white/75">
                {t("home.ctaText")}
              </p>
            </div>
            <button
              onClick={handleStart}
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-white px-7 py-4 text-[15px] font-bold text-[#111827] transition hover:bg-[#f1f4f6] active:scale-[0.98]"
            >
              {t("home.register")}
              <LuArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={navigate} />
    </div>
  );
}
