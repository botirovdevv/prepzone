import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuHeadphones, LuBookOpen, LuPenLine, LuPlay, LuLock, LuClock, LuFileText } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { IELTS_TESTS, IELTS_SECTIONS } from "../../data/ielts";
import { loadLocalProgress, getCooldownRemainingMs } from "../../utils/testProgress";
import { Page, PageHeader, Card, Badge, Button } from "../../components/ui";

const SECTION_CARDS = [
  { key: "listening", icon: LuHeadphones, tone: "bg-[#e4002b]/10 text-[#e4002b]", time: "~30 daq", count: "4 part · 40 savol" },
  { key: "reading", icon: LuBookOpen, tone: "bg-[#087fd1]/10 text-[#087fd1]", time: "60 daq", count: "3 passage · 40 savol" },
  { key: "writing", icon: LuPenLine, tone: "bg-emerald-500/10 text-emerald-600", time: "60 daq", count: "Task 1 + Task 2" },
];

function lockMinutes(uid, testId, mode) {
  const saved = loadLocalProgress(uid, `ielts-${testId}-${mode}`);
  if (saved?.reason !== "paused") return 0;
  return Math.ceil(getCooldownRemainingMs(saved.pausedAt) / 60000);
}

export default function IeltsTests({ initialSection = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const start = (testId, mode) => navigate(`/ielts/test/${testId}?section=${mode}`);

  return (
    <Page>
      <PageHeader
        eyebrow="IELTS Academic"
        icon={LuFileText}
        title={initialSection ? `${IELTS_SECTIONS[initialSection].label} practice` : "IELTS mock testlar"}
        subtitle="IELTS on Computer interfeysidagi to'liq mock yoki alohida bo'limlar. Listening va Reading avtomatik tekshiriladi, Writing 4 ta rasmiy mezon bo'yicha taxminiy baholanadi."
      />

      <div className="space-y-6">
        {IELTS_TESTS.map((t) => {
          const fullLock = user ? lockMinutes(user.uid, t.id, "full") : 0;
          return (
            <Card key={t.id} className="overflow-hidden">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#e4002b] px-2 py-0.5 font-display text-[12px] font-black text-white">IELTS</span>
                    <Badge tone="ink">Academic</Badge>
                    <Badge tone="blue" icon={LuClock}>
                      ~2 soat 35 daq
                    </Badge>
                  </div>
                  <h2 className="mt-3 font-display text-[21px] font-extrabold text-[#12213D]">{t.title}</h2>
                  <p className="mt-1 text-sm text-[#12213D]/55">{t.description}</p>
                </div>
                {!initialSection &&
                  (fullLock > 0 ? (
                    <Badge tone="amber" icon={LuLock} className="self-start sm:self-center">
                      {fullLock} daqiqadan keyin davom etadi
                    </Badge>
                  ) : (
                    <Button size="lg" onClick={() => start(t.id, "full")} className="shrink-0">
                      <LuPlay size={17} /> Full mock
                    </Button>
                  ))}
              </div>

              <div className="grid gap-px border-t border-[#12213D]/[0.06] bg-[#12213D]/[0.06] sm:grid-cols-3">
                {SECTION_CARDS.filter((s) => !initialSection || s.key === initialSection).map((s) => {
                  const Icon = s.icon;
                  const lock = user ? lockMinutes(user.uid, t.id, s.key) : 0;
                  return (
                    <button
                      key={s.key}
                      disabled={lock > 0}
                      onClick={() => start(t.id, s.key)}
                      className="group flex items-center gap-3.5 bg-white p-5 text-left transition hover:bg-[#F6F7FB] disabled:opacity-60"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.tone}`}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#12213D]">{IELTS_SECTIONS[s.key].label}</p>
                        <p className="text-xs text-[#12213D]/45">
                          {lock > 0 ? `${lock} daqiqadan keyin` : `${s.time} · ${s.count}`}
                        </p>
                      </div>
                      <LuPlay size={15} className="text-[#12213D]/25 transition group-hover:text-[#087fd1]" />
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[#12213D]/40">
        Listening audiosi brauzer ovozi bilan o'qiladi — Chrome yoki Edge va quloqchin tavsiya etiladi. Speaking bo'limi hozircha mavjud emas.
      </p>
    </Page>
  );
}
