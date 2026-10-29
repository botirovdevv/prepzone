import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { LuMonitor, LuSmartphone, LuCircleCheck, LuCircleX, LuTriangleAlert } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import { FormAlert, PrimaryButton } from "../components/auth/FormParts";
import { PageLoader } from "../components/ui";

// ------------------------------------------------------------------
// Telefonda ochiladi: kompyuterdagi QR skanerlanganda shu sahifaga
// keladi (/qr?i=...&c=...). Foydalanuvchi qaysi kompyuter kirmoqchi
// ekanini ko'radi va tasdiqlaydi yoki rad etadi.
// ------------------------------------------------------------------

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
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
  const [info, setInfo] = useState(null);
  const [state, setState] = useState("loading"); // loading | ask | approved | denied | expired | invalid
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
        await qrApprove(qrId, scanCode);
        setState("approved");
      } else {
        await qrDeny(qrId, scanCode);
        setState("denied");
      }
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") return <PageLoader fullscreen />;

  const DeviceIcon = info?.device === "phone" ? LuSmartphone : LuMonitor;

  return (
    <AuthLayout
      eyebrow="QR orqali kirish"
      title={state === "ask" ? "Kompyuterga kirasizmi?" : "QR orqali kirish"}
      footer={
        <Link to="/dashboard" className="font-semibold text-[#087fd1] hover:underline">
          Bosh sahifaga qaytish
        </Link>
      }
    >
      {state === "ask" && info && (
        <>
          <div className="flex items-center gap-4 rounded-[18px] bg-black/[0.04] p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#087fd1] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <DeviceIcon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-[#1d1d1f]">
                {info.browser} · {info.os}
              </p>
              <p className="mt-0.5 truncate text-[13px] text-[#6e6e73]">
                IP {info.ip || "noma'lum"} · {formatTime(info.createdAt)} da so'ralgan
              </p>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#fff8e6] px-4 py-3 text-[13px] leading-[1.45] text-[#8a5a00]">
            <LuTriangleAlert size={16} className="mt-px shrink-0" />
            Faqat hozir o'zingiz oldida turgan kompyuterdagi QR kodni tasdiqlang. Kimdir sizga QR yuborgan bo'lsa — rad
            eting.
          </p>

          {error && (
            <div className="mt-4">
              <FormAlert>{error}</FormAlert>
            </div>
          )}

          <div className="mt-5 space-y-2.5">
            <PrimaryButton type="button" onClick={() => decide(true)} loading={busy} loadingText="Tasdiqlanmoqda...">
              Ha, kirish
            </PrimaryButton>
            <button
              type="button"
              onClick={() => decide(false)}
              disabled={busy}
              className="pz-press flex h-[52px] w-full items-center justify-center rounded-full border border-black/[0.12] bg-white text-[17px] font-semibold text-[#1d1d1f] hover:bg-[#fafafa] disabled:opacity-60"
            >
              Yo'q, bu men emas
            </button>
          </div>
        </>
      )}

      {state !== "ask" && <Result state={state} />}
    </AuthLayout>
  );
}

const RESULTS = {
  approved: {
    icon: LuCircleCheck,
    tone: "text-emerald-600",
    title: "Kompyuterda kirildi",
    text: "Kompyuter ekranini tekshiring. Bu seansni istalgan vaqtda Sozlamalar → Faol seanslar bo'limidan tugatishingiz mumkin.",
  },
  denied: {
    icon: LuCircleX,
    tone: "text-[#c4252b]",
    title: "So'rov rad etildi",
    text: "Kompyuter hisobingizga kira olmaydi.",
  },
  expired: {
    icon: LuTriangleAlert,
    tone: "text-[#8a5a00]",
    title: "QR kod eskirgan",
    text: "Kompyuterda yangi QR kodni oching va qaytadan skanerlang.",
  },
  invalid: {
    icon: LuTriangleAlert,
    tone: "text-[#c4252b]",
    title: "QR kod yaroqsiz",
    text: "Havola noto'g'ri yoki eskirgan. Kompyuterdagi QR kodni qaytadan skanerlang.",
  },
};

function Result({ state }) {
  const r = RESULTS[state] || RESULTS.invalid;
  const Icon = r.icon;
  return (
    <div className="py-4 text-center">
      <Icon size={40} className={`mx-auto ${r.tone}`} />
      <p className="mt-3 text-[19px] font-semibold text-[#1d1d1f]">{r.title}</p>
      <p className="mt-1.5 text-[15px] leading-[1.47] text-[#6e6e73]">{r.text}</p>
    </div>
  );
}
