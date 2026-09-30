import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  LuNotebookPen,
  LuArrowRight,
  LuTimer,
  LuGlobe,
  LuListChecks,
  LuClock,
  LuLayers,
  LuBookOpenText,
  LuCalculator,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { testsCatalog } from "../data/testsCatalog";
import { loadLocalProgress, getCooldownRemainingMs } from "../utils/testProgress";
import { Page, PageHeader, Card, Button, IconTile, Badge, EmptyState, PageLoader } from "../components/ui";

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function sessionMeta(session) {
  const sections = session.sections || [];
  const totalMinutes = sections.reduce((sum, sec) => sum + (sec.durationMin || 0) * 2, 0);
  const totalQuestions = sections.reduce((sum, sec) => sum + (sec.module1?.length || 0) * 2, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeLabel = hours > 0 ? `${hours} soat${mins ? ` ${mins} daqiqa` : ""}` : `${mins} daqiqa`;
  return { totalMinutes, totalQuestions, timeLabel };
}

export default function TestSelect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [lockRemaining, setLockRemaining] = useState({});
  const [openSessions, setOpenSessions] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    // Yopilgan sessiyalar yuklanmaydi (ro'yxat vaqt o'tishi bilan cheksiz o'smasin).
    const q = query(
      collection(db, "testSessions"),
      where("accessType", "==", "open"),
      where("status", "in", ["scheduled", "active"]),
      limit(30)
    );
    const unsub = onSnapshot(
      q,
      (snap) =>
        setOpenSessions(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.status !== "closed")
        ),
      () => setOpenSessions([])
    );
    return unsub;
  }, []);

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
      openSessions.forEach((s) => {
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

  if (loading || !user) return <PageLoader />;

  // Statik va admin tomonidan qo'shilgan "doimiy ochiq" testlarni bitta
  // ro'yxatga birlashtiramiz — foydalanuvchi uchun ular bir xil toifa:
  // "to'liq mock testlar".
  const papers = [
    ...testsCatalog.map((t) => ({
      key: t.id,
      lockKey: t.id,
      title: t.title,
      description: t.description,
      go: () => navigate("/sat/test", { state: { testId: t.id } }),
      kind: "builtin",
    })),
    ...openSessions.map((s) => {
      const meta = sessionMeta(s);
      return {
        key: `session:${s.id}`,
        lockKey: `session:${s.id}`,
        title: s.title,
        description:
          meta.totalQuestions > 0
            ? `${meta.totalQuestions} ta savol · ${meta.timeLabel}`
            : "Reading&Writing + Math",
        go: () => navigate(`/session/${s.id}/test`),
        kind: "open",
      };
    }),
  ];

  return (
    <Page>
      <PageHeader
        eyebrow="Mock testlar"
        icon={LuListChecks}
        title="Qaysi testni topshirasiz?"
        subtitle="Har bir test to'liq, moslashuvchan (adaptiv) Reading & Writing va Math bo'limlaridan iborat. Boshlagach vaqt hisobi yuritiladi."
        actions={
          <>
            <Badge tone="blue" icon={LuNotebookPen}>
              {papers.length} ta test
            </Badge>
            {openSessions.length > 0 && (
              <Badge tone="emerald" icon={LuGlobe}>
                {openSessions.length} ta doimiy ochiq
              </Badge>
            )}
          </>
        }
      />

      {papers.length === 0 ? (
        <EmptyState
          icon={LuLayers}
          title="Hozircha mock test mavjud emas"
          text="Yangi to'liq mock testlar qo'shilishi bilan ular shu yerda paydo bo'ladi."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {papers.map((p) => {
            const locked = !!lockRemaining[p.lockKey];
            return (
              <Card key={p.key} className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <IconTile
                    icon={locked ? LuTimer : p.kind === "open" ? LuGlobe : LuNotebookPen}
                    tone={locked ? "ink" : "blue"}
                    size="lg"
                  />
                  {locked ? (
                    <Badge tone="amber" icon={LuClock}>
                      Pauzada
                    </Badge>
                  ) : p.kind === "open" ? (
                    <Badge tone="emerald">Ochiq</Badge>
                  ) : (
                    <Badge tone="blue">Bluebook formati</Badge>
                  )}
                </div>

                <h3 className="mt-5 font-display text-xl font-extrabold tracking-[-0.01em] text-[#12213D]">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#12213D]/50">{p.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F7FB] px-2.5 py-1.5 text-xs font-semibold text-[#12213D]/60">
                    <LuBookOpenText size={13} /> Reading &amp; Writing
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F7FB] px-2.5 py-1.5 text-xs font-semibold text-[#12213D]/60">
                    <LuCalculator size={13} /> Math
                  </span>
                </div>

                <div className="mt-6 flex flex-1 items-end">
                  {locked ? (
                    <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#12213D]/[0.04] px-3 text-center text-sm font-semibold text-[#12213D]/55">
                      <LuClock size={15} className="shrink-0" />
                      {formatRemaining(lockRemaining[p.lockKey])} dan keyin davom ettirish mumkin
                    </div>
                  ) : (
                    <Button className="w-full" onClick={p.go}>
                      Boshlash <LuArrowRight size={17} />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
