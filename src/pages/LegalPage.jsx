import { useEffect } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { LanguageSwitch, useI18n } from "../i18n";

// ------------------------------------------------------------------
// Foydalanish shartlari, Maxfiylik siyosati va Aloqa sahifalari.
// Matnlar — src/i18n/messages/legal.js. E'lon qilishdan oldin yuridik
// jihatdan tekshirib chiqish tavsiya etiladi.
// ------------------------------------------------------------------

const CONTACT_EMAIL = "support@prep-zone.uz";
const TELEGRAM = "https://t.me/prepzonesat";

export default function LegalPage({ page }) {
  const { t, tr } = useI18n();
  const title = t(`legal.${page}.title`);
  const sections = tr(`legal.${page}.sections`) || [];
  const isContact = page === "contact";

  useEffect(() => {
    const previous = document.title;
    document.title = `${title} — Prepzone`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <AuthLayout
      headerAction={
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <Link
            to="/login"
            className="rounded-full border border-ink/10 bg-surface/80 px-5 py-2 text-sm font-semibold transition hover:bg-surface hover:shadow-sm"
          >
            {t("legal.login")}
          </Link>
        </div>
      }
    >
      <article className="w-full max-w-2xl rounded-3xl border border-ink/[0.08] bg-surface/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {!isContact && (
          <p className="mt-2 text-xs text-ink-2">{t("legal.updated", { date: t("legal.updatedDate") })}</p>
        )}
        <div className="mt-8 space-y-6">
          {sections.map(([heading, text]) => (
            <section key={heading}>
              <h2 className="text-base font-bold">{heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">{text.replace("{email}", CONTACT_EMAIL)}</p>
            </section>
          ))}
        </div>
        {isContact && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-2xl border border-ink/10 p-5 transition hover:border-accent hover:bg-accent/[0.03]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">Email</p>
              <p className="mt-1 break-all font-semibold text-accent">{CONTACT_EMAIL}</p>
            </a>
            <a
              href={TELEGRAM}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-ink/10 p-5 transition hover:border-accent hover:bg-accent/[0.03]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">Telegram</p>
              <p className="mt-1 font-semibold text-accent">@prepzonesat</p>
            </a>
          </div>
        )}
      </article>
    </AuthLayout>
  );
}
