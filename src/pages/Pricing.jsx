import { useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuChevronDown } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { LanguageSwitch, useI18n } from "../i18n";
import PlanCards, { MonthsToggle, PricingCompare } from "../components/billing/PlanCards";
import { useCheckout } from "../components/billing/Checkout";

// ------------------------------------------------------------------
// /pricing — ochiq sahifa (login'siz ham). To'lov Telegram bot orqali.
// ------------------------------------------------------------------

export function PricingSection({ id = "pricing" }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [months, setMonths] = useState(1);
  const { start, busyPlan, error, modal } = useCheckout();

  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[680px]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#087fd1]">{t("pricing.eyebrow")}</p>
          <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-[16px] leading-7 text-[#667085]">{t("pricing.subtitle")}</p>
        </div>
        <MonthsToggle months={months} onChange={setMonths} />
      </div>

      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-10">
        <PlanCards months={months} currentPlan={user?.plan} onChoose={(plan) => start(plan, months)} busyPlan={busyPlan} />
      </div>

      <div className="mt-16">
        <h3 className="mb-5 text-2xl font-bold tracking-tight">{t("pricing.compareTitle")}</h3>
        <PricingCompare />
      </div>
      {modal}
    </section>
  );
}

function HowToPay() {
  const { t, tr } = useI18n();
  return (
    <div>
      <h3 className="text-2xl font-bold tracking-tight">{t("pricing.howTitle")}</h3>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {(tr("pricing.how") || []).map((s, i) => (
          <li key={s.title} className="rounded-3xl border border-[#111827]/[0.07] bg-white p-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9] text-sm font-bold text-white">
              {i + 1}
            </span>
            <h4 className="mt-5 text-[17px] font-bold">{s.title}</h4>
            <p className="mt-1.5 text-[14px] leading-6 text-[#667085]">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PricingFaq() {
  const { t, tr } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <div>
      <h3 className="text-2xl font-bold tracking-tight">{t("pricing.faqTitle")}</h3>
      <div className="mt-6 divide-y divide-[#111827]/[0.07] rounded-3xl border border-[#111827]/[0.07] bg-white">
        {(tr("pricing.faq") || []).map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold"
            >
              {f.q}
              <LuChevronDown size={18} className={`shrink-0 text-[#98a2b3] transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-6 pb-5 text-[14px] leading-6 text-[#667085]">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Pricing() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#fcfcfa] font-['Inter'] text-[#111827]">
      <header className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#111827]">
          <LuArrowLeft size={16} />
          <img src="/Logo.png" alt="Prepzone" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          {!user && (
            <Link to="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-[#111827]/[0.05]">
              {t("home.login")}
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] space-y-20 px-5 pb-24 pt-8 sm:px-8">
        <PricingSection />
        <HowToPay />
        <PricingFaq />
      </main>
    </div>
  );
}
