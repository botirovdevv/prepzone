// Sahifalar uchun umumiy "hero" banner — barcha sahifalarda bitta
// (logotip) rangida, faqat mazmuni farq qiladi.
export default function PageHero({ eyebrow, title, subtitle, icon: Icon, stats, children }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#12213D]/6 px-6 py-8 sm:px-9 sm:py-10 mb-8 bg-[linear-gradient(135deg,#eaf3ff_0%,#f6f7fb_55%,#ffffff_100%)]">
      <div className="pointer-events-none absolute -right-16 -top-20 w-72 h-72 rounded-full bg-[#087fd1]/[0.08]" />
      <div className="pointer-events-none absolute right-24 bottom-[-70px] w-40 h-40 rounded-full bg-[#087fd1]/[0.08]" />

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            {Icon && (
              <span className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm bg-white text-[#087fd1]">
                <Icon size={16} />
              </span>
            )}
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#12213D]/45">
              {eyebrow}
            </p>
          </div>
          <h1 className="font-display text-[28px] sm:text-[34px] font-extrabold text-[#12213D] leading-[1.1] mb-2.5">
            {title}
          </h1>
          {subtitle && <p className="text-[#12213D]/55 text-[15px] leading-relaxed">{subtitle}</p>}
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-2.5 shrink-0">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white/90 backdrop-blur rounded-2xl px-4 py-2.5 shadow-sm border border-white"
              >
                {s.icon && (
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      s.iconClass || "bg-[#087fd1]/10 text-[#087fd1]"
                    }`}
                  >
                    <s.icon size={14} />
                  </span>
                )}
                <div className="leading-tight">
                  <p className="font-display text-base font-extrabold text-[#12213D]">{s.value}</p>
                  <p className="text-[11px] text-[#12213D]/45 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {children && <div className="relative mt-6">{children}</div>}
    </div>
  );
}
