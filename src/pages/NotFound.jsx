import { LuSearchX } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F7FB] px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#087fd1]/10 text-[#087fd1]">
        <LuSearchX size={28} />
      </div>
      <p className="font-display text-5xl font-black text-[#12213D]">404</p>
      <h1 className="mt-2 font-display text-xl font-bold text-[#12213D]">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-sm text-sm text-[#12213D]/60">{t("notFound.text")}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-xl bg-[#087fd1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0670b9]"
      >
        {t("notFound.home")}
      </Link>
    </div>
  );
}
