import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import QuestionEditor from "../../components/admin/QuestionEditor";
import AdaptiveBuilder from "../../components/admin/AdaptiveBuilder";
import FullTestImporter from "../../components/admin/FullTestImporter";
import { RW_DOMAINS, RW_PROMPT_TEMPLATES } from "../../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../../data/mathDomains";
import { LuArrowLeft, LuInfo, LuShieldCheck } from "react-icons/lu";
import { Page, PageHeader, Card, CardHeader, Button, Field, inputClass, PageLoader } from "../../components/ui";
import useUnsavedChangesWarning from "../../hooks/useUnsavedChangesWarning";

function toDateInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toTimeInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


export default function SessionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [accessType, setAccessType] = useState("code"); // "code" | "open"
  const [dateStr, setDateStr] = useState(() => toDateInputValue(new Date()));
  const [timeStr, setTimeStr] = useState(() => toTimeInputValue(new Date(Date.now() + 30 * 60000)));

  const [rwDuration, setRwDuration] = useState(32);
  const [mathDuration, setMathDuration] = useState(35);
  const [rwM1, setRwM1] = useState([]);
  const [rwM2E, setRwM2E] = useState([]);
  const [rwM2H, setRwM2H] = useState([]);
  const [rwM2Mix, setRwM2Mix] = useState([]);
  const [mathM1, setMathM1] = useState([]);
  const [mathM2E, setMathM2E] = useState([]);
  const [mathM2H, setMathM2H] = useState([]);
  const [mathM2Mix, setMathM2Mix] = useState([]);

  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sahifaning "saqlangan" holatini olib qo'yamiz, shu bilan taqqoslab
  // saqlanmagan o'zgarish bor-yo'qligini bilamiz.
  const savedSnapshotRef = useRef(null);
  const currentSnapshot = JSON.stringify({
    title,
    accessType,
    dateStr,
    timeStr,
    rwDuration,
    mathDuration,
    rwM1,
    rwM2E,
    rwM2H,
    rwM2Mix,
    mathM1,
    mathM2E,
    mathM2H,
    mathM2Mix,
  });
  useEffect(() => {
    if (!loadingExisting && savedSnapshotRef.current === null) {
      savedSnapshotRef.current = currentSnapshot;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingExisting, currentSnapshot]);

  const isDirty = savedSnapshotRef.current !== null && currentSnapshot !== savedSnapshotRef.current;
  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (!isEdit) return;
    // Admin uchun server to'liq savollarni (to'g'ri javoblar bilan) qaytaradi.
    Promise.all([api.get(`/sessions/${id}`), api.get(`/sessions/${id}/content`)])
      .catch(() => [null, null])
      .then(([s, content]) => {
      if (!s) {
        setError("Test topilmadi.");
        setLoadingExisting(false);
        return;
      }
      const contentSections = content?.sections || [];
      setTitle(s.title || "");
      setAccessType(s.accessType === "open" ? "open" : "code");
      const scheduled = new Date(s.scheduledAt || Date.now());
      setDateStr(toDateInputValue(scheduled));
      setTimeStr(toTimeInputValue(scheduled));
      const rw = contentSections.find((sec) => sec.id === "rw");
      const math = contentSections.find((sec) => sec.id === "math");
      const rwMeta = (s.sections || []).find((sec) => sec.id === "rw");
      const mathMeta = (s.sections || []).find((sec) => sec.id === "math");
      if (rw) {
        setRwDuration(rwMeta?.durationMin || 32);
        setRwM1(rw.module1 || []);
        setRwM2E(rw.module2Easy || []);
        setRwM2H(rw.module2Hard || []);
        setRwM2Mix(rw.module2Mixed || []);
      }
      if (math) {
        setMathDuration(mathMeta?.durationMin || 35);
        setMathM1(math.module1 || []);
        setMathM2E(math.module2Easy || []);
        setMathM2H(math.module2Hard || []);
        setMathM2Mix(math.module2Mixed || []);
      }
      setLoadingExisting(false);
    });
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Test nomini kiriting.");
      return;
    }
    if (accessType === "code" && (!dateStr || !timeStr)) {
      setError("Sana va vaqtni tanlang.");
      return;
    }
    if (rwM1.length === 0 && mathM1.length === 0) {
      setError("Kamida bitta bo'limga (Reading&Writing yoki Math) Module 1 savollari qo'shing.");
      return;
    }
    const unreviewed = [rwM1, rwM2E, rwM2H, rwM2Mix, mathM1, mathM2E, mathM2H, mathM2Mix]
      .flat()
      .filter((q) => q.aiGenerated && !q.aiReviewed).length;
    if (unreviewed > 0) {
      setError(`AI yaratgan ${unreviewed} ta savol hali tekshirilmagan. Modullarda "AI · tekshirish kerak" belgisini bosib, har birini tasdiqlang.`);
      return;
    }

    const scheduledAt = accessType === "open" ? null : new Date(`${dateStr}T${timeStr}`);
    const sections = [];
    if (rwM1.length > 0) {
      sections.push({
        id: "rw",
        title: "Reading and Writing",
        type: "rw",
        durationMin: Number(rwDuration) || 32,
        calculator: false,
        module1: rwM1,
        module2Easy: rwM2E,
        module2Hard: rwM2H,
        module2Mixed: rwM2Mix,
      });
    }
    if (mathM1.length > 0) {
      sections.push({
        id: "math",
        title: "Math",
        type: "math",
        durationMin: Number(mathDuration) || 35,
        calculator: true,
        module1: mathM1,
        module2Easy: mathM2E,
        module2Hard: mathM2H,
        module2Mixed: mathM2Mix,
      });
    }

    // XAVFSIZLIK: server savollarni (to'g'ri javoblar bilan) meta'dan ajratib
    // saqlaydi — ishtirokchilar ularni faqat test vaqti kelganda va
    // kalitlarsiz oladi, ball serverda hisoblanadi. Unikal kodni ham server yaratadi.
    const payload = {
      title: title.trim(),
      accessType,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
      sections,
    };

    setSaving(true);
    try {
      let sessionId = id;
      if (isEdit) {
        await api.put(`/sessions/${id}`, payload);
      } else {
        const created = await api.post("/sessions", payload);
        sessionId = created.id;
      }
      navigate(`/admin/sessions/${sessionId}/monitor`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) return <PageLoader />;

  const goBack = () => {
    if (isDirty && !window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqsangiz, ular yo'qoladi. Baribir chiqasizmi?")) return;
    navigate("/admin");
  };

  const accessOption = (value, title, text) => (
    <button
      type="button"
      onClick={() => setAccessType(value)}
      className={`rounded-xl border-2 px-4 py-3.5 text-left transition ${
        accessType === value
          ? "border-[#087fd1] bg-[#087fd1]/[0.04]"
          : "border-[#12213D]/10 hover:border-[#12213D]/25"
      }`}
    >
      <p className="text-sm font-semibold text-[#12213D]">{title}</p>
      <p className="mt-0.5 text-xs text-[#12213D]/50">{text}</p>
    </button>
  );

  const durationInput = (value, onChange) => (
    <label className="flex items-center gap-2 text-sm text-[#12213D]/50">
      Davomiyligi
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-20 rounded-lg border border-[#12213D]/12 px-2.5 text-sm text-[#12213D] outline-none transition focus:border-[#087fd1] focus:ring-4 focus:ring-[#087fd1]/10"
      />
      daqiqa
    </label>
  );

  return (
    <Page width="narrow">
      <button
        onClick={goBack}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#12213D]/50 transition hover:text-[#12213D]"
      >
        <LuArrowLeft size={16} /> Barcha testlar
      </button>

      <PageHeader
        eyebrow="Admin panel"
        icon={LuShieldCheck}
        title={isEdit ? "Testni tahrirlash" : "Yangi test tashkil qilish"}
        subtitle="Sana, vaqt va savollarni belgilang. Kirish kodi saqlagandan keyin avtomatik yaratiladi."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Asosiy ma'lumotlar" />
          <div className="space-y-5 p-5 sm:p-6">
            <Field label="Test nomi">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Avgust oyi sinov testi"
                className={inputClass}
              />
            </Field>

            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-[#12213D]/75">Kirish turi</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {accessOption("code", "Kod bilan, vaqti belgilangan", "6 xonali kod va belgilangan sana/vaqtda ochiladi")}
                {accessOption("open", "Doimiy ochiq", "Har doim ochiq, \"Testlar\" bo'limida hammaga ko'rinadi")}
              </div>
            </div>

            {accessType === "code" && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sana">
                  <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Vaqt">
                  <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className={inputClass} />
                </Field>
              </div>
            )}
          </div>
        </Card>

        <FullTestImporter
          hasQuestions={[rwM1, rwM2E, rwM2H, rwM2Mix, mathM1, mathM2E, mathM2H, mathM2Mix].some((m) => m.length > 0)}
          onApply={({ rw, math }) => {
            setRwM1(rw.module1);
            setRwM2E(rw.module2Easy);
            setRwM2H(rw.module2Hard);
            setRwM2Mix(rw.module2Mixed);
            setMathM1(math.module1);
            setMathM2E(math.module2Easy);
            setMathM2H(math.module2Hard);
            setMathM2Mix(math.module2Mixed);
          }}
        />

        <div className="flex items-start gap-3 rounded-2xl border border-[#087fd1]/15 bg-[#087fd1]/[0.04] p-4 text-sm leading-relaxed text-[#12213D]/70">
          <LuInfo size={18} className="mt-0.5 shrink-0 text-[#087fd1]" />
          <p>
            Har bir bo'lim uchun <strong>Module 1</strong> savollarini qo'shing (bu — barcha
            talabalar oladigan aralash qiyinlikdagi bazaviy modul). Agar shu bo'lim uchun{" "}
            <strong>Module 2 (Oson)</strong> va <strong>Module 2 (Qiyin)</strong> ikkalasini ham
            to'ldirsangiz, test haqiqiy moslashuvchan (adaptiv) bo'ladi: Module 1 natijasiga qarab
            talaba avtomatik oson yoki qiyin versiyaga yo'naltiriladi. Agar sizda faqat bitta,
            filial qilinmagan Module 2 to'plami bo'lsa (masalan real testdan olingan, qiyinligi
            aralash savollar) — ularni <strong>Module 2 — Aralash</strong> bo'limiga qo'shing;
            bunda barcha talabalar Module 1 natijasidan qat'iy nazar shu bitta to'plamni oladi.
            Hech qanday Module 2 qo'shilmasa, bo'lim faqat Module 1 asosida baholanadi.
          </p>
        </div>

        {/* Reading and Writing */}
        <Card>
          <CardHeader
            title="Reading and Writing"
            subtitle="Bo'lim 1"
            action={durationInput(rwDuration, setRwDuration)}
          />
          <div className="space-y-3 p-5 sm:p-6">
            <AdaptiveBuilder
              subject="rw"
              showPassage
              domainOptions={RW_DOMAINS}
              promptTemplates={RW_PROMPT_TEMPLATES}
              hasModules={rwM1.length + rwM2E.length + rwM2H.length > 0}
              onApply={({ module1, module2Easy, module2Hard }) => {
                setRwM1(module1);
                setRwM2E(module2Easy);
                setRwM2H(module2Hard);
                setRwM2Mix([]);
              }}
            />
            <QuestionEditor
              title="Module 1"
              questions={rwM1}
              onChange={setRwM1}
              showPassage
              domainOptions={RW_DOMAINS}
              promptTemplates={RW_PROMPT_TEMPLATES}
              bankSubject="rw"
            />
            <QuestionEditor
              title="Module 2 — Oson (ixtiyoriy)"
              questions={rwM2E}
              onChange={setRwM2E}
              showPassage
              domainOptions={RW_DOMAINS}
              promptTemplates={RW_PROMPT_TEMPLATES}
              bankSubject="rw"
            />
            <QuestionEditor
              title="Module 2 — Qiyin (ixtiyoriy)"
              questions={rwM2H}
              onChange={setRwM2H}
              showPassage
              domainOptions={RW_DOMAINS}
              promptTemplates={RW_PROMPT_TEMPLATES}
              bankSubject="rw"
            />
            <QuestionEditor
              title="Module 2 — Aralash / filial qilinmagan (ixtiyoriy)"
              questions={rwM2Mix}
              onChange={setRwM2Mix}
              showPassage
              domainOptions={RW_DOMAINS}
              promptTemplates={RW_PROMPT_TEMPLATES}
              bankSubject="rw"
            />
          </div>
        </Card>

        {/* Math */}
        <Card>
          <CardHeader title="Math" subtitle="Bo'lim 2" action={durationInput(mathDuration, setMathDuration)} />
          <div className="space-y-3 p-5 sm:p-6">
            <AdaptiveBuilder
              subject="math"
              domainOptions={MATH_DOMAINS}
              hasModules={mathM1.length + mathM2E.length + mathM2H.length > 0}
              onApply={({ module1, module2Easy, module2Hard }) => {
                setMathM1(module1);
                setMathM2E(module2Easy);
                setMathM2H(module2Hard);
                setMathM2Mix([]);
              }}
            />
            <QuestionEditor
              title="Module 1"
              questions={mathM1}
              onChange={setMathM1}
              domainOptions={MATH_DOMAINS}
              bankSubject="math"
            />
            <QuestionEditor
              title="Module 2 — Oson (ixtiyoriy)"
              questions={mathM2E}
              onChange={setMathM2E}
              domainOptions={MATH_DOMAINS}
              bankSubject="math"
            />
            <QuestionEditor
              title="Module 2 — Qiyin (ixtiyoriy)"
              questions={mathM2H}
              onChange={setMathM2H}
              domainOptions={MATH_DOMAINS}
              bankSubject="math"
            />
            <QuestionEditor
              title="Module 2 — Aralash / filial qilinmagan (ixtiyoriy)"
              questions={mathM2Mix}
              onChange={setMathM2Mix}
              domainOptions={MATH_DOMAINS}
              bankSubject="math"
            />
          </div>
        </Card>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Saqlash paneli — pastda yopishib turadi */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-[#12213D]/[0.07] bg-white/90 p-3 pl-5 shadow-[0_12px_32px_-12px_rgba(18,33,61,0.3)] backdrop-blur">
          <p className="text-sm text-[#12213D]/50">{isDirty ? "Saqlanmagan o'zgarishlar bor" : "Barcha o'zgarishlar saqlangan"}</p>
          <Button type="submit" disabled={saving}>
            {saving ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni saqlash" : "Testni yaratish"}
          </Button>
        </div>
      </form>
    </Page>
  );
}
