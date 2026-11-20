import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuChevronRight,
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
  LuNotebookPen,
  LuGauge,
  LuFlame,
} from "react-icons/lu";
import { ThemeCycleButton } from "../components/ThemeToggle";
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

// ---------------- Global nav (apple.com uslubi) ----------------
// Ixcham: logo, 3 ta havola, "Kirish" va "Boshlash". Mavzu va til — footer'da
// (telefonda — menyu ichida).
const NAV_BAR_LINKS = ["tests", "features", "faq"];

function Navbar({ onLogin, onRegister }) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (id) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="pz-material sticky top-0 z-50 border-b border-ink/[0.08]">
      <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between gap-4 px-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-6 shrink-0 items-center"
          aria-label={t("home.toTop")}
        >
          <img src={logo} alt="Prepzone" className="pz-logo h-full w-auto object-contain" />
        </button>

        <nav className="hidden items-center gap-8 text-[13px] text-ink/80 md:flex">
          {NAV_BAR_LINKS.map((id) => (
            <button key={id} onClick={() => go(id)} className="transition-colors hover:text-ink">
              {t(`home.nav.${id}`)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="hidden text-[13px] text-ink/80 transition-colors hover:text-ink md:block">
            {t("home.login")}
          </button>
          <button
            onClick={onRegister}
            className="inline-flex h-7 items-center rounded-full bg-accent px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-accent-press"
          >
            {t("home.start")}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? t("home.closeMenu") : t("home.openMenu")}
            aria-expanded={menuOpen}
            className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.06] md:hidden"
          >
            {menuOpen ? <LuX size={18} /> : <LuMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Telefon menyusi */}
      {menuOpen && (
        <div className="home-menu-in border-t border-ink/[0.08] px-5 pb-6 pt-2 md:hidden">
          {NAV_LINKS.map((id) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="flex w-full items-center justify-between border-b border-ink/[0.08] py-3.5 text-left text-[17px] font-semibold text-ink"
            >
              {t(`home.nav.${id}`)}
              <LuChevronRight size={18} className="text-ink-3" />
            </button>
          ))}
          <button
            onClick={onLogin}
            className="flex w-full items-center justify-between border-b border-ink/[0.08] py-3.5 text-left text-[17px] font-semibold text-ink"
          >
            {t("home.login")}
            <LuChevronRight size={18} className="text-ink-3" />
          </button>
          <div className="mt-5 flex items-center justify-between">
            <LanguageSwitch />
            <ThemeCycleButton className="h-9 w-9 rounded-full bg-fill" />
          </div>
        </div>
      )}
    </header>
  );
}

// Bo'lim sarlavhasi: kichik rangli eyebrow + katta sarlavha (HIG: sentence case, tracking manfiy).
function SectionHead({ eyebrow, title, muted, text, center = false, className = "" }) {
  return (
    <div className={`home-reveal ${center ? "mx-auto text-center" : ""} max-w-[760px] ${className}`}>
      {eyebrow && <p className="text-[17px] font-semibold text-accent">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[56px]">
        {title}
        {muted && (
          <>
            {" "}
            <span className="text-ink-3">{muted}</span>
          </>
        )}
      </h2>
      {text && <p className={`mt-5 text-[19px] leading-[1.45] text-ink-2 ${center ? "mx-auto" : ""} max-w-[640px]`}>{text}</p>}
    </div>
  );
}

// ---------------- Nega PrepZone: 4 ta asosiy farq ----------------
const GROWTH_STYLE = [
  { icon: LuNotebookPen, cls: "bg-danger" },
  { icon: LuGauge, cls: "bg-accent" },
  { icon: LuFlame, cls: "bg-warning" },
];

function GrowthSection() {
  const { t, tr } = useI18n();
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1024px] px-5 py-24 lg:py-32">
        <SectionHead eyebrow={t("home.growthEyebrow")} title={t("home.growthTitle")} text={t("home.growthText")} />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {(tr("home.growth") || []).map((g, i) => {
            const { icon: Icon, cls } = GROWTH_STYLE[i];
            return (
              <div
                key={g.title}
                className="home-reveal rounded-[28px] bg-canvas p-7 sm:p-8"
                style={{ "--reveal-delay": `${i * 80}ms` }}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-[12px] text-white ${cls}`}>
                  <Icon size={21} />
                </span>
                <h3 className="mt-6 font-display text-[21px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">{g.title}</h3>
                <p className="mt-2 text-[17px] leading-[1.47] text-ink-2">{g.text}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-8">
          {(tr("home.stats") || []).map((s) => (
            <div key={s.label} className="home-reveal">
              <p className="font-display text-[48px] font-bold leading-none tracking-[-0.025em] text-ink">{s.value}</p>
              <p className="mt-2 text-[15px] text-ink-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Hero preview: SAT ----------------
function SatPreview() {
  const { t } = useI18n();
  return (
    <>
      <div className="flex h-11 items-center justify-between border-b border-fill bg-surface-2 px-5 text-[11px]">
        <span className="font-semibold text-ink">Section 1, Module 1: Reading and Writing</span>
        <span className="flex items-center gap-1.5 font-bold tabular-nums text-ink">
          <LuClock size={12} /> 31:23
        </span>
      </div>
      <div className="grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-fill p-6 md:border-b-0 md:border-r">
          <p className="text-[13px] leading-6 text-ink">
            The mihrab (or niche) is one of many features that distinguish mosque architecture and is therefore
            considered <span className="rounded bg-yellow-200 px-0.5">______</span> aspect of mosque design.
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-fill pt-4 text-[11px]">
            <span className="text-ink-3">Question 12 of 27</span>
            <span className="flex items-center gap-1 font-semibold text-accent">
              <LuCalculator size={12} /> {t("home.desmosSoon")}
            </span>
          </div>
        </div>
        <div className="bg-surface-2 p-6">
          <p className="text-[13px] font-medium leading-6 text-ink">
            Which choice completes the text with the most logical and precise word or phrase?
          </p>
          <div className="mt-5 space-y-2">
            {["an unprecedented", "an embellished", "an imposing", "a fundamental"].map((answer, i) => {
              const picked = i === 3;
              return (
                <div
                  key={answer}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[12px] ${
                    picked ? "border-accent bg-accent/[0.05] text-ink" : "border-line bg-surface text-ink-2"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                      picked ? "border-accent bg-accent text-white" : "border-line text-ink-2"
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
    <div className="relative">
      <div className="overflow-hidden rounded-[28px] border border-ink/[0.08] bg-surface shadow-[0_2px_4px_rgb(0_0_0/0.04),0_24px_60px_-24px_rgb(0_0_0/0.18)]">
        <div className="min-h-[340px]">
          <SatPreview />
        </div>
      </div>

      <div className="pz-material-surface absolute -bottom-6 left-6 hidden items-center gap-3 rounded-2xl border border-ink/[0.08] px-4 py-3 shadow-lift sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
          <LuTarget size={17} />
        </span>
        <div>
          <p className="text-[12px] font-medium text-ink-2">{t("home.goal")}</p>
          <p className="text-[15px] font-bold text-ink">SAT 1400</p>
        </div>
      </div>
    </div>
  );
}

// Keyingi rasmiy test kunlari (src/data/testDates.js).
function TestDayPills() {
  const { t } = useI18n();
  const items = [["SAT", nextTestDate(), "bg-accent"]].filter(([, d]) => d);
  if (!items.length) return null;
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-2">
      {items.map(([label, date, dot]) => {
        const left = daysLeft(date);
        return (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full bg-fill px-3.5 py-2 text-[13px] text-ink-2"
          >
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {t("home.nextTest", { label })} <b className="font-semibold tabular-nums text-ink">{formatDay(date)}</b>
            <span className="text-ink/30">·</span>
            <span className="font-semibold text-ink">{left === 0 ? t("home.today") : t("home.daysLeft", { n: left })}</span>
          </span>
        );
      })}
    </div>
  );
}

// ---------------- Imkoniyatlar (bento) ----------------
function FeatureCard({ icon: Icon, tone = "blue", title, text, className = "", children, delay = 0 }) {
  const tones = {
    blue: "bg-accent/10 text-accent",
    red: "bg-danger/10 text-danger",
    emerald: "bg-success/10 text-success",
    amber: "bg-warning/10 text-warning",
    ink: "bg-ink/[0.06] text-ink",
  };
  return (
    <div
      className={`home-reveal flex flex-col rounded-[28px] bg-surface p-7 sm:p-8 ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <h3 className="mt-5 font-display text-[21px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-2 text-[17px] leading-[1.47] text-ink-2">{text}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </div>
  );
}

function Features() {
  const { t, tr } = useI18n();
  return (
    <section id="features" className="scroll-mt-16 bg-canvas">
      <div className="mx-auto max-w-[1024px] px-5 py-24 lg:py-32">
        <SectionHead
          eyebrow={t("home.featuresEyebrow")}
          title={t("home.featuresTitle")}
          muted={t("home.featuresTitleMuted")}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={LuBookOpenCheck}
            title={t("home.fAdaptiveTitle")}
            text={t("home.fAdaptiveText")}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
              {[
                ["Module 1", "bg-accent/[0.12] text-accent"],
                ["Module 2 · Hard", "bg-accent text-white"],
                ["Module 2 · Easy", "bg-ink/[0.05] text-ink-3"],
              ].map(([label, cls]) => (
                <div key={label} className={`rounded-xl px-2 py-3 ${cls}`}>
                  {label}
                </div>
              ))}
              <div className="col-span-3 flex items-center justify-center gap-4 rounded-xl border border-dashed border-ink/10 py-2.5 text-ink-2">
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
                <div key={k} className="rounded-xl bg-canvas py-2.5 text-ink">
                  <p className="text-[10px] font-bold text-ink-3">SAT</p>
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
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-ink-2">
                    <span>{label}</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div
                      className={`h-full rounded-full ${pct >= 70 ? "bg-success" : "bg-warning"}`}
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
            <div className="flex items-end justify-between rounded-2xl bg-canvas p-4">
              <div>
                <p className="text-[12px] font-medium text-ink-2">{t("home.planTarget")}</p>
                <p className="mt-1 font-display text-[30px] font-bold leading-none text-ink">
                  24 <span className="text-[15px] font-medium text-ink-2">{t("home.planDays")}</span>
                </p>
              </div>
              <LuTarget size={22} className="text-accent" />
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
                <span key={w} className="rounded-full border border-ink/10 px-3 py-1 text-[12px] font-medium text-ink">
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
                    className="flex h-11 w-9 items-center justify-center rounded-lg border border-ink/12 bg-surface-2 font-display text-[18px] font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[12px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> {t("home.liveMonitor")}
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
    <section className="bg-surface">
      <div className="mx-auto grid max-w-[1024px] items-center gap-14 px-5 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
        <div>
          <SectionHead
            eyebrow={t("home.reportEyebrow")}
            title={`${t("home.reportTitle")} ${t("home.reportTitle2")}`}
            text={t("home.reportText")}
          />
          <ul className="home-reveal mt-7 space-y-3 text-[17px] text-ink">
            {tr("home.reportList").map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                  <LuCheck size={12} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={onStart}
            className="mt-9 inline-flex h-11 items-center rounded-full bg-accent px-6 text-[17px] font-medium text-white transition-colors hover:bg-accent-press"
          >
            {t("home.reportCta")}
          </button>
        </div>

        <div className="home-reveal rounded-[28px] bg-canvas p-6 sm:p-8" style={{ "--reveal-delay": "120ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-ink-2">{t("home.reportSample")}</p>
              <p className="mt-2 font-display text-[64px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">1380</p>
              <p className="mt-1 text-[13px] text-ink-2">{t("home.scale")}</p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1.5 text-[12px] font-semibold text-success">{t("home.points")}</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ["Reading & Writing", 680],
              ["Math", 700],
            ].map(([label, v]) => (
              <div key={label} className="rounded-2xl bg-surface p-4">
                <p className="text-[13px] text-ink-2">{label}</p>
                <p className="mt-1 font-display text-[28px] font-bold tabular-nums text-ink">{v}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${((v - 200) / 600) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex h-24 items-end gap-2">
            {[1180, 1210, 1260, 1250, 1320, 1380].map((s, i, arr) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-md ${i === arr.length - 1 ? "bg-accent" : "bg-ink/[0.12]"}`}
                  style={{ height: `${((s - 1000) / 400) * 80}px` }}
                />
                <span className="text-[11px] tabular-nums text-ink-3">{s}</span>
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
    <div className="border-b border-ink/[0.08] last:border-b-0">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[17px] font-semibold text-ink"
        >
          {q}
          <LuChevronDown
            size={18}
            className={`shrink-0 text-ink-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out-strong ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[680px] px-6 pb-6 text-[17px] leading-[1.47] text-ink-2">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const { t, tr } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-16 bg-canvas">
      <div className="mx-auto max-w-[1024px] px-5 py-24 lg:py-32">
        <SectionHead center eyebrow={t("home.faqEyebrow")} title={`${t("home.faqTitle")} ${t("home.faqTitle2")}`} />
        <div className="home-reveal mx-auto mt-12 max-w-[760px] overflow-hidden rounded-[20px] bg-surface">
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
    <footer className="border-t border-ink/[0.08] bg-canvas">
      <div className="mx-auto max-w-[1024px] px-5">
        <div className="grid gap-12 py-12 lg:grid-cols-[1.2fr_2fr] lg:py-16">
          <div className="max-w-[360px]">
            <img src={logo} alt="Prepzone" className="pz-logo h-6 w-auto object-contain" />
            <p className="mt-4 text-[13px] leading-[1.5] text-ink-2">
              {t("home.footer.about")}
            </p>
            <button
              onClick={() => onNavigate("/register")}
              className="mt-5 text-[13px] text-accent hover:underline"
            >
              {t("home.footer.startNow")} ›
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] font-semibold text-ink">{col.title}</p>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.soon ? (
                        <span className="flex items-center gap-2 text-[12px] text-ink-3">
                          {link.label}
                          <span className="rounded-full bg-fill px-2 py-0.5 text-[10px] font-medium text-ink-3">
                            {t("common.soon")}
                          </span>
                        </span>
                      ) : (
                        <button
                          onClick={() => (link.route ? onNavigate(link.route) : scrollToSection(link.section))}
                          className="text-left text-[12px] text-ink-2 transition-colors hover:text-ink hover:underline"
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

        <div className="flex flex-col items-start justify-between gap-3 border-t border-ink/[0.08] py-5 sm:flex-row sm:items-center">
          <p className="text-[12px] text-ink-3">© {new Date().getFullYear()} Prepzone. {t("home.footer.rights")}</p>
          <div className="flex items-center gap-2 sm:ml-auto sm:mr-6">
            <LanguageSwitch />
            <ThemeCycleButton className="h-8 w-8 rounded-full bg-fill" />
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 text-[12px] text-ink-2 transition-colors hover:text-ink"
          >
            {t("home.footer.backToTop")}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fill">
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
    <div ref={rootRef} className="min-h-screen overflow-x-clip bg-canvas font-sans text-ink">
      <Navbar onLogin={handleLogin} onRegister={handleStart} />

      {/* Hero — markazda, katta sarlavha, ostida mahsulot ko'rinishi */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1024px] px-5 pb-24 pt-16 text-center sm:pt-24 lg:pb-32">
          <div className="home-reveal">
            <p className="text-[17px] font-semibold text-accent sm:text-[21px]">{t("home.heroBadge")}</p>
            <h1 className="mx-auto mt-3 max-w-[900px] font-display text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[64px] lg:text-[80px]">
              {t("home.heroTitle")} <span className="text-accent">{t("home.heroAccent")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[680px] text-[19px] leading-[1.42] text-ink-2 sm:text-[21px]">{t("home.heroText")}</p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-7">
              <button
                onClick={handleStart}
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-[17px] font-medium text-white transition-colors hover:bg-accent-press"
              >
                {t("home.register")}
              </button>
              <button onClick={handleLogin} className="text-[17px] text-accent hover:underline">
                {t("home.heroLogin")} ›
              </button>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-[13px] text-ink-2">
              <LuCheck size={14} className="text-success" /> {t("home.heroFree")}
            </p>

            <TestDayPills />
          </div>

          <div className="home-reveal mx-auto mt-16 max-w-[900px] text-left" style={{ "--reveal-delay": "120ms" }}>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Imtihonlar */}
      <section id="tests" className="scroll-mt-16 bg-surface">
        <div className="mx-auto max-w-[1024px] px-5 py-24 lg:py-32">
          <SectionHead center eyebrow={t("home.nav.tests")} title={t("home.testsTitle")} />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              { icon: LuBookOpenCheck, accent: "text-white bg-accent" },
              { icon: LuLayers, accent: "text-white bg-warning" },
              { icon: LuKeyRound, accent: "text-white bg-ink-3" },
            ]
              .map((style, i) => ({ ...style, ...tr("home.tests")[i] }))
              .map((card, i) => (
                <div
                  key={card.name}
                  className="home-reveal flex flex-col rounded-[28px] bg-canvas p-7"
                  style={{ "--reveal-delay": `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${card.accent}`}>
                      <card.icon size={21} />
                    </span>
                    {card.soon && (
                      <span className="rounded-full bg-fill px-2.5 py-1 text-[12px] font-medium text-ink-2">{t("common.soon")}</span>
                    )}
                  </div>
                  <h3 className={`mt-6 font-display text-[21px] font-semibold tracking-[-0.01em] ${card.soon ? "text-ink-2" : "text-ink"}`}>
                    {card.name}
                  </h3>
                  <p className="mt-2 flex-1 text-[17px] leading-[1.47] text-ink-2">{card.text}</p>
                  {!card.soon && (
                    <button onClick={handleStart} className="mt-6 self-start text-[17px] text-accent hover:underline">
                      {t("home.startMock")} ›
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      <Features />

      <GrowthSection />

      {/* Qanday ishlaydi */}
      <section id="how" className="scroll-mt-16 bg-canvas">
        <div className="mx-auto max-w-[1024px] px-5 py-24 lg:py-32">
          <SectionHead center eyebrow={t("home.howEyebrow")} title={t("home.howTitle")} />
          <ol className="mt-14 grid gap-4 md:grid-cols-3">
            {tr("home.howSteps").map(([title, text], i) => (
              <li
                key={title}
                className="home-reveal rounded-[28px] bg-surface p-7"
                style={{ "--reveal-delay": `${i * 100}ms` }}
              >
                <span className="font-display text-[48px] font-bold leading-none tracking-[-0.03em] text-accent tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-6 font-display text-[21px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
                <p className="mt-2 text-[17px] leading-[1.47] text-ink-2">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ReportPreview onStart={handleStart} />

      <Faq />

      {/* Yakuniy CTA */}
      <section className="bg-surface">
        <div className="home-reveal mx-auto max-w-[1024px] px-5 py-24 text-center lg:py-32">
          <h2 className="mx-auto max-w-[760px] font-display text-[40px] font-bold leading-[1.05] tracking-[-0.025em] text-ink sm:text-[56px]">
            {t("home.ctaTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[19px] leading-[1.45] text-ink-2">{t("home.ctaText")}</p>
          <button
            onClick={handleStart}
            className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-[17px] font-medium text-white transition-colors hover:bg-accent-press"
          >
            {t("home.register")}
          </button>
        </div>
      </section>

      <Footer onNavigate={navigate} />
    </div>
  );
}
