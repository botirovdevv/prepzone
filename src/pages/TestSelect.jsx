import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  LuNotebookPen,
  LuArrowRight,
  LuTimer,
  LuGlobe,
  LuClock,
  LuLayers,
  LuBookOpenText,
  LuCalculator,
  LuCoffee,
  LuGitBranch,
  LuSparkles,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { testsCatalog } from "../data/testsCatalog";
import { loadLocalProgress, getCooldownRemainingMs } from "../utils/testProgress";
import { Page, PageHeader, Card, Button, IconTile, Badge, EmptyState, ErrorState, PageLoader, SectionTitle } from "../components/ui";
import { translate, useI18n } from "../i18n";

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const h = translate("tests.hours", { h: hours });
  const m = translate("tests.minutes", { m: mins });
  return hours > 0 ? `${h}${mins ? ` ${m}` : ""}` : m;
}

function sessionMeta(session) {
  const sections = session.sections || [];
  const totalMinutes = sections.reduce((sum, sec) => sum + (sec.durationMin || 0) * 2, 0);
  const totalQuestions = sections.reduce((sum, sec) => sum + (sec.questionCount || 0), 0);
  const parts = sections.map((sec) => ({
    key: sec.id || sec.type,
    math: (sec.type || sec.id) === "math",
    title: sec.title || ((sec.type || sec.id) === "math" ? "Math" : "Reading & Writing"),
    questions: sec.questionCount || 0,
    minutes: (sec.durationMin || 0) * 2,
  }));
  return { totalMinutes, totalQuestions, parts };
}

const BUILTIN_PARTS = [
  { key: "rw", math: false, title: "Reading & Writing", questions: 54, minutes: 64 },
  { key: "math", math: true, title: "Math", questions: 44, minutes: 70 },
];

export default function TestSelect() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [lockRemaining, setLockRemaining] = useState({});
  // null — yuklanmoqda; xato bo'lsa "test yo'q" emas, xato ko'rsatiladi.
  const [openSessions, setOpenSessions] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    // Faqat "doimiy ochiq" va yopilmagan testlar (admin uchun server hammasini
    // qaytaradi — shu yerda filtrlaymiz).
    let cancelled = false;
    setLoadError(false);
    api
      .get("/sessions")
      .then(
        (list) =>
          !cancelled && setOpenSessions(list.filter((s) => s.accessType === "open" && s.status !== "closed"))
      )
      .catch(() => {
        if (cancelled) return;
        setOpenSessions([]);
        setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!user) return;
    const compute = () => {
      const next = {};
      testsCatalog.forEach((t) => {
        const saved = loadLocalProgress(user.uid, t.id);
        if (saved && saved.reason === "paused") {
          const remaining = getCooldownRemainingMs(saved.pausedAt);
          if (remaining > 0) next[t.id] = remaining;
        }
      });
      (openSessions || []).forEach((s) => {
        const saved = loadLocalProgress(user.uid, `session:${s.id}`);
        if (saved && saved.reason === "paused") {
          const remaining = getCooldownRemainingMs(saved.pausedAt);
          if (remaining > 0) next[`session:${s.id}`] = remaining;
        }
      });
      setLockRemaining(next);
    };
    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [user, openSessions]);

  if (loading || !user || openSessions === null) return <PageLoader />;

  // Statik va admin tomonidan qo'shilgan "doimiy ochiq" testlar —
  // foydalanuvchi uchun ikkalasi ham "to'liq mock test", lekin alohida
  // guruhlarda ko'rsatiladi.
  const mocks = testsCatalog.map((t) => ({
    key: t.id,
    title: t.title,
    description: t.description,
    questions: t.questions,
    minutes: t.minutes,
    parts: BUILTIN_PARTS,
    isNew: t.isNew,
    go: () => navigate("/sat/test", { state: { testId: t.id } }),
    kind: "builtin",
  }));
  const open = openSessions.map((s) => {
    const meta = sessionMeta(s);
    return {
      key: `session:${s.id}`,
      title: s.title,
      questions: meta.totalQuestions,
      minutes: meta.totalMinutes,
      parts: meta.parts,
      go: () => navigate(`/session/${s.id}/test`),
      kind: "open",
    };
  });
  const total = mocks.length + open.length;

  const renderCard = (p, index) => {
    const lock = lockRemaining[p.key];
    return (
      <Card key={p.key} className="flex flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-[18px] font-bold tabular-nums ${
              lock ? "bg-ink/[0.06] text-ink-2" : "bg-accent/10 text-accent"
            }`}
            aria-hidden="true"
          >
            {lock ? <LuTimer size={22} /> : p.kind === "open" ? <LuGlobe size={22} /> : String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[20px] font-semibold leading-[25px] tracking-[-0.01em] text-ink">
                {p.title}
              </h3>
              {lock ? (
                <Badge tone="amber" icon={LuClock}>
                  {t("tests.paused")}
                </Badge>
              ) : p.isNew ? (
                <Badge tone="blue" icon={LuSparkles}>
                  {t("tests.isNew")}
                </Badge>
              ) : p.kind === "open" ? (
                <Badge tone="emerald">{t("tests.open")}</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-[15px] leading-[20px] text-ink-2">
              {p.questions > 0 ? t("tests.questionsTime", { n: p.questions, time: timeLabel(p.minutes) }) : "Reading & Writing + Math"}
              {p.description ? ` · ${p.description}` : ""}
            </p>
          </div>
        </div>

        {p.parts.length > 0 && (
          <div className="mt-5 divide-y divide-ink/[0.08] rounded-xl bg-fill/60 px-4">
            {p.parts.map((part) => (
              <div key={part.key} className="flex items-center gap-3 py-2.5">
                {part.math ? (
                  <LuCalculator size={16} className="shrink-0 text-ink-2" />
                ) : (
                  <LuBookOpenText size={16} className="shrink-0 text-ink-2" />
                )}
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{part.title}</span>
                <span className="shrink-0 text-[13px] text-ink-2 tabular-nums">
                  {part.questions > 0 && `${t("tests.modulesMeta", { n: part.questions })} · `}
                  {timeLabel(part.minutes)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-1 items-end">
          {lock ? (
            <div className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink/[0.04] px-3 text-center text-sm font-semibold text-ink-2">
              <LuClock size={15} className="shrink-0" />
              {t("tests.resumeIn", { time: formatRemaining(lock) })}
            </div>
          ) : (
            <Button className="w-full" onClick={p.go}>
              {t("tests.start")} <LuArrowRight size={17} />
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const steps = [
    { icon: LuBookOpenText, title: t("tests.stepRw"), meta: t("tests.stepRwMeta") },
    { icon: LuCoffee, title: t("tests.stepBreak"), meta: t("tests.stepBreakMeta") },
    { icon: LuCalculator, title: t("tests.stepMath"), meta: t("tests.stepMathMeta") },
  ];

  return (
    <Page>
      <PageHeader
        eyebrow={t("tests.eyebrow")}
        title={t("tests.title")}
        subtitle={t("tests.subtitle")}
        actions={
          total > 0 && (
            <Badge tone="blue" icon={LuNotebookPen}>
              {t("tests.count", { n: total })}
            </Badge>
          )
        }
      />

      {/* Test tuzilishi — bir marta, kartalarda takrorlanmaydi. */}
      <section aria-label={t("tests.howTitle")} className="mb-8">
        <SectionTitle>{t("tests.howTitle")}</SectionTitle>
        <Card className="p-4 sm:p-5">
          <ol className="grid gap-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink/[0.08]">
            {steps.map((st, i) => (
              <li key={st.title} className="flex items-center gap-3 sm:px-4 sm:first:pl-0 sm:last:pr-0">
                <IconTile icon={st.icon} tone={i === 1 ? "ink" : "blue"} />
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-[20px] text-ink">{st.title}</p>
                  <p className="text-[13px] leading-[18px] text-ink-2">{st.meta}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 border-t border-ink/[0.08] pt-3 text-[13px] leading-[18px] text-ink-2">
            <LuGitBranch size={15} className="mt-px shrink-0" />
            {t("tests.adaptiveNote")}
          </p>
        </Card>
      </section>

      {loadError && (
        <ErrorState
          className="mb-8"
          onRetry={() => {
            setOpenSessions(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      {total === 0 && !loadError ? (
        <EmptyState icon={LuLayers} title={t("tests.emptyTitle")} text={t("tests.emptyText")} />
      ) : (
        <div className="space-y-8">
          {mocks.length > 0 && (
            <section>
              <SectionTitle>{t("tests.sectionMocks")}</SectionTitle>
              <div className="grid gap-5 md:grid-cols-2">{mocks.map((p, i) => renderCard(p, i))}</div>
            </section>
          )}
          {open.length > 0 && (
            <section>
              <SectionTitle>{t("tests.sectionOpen")}</SectionTitle>
              <div className="grid gap-5 md:grid-cols-2">{open.map((p, i) => renderCard(p, i))}</div>
            </section>
          )}
        </div>
      )}
    </Page>
  );
}
