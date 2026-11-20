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
import { ThemeCycleButton } from "../components/ThemeToggle";
import { nextTestDate, daysLeft } from "../data/testDates";

const logo = "/Logo.png";

const NAV_LINKS = [
  { id: "tests", label: "Imtihonlar" },
  { id: "features", label: "Imkoniyatlar" },
  { id: "how", label: "Qanday ishlaydi" },
  { id: "faq", label: "Savollar" },
];

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
            ? "max-w-[1040px] border-ink/[0.08] pz-material-surface shadow-lift"
            : "max-w-[1280px] border-transparent bg-transparent"
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-10 shrink-0 items-center overflow-hidden pl-2"
          aria-label="Prepzone — sahifa boshiga"
        >
          <img src={logo} alt="Prepzone" className="pz-logo w-32 max-h-full object-contain" />
        </button>

        <nav className="hidden items-center gap-1 rounded-full p-1 text-[14px] font-medium text-ink-2 lg:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="rounded-full px-4 py-2 transition hover:bg-ink/[0.05] hover:text-ink"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeCycleButton />
          <button
            onClick={onLogin}
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/[0.05] sm:block"
          >
            Kirish
          </button>
          <button
            onClick={onRegister}
            className="group hidden items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink transition hover:bg-ink/85 sm:inline-flex"
          >
            Boshlash
            <LuArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-ink/[0.05] lg:hidden"
          >
            {menuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobil menyu */}
      {menuOpen && (
        <div className="home-menu-in mx-auto mt-2 max-w-[1040px] rounded-3xl border border-ink/[0.08] bg-surface p-2 shadow-[0_20px_50px_-15px_rgba(17,24,39,0.25)] lg:hidden">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-semibold text-ink transition hover:bg-ink/[0.04]"
            >
              {l.label}
              <LuArrowRight size={16} className="text-ink/30" />
            </button>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink/[0.06] p-2 pt-3">
            <button
              onClick={onLogin}
              className="rounded-full border border-ink/12 py-3 text-sm font-bold text-ink transition hover:bg-ink/[0.04]"
            >
              Kirish
            </button>
            <button
              onClick={onRegister}
              className="rounded-full bg-accent py-3 text-sm font-bold text-white transition hover:bg-accent-press"
            >
              Ro‘yxatdan o‘tish
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------- Hero preview: SAT ----------------
function SatPreview() {
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
              <LuCalculator size={12} /> Desmos · tez orada
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
  return (
    <div className="relative lg:pl-4">
      <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-accent/15 via-transparent to-accent/5 blur-3xl" />

      <div className="overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_30px_80px_rgba(24,54,78,0.13)]">
        <div className="min-h-[340px]">
          <SatPreview />
        </div>
      </div>

      <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-[0_15px_40px_rgba(24,54,78,0.10)] sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <LuTarget size={17} />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-3">Maqsad</p>
          <p className="text-[15px] font-bold text-ink">SAT 1400</p>
        </div>
      </div>
    </div>
  );
}

// Keyingi rasmiy test kunlari (src/data/testDates.js).
function TestDayPills() {
  const items = [["SAT", nextTestDate(), "bg-accent"]].filter(([, d]) => d);
  if (!items.length) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {items.map(([label, date, dot]) => {
        const left = daysLeft(date);
        return (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-ink/[0.08] bg-surface px-3.5 py-2 text-[12.5px] text-ink-2"
          >
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            Keyingi {label}: <b className="font-semibold tabular-nums text-ink">{formatDay(date)}</b>
            <span className="text-ink/30">·</span>
            <span className="font-semibold text-ink">{left === 0 ? "bugun" : `${left} kun`}</span>
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
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    ink: "bg-ink/[0.06] text-ink",
  };
  return (
    <div
      className={`home-reveal flex flex-col rounded-3xl border border-ink/[0.07] bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-25px_rgba(17,24,39,0.35)] sm:p-7 ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <h3 className="mt-5 text-[18px] font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-6 text-ink-2">{text}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-y border-ink/[0.08] bg-canvas">
      <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="home-reveal max-w-[640px]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">Imkoniyatlar</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Test ishlashdan tashqari —
            <br />
            <span className="text-ink-3">tayyorgarlikning butun jarayoni.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={LuBookOpenCheck}
            title="Adaptiv Digital SAT"
            text="Bluebook formatidagi 2 bosqichli modullar: 1-modul natijasiga qarab 2-modul qiyinlashadi. Ball 400–1600 shkalada."
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
              {[
                ["Module 1", "bg-ink text-on-ink"],
                ["Module 2 · Hard", "bg-accent text-white"],
                ["Module 2 · Easy", "bg-ink/[0.05] text-ink-3"],
              ].map(([label, cls]) => (
                <div key={label} className={`rounded-xl px-2 py-3 ${cls}`}>
                  {label}
                </div>
              ))}
              <div className="col-span-3 flex items-center justify-center gap-4 rounded-xl border border-dashed border-ink/10 py-2.5 text-ink-2">
                <span className="flex items-center gap-1.5">
                  <LuCalculator size={13} /> Desmos · tez orada
                </span>
                <span className="flex items-center gap-1.5">
                  <LuClock size={13} /> Taymer
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
            title="Oylik amaliyot to'plamlari"
            text="Har bir rasmiy SAT sanasi uchun alohida to'plam — vaqt cheklovisiz, javob darhol tekshiriladi."
            delay={80}
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Mart", "40"],
                ["May", "98"],
                ["Iyun", "40"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-canvas py-2.5">
                  <p className="text-[10px] font-bold text-ink-3">{k}</p>
                  <p className="text-[17px] font-bold tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuChartColumn}
            tone="emerald"
            title="Mavzular bo'yicha tahlil"
            text="Har bir urinishdan so'ng qaysi mavzularda xato qilayotganingizni ko'rasiz."
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
            title="Study Plan va test day"
            text="Imtihon sanasi va maqsad ballingizga qarab kunlik reja. Dashboard test dayga necha kun qolganini ko'rsatib turadi."
            delay={80}
          >
            <div className="flex items-end justify-between rounded-2xl bg-night p-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">1400 ga</p>
                <p className="font-display text-[30px] font-semibold leading-none">
                  24 <span className="text-[14px] font-medium text-white/60">kun qoldi</span>
                </p>
              </div>
              <LuTarget size={22} className="text-accent" />
            </div>
          </FeatureCard>

          <FeatureCard
            icon={LuLanguages}
            tone="ink"
            title="Vocabulary"
            text="SAT uchun muhim so'zlar — kartochkalar va takrorlash bilan."
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
            title="Reyting"
            text="Eng yaxshi SAT natijangiz bilan boshqa o'quvchilar orasida o'rningizni ko'ring."
          />

          <FeatureCard
            icon={LuKeyRound}
            title="Kodli mock sessiyalar"
            text="O'quv markazlari va ustozlar uchun: bir vaqtda, kirish kodi bilan ochiladigan va jonli kuzatiladigan mock testlar."
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> 24 ishtirokchi jonli
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
  return (
    <section className="bg-night text-white">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
        <div className="home-reveal">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">Natija hisoboti</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Har bir xato —
            <br />
            keyingi qadam uchun ma'lumot.
          </h2>
          <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-white/60">
            Test tugagach ball, bo'limlar kesimi, har bir savolning to'g'ri javobi va izohi, hamda ball dinamikasi bir
            joyda ko'rinadi.
          </p>
          <ul className="mt-7 space-y-3 text-[14px] text-white/80">
            {["Savolma-savol review", "Bo'limlar va mavzular kesimi", "Barcha urinishlar tarixi"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <LuCheck size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <button
            onClick={onStart}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-night transition hover:bg-white/90"
          >
            Birinchi mockni ishlash
            <LuArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="home-reveal rounded-[24px] border border-white/10 bg-white/[0.04] p-6 sm:p-8" style={{ "--reveal-delay": "120ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">SAT Practice Test · namuna</p>
              <p className="mt-2 font-display text-[64px] font-semibold leading-none tracking-[-0.04em]">1380</p>
              <p className="mt-1 text-[13px] text-white/50">400–1600 shkala</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[12px] font-bold text-emerald-300">+60 ball</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ["Reading & Writing", 680],
              ["Math", 700],
            ].map(([label, v]) => (
              <div key={label} className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-[12px] text-white/55">{label}</p>
                <p className="mt-1 font-display text-[28px] font-semibold tabular-nums">{v}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${((v - 200) / 600) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex h-24 items-end gap-2">
            {[1180, 1210, 1260, 1250, 1320, 1380].map((s, i, arr) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-md ${i === arr.length - 1 ? "bg-accent" : "bg-white/15"}`}
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
const FAQ = [
  [
    "Mock testlar haqiqiy imtihonga qanchalik o'xshash?",
    "SAT — Bluebook ilovasidagi kabi 2 bo'lim, har birida adaptiv 2 modul, Desmos kalkulyatori (tez orada) va formula varag'i bilan, rasmiy vaqt chegaralari va to'liq ekran rejimida.",
  ],
  [
    "Ball qanday hisoblanadi?",
    "SAT natijasi javoblar va modul qiyinligi asosida 400–1600 shkalaga o'tkaziladi (IRT modeli asosida). Bu rasmiy natija emas, balki tayyorgarlik darajangiz uchun yo'l-yo'riq.",
  ],
  [
    "Qaysi qurilmada ishlash kerak?",
    "Haqiqiy imtihon kabi kompyuter yoki noutbukda ishlash tavsiya etiladi — test to'liq ekran rejimida o'tadi. Natijalar, lug'at va rejani telefonda ham ko'rish mumkin.",
  ],
  [
    "O'qituvchim bergan kod bilan qanday test topshiraman?",
    "Dashboard yoki \"Mock with key\" bo'limida 6 xonali kodni kiriting — belgilangan vaqtda test ochiladi va natijangiz o'qituvchingizga ko'rinadi.",
  ],
  [
    "Natijalarim saqlanadimi?",
    "Ha, har bir urinish hisobingizda saqlanadi: ball dinamikasi, savollar review'i va to'liq tarix istalgan qurilmadan ko'rinadi.",
  ],
];

function FaqItem({ q, a, open, onToggle, id }) {
  return (
    <div className="border-b border-line">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[16px] font-semibold text-ink transition hover:text-accent sm:text-[17px]"
        >
          {q}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/10 transition ${
              open ? "rotate-180 bg-ink text-on-ink" : ""
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
          <p className="max-w-[680px] pb-6 text-[15px] leading-7 text-ink-2">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-24 mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="home-reveal">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">Savollar</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
            Ko'p so'raladigan
            <br />
            savollar.
          </h2>
        </div>
        <div className="home-reveal border-t border-line">
          {FAQ.map(([q, a], i) => (
            <FaqItem key={q} id={`faq-${i}`} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Footer ----------------
const FOOTER_COLUMNS = [
  {
    title: "Platforma",
    links: NAV_LINKS.map((l) => ({ label: l.label, section: l.id })),
  },
  {
    title: "Imtihonlar",
    links: [
      { label: "Digital SAT mock", section: "tests" },
      { label: "Amaliyot to'plamlari", section: "tests" },
      { label: "Kod bilan test", section: "tests" },
    ],
  },
  {
    title: "Hisob",
    links: [
      { label: "Kirish", route: "/login" },
      { label: "Ro‘yxatdan o‘tish", route: "/register" },
    ],
  },
  {
    title: "Ma'lumot",
    links: [
      { label: "Foydalanish shartlari", route: "/terms" },
      { label: "Maxfiylik siyosati", route: "/privacy" },
      { label: "Aloqa", route: "/contact" },
    ],
  },
];

function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-ink/[0.08] bg-surface">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:py-20">
          <div className="max-w-[360px]">
            <img src={logo} alt="Prepzone" className="pz-logo h-8 w-auto object-contain" />
            <p className="mt-5 text-[15px] leading-7 text-ink-2">
              Digital SAT uchun real imtihon formatiga yaqin online mock test platformasi.
            </p>
            <button
              onClick={() => onNavigate("/register")}
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-press"
            >
              Hoziroq boshlash
              <LuArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-ink-3">{col.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.soon ? (
                        <span className="flex items-center gap-2 text-[15px] text-ink-3">
                          {link.label}
                          <span className="rounded-full bg-fill px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-3">
                            Soon
                          </span>
                        </span>
                      ) : (
                        <button
                          onClick={() => (link.route ? onNavigate(link.route) : scrollToSection(link.section))}
                          className="text-[15px] text-ink transition hover:text-accent"
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

        <div className="flex flex-col items-start justify-between gap-4 border-t border-ink/[0.08] py-7 sm:flex-row sm:items-center">
          <p className="text-[13px] text-ink-3">© {new Date().getFullYear()} Prepzone. Online mock test platform.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2 transition hover:text-ink"
          >
            Yuqoriga qaytish
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 transition group-hover:border-ink/25 group-hover:bg-ink/[0.03]">
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
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useReveal(rootRef);

  // Yangi user: ro'yxatdan o'tadi, so'ng /onboarding so'rovnomasida
  // maqsad ballini belgilaydi.
  const handleStart = () => navigate("/register");
  const handleLogin = () => navigate("/login");

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-clip bg-surface-2 text-ink font-sans">
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
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-3.5 py-1.5 text-[12px] font-bold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Digital SAT mock testlar
            </span>

            <h1 className="mt-7 max-w-[640px] font-display text-[46px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[64px] lg:text-[72px]">
              Imtihonga real formatda{" "}
              <span className="relative whitespace-nowrap text-accent">
                tayyorlaning.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent/30"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9 C 80 2, 220 2, 298 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-[520px] text-[17px] leading-7 text-ink-2 sm:text-[18px]">
              Bluebook formatidagi adaptiv Digital SAT mock testlari, mavzular bo'yicha tahlil va maqsad ballingizga
              moslashgan reja — hammasi bitta platformada.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStart}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-[15px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(8,127,209,0.6)] transition hover:bg-accent-press active:scale-[0.98]"
              >
                Ro‘yxatdan o‘tish
                <LuArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center rounded-full border border-ink/12 bg-surface px-7 py-4 text-[15px] font-bold text-ink transition hover:bg-canvas active:scale-[0.98]"
              >
                Hisobim bor — kirish
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
            {
              icon: LuBookOpenCheck,
              name: "Digital SAT",
              text: "Reading & Writing va Math. Adaptiv modullar, Desmos (tez orada), 400–1600 ball.",
              accent: "text-accent bg-accent/10",
              link: "text-accent",
            },
            {
              icon: LuLayers,
              name: "Amaliyot to'plamlari",
              text: "Har oylik rasmiy SAT sanasi uchun mavzular bo'yicha savollar — vaqt cheklovisiz, darhol javob bilan.",
              accent: "text-[#e07a5f] bg-[#e07a5f]/10",
              link: "text-[#e07a5f]",
            },
            {
              icon: LuKeyRound,
              name: "Kod bilan mock",
              text: "O'qituvchingiz bergan 6 xonali kod bilan belgilangan vaqtda nazorat ostidagi test.",
              accent: "text-ink bg-ink/[0.06]",
              link: "text-ink",
            },
          ].map((t, i) => (
            <div
              key={t.name}
              className={`home-reveal group flex flex-col rounded-3xl border border-ink/[0.07] bg-surface p-7 ${
                t.soon ? "" : "transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(17,24,39,0.4)]"
              }`}
              style={{ "--reveal-delay": `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${t.accent}`}>
                  <t.icon size={22} />
                </span>
                {t.soon && (
                  <span className="rounded-full bg-fill px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">
                    Tez orada
                  </span>
                )}
              </div>
              <h3 className={`mt-6 text-[21px] font-bold tracking-tight ${t.soon ? "text-ink-2" : ""}`}>{t.name}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-6 text-ink-2">{t.text}</p>
              {!t.soon && (
                <button
                  onClick={handleStart}
                  className={`mt-6 inline-flex items-center gap-2 self-start text-[14px] font-bold ${t.link}`}
                >
                  Mockni boshlash
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
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">Qanday ishlaydi</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
            Uch qadamda boshlang.
          </h2>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["Ro'yxatdan o'ting", "Olmoqchi bo'lgan SAT ballingizni belgilang — reja shunga moslashadi."],
            ["Mockni ishlang", "Real imtihon sharoitida — vaqt chegarasi va to'liq ekran rejimida."],
            ["Tahlil qiling", "Ball, xatolar va mavzular kesimi. Study Plan keyingi qadamni ko'rsatadi."],
          ].map(([title, text], i) => (
            <li
              key={title}
              className="home-reveal relative rounded-3xl border border-ink/[0.07] bg-surface p-7"
              style={{ "--reveal-delay": `${i * 100}ms` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-[15px] font-semibold text-on-ink">
                {i + 1}
              </span>
              <h3 className="mt-8 text-[19px] font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-ink-2">{text}</p>
              {i < 2 && (
                <LuArrowRight
                  size={18}
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-surface-2 text-ink-3 md:block"
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
        <div className="home-reveal relative overflow-hidden rounded-[32px] bg-accent px-7 py-16 text-white sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-ink/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-[640px] font-display text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
                Keyingi mock testingizni bugun ishlang.
              </h2>
              <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-white/75">
                Hisob yarating, maqsad ballingizni belgilang va birinchi natijangizni oling.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-surface px-7 py-4 text-[15px] font-bold text-ink transition hover:bg-fill active:scale-[0.98]"
            >
              Ro‘yxatdan o‘tish
              <LuArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={navigate} />
    </div>
  );
}
