import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuX } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { dayKey } from "../utils/date";
import { addDays, analyzeAttempts, buildWeek, daysUntil, mergeAiWeek } from "../utils/studyPlan";

// ------------------------------------------------------------------
// Study Plan eslatmasi — o'ng tepada chiqadigan kulgili, lekin
// motivatsion xabar (matnlar: i18n/messages/nudges.js). Faqat dashboard
// sahifalarida (DashboardLayout), testlar paytida chiqmaydi.
//
// Qachon:  missed — kecha o'qish kuni edi, hech narsa bajarilmadi (09:00 dan);
//          almost — bugun boshlangan, tugamagan (19:00 dan);
//          behind — bugun hali hech narsa yo'q (16:00 dan).
// Qancha:  kuniga ko'pi bilan 2 ta, orasida kamida 3 soat, bir holat
//          kuniga bir marta; ketma-ket bir xil matn takrorlanmaydi.
// ------------------------------------------------------------------

const MAX_PER_DAY = 2;
const GAP_MS = 3 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 4000;
const AUTO_HIDE_MS = 15000;
const CHECK_EVERY_MS = 10 * 60 * 1000;
// Bu sahifalarda chiqmaydi: rejaning o'zi va vaqtli o'yin.
const SKIP_PATHS = [/^\/study-plan/, /^\/duel\/rush/];

const storageKey = (uid) => `pz-nudge:${uid}`;

function readLog(uid) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(uid))) || {};
  } catch {
    return {};
  }
}

function writeLog(uid, log) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(log));
  } catch {
    /* private rejim */
  }
}

// Bugungi vazifalar soni — Study Plan sahifasi bilan bir xil manbadan.
function todayTaskCount(plan, today) {
  const empty = analyzeAttempts([]);
  let week = buildWeek({ settings: plan.settings, analysis: empty, startDate: today });
  if (plan.ai?.days?.length) week = mergeAiWeek(week, plan.ai);
  return week[0]?.tasks.length || 0;
}

// Hozir qaysi eslatma kerak (yoki null).
function pickNudgeKind(plan, now = new Date()) {
  const s = plan?.settings;
  if (!s?.examDate) return null;
  const left = daysUntil(s.examDate, now);
  if (left == null || left <= 0) return null; // imtihon kuni yoki o'tib ketgan
  const restDays = s.restDays || [];
  if (restDays.includes(now.getDay())) return null;

  const done = plan.done || {};
  const todayKey = dayKey(now);
  const doneToday = done[todayKey]?.length || 0;
  const hour = now.getHours();

  const yesterday = addDays(now, -1);
  const yesterdayKey = dayKey(yesterday);
  // Reja kechadan oldin tuzilgan bo'lishi kerak — yangi rejani "kecha" uchun so'kmaymiz.
  const planStart = plan.updatedAt ? dayKey(new Date(plan.updatedAt)) : null;
  const missedYesterday =
    planStart &&
    planStart < yesterdayKey &&
    !restDays.includes(yesterday.getDay()) &&
    !(done[yesterdayKey]?.length > 0);

  if (missedYesterday && doneToday === 0 && hour >= 9) return "missed";
  if (doneToday > 0 && hour >= 19 && doneToday < todayTaskCount(plan, now)) return "almost";
  if (doneToday === 0 && hour >= 16) return "behind";
  return null;
}

export default function StudyPlanNudge() {
  const { user } = useAuth();
  const { t, tr } = useI18n();
  const { pathname } = useLocation();
  const [nudge, setNudge] = useState(null); // { kind, index }
  const [leaving, setLeaving] = useState(false);
  const hideTimer = useRef(null);
  const uid = user?.uid;
  const plan = user?.studyPlan;

  const close = useCallback(() => {
    clearTimeout(hideTimer.current);
    setLeaving(true);
    setTimeout(() => {
      setNudge(null);
      setLeaving(false);
    }, 220);
  }, []);

  const startAutoHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(close, AUTO_HIDE_MS);
  }, [close]);

  // Tekshiruv: sahifa ochilganda, sahifa almashganda va har 10 daqiqada.
  useEffect(() => {
    if (!uid || !plan || nudge || SKIP_PATHS.some((re) => re.test(pathname))) return;
    const check = () => {
      const now = new Date();
      const kind = pickNudgeKind(plan, now);
      if (!kind) return;
      const today = dayKey(now);
      const log = readLog(uid);
      const day = log.day === today ? log : { day: today, count: 0, kinds: [], at: 0, last: log.last || {} };
      if (day.count >= MAX_PER_DAY || day.kinds.includes(kind) || Date.now() - day.at < GAP_MS) return;
      const pool = tr(`nudge.${kind}`) || [];
      if (!pool.length) return;
      // Oldingi safar chiqqan matn ketma-ket takrorlanmasin.
      let index = Math.floor(Math.random() * pool.length);
      if (pool.length > 1 && index === day.last[kind]) index = (index + 1) % pool.length;
      writeLog(uid, {
        ...day,
        count: day.count + 1,
        kinds: [...day.kinds, kind],
        at: Date.now(),
        last: { ...day.last, [kind]: index },
      });
      setNudge({ kind, index });
    };
    const first = setTimeout(check, SHOW_DELAY_MS);
    const every = setInterval(check, CHECK_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [uid, plan, pathname, nudge, tr]);

  useEffect(() => {
    if (nudge) startAutoHide();
    return () => clearTimeout(hideTimer.current);
  }, [nudge, startAutoHide]);

  if (!nudge) return null;
  const msg = (tr(`nudge.${nudge.kind}`) || [])[nudge.index];
  if (!msg) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => clearTimeout(hideTimer.current)}
      onMouseLeave={startAutoHide}
      className={`pz-nudge pz-shadow-lift fixed right-3 top-[calc(52px+env(safe-area-inset-top)+12px)] z-[60] w-[min(360px,calc(100vw-1.5rem))] rounded-[20px] border border-ink/[0.08] bg-elevated p-4 lg:right-6 lg:top-6 ${
        leaving ? "pz-nudge-out" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-5 text-ink">{msg.title}</p>
          <p className="mt-1 text-[13px] leading-[19px] text-ink-2">{msg.text}</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t("common.close")}
          className="-mr-1.5 -mt-1.5 shrink-0 rounded-full p-1.5 text-ink-3 transition hover:bg-ink/[0.06] hover:text-ink"
        >
          <LuX size={16} />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link
          to="/study-plan"
          onClick={close}
          className="inline-flex h-8 items-center rounded-full bg-accent px-3.5 text-[13px] font-medium text-white transition hover:bg-accent-press"
        >
          {t("nudge.open")}
        </Link>
        <button
          type="button"
          onClick={close}
          className="inline-flex h-8 items-center rounded-full px-3 text-[13px] font-medium text-ink-2 transition hover:bg-ink/[0.06] hover:text-ink"
        >
          {t("nudge.later")}
        </button>
      </div>
    </div>
  );
}
