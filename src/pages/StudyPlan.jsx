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
} from "react-icons/lu";
import { Page, PageHeader, Card, CardHeader, Badge, Button, Field, PageLoader, Skeleton, inputClass } from "../components/ui";
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
} from "../utils/studyPlan";
import { translate, useI18n } from "../i18n";

const MINUTE_OPTIONS = [30, 60, 90, 120];

const TASK_META = {
  mock: { icon: LuNotebookPen, tone: "text-[#087fd1] bg-[#087fd1]/10" },
  review: { icon: LuHistory, tone: "text-amber-600 bg-amber-500/10" },
  practice: { icon: LuTarget, tone: "text-emerald-600 bg-emerald-500/10" },
  vocab: { icon: LuBookOpen, tone: "text-[#2a9d8f] bg-[#2a9d8f]/10" },
  exam: { icon: LuTrophy, tone: "text-red-600 bg-red-500/10" },
};

function formatMinutes(m) {
  if (!m) return "";
  if (m < 60) return translate("studyPlan.min", { m });
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? translate("studyPlan.hourMin", { h, m: r }) : translate("studyPlan.hour", { h });
}

const shortDate = (key) => `${key.slice(8)}.${key.slice(5, 7)}`;

// ---------------- Sozlash formasi ----------------
// `defaultTarget` — onboarding'da kiritilgan maqsad ball (reja hali yo'q bo'lsa).
function SettingsForm({ initial, defaultTarget, onSave, onCancel, saving }) {
  const { t, tr } = useI18n();
  const [form, setForm] = useState({
    ...DEFAULT_SETTINGS,
    ...(defaultTarget ? { targetScore: defaultTarget } : {}),
    ...initial,
  });
  const minDate = dayKey(addDays(new Date(), 1));
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleRest = (d) =>
    set({ restDays: form.restDays.includes(d) ? form.restDays.filter((x) => x !== d) : [...form.restDays, d] });

  const valid =
    form.examDate && form.examDate >= minDate && form.restDays.length < 6 && !form.restDays.includes(form.mockDay);

  return (
    <Card className="p-5 sm:p-7">
      <h2 className="font-display text-[19px] font-bold text-[#12213D]">{t("studyPlan.setupTitle")}</h2>
      <p className="mt-1 text-sm text-[#12213D]/50">{t("studyPlan.setupText")}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={t("studyPlan.examDate")}>
          <input
            type="date"
            min={minDate}
            value={form.examDate}
            onChange={(e) => set({ examDate: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label={t("studyPlan.target", { n: form.targetScore })}>
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={form.targetScore}
            onChange={(e) => set({ targetScore: Number(e.target.value) })}
            className="mt-3 w-full accent-[#087fd1]"
          />
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[13px] font-semibold text-[#12213D]/75">{t("studyPlan.dailyTime")}</p>
        <div className="flex flex-wrap gap-2">
          {MINUTE_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set({ dailyMinutes: m })}
              className={`h-10 rounded-xl border px-4 text-sm font-semibold transition ${
                form.dailyMinutes === m
                  ? "border-[#087fd1] bg-[#087fd1] text-white"
                  : "border-[#12213D]/12 text-[#12213D]/70 hover:border-[#12213D]/25"
              }`}
            >
              {formatMinutes(m)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-[#12213D]/75">{t("studyPlan.restDays")}</p>
          <div className="flex flex-wrap gap-1.5">
            {tr("studyPlan.weekdaysShort").map((w, d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleRest(d)}
                className={`h-9 min-w-[44px] rounded-lg px-2 text-[13px] font-semibold transition ${
                  form.restDays.includes(d)
                    ? "bg-[#12213D] text-white"
                    : "bg-[#12213D]/[0.05] text-[#12213D]/60 hover:bg-[#12213D]/10"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <Field label={t("studyPlan.mockDay")}>
          <select
            value={form.mockDay}
            onChange={(e) => set({ mockDay: Number(e.target.value) })}
            className={inputClass}
          >
            {tr("studyPlan.weekdays").map((w, d) => (
              <option key={d} value={d} disabled={form.restDays.includes(d)}>
                {w}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button onClick={() => onSave(form)} disabled={!valid || saving}>
          {saving ? t("studyPlan.saving") : t("studyPlan.build")} <LuArrowRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

// ---------------- Ball halqasi ----------------
function ScoreRing({ current, target }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = current != null ? Math.min(1, Math.max(0, (current - 400) / Math.max(1, target - 400))) : 0;
  return (
    <div className="relative h-[112px] w-[112px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="text-[#4fb3ff] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[24px] font-extrabold leading-none tabular-nums">{current ?? "—"}</span>
        <span className="mt-1 text-[11px] font-semibold text-white/50">/ {target}</span>
      </div>
    </div>
  );
}

// ---------------- Hero ----------------
function Hero({ settings, analysis, streakCount, status, ai, generating, onGenerate }) {
  const { t } = useI18n();
  const left = daysUntil(settings.examDate);
  const gap = analysis.current != null ? settings.targetScore - analysis.current : null;
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#12213D] via-[#163056] to-[#0b5fa0] text-white shadow-[0_18px_40px_-20px_rgba(18,33,61,0.6)]">
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-8">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/50">{t("studyPlan.untilExam")}</p>
          <p className="mt-1 font-display text-[44px] font-extrabold leading-none tabular-nums">
            {left > 0 ? left : left === 0 ? t("studyPlan.today") : "—"}
            {left > 0 && <span className="ml-2 text-[20px] font-bold text-white/60">{t("studyPlan.days")}</span>}
          </p>
          <p className="mt-2 text-sm text-white/55">{settings.examDate.split("-").reverse().join(".")}</p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:gap-2">
          <ScoreRing current={analysis.current} target={settings.targetScore} />
          <p className="text-[13px] font-semibold text-white/70 sm:text-center">
            {gap == null ? t("studyPlan.takeDiagnostic") : gap > 0 ? t("studyPlan.toGoal", { n: gap }) : t("studyPlan.reached")}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
            <LuFlame size={24} />
          </span>
          <div>
            <p className="font-display text-[28px] font-extrabold leading-none tabular-nums">{streakCount}</p>
            <p className="mt-1 text-[12px] font-semibold text-white/50">{t("studyPlan.streak")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/[0.04] px-6 py-5 sm:flex-row sm:items-center sm:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4fb3ff]/15 text-[#4fb3ff]">
          <LuSparkles size={19} />
        </span>
        <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-white/80">
          {generating
            ? t("studyPlan.aiGenerating")
            : status === "none"
              ? t("studyPlan.aiNone")
              : status === "stale"
                ? t("studyPlan.aiStale")
                : ai.summary || t("studyPlan.aiFallbackSummary")}
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#12213D] transition hover:bg-white/90 disabled:opacity-60"
        >
          {generating ? (
            <LuRefreshCw size={16} className="animate-spin" />
          ) : status === "none" ? (
            <LuSparkles size={16} />
          ) : (
            <LuRefreshCw size={16} />
          )}
          {generating ? t("studyPlan.building") : status === "none" ? t("studyPlan.buildAi") : t("studyPlan.rebuild")}
        </button>
      </div>
    </div>
  );
}

// ---------------- Kunlar chizig'i ----------------
function DayStrip({ week, done, selected, onSelect }) {
  const { t, tr } = useI18n();
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none]">
      <div className="flex min-w-max snap-x gap-2 sm:grid sm:min-w-0 sm:grid-cols-7">
        {week.map((day, i) => {
          const isExam = day.tasks.some((t) => t.type === "exam");
          const total = day.tasks.length;
          const finished = day.tasks.filter((t) => done[day.key]?.includes(t.id)).length;
          const active = day.key === selected;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelect(day.key)}
              className={`flex w-[76px] snap-start flex-col items-center rounded-2xl border px-2 py-3 transition sm:w-auto ${
                active
                  ? "border-[#087fd1] bg-[#087fd1] text-white shadow-[0_10px_24px_-12px_rgba(8,127,209,0.8)]"
                  : isExam
                    ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                    : day.rest || day.afterExam
                      ? "border-[#12213D]/[0.06] bg-[#12213D]/[0.02] text-[#12213D]/40 hover:border-[#12213D]/15"
                      : "border-[#12213D]/[0.07] bg-white text-[#12213D] hover:border-[#12213D]/20"
              }`}
            >
              <span className={`text-[11px] font-bold uppercase ${active ? "text-white/70" : "opacity-60"}`}>
                {i === 0 ? t("studyPlan.today") : tr("studyPlan.weekdaysShort")[day.weekday]}
              </span>
              <span className="mt-0.5 font-display text-[20px] font-extrabold tabular-nums">{day.key.slice(8)}</span>
              <span className="mt-1.5 flex h-3 items-center gap-1">
                {isExam ? (
                  <LuTrophy size={12} />
                ) : day.rest ? (
                  <LuCoffee size={12} />
                ) : (
                  day.tasks.slice(0, 5).map((t, k) => (
                    <span
                      key={t.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        k < finished ? (active ? "bg-white" : "bg-emerald-500") : active ? "bg-white/35" : "bg-[#12213D]/15"
                      }`}
                    />
                  ))
                )}
                {!isExam && !day.rest && total === 0 && <span className="text-[10px]">—</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Vazifa kartasi ----------------
function TaskCard({ task, done, canCheck, canStart, onToggle }) {
  const { t } = useI18n();
  const meta = TASK_META[task.type];
  const Icon = meta.icon;
  return (
    <div
      className={`flex items-start gap-3.5 rounded-2xl border p-4 transition sm:items-center ${
        done ? "border-emerald-200 bg-emerald-50/50" : "border-[#12213D]/[0.07] bg-white hover:border-[#12213D]/15"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={!canCheck}
        aria-label={done ? t("studyPlan.markUndone") : t("studyPlan.markDone")}
        className={`mt-0.5 shrink-0 transition sm:mt-0 disabled:cursor-not-allowed ${
          done ? "text-emerald-500" : canCheck ? "text-[#12213D]/20 hover:text-[#12213D]/45" : "text-[#12213D]/10"
        }`}
      >
        {done ? <LuCircleCheck size={26} /> : <LuCircle size={26} />}
      </button>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#12213D]/40">{t(`studyPlan.taskLabels.${task.type}`)}</span>
          {task.minutes > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#12213D]/40">
              <LuClock size={11} /> {formatMinutes(task.minutes)}
            </span>
          )}
        </div>
        <p className={`mt-0.5 text-[15px] font-semibold ${done ? "text-[#12213D]/40 line-through" : "text-[#12213D]"}`}>
          {task.title}
        </p>
        {task.detail && <p className="mt-0.5 text-[13px] leading-relaxed text-[#12213D]/50">{task.detail}</p>}
      </div>
      {task.to && canStart && !done && (
        <Button to={task.to} variant="outline" size="sm" className="hidden shrink-0 sm:inline-flex">
          {t("studyPlan.start")} <LuArrowRight size={14} />
        </Button>
      )}
    </div>
  );
}

// ---------------- Tanlangan kun ----------------
function DayPanel({ day, isToday, done, generating, onToggle }) {
  const { t, tr } = useI18n();
  const dayDone = done[day.key] || [];
  const finished = day.tasks.filter((t) => dayDone.includes(t.id)).length;
  const minutes = day.tasks.reduce((s, t) => s + (t.minutes || 0), 0);
  const pct = day.tasks.length ? (finished / day.tasks.length) * 100 : 0;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[19px] font-bold text-[#12213D]">
            {isToday ? t("studyPlan.today") : tr("studyPlan.weekdays")[day.weekday]} · {shortDate(day.key)}
          </h2>
          {day.focus && !generating && (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-[#087fd1]">
              <LuSparkles size={13} /> {day.focus}
            </p>
          )}
        </div>
        {day.tasks.length > 0 && !generating && (
          <div className="text-right">
            <p className="text-[13px] font-semibold tabular-nums text-[#12213D]/70">
              {t("studyPlan.doneCount", { done: finished, total: day.tasks.length })}
            </p>
            <p className="text-xs text-[#12213D]/40">{formatMinutes(minutes)}</p>
          </div>
        )}
      </div>

      {day.tasks.length > 0 && !generating && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#12213D]/[0.06]">
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="mt-5 space-y-2.5">
        {generating ? (
          <>
            {[0, 1, 2].map((k) => (
              <Skeleton key={k} className="h-[76px]" />
            ))}
            <p className="pt-1 text-center text-[13px] text-[#12213D]/45">{t("studyPlan.aiWorking")}</p>
          </>
        ) : day.rest ? (
          <div className="flex items-center gap-3 rounded-2xl bg-[#12213D]/[0.03] p-5 text-sm text-[#12213D]/55">
            <LuCoffee size={20} /> {t("studyPlan.restDay")}
          </div>
        ) : day.afterExam ? (
          <p className="rounded-2xl bg-[#12213D]/[0.03] p-5 text-sm text-[#12213D]/55">
            {t("studyPlan.afterExam")}
          </p>
        ) : (
          day.tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              done={dayDone.includes(t.id)}
              canCheck={isToday}
              canStart={isToday}
              onToggle={() => onToggle(day.key, t.id)}
            />
          ))
        )}
      </div>
      {!isToday && !generating && day.tasks.length > 0 && (
        <p className="mt-4 text-center text-xs text-[#12213D]/40">{t("studyPlan.onlyToday")}</p>
      )}
    </Card>
  );
}

// ---------------- Mavzular ----------------
function TopicsCard({ analysis }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader title={t("studyPlan.topicsTitle")} subtitle={t("studyPlan.topicsSubtitle")} />
      <div className="px-5 pb-6 pt-4 sm:px-6">
        {!analysis.hasData || analysis.domains.length === 0 ? (
          <div className="text-sm text-[#12213D]/55">
            <p>{t("studyPlan.topicsEmpty")}</p>
            <Button to="/sat/select" size="sm" className="mt-4">
              {t("studyPlan.diagnostic")} <LuArrowRight size={14} />
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {analysis.domains.map((d) => {
              const pct = Math.round(d.accuracy * 100);
              const weak = analysis.weakDomains.some((w) => w.id === d.id);
              return (
                <div key={d.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
                    <span className={`truncate font-semibold ${weak ? "text-red-600" : "text-[#12213D]"}`}>{d.label}</span>
                    <span className="shrink-0 tabular-nums text-[#12213D]/50">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#12213D]/[0.06]">
                    <div
                      className={`h-full rounded-full ${weak ? "bg-red-500" : pct >= 85 ? "bg-emerald-500" : "bg-[#087fd1]"}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function SourceCard({ status, ai }) {
  const { t, fmtDate } = useI18n();
  const isAi = status !== "none";
  const when = isAi ? new Date(ai.generatedAt) : null;
  return (
    <Card className="flex items-start gap-3 p-5">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isAi ? "bg-[#087fd1]/10 text-[#087fd1]" : "bg-[#12213D]/[0.06] text-[#12213D]/50"
        }`}
      >
        {isAi ? <LuSparkles size={18} /> : <LuCpu size={18} />}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-[#12213D]">{isAi ? t("studyPlan.aiPlan") : t("studyPlan.standardPlan")}</p>
          {status === "stale" && <Badge tone="amber">{t("studyPlan.needsUpdate")}</Badge>}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-[#12213D]/50">
          {isAi
            ? t("studyPlan.aiMade", { date: fmtDate(when, { day: "2-digit", month: "2-digit", year: "numeric" }) })
            : t("studyPlan.autoPlan")}
        </p>
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
    <Card className="mb-6 flex items-center gap-3 border-amber-300 bg-amber-50 p-4 text-[13px] font-semibold text-amber-800">
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
  const todayKey = week[0]?.key;
  const day = week.find((d) => d.key === selected) || week[0];

  return (
    <Page>
      {header}
      {errorBox}

      <Hero
        settings={settings}
        analysis={analysis}
        streakCount={streak(done, settings.restDays)}
        status={status}
        ai={plan.ai}
        generating={generating}
        onGenerate={generateAi}
      />

      <div className="mt-6">
        <DayStrip week={week} done={done} selected={day.key} onSelect={setSelected} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DayPanel day={day} isToday={day.key === todayKey} done={done} generating={generating} onToggle={toggleTask} />
        </div>
        <div className="space-y-6">
          <SourceCard status={status} ai={plan.ai} />
          <TopicsCard analysis={analysis} />
        </div>
      </div>

      {analysis.latestResultPath && (
        <p className="mt-6 text-center text-xs text-[#12213D]/40">
          {t("studyPlan.updateHint")}{" "}
          <Link to={analysis.latestResultPath} className="font-semibold text-[#087fd1] hover:underline">
            {t("studyPlan.latestResult")}
          </Link>
        </p>
      )}
    </Page>
  );
}
