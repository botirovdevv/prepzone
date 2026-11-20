import { useMemo, useRef, useState } from "react";
import {
  LuLibraryBig,
  LuMonitorSmartphone,
  LuFileText,
  LuArrowUpRight,
  LuSearch,
  LuSun,
  LuChartLine,
  LuClipboardCheck,
  LuCompass,
  LuGraduationCap,
  LuBookOpen,
  LuUsers,
  LuMap,
  LuLightbulb,
  LuShieldCheck,
  LuInfo,
  LuSwords,
  LuNotebookPen,
} from "react-icons/lu";
import { Page, PageHeader, Card, IconTile, SegmentedControl, ListGroup, ListRow, inputClass } from "../components/ui";
import { useI18n } from "../i18n";
import {
  BLUEBOOK,
  DIFFICULTIES,
  PAPER_TESTS,
  PAPER_TESTS_PAGE,
  QUESTION_BANK_URL,
  RESOURCES,
  SKILL_MAP,
} from "../data/officialResources";

// ------------------------------------------------------------------
// Rasmiy SAT manbalari: College Board va hamkorlarining bepul manbalariga
// havolalar (kontent ko'chirilmaydi). Question Bank uchun — mavzu/qiyinlik
// tanlagich: tanlangan filtrni Question Bank'da qanday belgilashni ko'rsatadi.
// Ma'lumotlar: data/officialResources.js.
// ------------------------------------------------------------------

const ICONS = {
  qotd: LuSun,
  myPractice: LuChartLine,
  readiness: LuClipboardCheck,
  studyPlan: LuCompass,
  khan: LuGraduationCap,
  khanGuide: LuBookOpen,
  schoolhouse: LuUsers,
  domains: LuMap,
  qbTips: LuLightbulb,
  confidence: LuShieldCheck,
  myPractice101: LuInfo,
  studentGuide: LuFileText,
};

const ROW_TONES = {
  blue: "bg-accent text-white",
  green: "bg-success text-white",
  orange: "bg-warning text-white",
  red: "bg-danger text-white",
  purple: "bg-purple text-white",
  gray: "bg-ink-3 text-white",
};

const ext = { target: "_blank", rel: "noopener noreferrer" };

function ExternalRow({ href, icon: Icon, tone, title, subtitle }) {
  return (
    <a href={href} {...ext} className="group/row flex w-full items-center gap-3 pl-4 text-left transition-colors hover:bg-ink/[0.03] active:bg-ink/[0.06]">
      <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] ${ROW_TONES[tone]}`}>
        <Icon size={17} />
      </span>
      <span className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 border-b border-ink/[0.08] py-3 pr-4 group-last/row:border-b-0">
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] leading-[21px] text-ink">{title}</span>
          <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-2">{subtitle}</span>
        </span>
        <LuArrowUpRight size={17} className="shrink-0 text-ink-3" aria-hidden="true" />
      </span>
    </a>
  );
}

function SectionHeading({ title, text }) {
  return (
    <div className="mb-4 mt-12">
      <h2 className="font-display text-[22px] font-bold leading-[28px] tracking-[-0.01em] text-ink">{title}</h2>
      {text && <p className="mt-1 text-[15px] leading-[20px] text-ink-2">{text}</p>}
    </div>
  );
}

function LinkPill({ href, children }) {
  return (
    <a
      href={href}
      {...ext}
      className="inline-flex h-8 items-center gap-1 rounded-full bg-fill px-3 text-[13px] font-medium text-ink transition-colors hover:bg-ink/10"
    >
      {children}
      <LuArrowUpRight size={13} className="text-ink-3" />
    </a>
  );
}

export default function Resources() {
  const { t } = useI18n();
  const builderRef = useRef(null);
  const [section, setSection] = useState("math");
  const [domainId, setDomainId] = useState(SKILL_MAP[1].domains[0].id);
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const sec = SKILL_MAP.find((s) => s.section === section);
  const domain = sec.domains.find((d) => d.id === domainId) || sec.domains[0];

  const changeSection = (next) => {
    setSection(next);
    setDomainId(SKILL_MAP.find((s) => s.section === next).domains[0].id);
    setSkill("");
  };

  // Xaritadan ko'nikma tanlansa — tanlagichga o'tkazamiz.
  const pickSkill = (s, d, k) => {
    setSection(s);
    setDomainId(d);
    setSkill(k);
    builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const steps = useMemo(
    () => [
      t("resources.qbStep1"),
      t("resources.qbStep2", { section: sec.name }),
      t("resources.qbStep3", { domain: domain.name }),
      t("resources.qbStep4", { skill: skill || t("resources.qbAllSkills") }),
      t("resources.qbStep5", { difficulty: difficulty === "all" ? t("resources.qbAllLevels") : difficulty }),
    ],
    [t, sec, domain, skill, difficulty]
  );

  const groups = ["daily", "learn", "guides"];

  return (
    <Page width="narrow">
      <PageHeader eyebrow={t("resources.eyebrow")} title={t("resources.title")} subtitle={t("resources.subtitle")} />

      {/* ---------- Practice testlar ---------- */}
      <SectionHeading title={t("resources.testsTitle")} text={t("resources.testsText")} />
      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <IconTile icon={LuMonitorSmartphone} tone="solid" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[17px] font-semibold leading-[22px] text-ink">{t("resources.bluebookTitle")}</h3>
            <p className="mt-1 text-[15px] leading-[20px] text-ink-2">{t("resources.bluebookText")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={BLUEBOOK.app}
                {...ext}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-medium text-white transition-colors hover:bg-accent-press"
              >
                {t("resources.bluebookApp")} <LuArrowUpRight size={16} />
              </a>
              <a
                href={BLUEBOOK.tests}
                {...ext}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink/[0.06] px-5 text-[15px] font-medium text-ink transition-colors hover:bg-ink/10"
              >
                {t("resources.bluebookTests")} <LuArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <IconTile icon={LuFileText} tone="red" />
          <div className="min-w-0">
            <h3 className="font-display text-[17px] font-semibold leading-[22px] text-ink">{t("resources.paperTitle")}</h3>
            <p className="mt-1 text-[15px] leading-[20px] text-ink-2">{t("resources.paperText")}</p>
          </div>
        </div>
        <ul className="divide-y divide-ink/[0.08] border-t border-ink/[0.08]">
          {PAPER_TESTS.map((p) => (
            <li key={p.n} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="text-[15px] font-medium text-ink">{t("resources.paperName", { n: p.n })}</span>
              <span className="flex flex-wrap gap-2">
                <LinkPill href={p.test}>{t("resources.paperTest")}</LinkPill>
                <LinkPill href={p.answers}>{t("resources.paperAnswers")}</LinkPill>
                <LinkPill href={p.scoring}>{t("resources.paperScoring")}</LinkPill>
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink/[0.08] px-5 py-3 sm:px-6">
          <a href={PAPER_TESTS_PAGE} {...ext} className="inline-flex items-center gap-1 text-[15px] font-medium text-accent">
            {t("resources.paperAll")} <LuArrowUpRight size={15} />
          </a>
        </div>
      </Card>

      {/* ---------- Question Bank: mavzu va qiyinlik ---------- */}
      <div ref={builderRef} className="scroll-mt-20">
        <SectionHeading title={t("resources.qbTitle")} text={t("resources.qbText")} />
      </div>
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-2">{t("resources.qbSection")}</p>
            <SegmentedControl
              className="w-full"
              value={section}
              onChange={changeSection}
              label={t("resources.qbSection")}
              options={[
                { value: "rw", label: "Reading & Writing" },
                { value: "math", label: "Math" },
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-2">{t("resources.qbDifficulty")}</p>
            <SegmentedControl
              className="w-full"
              value={difficulty}
              onChange={setDifficulty}
              label={t("resources.qbDifficulty")}
              options={[{ value: "all", label: t("resources.qbAllLevels") }, ...DIFFICULTIES.map((d) => ({ value: d, label: d }))]}
            />
          </div>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-ink-2">{t("resources.qbDomain")}</span>
            <select
              value={domain.id}
              onChange={(e) => {
                setDomainId(e.target.value);
                setSkill("");
              }}
              className={inputClass}
            >
              {sec.domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-ink-2">{t("resources.qbSkill")}</span>
            <select value={skill} onChange={(e) => setSkill(e.target.value)} className={inputClass}>
              <option value="">{t("resources.qbAllSkills")}</option>
              {domain.skills.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-2xl bg-fill/70 p-4 sm:p-5">
          <p className="text-[13px] font-semibold text-ink-2">{t("resources.qbSteps")}</p>
          <ol className="mt-3 space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <a
            href={QUESTION_BANK_URL}
            {...ext}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-medium text-white transition-colors hover:bg-accent-press"
          >
            <LuSearch size={16} /> {t("resources.qbOpen")}
          </a>
          <a
            href={sec.guide}
            {...ext}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink/[0.06] px-5 text-[15px] font-medium text-ink transition-colors hover:bg-ink/10"
          >
            {t("resources.qbGuide")} <LuArrowUpRight size={16} />
          </a>
        </div>
        <p className="mt-3 text-[13px] text-ink-2">{t("resources.qbLogin")}</p>
      </Card>

      {/* ---------- Mavzular xaritasi ---------- */}
      <SectionHeading title={t("resources.mapTitle")} text={t("resources.mapText")} />
      {SKILL_MAP.map((s) => (
        <div key={s.section} className="mb-6">
          <p className="mb-3 text-[13px] font-semibold text-ink-2">{s.name}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {s.domains.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-[17px] font-semibold leading-[22px] text-ink">{d.name}</h3>
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-ink-2">{t("resources.share", { n: d.share })}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {d.skills.map((k) => (
                    <li key={k}>
                      <button
                        type="button"
                        onClick={() => pickSkill(s.section, d.id, k)}
                        className="w-full rounded-lg px-2 py-1.5 text-left text-[15px] leading-[20px] text-ink transition-colors hover:bg-fill"
                      >
                        {k}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-1.5 px-2">
                  {DIFFICULTIES.map((lvl, i) => (
                    <span
                      key={lvl}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        i === 0 ? "bg-success/10 text-success" : i === 1 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                      }`}
                    >
                      {lvl}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* ---------- Boshqa rasmiy manbalar ---------- */}
      {groups.map((g) => (
        <div key={g}>
          <SectionHeading title={t(`resources.${g}Title`)} />
          <ListGroup>
            {RESOURCES.filter((r) => r.group === g).map((r) => (
              <ExternalRow
                key={r.id}
                href={r.url}
                icon={ICONS[r.id]}
                tone={r.tone}
                title={t(`resources.items.${r.id}.title`)}
                subtitle={t(`resources.items.${r.id}.text`)}
              />
            ))}
          </ListGroup>
        </div>
      ))}

      {/* ---------- PrepZone'da ---------- */}
      <SectionHeading title={t("resources.inSiteTitle")} text={t("resources.inSiteText")} />
      <ListGroup>
        <ListRow to="/sat/select" icon={LuFileText} iconTone="blue" title={t("nav.practiceTests")} />
        <ListRow to="/daily" icon={LuSun} iconTone="orange" title={t("nav.daily")} />
        <ListRow to="/mistakes" icon={LuNotebookPen} iconTone="red" title={t("nav.mistakes")} />
        <ListRow to="/duel" icon={LuSwords} iconTone="purple" title="SAT Duel" />
      </ListGroup>

      <p className="mt-10 flex items-start gap-2 text-[13px] leading-[18px] text-ink-2">
        <LuLibraryBig size={16} className="mt-px shrink-0" /> {t("resources.disclaimer")}
      </p>
    </Page>
  );
}
