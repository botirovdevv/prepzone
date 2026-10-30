import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { LuRefreshCw, LuSmartphone, LuCircleCheck, LuShieldCheck } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { FormAlert } from "./FormParts";
import { translate, useI18n } from "../../i18n";

// ------------------------------------------------------------------
// Kompyuterda QR orqali kirish. QR'da telefonda ochiladigan havola bor
// (/qr?i=...&c=...). Telefonda tasdiqlangach, shu sahifa so'rab turgan
// /auth/qr/poll javobida seans cookie'si keladi.
// ------------------------------------------------------------------

const POLL_MS = 2000;
const MAX_AUTO_REFRESH = 5; // ~10 daqiqa — keyin qo'lda yangilanadi

export default function QrLogin({ onSuccess }) {
  const { qrStart, qrPoll } = useAuth();
  const { t, tr } = useI18n();
  const [qr, setQr] = useState(null); // { id, pollSecret, expiresAt, image }
  const [status, setStatus] = useState("loading"); // loading | pending | scanned | approved | denied | stale
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const refreshes = useRef(0);
  const alive = useRef(true);
  // AuthContext funksiyalari har renderda yangi — effektlar qayta ishga
  // tushmasligi uchun ref orqali chaqiriladi.
  const fns = useRef({});
  fns.current = { qrStart, qrPoll, onSuccess };

  const start = useRef(async () => {
    setStatus("loading");
    setError("");
    try {
      const data = await fns.current.qrStart();
      const url = `${window.location.origin}/qr?i=${data.id}&c=${encodeURIComponent(data.scanCode)}`;
      const image = await QRCode.toDataURL(url, { margin: 1, width: 440, errorCorrectionLevel: "M" });
      if (!alive.current) return;
      setQr({ id: data.id, pollSecret: data.pollSecret, expiresAt: new Date(data.expiresAt).getTime(), image });
      setStatus("pending");
    } catch (err) {
      if (!alive.current) return;
      setError(err.message || translate("auth.qr.createFailed"));
      setStatus("stale");
    }
  }).current;

  useEffect(() => {
    alive.current = true;
    start();
    return () => {
      alive.current = false;
    };
  }, [start]);

  // So'rov holatini kuzatish.
  useEffect(() => {
    if (!qr || (status !== "pending" && status !== "scanned")) return;
    let busy = false;
    const timer = setInterval(async () => {
      if (busy || document.hidden) return;
      busy = true;
      try {
        const res = await fns.current.qrPoll(qr.id, qr.pollSecret);
        if (!alive.current) return;
        if (res.status === "approved") {
          setStatus("approved");
          fns.current.onSuccess?.(res.user);
        } else if (res.status === "expired") {
          if (refreshes.current < MAX_AUTO_REFRESH) {
            refreshes.current += 1;
            start();
          } else setStatus("stale");
        } else if (res.status !== status) {
          setStatus(res.status);
        }
      } catch {
        // Tarmoq uzilishi — keyingi urinishda davom etadi.
      } finally {
        busy = false;
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [qr, status, start]);

  // Qolgan vaqt.
  useEffect(() => {
    if (!qr) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((qr.expiresAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [qr]);

  const manualRefresh = () => {
    refreshes.current = 0;
    start();
  };

  const dimmed = status === "scanned" || status === "approved" || status === "denied" || status === "stale";

  return (
    <div>
      <p className="mb-4 rounded-[14px] bg-[#eef6ff] px-4 py-3 text-[13px] leading-[1.45] text-[#0a5d99] sm:hidden">
        {t("auth.qr.mobileNote")}
      </p>

      <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-[22px] border border-black/[0.08] bg-white p-3">
        {qr?.image ? (
          <img
            src={qr.image}
            alt={t("auth.qr.alt")}
            className={`h-full w-full transition duration-300 ${dimmed ? "scale-[0.97] opacity-15 blur-[2px]" : ""}`}
          />
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-black/[0.05]" />
        )}

        {status !== "pending" && status !== "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            {status === "scanned" && (
              <>
                <LuSmartphone size={30} className="text-[#087fd1]" />
                <p className="text-[15px] font-semibold text-[#1d1d1f]">{t("auth.qr.confirmOnPhone")}</p>
                <p className="text-[13px] text-[#6e6e73]">{t("auth.qr.pressYes")}</p>
              </>
            )}
            {status === "approved" && (
              <>
                <LuCircleCheck size={32} className="text-emerald-600" />
                <p className="text-[15px] font-semibold text-[#1d1d1f]">{t("auth.qr.approved")}</p>
              </>
            )}
            {(status === "denied" || status === "stale") && (
              <>
                <p className="text-[15px] font-semibold text-[#1d1d1f]">
                  {status === "denied" ? t("auth.qr.denied") : t("auth.qr.expired")}
                </p>
                <button
                  type="button"
                  onClick={manualRefresh}
                  className="pz-press mt-1 inline-flex items-center gap-2 rounded-full bg-[#087fd1] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#0673bd]"
                >
                  <LuRefreshCw size={15} /> {t("auth.qr.newQr")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] tabular-nums text-[#86868b]">
        {status === "pending" && secondsLeft > 0
          ? t("auth.qr.refreshIn", { time: `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` })
          : " "}
      </p>

      <ol className="mt-4 space-y-2.5 text-[14px] leading-[1.45] text-[#1d1d1f]">
        {tr("auth.qr.steps").map((text, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#087fd1]/10 text-[12px] font-bold text-[#087fd1]">
              {i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>

      <p className="mt-4 flex items-start gap-2 text-[12px] leading-[1.45] text-[#86868b]">
        <LuShieldCheck size={14} className="mt-px shrink-0" />
        {t("auth.qr.warning")}
      </p>

      {error && (
        <div className="mt-4">
          <FormAlert>{error}</FormAlert>
        </div>
      )}
    </div>
  );
}
