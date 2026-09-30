import { Link } from "react-router-dom";

const logo = "/Logo.png";

// Login/Register/ForgotPassword va huquqiy sahifalar uchun umumiy footer.
export function AuthFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center gap-2 py-6 text-center text-xs text-[#566176]">
      <nav className="flex gap-4">
        <Link to="/terms" className="hover:text-[#111827]">
          Foydalanish shartlari
        </Link>
        <Link to="/privacy" className="hover:text-[#111827]">
          Maxfiylik siyosati
        </Link>
        <Link to="/contact" className="hover:text-[#111827]">
          Aloqa
        </Link>
      </nav>
      <p>&copy; {new Date().getFullYear()} Prepzone. Barcha huquqlar himoyalangan.</p>
    </footer>
  );
}

// Nuqtali fon, yuqori panel va footer bilan sahifa qobig'i (Login uslubida).
export default function AuthLayout({ children, headerAction }) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#fcfcfa] text-[#111827]">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
      radial-gradient(circle at 50% 0%, rgba(8, 127, 209, 0.18) 0%, transparent 60%),
      radial-gradient(rgba(17, 24, 39, 0.22) 1.5px, transparent 1.5px)
    `,
          backgroundSize: "100% 100%, 24px 24px",
        }}
      />
      <header className="relative z-10 border-b border-[#111827]/[0.08] bg-[#fcfcfa]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center">
            <img src={logo} alt="Prepzone" width="144" height="29" className="h-auto w-36 object-contain" />
          </Link>
          {headerAction}
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">{children}</main>
      <AuthFooter />
    </div>
  );
}
