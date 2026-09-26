import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { LuHeadphones, LuBookOpen, LuPenLine, LuAward, LuTriangleAlert, LuCheck, LuX, LuChevronDown } from "react-icons/lu";
import { Page, PageHeader, Card, CardHeader, Badge, Button, PageLoader, EmptyState } from "../../components/ui";
import QuestionGroup from "../../components/ielts/QuestionGroup";
import WritingChart from "../../components/ielts/WritingChart";
import { getIeltsTest } from "../../data/ielts";
import { scoreSection, formatBand } from "../../utils/ieltsScoring";
import { assessWriting, CRITERIA_LABELS } from "../../utils/ieltsWriting";
import { MODE_LABELS, formatResultDate } from "../../utils/ieltsResults";

const SECTION_META = {
  listening: { label: "Listening", icon: LuHeadphones, color: "text-[#e4002b] bg-[#e4002b]/10" },
  reading: { label: "Reading", icon: LuBookOpen, color: "text-[#087fd1] bg-[#087fd1]/10" },
  writing: { label: "Writing", icon: LuPenLine, color: "text-emerald-600 bg-emerald-500/10" },
};

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#12213D]/[0.08]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[#12213D]"
      >
        {title}
        <LuChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-[#12213D]/[0.08] px-4 py-4">{children}</div>}
    </div>
  );
}

function ObjectiveReview({ sectionKey, test, data }) {
  const parts = test[sectionKey].parts;
  const scored = useMemo(() => scoreSection(parts, data.answers || {}), [parts, data.answers]);
  const review = Object.fromEntries(scored.items.map((i) => [i.n, { correct: i.correct, expected: i.expected }]));

  return (
    <div className="space-y-6">
      {parts.map((part, pi) => {
        const items = scored.items.filter((i) => i.partIndex === pi);
        const right = items.filter((i) => i.correct).length;
        return (
          <Card key={part.id}>
            <CardHeader
              title={sectionKey === "reading" ? `${part.title} · ${part.passageTitle}` : part.title}
              subtitle={`${right} / ${items.length} to'g'ri`}
            />
            <div className="px-5 pb-5 pt-4 sm:px-6">
              {sectionKey === "listening" ? (
                <div className="mb-5">
                  <Collapsible title="Audio transkripti">
                    <div className="space-y-2 text-[14px] leading-relaxed text-[#12213D]/80">
                      {part.script.map((l, i) => (
                        <p key={i}>
                          <b className="text-[#12213D]">{l.speaker}:</b> {l.text}
                        </p>
                      ))}
                    </div>
                  </Collapsible>
                </div>
              ) : (
                <div className="mb-5">
                  <Collapsible title="Passage matni">
                    <div className="space-y-3 text-[14px] leading-relaxed text-[#12213D]/80">
                      {part.paragraphs.map((p) => (
                        <p key={p.label}>
                          <b className="text-[#12213D]">{p.label}</b> {p.text}
                        </p>
                      ))}
                    </div>
                  </Collapsible>
                </div>
              )}
              {part.groups.map((g, gi) => (
                <QuestionGroup key={gi} group={g} answers={data.answers || {}} review={review} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function WritingReview({ test, data }) {
  const assessment = useMemo(
    () => assessWriting(test.writing, { task1: data.task1Text || "", task2: data.task2Text || "" }),
    [test, data]
  );
  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-3 border-amber-200 bg-amber-50/60 p-4 text-[13px] leading-relaxed text-amber-900">
        <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
        <p>
          Writing avtomatik, <b>taxminiy</b> baholangan: tizim so'z soni, tuzilish, bog'lovchilar, lug'at xilma-xilligi va gap
          tuzilishini IELTS mezonlari asosida o'lchaydi, lekin g'oyalar sifatini examiner kabi to'liq tushunmaydi. Haqiqiy
          natija ±1 band farq qilishi mumkin.
        </p>
      </Card>
      {["task1", "task2"].map((t, i) => {
        const res = assessment[t];
        const meta = test.writing[t];
        const text = data[`${t}Text`] || "";
        return (
          <Card key={t}>
            <CardHeader
              title={`Task ${i + 1}`}
              subtitle={`${res.wordCount} so'z (kamida ${meta.minWords})`}
              action={
                <span className="font-display text-[26px] font-extrabold tabular-nums text-[#12213D]">{formatBand(res.band)}</span>
              }
            />
            <div className="grid gap-5 px-5 pb-6 pt-4 sm:px-6 lg:grid-cols-2">
              <div className="space-y-4">
                {["ta", "cc", "lr", "gra"].map((c) => {
                  const label = typeof CRITERIA_LABELS[c] === "string" ? CRITERIA_LABELS[c] : CRITERIA_LABELS[c][t];
                  return (
                    <div key={c}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13px] font-bold text-[#12213D]">{label}</p>
                        <span className="font-display text-[17px] font-extrabold tabular-nums text-[#087fd1]">
                          {formatBand(res.criteria[c])}
                        </span>
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {res.notes[c].map((n, k) => (
                          <li key={k} className="flex gap-2 text-[13px] leading-relaxed text-[#12213D]/70">
                            {n.ok ? (
                              <LuCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                            ) : (
                              <LuX size={14} className="mt-0.5 shrink-0 text-red-500" />
                            )}
                            {n.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <Collapsible title="Topshiriq">
                  <p className="whitespace-pre-line text-[14px] leading-relaxed text-[#12213D]/80">{meta.prompt}</p>
                  {meta.chart && (
                    <div className="mt-3">
                      <WritingChart chart={meta.chart} />
                    </div>
                  )}
                </Collapsible>
                <div className="rounded-xl bg-[#F6F7FB] p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#12213D]/45">Sizning javobingiz</p>
                  <p className="whitespace-pre-line text-[14px] leading-relaxed text-[#12213D]/85">
                    {text || <span className="italic text-[#12213D]/40">Javob yozilmagan</span>}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function IeltsResults() {
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [tab, setTab] = useState(null);

  useEffect(() => {
    if (result || id === "local") {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "ieltsResults", id))
      .then((snap) => setResult(snap.exists() ? { id: snap.id, ...snap.data() } : null))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [id, result]);

  if (loading) return <PageLoader />;
  const test = result && getIeltsTest(result.testId);
  if (!result || !test) {
    return (
      <Page width="narrow">
        <EmptyState
          icon={LuAward}
          title="Natija topilmadi"
          text="Bu natija o'chirilgan yoki sizga tegishli emas."
          action={<Button to="/ielts/history">Barcha natijalar</Button>}
        />
      </Page>
    );
  }

  const sections = ["listening", "reading", "writing"].filter((s) => result[s]);
  const active = tab && result[tab] ? tab : sections[0];

  return (
    <Page>
      <PageHeader
        eyebrow={`IELTS Academic · ${MODE_LABELS[result.mode] || ""}`}
        icon={LuAward}
        title={result.testTitle || test.title}
        subtitle={formatResultDate(result.createdAt, true)}
        actions={
          <>
            <Button variant="outline" size="sm" to="/ielts/history">
              Barcha natijalar
            </Button>
            <Button size="sm" to="/ielts/tests">
              Yana test yechish
            </Button>
          </>
        }
      />

      {location.state?.saveError && (
        <Card className="mb-6 flex items-center gap-3 border-amber-300 bg-amber-50 p-4 text-[13px] font-semibold text-amber-800">
          <LuTriangleAlert size={18} className="shrink-0" /> Natija serverga saqlanmadi (internet yoki ruxsat muammosi) — faqat shu
          sahifada ko'rinadi.
        </Card>
      )}
      {result.terminated && (
        <Card className="mb-6 flex items-center gap-3 border-red-200 bg-red-50 p-4 text-[13px] font-semibold text-red-700">
          <LuTriangleAlert size={18} className="shrink-0" /> Test xavfsizlik qoidasi buzilgani uchun muddatidan oldin yakunlangan.
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#12213D] p-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#e4002b]/30 blur-2xl" />
          <p className="relative text-[12px] font-semibold uppercase tracking-wide text-white/55">
            {sections.length > 1 ? "Overall band" : `${SECTION_META[sections[0]].label} band`}
          </p>
          <p className="relative mt-1 font-display text-[44px] font-black leading-none tabular-nums">{formatBand(result.overall)}</p>
          {sections.length > 1 && <p className="relative mt-2 text-[11px] text-white/45">Speakingsiz, taxminiy</p>}
        </div>
        {sections.map((s) => {
          const M = SECTION_META[s];
          const Icon = M.icon;
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`rounded-2xl border bg-white p-5 text-left transition ${
                active === s ? "border-[#087fd1] ring-4 ring-[#087fd1]/10" : "border-[#12213D]/[0.07] hover:border-[#12213D]/15"
              }`}
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${M.color}`}>
                <Icon size={17} />
              </span>
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">{M.label}</p>
              <p className="font-display text-[28px] font-extrabold leading-tight tabular-nums text-[#12213D]">
                {formatBand(result[s].band)}
              </p>
              <p className="text-xs text-[#12213D]/45">
                {s === "writing" ? `Task 1: ${formatBand(result.writing.task1?.band)} · Task 2: ${formatBand(result.writing.task2?.band)}` : `${result[s].raw} / 40 to'g'ri`}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-display text-[19px] font-bold text-[#12213D]">{SECTION_META[active].label} tahlili</h2>
          {active !== "writing" && <Badge tone="ink">to'g'ri javoblar ko'rsatilgan</Badge>}
        </div>
        {active === "writing" ? (
          <WritingReview test={test} data={result.writing} />
        ) : (
          <ObjectiveReview sectionKey={active} test={test} data={result[active]} />
        )}
      </div>
    </Page>
  );
}
