import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuLightbulb, LuWind } from "react-icons/lu";
import { useDeadline, useSecondsLeft } from "../hooks/useCountdown";
import { LanguageSwitch, useI18n } from "../i18n";

export const BREAK_SECONDS = 10 * 60;
const BREATH_CYCLE = 12; // 4 s nafas olish, 4 s ushlash, 4 s chiqarish
const TIP_SECONDS = 12;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Bluebook'dagi tanaffus qoidalari (rasmiy matn inglizcha qoladi).
const BREAK_RULES = [
  "Do not disturb students who are still testing.",
  "Do not exit the app or close your laptop.",
  "Do not access phones, smartwatches, textbooks, notes, or the internet.",
  "Do not eat or drink near any testing device.",
  "Do not speak in the test room; outside the test room, do not discuss the exam with anyone.",
];

function Breathing() {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const phase = Math.floor((tick % BREATH_CYCLE) / 4);
  const label = [t("breakExtras.inhale"), t("breakExtras.hold"), t("breakExtras.exhale")][phase];
  const left = 4 - (tick % 4);

  return (
    <section className="flex flex-col items-center rounded-3xl border border-ink/[0.07] bg-surface p-6 text-center">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink">
        <LuWind size={17} className="text-accent" /> {t("breakExtras.breathingTitle")}
      </h3>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-ink-2">{t("breakExtras.breathingText")}</p>
      <div className="relative mt-6 flex h-44 w-44 items-center justify-center">
        <span className="pz-breathe absolute inset-0 rounded-full bg-accent/15" aria-hidden="true" />
        <span className="pz-breathe absolute inset-5 rounded-full bg-accent/25" aria-hidden="true" />
        <div className="relative text-center" aria-live="polite">
          <p className="text-[15px] font-bold text-[#0b4f80]">{label}</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-accent">{left}</p>
        </div>
      </div>
    </section>
  );
}

function Tips() {
  const { t, tr } = useI18n();
  const tips = tr("breakExtras.tips") || [];
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(tips.length, 1)));
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % tips.length), TIP_SECONDS * 1000);
    return () => clearInterval(id);
  }, [index, tips.length]);
  if (!tips.length) return null;
  const go = (d) => setIndex((i) => (i + d + tips.length) % tips.length);

  return (
    <section className="flex flex-col rounded-3xl border border-ink/[0.07] bg-surface p-6">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink">
        <LuLightbulb size={17} className="text-amber-500" /> {t("breakExtras.tipsTitle")}
      </h3>
      <p key={index} className="pz-fade-in mt-4 min-h-[96px] flex-1 text-[15px] leading-relaxed text-ink">
        {tips[index]}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] font-semibold tabular-nums text-ink-3">
          {t("breakExtras.tipOf", { n: index + 1, total: tips.length })}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous tip"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink hover:bg-canvas"
          >
            <LuChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next tip"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink hover:bg-canvas"
          >
            <LuChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

// Bo'limlar orasidagi tanaffus. Chap/o'ng qismi Bluebook'dagi kabi
// (inglizcha), pastda nafas mashqi va maslahatlar (sayt tilida).
// `endAt` ota komponentda saqlanadi — test pauza qilinib qaytilganda
// tanaffus boshidan boshlanmaydi.
export default function BreakScreen({ endAt, onContinue }) {
  const secondsLeft = useSecondsLeft(endAt) ?? BREAK_SECONDS;
  useDeadline(endAt, onContinue);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <img src="/Logo.png" alt="Prepzone" className="h-7 w-auto" />
          <LanguageSwitch />
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section className="flex flex-col items-center justify-center rounded-3xl bg-night px-6 py-10 text-center text-white">
            <p className="text-[15px] font-semibold text-white/70">Remaining Break Time:</p>
            <p className="mt-2 font-display text-6xl font-semibold tabular-nums tracking-[-0.04em]">
              {formatTime(secondsLeft)}
            </p>
            <button
              onClick={onContinue}
              className="mt-8 rounded-full bg-[#ffd400] px-7 py-3 text-[15px] font-bold text-ink transition hover:bg-[#ffe14d]"
            >
              Resume Testing
            </button>
          </section>

          <section className="rounded-3xl border border-ink/[0.07] bg-surface p-6 sm:p-8">
            <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Practice Test Break</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              You can resume this practice test as soon as you&apos;re ready to move on. On test day, you&apos;ll
              wait until the clock counts down. Read below to see how breaks work on test day.
            </p>
            <hr className="my-5 border-ink/10" />
            <h2 className="text-[17px] font-bold">Take a Break: Do Not Close Your Device</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink">
              After the break, a <b>Resume Testing Now</b> button will appear and you&apos;ll start the next
              section.
            </p>
            <p className="mt-4 text-[14px] font-bold">Follow these rules during the break:</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink">
              {BREAK_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Breathing />
          <Tips />
        </div>
      </div>
    </div>
  );
}
