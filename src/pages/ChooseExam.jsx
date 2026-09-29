import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuArrowRight, LuCheck, LuInstagram, LuSend, LuUsers, LuEllipsis } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useExam } from "../context/ExamContext";

const logo = "/Logo.png";

// ------------------------------------------------------------------
// Ro'yxatdan o'tgandan keyingi qisqa so'rovnoma (email va Google userlar
// ikkalasi ham shu yerga tushadi — App.jsx dagi ExamDashboard):
//   1) Bizni qayerdan topdingiz?
//   2) Qaysi testga tayyorlanyapsiz? + har biri uchun maqsad ball.
// ------------------------------------------------------------------

const SOURCES = [
  { id: "instagram", label: "Instagram", icon: LuInstagram },
  { id: "telegram", label: "Telegram", icon: LuSend },
  { id: "friends", label: "Do'stlarim", icon: LuUsers },
  { id: "other", label: "Boshqa", icon: LuEllipsis },
];

const OPTIONS = [
  {
    id: "sat",
    badge: "SAT",
    badgeClass: "bg-[#087fd1] text-white",
    title: "Digital SAT",
    text: "Bluebook formatidagi adaptiv mock testlar, 400–1600 ball.",
    target: { label: "Maqsad ball", min: 400, max: 1600, step: 10, def: 1400 },
  },
  {
    id: "ielts",
    badge: "IELTS",
    badgeClass: "bg-[#e4002b] text-white",
    title: "IELTS Academic",
    text: "Listening, Reading va Writing mock testlari, band 0–9.",
    target: { label: "Maqsad band", min: 0, max: 9, step: 0.5, def: 7 },
  },
];

function validTarget(id, v) {
  const t = OPTIONS.find((o) => o.id === id).target;
  return Number.isFinite(v) && v >= t.min && v <= t.max && Number.isInteger(v / t.step);
}

export default function ChooseExam() {
  const { user } = useAuth();
  const { targets: savedTargets, saveOnboarding } = useExam();
  const navigate = useNavigate();
  const name = user?.displayName || user?.email?.split("@")[0] || "";

  const [step, setStep] = useState(1);
  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [exams, setExams] = useState(() => OPTIONS.map((o) => o.id).filter((id) => savedTargets?.[id] != null));
  const [targets, setTargets] = useState(() =>
    Object.fromEntries(OPTIONS.map((o) => [o.id, String(savedTargets?.[o.id] ?? o.target.def)]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleExam = (id) => setExams((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const targetsValid = exams.length > 0 && exams.every((id) => validTarget(id, Number(targets[id])));

  const submit = async () => {
    if (!source || !targetsValid) return;
    setError("");
    setSaving(true);
    try {
      await saveOnboarding({
        source,
        sourceOther,
        exams: OPTIONS.map((o) => o.id).filter((id) => exams.includes(id)),
        targets: Object.fromEntries(exams.map((id) => [id, Number(targets[id])])),
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("So'rovnomani saqlashda xatolik:", err);
      setError("Saqlab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <img src={logo} alt="Prepzone" className="h-8 w-auto" />

        <p className="mt-10 text-[12px] font-bold uppercase tracking-[0.16em] text-[#087fd1]">{step}/2-savol</p>
        <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-[#12213D]/10">
          <div className="h-full rounded-full bg-[#087fd1] transition-all" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>

        {step === 1 ? (
          <>
            <h1 className="mt-5 font-display text-[28px] font-extrabold tracking-[-0.02em] text-[#12213D] sm:text-[36px]">
              {name ? `${name}, bizni qayerdan topdingiz?` : "Bizni qayerdan topdingiz?"}
            </h1>
            <p className="mt-2 text-[15px] text-[#12213D]/55">Bu bizga ko'proq o'quvchilarga yetib borishga yordam beradi.</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {SOURCES.map(({ id, label, icon: Icon }) => {
                const active = source === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSource(id)}
                    className={`flex items-center gap-3 rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 ${
                      active ? "border-[#087fd1] ring-4 ring-[#087fd1]/10" : "border-[#12213D]/[0.08]"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087fd1]/10 text-[#087fd1]">
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 font-display text-[17px] font-bold text-[#12213D]">{label}</span>
                    {active && <LuCheck size={18} className="text-[#087fd1]" />}
                  </button>
                );
              })}
            </div>

            {source === "other" && (
              <input
                value={sourceOther}
                onChange={(e) => setSourceOther(e.target.value)}
                maxLength={60}
                placeholder="Qayerdan? (ixtiyoriy)"
                className="mt-3 h-11 w-full rounded-xl border border-[#12213D]/12 bg-white px-3.5 text-[15px] text-[#12213D] outline-none transition focus:border-[#087fd1] focus:ring-4 focus:ring-[#087fd1]/10"
              />
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!source}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-full bg-[#087fd1] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#066fb8] disabled:opacity-50"
              >
                Keyingisi <LuArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-5 font-display text-[28px] font-extrabold tracking-[-0.02em] text-[#12213D] sm:text-[36px]">
              Qaysi testga tayyorlanyapsiz?
            </h1>
            <p className="mt-2 text-[15px] text-[#12213D]/55">
              Bittasini yoki ikkalasini tanlang va olmoqchi bo'lgan ballingizni yozing.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {OPTIONS.map((o) => {
                const active = exams.includes(o.id);
                const value = targets[o.id];
                const bad = active && !validTarget(o.id, Number(value));
                return (
                  <div
                    key={o.id}
                    className={`rounded-3xl border bg-white p-6 transition ${
                      active ? "border-[#087fd1] ring-4 ring-[#087fd1]/10" : "border-[#12213D]/[0.08]"
                    }`}
                  >
                    <button type="button" onClick={() => toggleExam(o.id)} className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <span className={`inline-block rounded-lg px-2.5 py-1 font-display text-[14px] font-black tracking-wide ${o.badgeClass}`}>
                          {o.badge}
                        </span>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                            active ? "border-[#087fd1] bg-[#087fd1] text-white" : "border-[#12213D]/20"
                          }`}
                        >
                          {active && <LuCheck size={15} />}
                        </span>
                      </div>
                      <h2 className="mt-4 font-display text-[20px] font-extrabold text-[#12213D]">{o.title}</h2>
                      <p className="mt-1 text-[14px] leading-relaxed text-[#12213D]/55">{o.text}</p>
                    </button>

                    {active && (
                      <label className="mt-5 block">
                        <span className="mb-1.5 block text-[13px] font-semibold text-[#12213D]/75">
                          {o.target.label} ({o.target.min}–{o.target.max})
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={o.target.min}
                          max={o.target.max}
                          step={o.target.step}
                          value={value}
                          onChange={(e) => setTargets((t) => ({ ...t, [o.id]: e.target.value }))}
                          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[16px] font-bold tabular-nums text-[#12213D] outline-none transition focus:ring-4 ${
                            bad ? "border-red-400 focus:ring-red-500/10" : "border-[#12213D]/12 focus:border-[#087fd1] focus:ring-[#087fd1]/10"
                          }`}
                        />
                        {bad && (
                          <span className="mt-1.5 block text-xs text-red-600">
                            {o.id === "sat" ? "400–1600 oralig'ida, 10 ga karrali son kiriting." : "0–9 oralig'ida, 0.5 qadam bilan kiriting."}
                          </span>
                        )}
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#12213D]/60 hover:text-[#12213D]"
              >
                <LuArrowLeft size={16} /> Orqaga
              </button>
              <button
                type="button"
                disabled={!targetsValid || saving}
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-full bg-[#087fd1] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#066fb8] disabled:opacity-50"
              >
                {saving ? "Saqlanmoqda..." : "Boshlash"} <LuArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
