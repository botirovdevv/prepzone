import { useState } from "react";
import { LuSparkles, LuLoader, LuLightbulb, LuTriangleAlert } from "react-icons/lu";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";

// ------------------------------------------------------------------
// "AI tushuntirish" tugmasi: savolni serverga (POST /api/tutor/explain)
// yuboradi va bosqichma-bosqich yechimni ko'rsatadi. Kunlik limit serverda.
// ------------------------------------------------------------------

const pickQuestion = (q) => ({
  passage: q.passage || "",
  prompt: q.prompt || "",
  choices: (q.choices || []).map((c) => ({ label: c.label, text: c.text })),
  correctAnswer: q.type === "spr" ? (q.answers || []).join(" / ") : q.correctAnswer || "",
});

export default function AiExplain({ question, userAnswer, className = "" }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [state, setState] = useState({ status: "idle" });

  const ask = async () => {
    setState({ status: "loading" });
    try {
      const data = await api.post("/tutor/explain", { lang, question: pickQuestion(question), userAnswer: userAnswer ?? null });
      setState({ status: "done", data });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  };

  if (user && user.aiEnabled === false) return null;

  if (state.status === "done") {
    const d = state.data;
    return (
      <div className={`rounded-2xl border border-purple/25 bg-purple/[0.06] p-4 text-[14px] leading-6 text-ink ${className}`}>
        <p className="flex items-center gap-2 font-bold text-purple">
          <LuSparkles size={15} /> {d.summary}
        </p>
        {d.steps?.length > 0 && (
          <>
            <p className="mt-3 text-[11px] font-bold text-ink/45">{t("tutor.steps")}</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {d.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </>
        )}
        {d.trap && (
          <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-900">
            <LuTriangleAlert size={16} className="mt-1 shrink-0" />
            <span>
              <b>{t("tutor.trap")}:</b> {d.trap}
            </span>
          </p>
        )}
        {d.tip && (
          <p className="mt-2 flex gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-900">
            <LuLightbulb size={16} className="mt-1 shrink-0" />
            <span>
              <b>{t("tutor.tip")}:</b> {d.tip}
            </span>
          </p>
        )}
        {d.quota?.remaining != null && (
          <p className="mt-2 text-right text-[11px] text-ink/40">{t("tutor.left", { n: d.quota.remaining })}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={ask}
        disabled={state.status === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-purple px-4 py-2 text-[13px] font-bold text-white transition hover:bg-purple/90 disabled:opacity-60"
      >
        {state.status === "loading" ? <LuLoader size={14} className="animate-spin" /> : <LuSparkles size={14} />}
        {state.status === "loading" ? t("tutor.loading") : t("tutor.ask")}
      </button>
      {state.status === "error" && (
        <p className="mt-2 text-[13px] text-red-600">
          {t("tutor.error")}: {state.message}
        </p>
      )}
    </div>
  );
}
