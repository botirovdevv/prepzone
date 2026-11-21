import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUserResults } from "../utils/userResults";
import { useAuth } from "../context/AuthContext";
import {
  LuCompass,
  LuTarget,
  LuFlame,
  LuPencil,
  LuCircleCheck,
  LuCircle,
  LuNotebookPen,
  LuHistory,
  LuBookOpen,
  LuTrophy,
  LuCoffee,
  LuArrowRight,
  LuTriangleAlert,
  LuSparkles,
  LuRefreshCw,
  LuClock,
  LuCpu,
  LuCalendarX,
  LuCalendarClock,
  LuPartyPopper,
} from "react-icons/lu";
import { Page, PageHeader, Card, CardHeader, Badge, Button, PageLoader, Skeleton, inputClass } from "../components/ui";
import { dayKey } from "../utils/date";
import { loadVocabProgress, isDue } from "../utils/vocabProgress";
import {
  analyzeAttempts,
  buildWeek,
  mergeAiWeek,
  aiStatus,
  daysUntil,
  streak,
  DEFAULT_SETTINGS,
  addDays,
  parseDay,
  WEAK_ACCURACY,
} from "../utils/studyPlan";
import { translate, useI18n } from "../i18n";
import { SAT_TEST_DATES } from "../data/testDates";

const TASK_META = {
  mock: { icon: LuNotebookPen, tone: "text-accent bg-accent/10" },
  review: { icon: LuHistory, tone: "text-warning bg-warning/10" },
  practice: { icon: LuTarget, tone: "text-purple bg-purple/10" },
  vocab: { icon: LuBookOpen, tone: "text-success bg-success/10" },
  exam: { icon: LuTrophy, tone: "text-danger bg-danger/10" },
};

function formatMinutes(m) {
  if (!m) return "";
  if (m < 60) return translate("studyPlan.min", { m });
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? translate("studyPlan.hourMin", { h, m: r }) : translate("studyPlan.hour", { h });
}

// "Shanba, 21-noyabr" / "Saturday, November 21". Brauzerning Intl'ida
// o'zbekcha oy nomlari yo'q ("M11"), shuning uchun lug'atdan olinadi.
function dayTitle(key) {
  const d = parseDay(key);
  const date = translate("studyPlan.dayMonth", { d: d.getDate(), month: translate("studyPlan.months")[d.getMonth()] });
  return `${translate("studyPlan.weekdays")[d.getDay()]}, ${date}`;
}

// ---------------- Sozlash formasi ----------------
// `defaultTarget` — onboarding'da kiritilgan maqsad ball (reja hali yo'q bo'lsa).
const TARGET_PRESETS = [1200, 1300, 1400, 1500, 1550];
const MINUTE_TILES = [
  { value: 30, key: "light" },
  { value: 60, key: "steady" },
  { value: 90, key: "serious" },
  { value: 120, key: "max" },
];
const clampScore = (n) => Math.min(1600, Math.max(400, Math.round(n / 10) * 10));

function Section({ n, title, hint, children }) {
  return (
    <section className="border-t border-ink/[0.07] pt-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold tabular-nums text-on-ink">
          {n}
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-6 text-ink">{title}</h3>
          {hint && <p className="mt-0.5 text-[13px] leading-[18px] text-ink-2">{hint}</p>}
        </div>
      </div>
      <div className="sm:pl-9">{children}</div>
    </section>
  );
}

// Tanlanadigan plitka (radio/checkbox ko'rinishi) — tanlangani accent chegara bilan.
function Tile({ selected, disabled, onClick, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`relative rounded-2xl border text-left transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 ${
        selected
          ? "border-accent bg-accent/[0.08] ring-1 ring-accent"
          : "border-ink/[0.1] bg-surface hover:border-ink/25"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function SettingsForm({ initial, defaultTarget, onSave, onCancel, saving }) {
  const { t, tr } = useI18n();
  const [form, setForm] = useState({
    ...DEFAULT_SETTINGS,
    ...(defaultTarget ? { targetScore: clampScore(defaultTarget) } : {}),
    ...initial,
  });
  const minDate = dayKey(addDays(new Date(), 1));
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Rasmiy SAT kunlari (ertadan boshlab, 4 tagacha) + "boshqa sana".
  const officialDates = SAT_TEST_DATES.filter((d) => d >= minDate).slice(0, 4);
  const [customDate, setCustomDate] = useState(() => Boolean(form.examDate) && !officialDates.includes(form.examDate));
  const examLeft = form.examDate ? daysUntil(form.examDate) : null;

  const weekdays = tr("studyPlan.weekdays");
  const weekdaysShort = tr("studyPlan.weekdaysShort");
  // Dushanbadan boshlab ko'rsatamiz (O'zbekistonda hafta dushanbadan).
  const order = [1, 2, 3, 4, 5, 6, 0];

  const toggleRest = (d) => {
    const restDays = form.restDays.includes(d) ? form.restDays.filter((x) => x !== d) : [...form.restDays, d];
    // Mock kuni dam olishga aylansa — birinchi bo'sh kunga ko'chadi.
    const mockDay = restDays.includes(form.mockDay) ? (order.find((x) => !restDays.includes(x)) ?? form.mockDay) : form.mockDay;
    set({ restDays, mockDay });
  };

  const studyDays = 7 - form.restDays.length;
  const problem = !form.examDate
    ? t("studyPlan.setup.needDate")
    : form.examDate < minDate
      ? t("studyPlan.setup.dateFuture")
      : studyDays < 1
        ? t("studyPlan.setup.needStudyDay")
        : null;

  return (
    <Card className="overflow-hidden">
      <div className="space-y-6 p-5 sm:p-7">
        <div>
          <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">{t("studyPlan.setupTitle")}</h2>
          <p className="mt-1 text-[15px] leading-[21px] text-ink-2">{t("studyPlan.setupText")}</p>
        </div>

        {/* 1. Imtihon sanasi */}
        <Section n={1} title={t("studyPlan.setup.dateTitle")} hint={t("studyPlan.setup.dateHint")}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {officialDates.map((d) => (
              <Tile
                key={d}
                selected={!customDate && form.examDate === d}
                onClick={() => {
                  setCustomDate(false);
                  set({ examDate: d });
                }}
                className="px-3.5 py-3"
              >
                <span className="block text-[15px] font-semibold text-ink">{dayTitle(d).split(", ")[1]}</span>
                <span className="mt-0.5 block text-[12px] text-ink-2">
                  {weekdays[parseDay(d).getDay()]} · {t("studyPlan.setup.daysLeft", { n: daysUntil(d) })}
                </span>
                <span className="mt-2 inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {t("studyPlan.setup.official")}
                </span>
              </Tile>
            ))}
            <Tile selected={customDate} onClick={() => setCustomDate(true)} className="px-3.5 py-3">
              <span className="block text-[15px] font-semibold text-ink">{t("studyPlan.setup.otherDate")}</span>
              <span className="mt-0.5 block text-[12px] text-ink-2">{t("studyPlan.setup.otherDateHint")}</span>
            </Tile>
          </div>
          {customDate && (
            <input
              type="date"
              min={minDate}
              value={form.examDate}
              onChange={(e) => set({ examDate: e.target.value })}
              aria-label={t("studyPlan.examDate")}
              className={`${inputClass} mt-3 max-w-xs`}
            />
          )}
        </Section>

        {/* 2. Maqsad ball */}
        <Section n={2} title={t("studyPlan.setup.targetTitle")} hint={t("studyPlan.setup.targetHint")}>
          <div className="flex items-center justify-center gap-5 rounded-2xl bg-fill/70 py-5 sm:justify-start sm:px-5">
            <button
              type="button"
              onClick={() => set({ targetScore: clampScore(form.targetScore - 10) })}
              disabled={form.targetScore <= 400}
              aria-label="−10"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-[22px] font-medium text-ink shadow-card transition hover:bg-ink/[0.04] active:scale-95 disabled:opacity-35"
            >
              −
            </button>
            <div className="min-w-[120px] text-center">
              <p className="font-display text-[44px] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink">
                {form.targetScore}
              </p>
              <p className="mt-1.5 text-[12px] text-ink-2">{t("studyPlan.setup.outOf")}</p>
            </div>
            <button
              type="button"
              onClick={() => set({ targetScore: clampScore(form.targetScore + 10) })}
              disabled={form.targetScore >= 1600}
              aria-label="+10"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-[22px] font-medium text-ink shadow-card transition hover:bg-ink/[0.04] active:scale-95 disabled:opacity-35"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={form.targetScore}
            onChange={(e) => set({ targetScore: Number(e.target.value) })}
            aria-label={t("studyPlan.setup.targetTitle")}
            className="pz-range mt-4 w-full"
            style={{ "--pz-range": `${((form.targetScore - 400) / 1200) * 100}%` }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {TARGET_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set({ targetScore: n })}
                aria-pressed={form.targetScore === n}
                className={`h-8 rounded-full px-3.5 text-[13px] font-medium tabular-nums transition ${
                  form.targetScore === n ? "bg-accent text-white" : "bg-fill text-ink-2 hover:text-ink"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Section>

        {/* 3. Kunlik vaqt */}
        <Section n={3} title={t("studyPlan.dailyTime")} hint={t("studyPlan.setup.timeHint")}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {MINUTE_TILES.map((m) => (
              <Tile
                key={m.value}
                selected={form.dailyMinutes === m.value}
                onClick={() => set({ dailyMinutes: m.value })}
                className="px-3.5 py-3"
              >
                <span className="block whitespace-nowrap font-display text-[19px] font-bold tabular-nums text-ink">
                  {t(`studyPlan.setup.time.${m.value}`)}
                </span>
                <span className="mt-0.5 block text-[12px] text-ink-2">{t(`studyPlan.setup.pace.${m.key}`)}</span>
              </Tile>
            ))}
          </div>
        </Section>

        {/* 4. Dam olish kunlari */}
        <Section n={4} title={t("studyPlan.restDays")} hint={t("studyPlan.setup.restHint")}>
          <div className="grid grid-cols-7 gap-1.5">
            {order.map((d) => {
              const on = form.restDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleRest(d)}
                  aria-pressed={on}
                  aria-label={weekdays[d]}
                  className={`flex h-14 flex-col items-center justify-center rounded-xl text-[13px] font-semibold transition active:scale-95 ${
                    on ? "bg-ink text-on-ink" : "bg-fill text-ink-2 hover:text-ink"
                  }`}
                >
                  {weekdaysShort[d]}
                  <span className={`mt-0.5 text-[10px] font-medium ${on ? "text-on-ink/70" : "text-ink-3"}`}>
                    {on ? t("studyPlan.rest") : t("studyPlan.setup.study")}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 5. Mock kuni */}
        <Section n={5} title={t("studyPlan.mockDay")} hint={t("studyPlan.setup.mockHint")}>
          <div className="grid grid-cols-7 gap-1.5">
            {order.map((d) => {
              const rest = form.restDays.includes(d);
              const on = form.mockDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => set({ mockDay: d })}
                  disabled={rest}
                  aria-pressed={on}
                  aria-label={weekdays[d]}
                  className={`flex h-11 items-center justify-center rounded-xl text-[13px] font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${
                    on ? "bg-accent text-white" : "bg-fill text-ink-2 hover:text-ink"
                  }`}
                >
                  {weekdaysShort[d]}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Xulosa + tugma */}
      <div className="border-t border-ink/[0.07] bg-surface-2 p-5 sm:px-7">
        <p className="text-[12px] font-semibold text-ink-3">{t("studyPlan.setup.summary")}</p>
        <p className="mt-1 text-[15px] leading-[22px] text-ink">
          {problem ? (
            <span className="text-ink-2">{problem}</span>
          ) : (
            t("studyPlan.setup.summaryText", {
              days: examLeft,
              target: form.targetScore,
              perWeek: studyDays,
              time: formatMinutes(form.dailyMinutes),
              mock: weekdays[form.mockDay],
            })
          )}
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
          <Button onClick={() => onSave(form)} disabled={Boolean(problem) || saving}>
            {saving ? t("studyPlan.saving") : t("studyPlan.build")} <LuArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------- Holat xabari ----------------
// Bir vaqtda faqat bittasi (eng muhimi): mock yo'q → AI eskirgan.
// (Sana o'tgan holatni markazdagi katta karta tushuntiradi.)
function StatusNotice({ kind, onGenerate, generating, aiEnabled }) {
  const { t } = useI18n();
  if (!kind) return null;
  const config = {
    noMock: {
      icon: LuNotebookPen,
      tone: "bg-accent/10 text-accent",
      text: t("studyPlan.notice.noMock"),
      action: (
        <Button size="sm" to="/sat/select">
          {t("studyPlan.notice.startMock")} <LuArrowRight size={14} />
        </Button>
      ),
    },
    stale: {
      icon: LuSparkles,
      tone: "bg-accent/10 text-accent",
      text: t("studyPlan.notice.stale"),
      action: aiEnabled ? (
        <Button size="sm" onClick={onGenerate} disabled={generating}>
          <LuRefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? t("studyPlan.building") : t("studyPlan.notice.update")}
        </Button>
      ) : null,
    },
  }[kind];
  const Icon = config.icon;
  return (
    <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.tone}`}>
          <Icon size={19} />
        </span>
        <p className="text-[15px] leading-[21px] text-ink">{config.text}</p>
      </div>
      {config.action && <div className="shrink-0 pl-[52px] sm:pl-0">{config.action}</div>}
    </Card>
  );
}

// ---------------- Vazifa qatori ----------------
// readOnly — boshqa kunlar (hafta kartasida): belgilash va boshlash yo'q.
function TaskRow({ task, done, readOnly = false, onToggle }) {
  const { t } = useI18n();
  const meta = TASK_META[task.type];
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      {!readOnly && (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? t("studyPlan.markUndone") : t("studyPlan.markDone")}
          title={done ? t("studyPlan.markUndone") : t("studyPlan.markDone")}
          className={`mt-2 shrink-0 rounded-full transition ${done ? "text-success" : "text-ink/25 hover:text-ink/50"}`}
        >
          {done ? <LuCircleCheck size={24} /> : <LuCircle size={24} />}
        </button>
      )}
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone} ${done ? "opacity-50" : ""}`}>
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[15px] font-semibold leading-5 ${done ? "text-ink-3 line-through" : "text-ink"}`}>
              {task.title}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-[18px] text-ink-2">
              <span>{t(`studyPlan.taskLabels.${task.type}`)}</span>
              {task.minutes > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden="true">·</span>
                  <LuClock size={12} /> {formatMinutes(task.minutes)}
                </span>
              )}
            </p>
            {task.detail && !readOnly && <p className="mt-1 text-[13px] leading-[19px] text-ink-2">{task.detail}</p>}
          </div>
          {task.to && !readOnly && !done && (
            <Button to={task.to} variant="outline" size="sm" className="self-start sm:self-center">
              {t("studyPlan.start")} <LuArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

// ---------------- Bugun ----------------
function TodayCard({ day, done, generating, onToggle }) {
  const { t } = useI18n();
  const dayDone = done[day.key] || [];
  const finished = day.tasks.filter((x) => dayDone.includes(x.id)).length;
  const total = day.tasks.length;
  const minutes = day.tasks.reduce((sum, x) => sum + (x.minutes || 0), 0);
  const isExam = day.tasks.some((x) => x.type === "exam");
  const allDone = total > 0 && finished === total;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-2">
            {dayTitle(day.key)}
          </p>
          <h2 className="mt-0.5 font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
            {t("studyPlan.todayTitle")}
          </h2>
        </div>
        {total > 0 && !generating && !isExam && (
          <p className="text-[13px] font-medium tabular-nums text-ink-2">
            {t("studyPlan.doneCount", { done: finished, total })} · {t("studyPlan.aboutTime", { time: formatMinutes(minutes) })}
          </p>
        )}
      </div>

      {day.focus && !generating && (
        <p className="mt-2 flex items-start gap-1.5 text-[13px] font-medium leading-[18px] text-accent">
          <LuSparkles size={14} className="mt-0.5 shrink-0" /> {day.focus}
        </p>
      )}

      {total > 0 && !generating && !isExam && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500"
            style={{ width: `${(finished / total) * 100}%` }}
          />
        </div>
      )}

      <div className="mt-5">
        {generating ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((k) => (
              <Skeleton key={k} className="h-[64px]" />
            ))}
            <p className="pt-1 text-center text-[13px] text-ink-2">{t("studyPlan.aiWorking")}</p>
          </div>
        ) : day.rest ? (
          <div className="flex items-center gap-3 rounded-2xl bg-fill p-4 text-[15px] text-ink-2">
            <LuCoffee size={20} className="shrink-0" /> {t("studyPlan.restDay")}
          </div>
        ) : isExam ? (
          <div className="flex items-center gap-3 rounded-2xl bg-danger/10 p-4 text-[15px] font-medium text-danger">
            <LuTrophy size={20} className="shrink-0" /> {t("studyPlan.tasks.examDetail")}
          </div>
        ) : (
          <>
            {allDone && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-success/10 p-4 text-[15px] font-medium text-success">
                <LuPartyPopper size={20} className="shrink-0" /> {t("studyPlan.allDone")}
              </div>
            )}
            <ul className="divide-y divide-ink/[0.07]">
              {day.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  done={dayDone.includes(task.id)}
                  onToggle={() => onToggle(day.key, task.id)}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}

// ---------------- Shu hafta ----------------
function WeekCard({ week, done, selected, onSelect }) {
  const { t, tr } = useI18n();
  const day = week.find((d) => d.key === selected) || week[0];
  const isToday = day.key === week[0].key;
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[17px] font-semibold text-ink">{t("studyPlan.weekTitle")}</h2>
        <p className="text-[12px] text-ink-3">{t("studyPlan.weekHint")}</p>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none]">
        <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-7">
          {week.map((d, i) => {
            const isExam = d.tasks.some((x) => x.type === "exam");
            const finished = d.tasks.filter((x) => done[d.key]?.includes(x.id)).length;
            const active = d.key === day.key;
            const label = isExam
              ? t("studyPlan.taskLabels.exam")
              : d.rest
                ? t("studyPlan.rest")
                : d.afterExam
                  ? "—"
                  : t("studyPlan.taskCount", { n: d.tasks.length });
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => onSelect(d.key)}
                aria-pressed={active}
                className={`flex w-[78px] flex-col items-center rounded-2xl border px-1.5 py-2.5 transition sm:w-auto ${
                  active ? "border-accent bg-accent/[0.08]" : "border-ink/[0.07] hover:border-ink/20"
                } ${d.rest || d.afterExam ? "text-ink-3" : isExam ? "text-danger" : "text-ink"}`}
              >
                <span className={`text-[12px] font-semibold ${i === 0 ? "text-accent" : "text-ink-2"}`}>
                  {i === 0 ? t("studyPlan.today") : tr("studyPlan.weekdaysShort")[d.weekday]}
                </span>
                <span className="mt-0.5 font-display text-[19px] font-bold tabular-nums">{d.key.slice(8)}</span>
                <span className="mt-1 flex h-3 items-center gap-1">
                  {isExam ? (
                    <LuTrophy size={12} />
                  ) : d.rest ? (
                    <LuCoffee size={12} />
                  ) : (
                    d.tasks.slice(0, 5).map((x, k) => (
                      <span key={x.id} className={`h-1.5 w-1.5 rounded-full ${k < finished ? "bg-success" : "bg-ink/15"}`} />
                    ))
                  )}
                </span>
                <span className="mt-1 text-[11px] font-medium text-ink-3">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 border-t border-ink/[0.07] pt-4">
        {isToday ? (
          <p className="text-[13px] text-ink-2">{t("studyPlan.seeToday")}</p>
        ) : (
          <>
            <p className="mb-3 text-[13px] font-semibold text-ink">
              {dayTitle(day.key)}
            </p>
            {day.rest ? (
              <p className="text-[13px] text-ink-2">{t("studyPlan.restDay")}</p>
            ) : day.afterExam ? (
              <p className="text-[13px] text-ink-2">{t("studyPlan.afterExamDay")}</p>
            ) : (
              <>
                {day.focus && (
                  <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-accent">
                    <LuSparkles size={13} /> {day.focus}
                  </p>
                )}
                <ul className="divide-y divide-ink/[0.07]">
                  {day.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} readOnly done={false} />
                  ))}
                </ul>
                <p className="mt-3 text-[12px] text-ink-3">{t("studyPlan.onlyToday")}</p>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

// ---------------- Holat: imtihon, ball, streak ----------------
function OverviewCard({ settings, analysis, streakCount }) {
  const { t } = useI18n();
  const left = daysUntil(settings.examDate);
  const gap = analysis.current != null ? settings.targetScore - analysis.current : null;
  const rows = [
    {
      icon: LuCalendarClock,
      tone: "bg-accent/10 text-accent",
      label: t("studyPlan.untilExam"),
      value: left > 0 ? t("studyPlan.daysN", { n: left }) : left === 0 ? t("studyPlan.today") : t("studyPlan.passed"),
      hint: settings.examDate.split("-").reverse().join("."),
    },
    {
      icon: LuTarget,
      tone: "bg-success/10 text-success",
      label: t("studyPlan.overview.score"),
      value:
        analysis.current != null ? (
          <>
            {analysis.current} <span className="text-ink-3">→</span> {settings.targetScore}
          </>
        ) : (
          <>
            — <span className="text-ink-3">→</span> {settings.targetScore}
          </>
        ),
      hint:
        gap == null ? t("studyPlan.overview.noScore") : gap > 0 ? t("studyPlan.toGoal", { n: gap }) : t("studyPlan.reached"),
    },
    {
      icon: LuFlame,
      tone: "bg-warning/10 text-warning",
      label: t("studyPlan.overview.streak"),
      value: t("studyPlan.daysN", { n: streakCount }),
      hint: t("studyPlan.overview.streakHint"),
    },
  ];
  return (
    <Card className="divide-y divide-ink/[0.07] px-5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 py-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.tone}`}>
            <r.icon size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-ink-2">{r.label}</p>
            <p className="whitespace-nowrap font-display text-[19px] font-bold leading-6 tabular-nums text-ink">{r.value}</p>
            <p className="mt-0.5 text-[12px] leading-4 text-ink-3">{r.hint}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ---------------- Reja turi (AI / standart) ----------------
function PlanSourceCard({ status, ai, generating, onGenerate, aiEnabled, latestResultPath }) {
  const { t, fmtDate } = useI18n();
  const isAi = status !== "none";
  const when = isAi ? fmtDate(new Date(ai.generatedAt), { day: "2-digit", month: "2-digit", year: "numeric" }) : null;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isAi ? "bg-accent/10 text-accent" : "bg-ink/[0.06] text-ink-2"
          }`}
        >
          {isAi ? <LuSparkles size={18} /> : <LuCpu size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-ink-2">{t("studyPlan.source.label")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[16px] font-semibold text-ink">{isAi ? t("studyPlan.aiPlan") : t("studyPlan.standardPlan")}</p>
            {status === "stale" && <Badge tone="amber">{t("studyPlan.needsUpdate")}</Badge>}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-[19px] text-ink-2">
        {generating
          ? t("studyPlan.aiGenerating")
          : isAi
            ? ai.summary || t("studyPlan.source.aiText", { date: when })
            : t("studyPlan.source.standardText")}
      </p>
      {isAi && ai.summary && !generating && (
        <p className="mt-1.5 text-[12px] text-ink-3">{t("studyPlan.source.aiMadeOn", { date: when })}</p>
      )}

      {aiEnabled && (
        <Button
          variant={isAi ? "outline" : "primary"}
          size="sm"
          className="mt-4 w-full"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? <LuRefreshCw size={14} className="animate-spin" /> : isAi ? <LuRefreshCw size={14} /> : <LuSparkles size={14} />}
          {generating ? t("studyPlan.building") : isAi ? t("studyPlan.rebuild") : t("studyPlan.buildAi")}
        </Button>
      )}
      <p className="mt-2.5 text-center text-[12px] leading-4 text-ink-3">
        {t("studyPlan.source.limit")}
        {latestResultPath && (
          <>
            {" · "}
            <Link to={latestResultPath} className="text-accent hover:underline">
              {t("studyPlan.latestResult")}
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}

// ---------------- Mavzular ----------------
function TopicsCard({ analysis }) {
  const { t } = useI18n();
  const weakIds = new Set(analysis.weakDomains.map((w) => w.id));
  const groups = [
    { id: "rw", label: "Reading & Writing" },
    { id: "math", label: "Math" },
  ]
    .map((g) => ({ ...g, items: analysis.domains.filter((d) => d.subject === g.id && d.total > 0) }))
    .filter((g) => g.items.length);

  return (
    <Card>
      <CardHeader title={t("studyPlan.topicsTitle")} subtitle={t("studyPlan.topicsSubtitle")} />
      <div className="px-5 pb-5 pt-4 sm:px-6">
        {!analysis.hasData || groups.length === 0 ? (
          <div className="text-[13px] leading-[19px] text-ink-2">
            <p>{t("studyPlan.topicsEmpty")}</p>
            <Button to="/sat/select" size="sm" className="mt-4">
              {t("studyPlan.diagnostic")} <LuArrowRight size={14} />
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.id}>
                <p className="mb-2.5 text-[12px] font-semibold text-ink-3">{g.label}</p>
                <div className="space-y-3">
                  {g.items.map((d) => {
                    const pct = Math.round(d.accuracy * 100);
                    const weak = weakIds.has(d.id);
                    const bar = weak ? "bg-warning" : pct >= 85 ? "bg-success" : "bg-accent";
                    return (
                      <div key={d.id}>
                        <div className="mb-1.5 flex items-start justify-between gap-3 text-[13px] leading-[18px]">
                          <span className="min-w-0">
                            <span className="font-medium text-ink">{d.label}</span>
                            {weak && (
                              <Badge tone="amber" className="ml-1.5 align-[1px]">
                                {t("studyPlan.topics.weak")}
                              </Badge>
                            )}
                          </span>
                          <span className="shrink-0 text-right tabular-nums">
                            <span className="font-semibold text-ink">{pct}%</span>
                            <span className="block text-[11px] text-ink-3">
                              {t("studyPlan.topics.correctOf", { correct: d.correct, total: d.total })}
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                          <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-[12px] text-ink-3">
              {t("studyPlan.topics.legend", { pct: Math.round(WEAK_ACCURACY * 100) })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------- Sahifa ----------------
export default function StudyPlan() {
  const { user, saveStudyPlan, setStudyPlanDone, generateAiStudyPlan } = useAuth();
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null); // { settings, done, ai }
  const [attempts, setAttempts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(() => dayKey());
  const [error, setError] = useState("");

  // Reja foydalanuvchi profilida (/auth/me) keladi; natijalar alohida so'rovda.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    const sp = user.studyPlan;
    if (sp?.settings) setPlan({ settings: sp.settings, done: sp.done || {}, ai: sp.ai || null });
    fetchUserResults("results", uid, { pageSize: 10 })
      .then((r) => setAttempts(r.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    // Faqat foydalanuvchi almashganda — saqlashdan keyingi user yangilanishi
    // mahalliy holatni qayta yozmasin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const analysis = useMemo(() => analyzeAttempts(attempts), [attempts]);

  const vocabDue = useMemo(() => {
    if (!user) return 0;
    const progress = loadVocabProgress(user.uid);
    return Object.values(progress).filter((e) => isDue(e)).length;
  }, [user]);

  const status = plan ? aiStatus(plan.ai, analysis) : "none";

  const week = useMemo(() => {
    if (!plan) return [];
    const base = buildWeek({ settings: plan.settings, analysis, vocabDue });
    return status === "none" ? base : mergeAiWeek(base, plan.ai, { latestResultPath: analysis.latestResultPath });
    // lang: vazifa nomlari tanlangan tilda qayta tuziladi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, analysis, vocabDue, status, lang]);

  const saveSettings = async (settings) => {
    setSaving(true);
    setError("");
    try {
      await saveStudyPlan(settings);
      // Server sozlamalar o'zgarganda AI rejani tashlab yuboradi.
      setPlan((p) => ({ settings, done: p?.done || {}, ai: null }));
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(t("studyPlan.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const generateAi = async () => {
    setGenerating(true);
    setError("");
    try {
      const updated = await generateAiStudyPlan({
        startDate: dayKey(),
        lang,
        vocabDue,
        latestId: analysis.latestId,
        analysis: {
          current: analysis.current,
          rw: analysis.rw,
          math: analysis.math,
          domains: analysis.domains.map((d) => ({ id: d.id, correct: d.correct, total: d.total })),
        },
      });
      setPlan((p) => ({ ...p, ai: updated.studyPlan?.ai || null }));
    } catch (err) {
      console.error(err);
      setError(err?.message || t("studyPlan.aiError"));
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = (dateKey, taskId) => {
    const current = plan.done[dateKey] || [];
    const next = current.includes(taskId) ? current.filter((t) => t !== taskId) : [...current, taskId];
    setPlan((p) => ({ ...p, done: { ...p.done, [dateKey]: next } }));
    setStudyPlanDone(dateKey, next).catch((err) => {
      console.error(err);
      setError(t("studyPlan.checkError"));
    });
  };

  if (loading) return <PageLoader />;

  const header = (
    <PageHeader
      eyebrow="Study Plan"
      icon={LuCompass}
      title={t("studyPlan.title")}
      subtitle={t("studyPlan.subtitle")}
      actions={
        plan &&
        !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <LuPencil size={14} /> {t("studyPlan.settings")}
          </Button>
        )
      }
    />
  );

  const errorBox = error && (
    <Card className="mb-6 flex items-center gap-3 border-warning/30 bg-warning/10 p-4 text-[13px] font-semibold text-warning">
      <LuTriangleAlert size={18} className="shrink-0" /> {error}
    </Card>
  );

  if (!plan || editing) {
    return (
      <Page width="form">
        {header}
        {errorBox}
        <SettingsForm
          initial={plan?.settings}
          defaultTarget={user?.onboarding?.targets?.sat}
          onSave={saveSettings}
          onCancel={plan ? () => setEditing(false) : null}
          saving={saving}
        />
      </Page>
    );
  }

  const { settings, done } = plan;
  const today = week[0];
  const examPassed = daysUntil(settings.examDate) < 0;
  const aiEnabled = user?.aiEnabled !== false;
  // Sana o'tgan bo'lsa markazdagi katta karta o'zi tushuntiradi — tepada takrorlanmaydi.
  const notice = examPassed ? null : !analysis.hasData ? "noMock" : status === "stale" ? "stale" : null;

  return (
    <Page>
      {header}
      {errorBox}

      <StatusNotice
        kind={notice}
        onGenerate={generateAi}
        generating={generating}
        aiEnabled={aiEnabled}
      />

      {/* min-w-0: hafta qatori (gorizontal scroll) ustunni telefonda kengaytirib yubormasin. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {!examPassed && (
            <>
              <TodayCard day={today} done={done} generating={generating} onToggle={toggleTask} />
              <WeekCard week={week} done={done} selected={selected} onSelect={setSelected} />
            </>
          )}
          {examPassed && (
            <Card className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fill text-ink-2">
                <LuCalendarX size={26} />
              </span>
              <p className="mt-4 max-w-sm text-[15px] leading-[22px] text-ink-2">{t("studyPlan.examPassedEmpty")}</p>
              <Button className="mt-5" onClick={() => setEditing(true)}>
                {t("studyPlan.notice.newDate")}
              </Button>
            </Card>
          )}
        </div>
        <div className="min-w-0 space-y-6">
          <OverviewCard settings={settings} analysis={analysis} streakCount={streak(done, settings.restDays)} />
          <PlanSourceCard
            status={status}
            ai={plan.ai}
            generating={generating}
            onGenerate={generateAi}
            aiEnabled={aiEnabled}
            latestResultPath={analysis.latestResultPath}
          />
          <TopicsCard analysis={analysis} />
        </div>
      </div>
    </Page>
  );
}
