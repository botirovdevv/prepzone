import { LuSearchX } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <LuSearchX size={28} />
      </div>
      <p className="font-display text-5xl font-bold text-ink">404</p>
      <h1 className="mt-2 font-display text-xl font-bold text-ink">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">{t("notFound.text")}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent"
      >
        {t("notFound.home")}
      </Link>
    </div>
  );
}
