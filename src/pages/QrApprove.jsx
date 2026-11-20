import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { LuMonitor, LuSmartphone, LuCircleCheck, LuCircleX, LuTriangleAlert } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import { FormAlert, PrimaryButton } from "../components/auth/FormParts";
import { PageLoader } from "../components/ui";
import { formatDate, useI18n } from "../i18n";

// ------------------------------------------------------------------
// Telefonda ochiladi: kompyuterdagi QR skanerlanganda shu sahifaga
// keladi (/qr?i=...&c=...). Foydalanuvchi qaysi kompyuter kirmoqchi
// ekanini ko'radi va tasdiqlaydi yoki rad etadi.
// ------------------------------------------------------------------

function formatTime(iso) {
  return formatDate(iso, { hour: "2-digit", minute: "2-digit" });
}

export default function QrApprove() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const qrId = params.get("i") || "";
  const scanCode = params.get("c") || "";

  if (loading) return <PageLoader fullscreen />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;

  return <Approve qrId={qrId} scanCode={scanCode} />;
}

function Approve({ qrId, scanCode }) {
  const { qrInfo, qrApprove, qrDeny } = useAuth();
  const { t } = useI18n();
  const [info, setInfo] = useState(null);
  const [state, setState] = useState("loading"); // loading | ask | approved | denied | expired | invalid
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState("");
  // AuthContext funksiyasi har renderda yangi — so'rov bir marta ketsin.
  const qrInfoRef = useRef(qrInfo);

  useEffect(() => {
    let cancelled = false;
    qrInfoRef.current(qrId, scanCode)
      .then((data) => {
        if (cancelled) return;
        setInfo(data);
        setState(
          data.status === "scanned" || data.status === "pending" ? "ask" : data.status === "approved" ? "approved" : data.status
        );
      })
      .catch(() => !cancelled && setState("invalid"));
    return () => {
      cancelled = true;
    };
  }, [qrId, scanCode]);

  const decide = async (approve) => {
    setBusy(true);
    setError("");
    try {
      if (approve) {
        await qrApprove(qrId, scanCode, confirm);
        setState("approved");
      } else {
        await qrDeny(qrId, scanCode);
        setState("denied");
      }
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") return <PageLoader fullscreen />;

  const DeviceIcon = info?.device === "phone" ? LuSmartphone : LuMonitor;

  return (
    <AuthLayout
      eyebrow={t("qrApprove.eyebrow")}
      title={state === "ask" ? t("qrApprove.askTitle") : t("qrApprove.title")}
      footer={
        <Link to="/dashboard" className="font-semibold text-accent hover:underline">
          {t("qrApprove.back")}
        </Link>
      }
    >
      {state === "ask" && info && (
        <>
          <div className="flex items-center gap-4 rounded-[18px] bg-black/[0.04] p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-accent shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <DeviceIcon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-ink">
                {info.browser} · {info.os}
              </p>
              <p className="mt-0.5 truncate text-[13px] text-ink-2">
                IP {info.ip || t("qrApprove.unknown")} · {t("qrApprove.requestedAt", { time: formatTime(info.createdAt) })}
              </p>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#fff8e6] px-4 py-3 text-[13px] leading-[1.45] text-[#8a5a00]">
            <LuTriangleAlert size={16} className="mt-px shrink-0" />
            {t("qrApprove.warning")}
          </p>

          {error && (
            <div className="mt-4">
              <FormAlert>{error}</FormAlert>
            </div>
          )}

          <label className="mt-4 block">
            <span className="text-[13px] font-medium text-ink-2">{t("qrApprove.codeLabel")}</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={2}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="mt-1.5 h-[56px] w-full rounded-xl border border-ink/[0.12] bg-surface text-center font-display text-[28px] font-bold tracking-[0.3em] text-ink tabular-nums outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
              placeholder="••"
            />
          </label>

          <div className="mt-5 space-y-2.5">
            <PrimaryButton type="button" onClick={() => decide(true)} disabled={confirm.length !== 2} loading={busy} loadingText={t("qrApprove.approving")}>
              {t("qrApprove.yes")}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => decide(false)}
              disabled={busy}
              className="pz-press flex h-[52px] w-full items-center justify-center rounded-full border border-black/[0.12] bg-surface text-[17px] font-semibold text-ink hover:bg-surface-2 disabled:opacity-60"
            >
              {t("qrApprove.no")}
            </button>
          </div>
        </>
      )}

      {state !== "ask" && <Result state={state} />}
    </AuthLayout>
  );
}

const RESULTS = {
  approved: { icon: LuCircleCheck, tone: "text-emerald-600" },
  denied: { icon: LuCircleX, tone: "text-danger" },
  expired: { icon: LuTriangleAlert, tone: "text-[#8a5a00]" },
  invalid: { icon: LuTriangleAlert, tone: "text-danger" },
};

function Result({ state }) {
  const { tr } = useI18n();
  const key = RESULTS[state] ? state : "invalid";
  const r = { ...RESULTS[key], ...tr(`qrApprove.results.${key}`) };
  const Icon = r.icon;
  return (
    <div className="py-4 text-center">
      <Icon size={40} className={`mx-auto ${r.tone}`} />
      <p className="mt-3 text-[19px] font-semibold text-ink">{r.title}</p>
      <p className="mt-1.5 text-[15px] leading-[1.47] text-ink-2">{r.text}</p>
    </div>
  );
}
