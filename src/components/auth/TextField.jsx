import { useId, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

// ------------------------------------------------------------------
// Auth formalari uchun input. 17px shrift — iOS Safari fokusda sahifani
// kattalashtirmasligi uchun; 48px balandlik — barmoq uchun qulay nishon.
// Parol maydonida ko'rsatish/yashirish tugmasi bor.
// ------------------------------------------------------------------
export default function TextField({ label, type = "text", error, hint, action, className = "", ...props }) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-medium text-[#344054]">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-[14px] border bg-white px-4 text-[17px] text-[#111827] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#98a2b3] focus:ring-4 ${
            isPassword ? "pr-12" : ""
          } ${
            error
              ? "border-[#e5484d]/70 focus:border-[#e5484d] focus:ring-[#e5484d]/12"
              : "border-[#111827]/[0.12] hover:border-[#111827]/25 focus:border-[#087fd1] focus:ring-[#087fd1]/15"
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Parolni yashirish" : "Parolni ko'rsatish"}
            aria-pressed={reveal}
            className="pz-press absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#667085] hover:bg-[#111827]/[0.05] hover:text-[#111827]"
          >
            {reveal ? <LuEyeOff size={18} /> : <LuEye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="pz-fade mt-1.5 text-[13px] text-[#d93036]">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-1.5 text-[13px] text-[#667085]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
