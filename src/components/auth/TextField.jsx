import { useId, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

// ------------------------------------------------------------------
// Auth formalari uchun input: label maydon ichida turadi va fokus yoki
// qiymat bo'lganda tepaga yuzib chiqadi (index.css → .pz-field).
// 17px shrift — iOS Safari fokusda sahifani kattalashtirmasligi uchun;
// 56px balandlik — barmoq uchun qulay nishon. Parol maydonida
// ko'rsatish/yashirish tugmasi bor.
// ------------------------------------------------------------------
export default function TextField({ label, type = "text", error, hint, action, className = "", ...props }) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <div className="pz-field" data-invalid={error ? "" : undefined}>
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          // Yuzuvchi label :placeholder-shown ga tayanadi — placeholder doim bo'lishi kerak.
          {...props}
          placeholder={props.placeholder || " "}
          style={isPassword ? { paddingRight: 52 } : undefined}
        />
        <label htmlFor={id}>{label}</label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Parolni yashirish" : "Parolni ko'rsatish"}
            aria-pressed={reveal}
            className="pz-press absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#86868b] hover:bg-black/[0.05] hover:text-[#1d1d1f]"
          >
            {reveal ? <LuEyeOff size={18} /> : <LuEye size={18} />}
          </button>
        )}
      </div>
      {(error || hint || action) && (
        <div className="mt-1.5 flex items-start justify-between gap-3 px-1">
          {error ? (
            <p id={`${id}-error`} className="pz-fade text-[13px] leading-[1.4] text-[#d93036]">
              {error}
            </p>
          ) : hint ? (
            <div id={`${id}-hint`} className="flex-1 text-[13px] leading-[1.4] text-[#6e6e73]">
              {hint}
            </div>
          ) : (
            <span />
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </div>
  );
}
