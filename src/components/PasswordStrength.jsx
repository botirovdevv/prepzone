import { LuCheck, LuX } from "react-icons/lu";
import { STRENGTH_LABELS } from "../utils/passwordPolicy";

const BAR_COLORS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
const TEXT_COLORS = ["text-red-600", "text-red-600", "text-amber-600", "text-emerald-600", "text-emerald-700"];

// Parol kuchi indikatori va talablar ro'yxati (checkPassword natijasi bilan).
export default function PasswordStrength({ check, show }) {
  if (!show) return null;
  const { score, rules } = check;
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${i < Math.max(1, score) ? BAR_COLORS[score] : "bg-ink/10"}`}
            />
          ))}
        </div>
        <span className={`text-[12px] font-semibold ${TEXT_COLORS[score]}`}>{STRENGTH_LABELS[score]}</span>
      </div>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {rules.map((r) => (
          <li key={r.id} className={`flex items-center gap-1.5 text-[12px] ${r.ok ? "text-emerald-700" : "text-ink/55"}`}>
            {r.ok ? <LuCheck size={13} className="shrink-0" /> : <LuX size={13} className="shrink-0 text-red-400" />}
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
