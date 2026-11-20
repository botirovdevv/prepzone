import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuArrowRight, LuCheck, LuInstagram, LuSend, LuUsers, LuEllipsis } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { LanguageSwitch, useI18n } from "../i18n";

const logo = "/Logo.png";

// ------------------------------------------------------------------
// Ro'yxatdan o'tgandan keyingi qisqa so'rovnoma (email va Google userlar
// ikkalasi ham shu yerga tushadi — AuthedApp.jsx dagi HomeDashboard):
//   1) Bizni qayerdan topdingiz?
//   2) Maqsad SAT ballingiz.
// ------------------------------------------------------------------

const SOURCES = [
  { id: "instagram", icon: LuInstagram },
  { id: "telegram", icon: LuSend },
  { id: "friends", icon: LuUsers },
  { id: "other", icon: LuEllipsis },
];

const TARGET = { min: 400, max: 1600, step: 10, def: 1400 };

function validTarget(v) {
  return Number.isFinite(v) && v >= TARGET.min && v <= TARGET.max && Number.isInteger(v / TARGET.step);
}

export default function ChooseExam() {
  const { user, saveOnboarding } = useAuth();
  const { t } = useI18n();
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
      setError(t("onboarding.saveError"));
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <img src={logo} alt="Prepzone" className="pz-logo h-8 w-auto" />
          <LanguageSwitch />
        </div>

        <p className="mt-10 text-[12px] font-bold uppercase tracking-[0.16em] text-accent">{t("onboarding.step", { n: step })}</p>
        <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>

        {step === 1 ? (
          <>
            <h1 className="mt-5 font-display text-[28px] font-extrabold tracking-[-0.02em] text-ink sm:text-[36px]">
              {name ? t("onboarding.sourceTitleNamed", { name }) : t("onboarding.sourceTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-ink/55">{t("onboarding.sourceText")}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {SOURCES.map(({ id, icon: Icon }) => {
                const label = t(`onboarding.sources.${id}`);
                const active = source === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSource(id)}
                    className={`flex items-center gap-3 rounded-2xl border bg-surface p-5 text-left transition hover:-translate-y-0.5 ${
                      active ? "border-accent ring-4 ring-accent/10" : "border-ink/[0.08]"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 font-display text-[17px] font-bold text-ink">{label}</span>
                    {active && <LuCheck size={18} className="text-accent" />}
                  </button>
                );
              })}
            </div>

            {source === "other" && (
              <input
                value={sourceOther}
                onChange={(e) => setSourceOther(e.target.value)}
                maxLength={60}
                placeholder={t("onboarding.otherPlaceholder")}
                className="mt-3 h-11 w-full rounded-xl border border-ink/12 bg-surface px-3.5 text-[15px] text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!source}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-bold text-white transition hover:bg-accent-press disabled:opacity-50"
              >
                {t("onboarding.next")} <LuArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-5 font-display text-[28px] font-extrabold tracking-[-0.02em] text-ink sm:text-[36px]">
              {t("onboarding.targetTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-ink/55">
              {t("onboarding.targetText")}
            </p>

            <div className="mt-8 max-w-md rounded-3xl border border-accent bg-surface p-6 ring-4 ring-accent/10">
              <span className="inline-block rounded-lg bg-accent px-2.5 py-1 font-display text-[14px] font-black tracking-wide text-white">
                SAT
              </span>
              <h2 className="mt-4 font-display text-[20px] font-extrabold text-ink">Digital SAT</h2>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink/75">
                  {t("onboarding.targetLabel", { min: TARGET.min, max: TARGET.max })}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={TARGET.min}
                  max={TARGET.max}
                  step={TARGET.step}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-surface px-3.5 text-[16px] font-bold tabular-nums text-ink outline-none transition focus:ring-4 ${
                    targetValid ? "border-ink/12 focus:border-accent focus:ring-accent/10" : "border-red-400 focus:ring-red-500/10"
                  }`}
                />
                {!targetValid && (
                  <span className="mt-1.5 block text-xs text-red-600">{t("onboarding.targetInvalid")}</span>
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
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink/60 hover:text-ink"
              >
                <LuArrowLeft size={16} /> {t("onboarding.back")}
              </button>
              <button
                type="button"
                disabled={!targetValid || saving}
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-bold text-white transition hover:bg-accent-press disabled:opacity-50"
              >
                {saving ? t("onboarding.saving") : t("onboarding.start")} <LuArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
