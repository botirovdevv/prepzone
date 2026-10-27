import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuArrowRight, LuCheck, LuInstagram, LuSend, LuUsers, LuEllipsis } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const logo = "/Logo.png";

// ------------------------------------------------------------------
// Ro'yxatdan o'tgandan keyingi qisqa so'rovnoma (email va Google userlar
// ikkalasi ham shu yerga tushadi — AuthedApp.jsx dagi HomeDashboard):
//   1) Bizni qayerdan topdingiz?
//   2) Maqsad SAT ballingiz.
// ------------------------------------------------------------------

const SOURCES = [
  { id: "instagram", label: "Instagram", icon: LuInstagram },
  { id: "telegram", label: "Telegram", icon: LuSend },
  { id: "friends", label: "Do'stlarim", icon: LuUsers },
  { id: "other", label: "Boshqa", icon: LuEllipsis },
];

const TARGET = { min: 400, max: 1600, step: 10, def: 1400 };

function validTarget(v) {
  return Number.isFinite(v) && v >= TARGET.min && v <= TARGET.max && Number.isInteger(v / TARGET.step);
}

export default function ChooseExam() {
  const { user, saveOnboarding } = useAuth();
  const savedTarget = user?.onboarding?.targets?.sat;
  const navigate = useNavigate();
  const name = user?.displayName || user?.email?.split("@")[0] || "";

  const [step, setStep] = useState(1);
  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [target, setTarget] = useState(() => String(savedTarget ?? TARGET.def));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const targetValid = validTarget(Number(target));

  const submit = async () => {
    if (!source || !targetValid) return;
    setError("");
    setSaving(true);
    try {
      await saveOnboarding({ source, sourceOther, targets: { sat: Number(target) } });
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
              Maqsad SAT ballingiz qancha?
            </h1>
            <p className="mt-2 text-[15px] text-[#12213D]/55">
              Bluebook formatidagi adaptiv mock testlar 400–1600 ball oralig'ida baholanadi. Maqsadingizni
              keyin Study Plan'da o'zgartirishingiz mumkin.
            </p>

            <div className="mt-8 max-w-md rounded-3xl border border-[#087fd1] bg-white p-6 ring-4 ring-[#087fd1]/10">
              <span className="inline-block rounded-lg bg-[#087fd1] px-2.5 py-1 font-display text-[14px] font-black tracking-wide text-white">
                SAT
              </span>
              <h2 className="mt-4 font-display text-[20px] font-extrabold text-[#12213D]">Digital SAT</h2>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-[13px] font-semibold text-[#12213D]/75">
                  Maqsad ball ({TARGET.min}–{TARGET.max})
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={TARGET.min}
                  max={TARGET.max}
                  step={TARGET.step}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[16px] font-bold tabular-nums text-[#12213D] outline-none transition focus:ring-4 ${
                    targetValid ? "border-[#12213D]/12 focus:border-[#087fd1] focus:ring-[#087fd1]/10" : "border-red-400 focus:ring-red-500/10"
                  }`}
                />
                {!targetValid && (
                  <span className="mt-1.5 block text-xs text-red-600">400–1600 oralig'ida, 10 ga karrali son kiriting.</span>
                )}
              </label>
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
                disabled={!targetValid || saving}
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
