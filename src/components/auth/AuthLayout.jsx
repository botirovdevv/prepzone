import AuthNavbar from "./AuthNavbar";

// Login / Register / Parolni tiklash sahifalarining umumiy qobig'i:
// yumshoq fon, yarim shaffof navbar va markazdagi forma kartasi.
export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#fcfcfa] text-[#111827]">
      {/* Fon: yuqoridan tushayotgan yumshoq ko'k nur + juda nozik nuqtali to'r */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `
            radial-gradient(60% 50% at 50% 0%, rgba(8, 127, 209, 0.14) 0%, transparent 70%),
            radial-gradient(rgba(17, 24, 39, 0.09) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 22px 22px",
        }}
      />

      <AuthNavbar />

      <main className="relative flex flex-1 items-start justify-center px-4 pb-10 pt-8 sm:items-center sm:py-14">
        <div className="pz-rise w-full max-w-[420px]">
          <div className="pz-auth-card rounded-[28px] px-6 py-8 sm:px-9 sm:py-10">
            <div className="mb-7">
              {eyebrow && (
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#087fd1]">
                  {eyebrow}
                </p>
              )}
              <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-[#111827] sm:text-[32px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2.5 text-[15px] leading-[1.5] text-[#566176]">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-[15px] text-[#566176]">{footer}</div>
          )}
        </div>
      </main>

      <footer className="relative pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[12px] text-[#566176]/80">
        &copy; {new Date().getFullYear()} Prepzone
      </footer>
    </div>
  );
}
