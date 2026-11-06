import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuCircleCheck, LuLoader, LuSend, LuX, LuCircleAlert } from "react-icons/lu";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useI18n, formatDate, formatNumber } from "../../i18n";

// ------------------------------------------------------------------
// To'lov: server unikal summali to'lov yaratadi → Telegram bot ochiladi →
// user kartaga o'tkazib chekni botga yuboradi. Bu oyna to'lov holatini
// kuzatib turadi va tarif yoqilishi bilan userni yangilaydi.
// ------------------------------------------------------------------

const fmt = (n) => formatNumber(n).replace(/,/g, " ");

export function useCheckout() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState(null);
  const [checkout, setCheckout] = useState(null); // { payment, botUrl }
  const [error, setError] = useState("");

  const start = useCallback(
    async (plan, months) => {
      setError("");
      if (plan === "free") return navigate(user ? "/dashboard" : "/register");
      if (!user) return navigate("/register", { state: { next: "/pricing" } });
      // Brauzer popup'ni bloklamasligi uchun oyna bosish paytida ochiladi.
      const win = window.open("", "_blank");
      setBusyPlan(plan);
      try {
        const data = await api.post("/billing/checkout", { plan, months });
        setCheckout(data);
        if (win) win.location.href = data.botUrl;
      } catch (err) {
        win?.close();
        setError(err.message);
      } finally {
        setBusyPlan(null);
      }
    },
    [user, navigate]
  );

  const modal = checkout ? (
    <CheckoutModal checkout={checkout} onClose={() => setCheckout(null)} onApproved={refreshUser} />
  ) : null;

  return { start, busyPlan, error, modal };
}

function CheckoutModal({ checkout, onClose, onApproved }) {
  const { t } = useI18n();
  const [status, setStatus] = useState(checkout.payment.status);
  const [endsAt, setEndsAt] = useState(null);
  const [plan, setPlan] = useState(checkout.payment.plan);

  useEffect(() => {
    if (status === "approved" || status === "rejected" || status === "expired") return;
    const id = setInterval(async () => {
      try {
        const me = await api.get("/billing/me");
        const p = me.payments.find((x) => x.id === checkout.payment.id);
        if (!p) return;
        setStatus(p.status);
        if (p.status === "approved") {
          setEndsAt(me.planEndsAt);
          setPlan(me.plan);
          onApproved?.();
        }
      } catch {
        /* keyingi urinishda */
      }
    }, 4000);
    return () => clearInterval(id);
  }, [status, checkout.payment.id, onApproved]);

  const done = status === "approved";
  const failed = status === "rejected" || status === "expired";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#111827]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 text-[#111827] shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#111827]/5"
        >
          <LuX size={18} />
        </button>

        {done ? (
          <div className="text-center">
            <LuCircleCheck size={52} className="mx-auto text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold">
              {t("pricing.approved", {
                plan: t(`plans.names.${plan}`),
                date: endsAt ? formatDate(endsAt, { day: "numeric", month: "long", year: "numeric" }) : "",
              })}
            </h2>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-[#087fd1] py-3.5 font-bold text-white hover:bg-[#066fb8]">
              OK
            </button>
          </div>
        ) : failed ? (
          <div className="text-center">
            <LuCircleAlert size={48} className="mx-auto text-red-500" />
            <p className="mt-4 font-semibold">{t("pricing.rejected")}</p>
            <a
              href={checkout.botUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] py-3.5 font-bold text-white"
            >
              <LuSend size={16} /> {t("pricing.openBot")}
            </a>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{t("pricing.waitingTitle")}</h2>
            <p className="mt-1 text-sm text-[#667085]">
              {t(`plans.names.${checkout.payment.plan}`)} · {t(`plans.months.${checkout.payment.months}`)}
            </p>
            <div className="mt-5 rounded-2xl bg-[#087fd1]/[0.06] p-5 text-center">
              <p className="font-['Inter_Tight'] text-[34px] font-semibold tracking-tight tabular-nums">
                {fmt(checkout.payment.amount)} <span className="text-base font-medium text-[#667085]">so'm</span>
              </p>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[#475467]">
              {t("pricing.waitingText", { amount: fmt(checkout.payment.amount) })}
            </p>
            <a
              href={checkout.botUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#229ED9] py-3.5 font-bold text-white transition hover:bg-[#1c8cc2]"
            >
              <LuSend size={16} /> {t("pricing.openBot")}
            </a>
            <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#667085]">
              <LuLoader size={14} className="animate-spin" />
              {status === "receipt_sent" ? t("pricing.receiptChecking") : t("pricing.waitingReceipt")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
