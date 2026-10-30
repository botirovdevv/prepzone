import { LanguageSwitch } from "../i18n";

const TONES = {
  blue: "bg-[#087fd1]/10 text-[#087fd1]",
  amber: "bg-amber-500/10 text-amber-600",
  red: "bg-red-500/10 text-red-600",
};

// Test atrofidagi to'liq ekranli holat sahifalari (kutish, bloklangan,
// chetlatilgan, xato) uchun umumiy, sayt uslubidagi qolip.
export default function TestStatusScreen({ icon: Icon, tone = "blue", eyebrow, title, children, showLanguage = true }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f5f6f4] px-6 py-12 text-center text-[#111827]">
      {showLanguage && <LanguageSwitch className="absolute right-5 top-5" />}
      <div className="w-full max-w-lg rounded-3xl border border-[#111827]/[0.07] bg-white px-6 py-10 sm:px-10">
        {Icon && (
          <span className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${TONES[tone]}`}>
            <Icon size={28} />
          </span>
        )}
        {eyebrow && (
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#98a2b3]">{eyebrow}</p>
        )}
        {title && <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{title}</h1>}
        {children}
      </div>
    </div>
  );
}

export function BigTimer({ children, caption }) {
  return (
    <div className="mt-8">
      <div className="font-display text-5xl font-semibold tabular-nums tracking-[-0.04em] sm:text-6xl">{children}</div>
      {caption && <p className="mt-1 text-sm text-[#98a2b3]">{caption}</p>}
    </div>
  );
}
