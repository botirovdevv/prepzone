import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUserResults } from "../utils/userResults";
import { useAuth } from "../context/AuthContext";
import {
  LuCompass,
  LuCalendarDays,
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
} from "react-icons/lu";
import { Page, PageHeader, Card, CardHeader, StatTile, Badge, Button, Field, PageLoader, inputClass } from "../components/ui";
import { dayKey } from "../utils/date";
import { loadVocabProgress, isDue } from "../utils/vocabProgress";
import { analyzeAttempts, buildWeek, daysUntil, streak, DEFAULT_SETTINGS, addDays } from "../utils/studyPlan";

const WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const WEEKDAYS_SHORT = ["Yak", "Du", "Se", "Chor", "Pay", "Ju", "Sha"];
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
  if (m < 60) return `${m} daq`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} soat ${r} daq` : `${h} soat`;
}

// ---------------- Sozlash formasi ----------------
function SettingsForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS, ...initial });
  const minDate = dayKey(addDays(new Date(), 1));
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleRest = (d) =>
    set({ restDays: form.restDays.includes(d) ? form.restDays.filter((x) => x !== d) : [...form.restDays, d] });

  const valid =
    form.examDate && form.examDate >= minDate && form.restDays.length < 6 && !form.restDays.includes(form.mockDay);

  return (
    <Card className="p-5 sm:p-7">
      <h2 className="font-display text-[19px] font-bold text-[#12213D]">Rejangizni sozlang</h2>
      <p className="mt-1 text-sm text-[#12213D]/50">
        Imtihon sanasi va maqsadingizga qarab har kunlik vazifalar tuziladi.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Imtihon sanasi">
          <input
            type="date"
            min={minDate}
            value={form.examDate}
            onChange={(e) => set({ examDate: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label={`Maqsad ball: ${form.targetScore}`}>
          <input
            type="range"
            min={800}
            max={1600}
            step={10}
            value={form.targetScore}
            onChange={(e) => set({ targetScore: Number(e.target.value) })}
            className="mt-3 w-full accent-[#087fd1]"
          />
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[13px] font-semibold text-[#12213D]/75">Kuniga qancha vaqt ajrata olasiz?</p>
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
          <p className="mb-2 text-[13px] font-semibold text-[#12213D]/75">Dam olish kunlari</p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS_SHORT.map((w, d) => (
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
        <Field label="Mock test kuni">
          <select
            value={form.mockDay}
            onChange={(e) => set({ mockDay: Number(e.target.value) })}
            className={inputClass}
          >
            {WEEKDAYS.map((w, d) => (
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
            Bekor qilish
          </Button>
        )}
        <Button onClick={() => onSave(form)} disabled={!valid || saving}>
          {saving ? "Saqlanmoqda..." : "Rejani tuzish"} <LuArrowRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

// ---------------- Vazifa qatori ----------------
function TaskRow({ task, done, onToggle }) {
  const meta = TASK_META[task.type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5 sm:px-6">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
        className={`shrink-0 transition ${done ? "text-emerald-500" : "text-[#12213D]/20 hover:text-[#12213D]/40"}`}
      >
        {done ? <LuCircleCheck size={24} /> : <LuCircle size={24} />}
      </button>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${done ? "text-[#12213D]/40 line-through" : "text-[#12213D]"}`}>
          {task.title}
        </p>
        <p className="truncate text-xs text-[#12213D]/45">
          {task.minutes ? `${formatMinutes(task.minutes)} · ` : ""}
          {task.detail}
        </p>
      </div>
      {task.to && !done && (
        <Button to={task.to} variant="outline" size="sm" className="shrink-0">
          Boshlash
        </Button>
      )}
    </div>
  );
}

// ---------------- Sahifa ----------------
export default function StudyPlan() {
  const { user, saveStudyPlan, setStudyPlanDone } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null); // { settings, done }
  const [attempts, setAttempts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reja foydalanuvchi profilida (/auth/me) keladi; natijalar alohida so'rovda.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    const sp = user.studyPlan;
    if (sp?.settings) setPlan({ settings: sp.settings, done: sp.done || {} });
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

  const week = useMemo(
    () => (plan ? buildWeek({ settings: plan.settings, analysis, vocabDue }) : []),
    [plan, analysis, vocabDue]
  );

  const saveSettings = async (settings) => {
    setSaving(true);
    setError("");
    try {
      await saveStudyPlan(settings);
      setPlan((p) => ({ settings, done: p?.done || {} }));
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Saqlashda xatolik. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = (dateKey, taskId) => {
    const current = plan.done[dateKey] || [];
    const next = current.includes(taskId) ? current.filter((t) => t !== taskId) : [...current, taskId];
    setPlan((p) => ({ ...p, done: { ...p.done, [dateKey]: next } }));
    setStudyPlanDone(dateKey, next).catch((err) => {
      console.error(err);
      setError("Belgini saqlab bo'lmadi.");
    });
  };

  if (loading) return <PageLoader />;

  const header = (
    <PageHeader
      eyebrow="Study Plan"
      icon={LuCompass}
      title="O'quv rejangiz"
      subtitle="Mock natijalaringiz va zaif mavzularingizga qarab tuzilgan kunlik vazifalar."
      actions={
        plan &&
        !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <LuPencil size={14} /> Sozlamalar
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
          onSave={saveSettings}
          onCancel={plan ? () => setEditing(false) : null}
          saving={saving}
        />
      </Page>
    );
  }

  const { settings, done } = plan;
  const left = daysUntil(settings.examDate);
  const today = week[0];
  const todayDone = today?.tasks.filter((t) => done[today.key]?.includes(t.id)).length || 0;
  const gap = analysis.current != null ? settings.targetScore - analysis.current : null;
  const progressPct =
    analysis.current != null ? Math.min(100, Math.max(0, ((analysis.current - 400) / (settings.targetScore - 400)) * 100)) : 0;

  return (
    <Page>
      {header}
      {errorBox}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={LuCalendarDays}
          label="Imtihongacha"
          value={left > 0 ? `${left} kun` : left === 0 ? "Bugun!" : "O'tdi"}
          hint={settings.examDate.split("-").reverse().join(".")}
        />
        <Card className="p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">Joriy → Maqsad</p>
          <p className="mt-0.5 font-display text-[26px] font-extrabold leading-tight tabular-nums text-[#12213D]">
            {analysis.current ?? "—"} <span className="text-[#12213D]/30">→</span> {settings.targetScore}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#12213D]/[0.06]">
            <div className="h-full rounded-full bg-[#087fd1]" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-[#12213D]/45">
            {gap == null ? "Diagnostik mock test yeching" : gap > 0 ? `Yana ${gap} ball kerak` : "Maqsadga yetdingiz! 🎉"}
          </p>
        </Card>
        <StatTile
          icon={LuFlame}
          tone="amber"
          label="Ketma-ket kunlar"
          value={streak(done, settings.restDays)}
          hint="kamida 1 vazifa bajarilgan"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Bugun */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader
            title={`Bugun · ${WEEKDAYS[today.weekday]}`}
            subtitle={today.tasks.length ? `${todayDone}/${today.tasks.length} bajarildi` : undefined}
            action={
              today.tasks.length > 0 && todayDone === today.tasks.length ? <Badge tone="emerald">Barchasi bajarildi</Badge> : null
            }
          />
          <div className="mt-3 divide-y divide-[#12213D]/[0.06]">
            {today.rest ? (
              <div className="flex items-center gap-3 px-6 pb-6 text-sm text-[#12213D]/55">
                <LuCoffee size={18} /> Bugun dam olish kuni. Yaxshi hordiq chiqaring!
              </div>
            ) : today.afterExam ? (
              <p className="px-6 pb-6 text-sm text-[#12213D]/55">
                Imtihon sanasi o'tib ketdi. Yangi sana kiritish uchun "Sozlamalar"ni bosing.
              </p>
            ) : (
              today.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  done={done[today.key]?.includes(t.id)}
                  onToggle={() => toggleTask(today.key, t.id)}
                />
              ))
            )}
          </div>
          <div className="h-2" />
        </Card>

        {/* Zaif mavzular */}
        <Card>
          <CardHeader title="Mavzular bo'yicha" subtitle="Oxirgi 3 ta mock test asosida" />
          <div className="px-5 pb-6 pt-4 sm:px-6">
            {!analysis.hasData || analysis.domains.length === 0 ? (
              <div className="text-sm text-[#12213D]/55">
                <p>Zaif mavzularni aniqlash uchun avval bitta to'liq mock test yeching.</p>
                <Button to="/sat/select" size="sm" className="mt-4">
                  Diagnostik test <LuArrowRight size={14} />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.domains.map((d) => {
                  const pct = Math.round(d.accuracy * 100);
                  const weak = analysis.weakDomains.some((w) => w.id === d.id);
                  return (
                    <div key={d.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
                        <span className={`truncate font-semibold ${weak ? "text-red-600" : "text-[#12213D]"}`}>
                          {d.label}
                        </span>
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
      </div>

      {/* Hafta */}
      <Card className="mt-6">
        <CardHeader title="Keyingi 7 kun" />
        <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-7">
          {week.map((day, i) => {
            const dayDone = done[day.key] || [];
            return (
              <div
                key={day.key}
                className={`rounded-xl border p-3 ${
                  i === 0 ? "border-[#087fd1]/40 bg-[#087fd1]/[0.04]" : "border-[#12213D]/[0.07]"
                }`}
              >
                <p className="text-[12px] font-bold text-[#12213D]">
                  {WEEKDAYS_SHORT[day.weekday]}{" "}
                  <span className="font-medium text-[#12213D]/40">{day.key.slice(8)}.{day.key.slice(5, 7)}</span>
                </p>
                <div className="mt-2 space-y-1.5">
                  {day.rest && <p className="text-[12px] text-[#12213D]/40">Dam olish</p>}
                  {day.afterExam && <p className="text-[12px] text-[#12213D]/30">—</p>}
                  {day.tasks.map((t) => {
                    const Icon = TASK_META[t.type].icon;
                    const isDone = dayDone.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        title={t.title}
                        className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-semibold ${
                          isDone ? "text-[#12213D]/35 line-through" : TASK_META[t.type].tone
                        }`}
                      >
                        <Icon size={12} className="shrink-0" />
                        <span className="truncate">{t.type === "practice" ? t.title.split(": ")[1] : t.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {analysis.latestResultPath && (
        <p className="mt-6 text-center text-xs text-[#12213D]/40">
          Reja har bir yangi mock natijangizdan keyin avtomatik yangilanadi ·{" "}
          <Link to={analysis.latestResultPath} className="font-semibold text-[#087fd1] hover:underline">
            Oxirgi natija
          </Link>
        </p>
      )}
    </Page>
  );
}
