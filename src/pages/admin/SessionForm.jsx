import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import QuestionEditor from "../../components/admin/QuestionEditor";
import { RW_DOMAINS, RW_PROMPT_TEMPLATES } from "../../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../../data/mathDomains";
import { LuArrowLeft, LuInfo } from "react-icons/lu";
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
    Promise.all([
      api.get(`/sessions/${id}`),
      api.get(`/sessions/${id}/content`),
    ]).catch(() => [null, null]).then(([s, content]) => {
      if (!s) {
        setError("Test topilmadi.");
        setLoadingExisting(false);
        return;
      }
      const contentSections = content?.sections || [];
      setTitle(s.title || "");
      setAccessType(s.accessType === "open" ? "open" : "code");
      const scheduled = s.scheduledAt ? new Date(s.scheduledAt) : new Date();
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

    // XAVFSIZLIK: server savollarni (module1/2 massivlari, to'g'ri javoblar
    // bilan) meta'dan ajratib alohida saqlaydi — ularni faqat admin va
    // sessiyaga QO'SHILGAN ishtirokchilar oladi. Unikal kodni ham server yaratadi.
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

  if (loadingExisting) {
    return <div className="p-10 text-[#12213D]/40">Yuklanmoqda...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <button
        onClick={() => {
          if (isDirty && !window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqsangiz, ular yo'qoladi. Baribir chiqasizmi?")) return;
          navigate("/admin");
        }}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/50 hover:text-[#12213D] mb-6"
      >
        <LuArrowLeft size={16} /> Barcha testlar
      </button>

      <h1 className="text-2xl font-extrabold text-[#12213D] mb-1">
        {isEdit ? "Testni tahrirlash" : "Yangi test tashkil qilish"}
      </h1>
      <p className="text-sm text-[#12213D]/50 mb-8">
        Sana, vaqt va savollarni belgilang. Kirish kodi saqlagandan keyin avtomatik yaratiladi.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#12213D]/8 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#12213D]/50 mb-1.5">
              Test nomi
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Avgust oyi sinov testi"
              className="w-full rounded-xl border border-[#12213D]/15 px-4 py-2.5 text-sm outline-none focus:border-[#087fd1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#12213D]/50 mb-1.5">
              Kirish turi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccessType("code")}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  accessType === "code"
                    ? "border-[#087fd1] bg-[#087fd1]/5"
                    : "border-[#12213D]/15 hover:border-[#12213D]/30"
                }`}
              >
                <p className="font-semibold text-sm text-[#12213D]">Kod bilan, vaqti belgilangan</p>
                <p className="text-xs text-[#12213D]/50 mt-0.5">
                  6 xonali kod va belgilangan sana/vaqtda ochiladi
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccessType("open")}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  accessType === "open"
                    ? "border-[#087fd1] bg-[#087fd1]/5"
                    : "border-[#12213D]/15 hover:border-[#12213D]/30"
                }`}
              >
                <p className="font-semibold text-sm text-[#12213D]">Doimiy ochiq</p>
                <p className="text-xs text-[#12213D]/50 mt-0.5">
                  Har doim ochiq, "Testlar" bo'limida hammaga ko'rinadi
                </p>
              </button>
            </div>
          </div>

          {accessType === "code" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#12213D]/50 mb-1.5">
                  Sana
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full rounded-xl border border-[#12213D]/15 px-4 py-2.5 text-sm outline-none focus:border-[#087fd1]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#12213D]/50 mb-1.5">
                  Vaqt
                </label>
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full rounded-xl border border-[#12213D]/15 px-4 py-2.5 text-sm outline-none focus:border-[#087fd1]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2.5 bg-[#087fd1]/5 border border-[#087fd1]/15 rounded-xl p-4 text-sm text-[#12213D]/70">
          <LuInfo size={17} className="shrink-0 mt-0.5 text-[#087fd1]" />
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#12213D]">Reading and Writing</h2>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-[#12213D]/50">Davomiyligi (daqiqa):</label>
              <input
                type="number"
                min={1}
                value={rwDuration}
                onChange={(e) => setRwDuration(e.target.value)}
                className="w-20 rounded-lg border border-[#12213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#087fd1]"
              />
            </div>
          </div>
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

        {/* Math */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#12213D]">Math</h2>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-[#12213D]/50">Davomiyligi (daqiqa):</label>
              <input
                type="number"
                min={1}
                value={mathDuration}
                onChange={(e) => setMathDuration(e.target.value)}
                className="w-20 rounded-lg border border-[#12213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#087fd1]"
              />
            </div>
          </div>
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#087fd1] text-white font-semibold py-3.5 rounded-full hover:bg-[#066fb8] disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni saqlash" : "Testni yaratish"}
        </button>
      </form>
    </div>
  );
}
