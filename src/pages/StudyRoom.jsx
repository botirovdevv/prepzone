import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LuMic,
  LuMicOff,
  LuVideo,
  LuVideoOff,
  LuMonitorUp,
  LuMonitorX,
  LuPhoneOff,
  LuCopy,
  LuCheck,
  LuPencilLine,
  LuUsers,
  LuArrowLeft,
  LuLoaderCircle,
  LuTimer,
  LuAlarmClock,
  LuSettings2,
  LuVolume2,
} from "react-icons/lu";
import { api } from "../api/client";
import { Button } from "../components/ui";
import Whiteboard from "../components/studyRoom/Whiteboard";
import { QualityPanel } from "../components/studyRoom/QualitySettings";
import { cameraConstraints, useQualitySettings } from "../components/studyRoom/quality";
import useP2PCall from "../components/studyRoom/useP2PCall";
import { translate, useI18n } from "../i18n";

// ------------------------------------------------------------------
// Study Room — ikki talaba uchun video dars xonasi.
//   Video/ovoz: brauzerlar orasida to'g'ridan-to'g'ri WebRTC (Google Meet'ning
//     ikki kishilik qo'ng'iroqlari kabi), kerak bo'lsa TURN relay —
//     components/studyRoom/useP2PCall.js. Kirish: POST /api/study-room/:code/join
//   Doska: Socket.IO (components/studyRoom/Whiteboard.jsx)
// Ko'rinish Meet uslubida: sherik katta, o'zimiz burchakda (telefonda tik 9:16).
// Internet sekinlashsa foydalanuvchiga aytiladi.
// ------------------------------------------------------------------

const canScreenShare = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

// Telefon/planshet: asosiy kiritish — barmoq.
function isPhone() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(pointer: coarse)").matches);
}

function deviceInfo() {
  const phone = isPhone();
  return { phone, portrait: phone && Boolean(window.matchMedia?.("(orientation: portrait)").matches) };
}

// lg (1024px) va undan keng — desktop ko'rinishi.
function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return desktop;
}

// MediaStream'ni <video>/<audio> elementga ulaydi.
function useMediaRef(stream) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.srcObject !== stream) el.srcObject = stream || null;
  }, [stream]);
  return ref;
}

// ---------------- Kirishdan oldin: kamera/mikrofon tekshiruvi ----------------
function PreJoin({ code, onJoin, joining, error }) {
  const { t } = useI18n();
  const videoRef = useRef(null);
  const [device] = useState(deviceInfo);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!camOn) return;
    let stream;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: cameraConstraints(device) })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        setMediaError("");
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {
        setMediaError(translate("studyRoom.cameraDenied"));
        setCamOn(false);
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camOn, device]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F7FB] px-4 py-8">
      <div className="w-full max-w-xl">
        <Link
          to="/study-room"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#12213D]/55 hover:text-[#12213D]"
        >
          <LuArrowLeft size={16} /> {t("studyRoom.back")}
        </Link>
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-24px_rgba(18,33,61,0.35)]">
          {/* Telefonda oldindan ko'rish ham tik (9:16) — yuboriladigan kadrning o'zi. */}
          <div
            className={`relative mx-auto bg-[#12213D] ${device.portrait ? "aspect-[9/16] h-[58dvh] max-w-full" : "aspect-video"}`}
          >
            {camOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/60">
                <LuVideoOff size={40} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
              <RoundButton active={micOn} onClick={() => setMicOn((v) => !v)} title={t("studyRoom.mic")}>
                {micOn ? <LuMic size={20} /> : <LuMicOff size={20} />}
              </RoundButton>
              <RoundButton active={camOn} onClick={() => setCamOn((v) => !v)} title={t("studyRoom.camera")}>
                {camOn ? <LuVideo size={20} /> : <LuVideoOff size={20} />}
              </RoundButton>
            </div>
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087fd1]">Study Room</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-[#12213D]">
              {t("studyRoom.room")} <span className="font-mono tracking-[0.12em]">{code}</span>
            </h1>
            <p className="mt-1 text-sm text-[#12213D]/55">{t("studyRoom.checkDevices")}</p>
            {(mediaError || error) && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error || mediaError}</p>
            )}
            <Button className="mt-5 w-full" size="lg" onClick={() => onJoin({ camOn, micOn })} disabled={joining}>
              {joining ? <LuLoaderCircle size={18} className="animate-spin" /> : <LuUsers size={18} />}
              {joining ? t("studyRoom.connecting") : t("studyRoom.enterRoom")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundButton({ active, danger, onClick, title, children, disabled, ...rest }) {
  return (
    <button
      {...rest}
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition disabled:opacity-40 ${
        danger
          ? "bg-red-600 text-white hover:bg-red-700"
          : active
            ? "bg-white/15 text-white hover:bg-white/25"
            : "bg-red-500 text-white hover:bg-red-600"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------- Video plitkasi ----------------
function QualityBars({ quality }) {
  const level = quality === "excellent" ? 3 : quality === "good" ? 2 : quality === "poor" ? 1 : 0;
  const color = level >= 2 ? "bg-emerald-400" : level === 1 ? "bg-amber-400" : "bg-white/40";
  return (
    <span className="flex items-end gap-[2px]" title={translate("studyRoom.connectionQuality")}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`w-[3px] rounded-sm ${i <= level ? color : "bg-white/30"}`} style={{ height: 3 + i * 3 }} />
      ))}
    </span>
  );
}

// Video va plitka shakli (tik/keng) bir xil bo'lsa — plitkani to'ldiramiz
// (object-cover, Meet kabi); farq qilsa (masalan tik telefon videosi keng
// plitkada) — kesmasdan to'liq ko'rsatamiz (object-contain).
function useVideoFit() {
  const boxRef = useRef(null);
  const [boxRatio, setBoxRatio] = useState(16 / 9);
  const [videoRatio, setVideoRatio] = useState(16 / 9);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setBoxRatio(width / height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onVideoSize = (e) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoWidth && videoHeight) setVideoRatio(videoWidth / videoHeight);
  };

  const ratio = Math.max(boxRatio, videoRatio) / Math.min(boxRatio, videoRatio);
  return { boxRef, onVideoSize, cover: ratio < 1.35 };
}

// tile: { stream, name, isLocal, isScreen, cam, mic, quality, speaking }
// compact — kichik suzuvchi oyna; forceCover — kadrni doim to'ldiradi.
function ParticipantTile({ tile, className = "", compact = false, forceCover = false }) {
  const { t } = useI18n();
  const { stream, name, isLocal, isScreen, cam, mic, quality, speaking } = tile;
  const videoRef = useMediaRef(stream);
  const { boxRef, onVideoSize, cover } = useVideoFit();
  const showVideo = Boolean(stream) && (isScreen || cam);

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden rounded-2xl bg-[#1b2c4d] ring-2 transition ${
        speaking && !isScreen ? "ring-emerald-400" : "ring-transparent"
      } ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={onVideoSize}
        onResize={onVideoSize}
        className={`h-full w-full ${(cover || forceCover) && !isScreen ? "object-cover" : "object-contain"} ${
          isLocal && !isScreen ? "-scale-x-100" : ""
        } ${showVideo ? "" : "hidden"}`}
      />
      {!showVideo && (
        <div className="flex h-full items-center justify-center">
          <span
            className={`flex items-center justify-center rounded-full bg-[#087fd1] font-display font-bold text-white ${
              compact ? "h-9 w-9 text-base" : "h-16 w-16 text-2xl"
            }`}
          >
            {(name || "?").slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}
      <div className={`absolute flex items-center gap-2 ${compact ? "inset-x-1 bottom-1" : "inset-x-2 bottom-2"}`}>
        <span
          className={`flex min-w-0 items-center gap-1.5 rounded-lg bg-black/45 font-semibold text-white backdrop-blur ${
            compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
          }`}
        >
          {!isScreen && !mic && <LuMicOff size={12} className="shrink-0 text-red-300" />}
          <span className="truncate">
            {isScreen ? t("studyRoom.screenSuffix", { name }) : name}
            {isLocal && name !== t("studyRoom.you") && t("studyRoom.youSuffix")}
          </span>
        </span>
        {!isScreen && !compact && (
          <span className="ml-auto rounded-lg bg-black/45 px-1.5 py-1 backdrop-blur">
            <QualityBars quality={quality} />
          </span>
        )}
      </div>
    </div>
  );
}

function WaitingTile({ className = "" }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard ruxsati yo'q */
    }
  };
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 p-4 text-center ${className}`}
    >
      <LuUsers size={26} className="text-white/40" />
      <p className="text-sm font-semibold text-white/70">{t("studyRoom.waiting")}</p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
      >
        {copied ? <LuCheck size={14} /> : <LuCopy size={14} />} {copied ? t("studyRoom.copied") : t("studyRoom.copyLink")}
      </button>
    </div>
  );
}

// ---------------- Qolgan vaqt ----------------
const WARN_MS = 5 * 60_000;

function useRemaining(endsAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return Math.max(0, endsAt - now);
}

function formatMs(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

// Taymer faqat shu kichik komponentlarni har soniyada qayta chizadi —
// videolar bilan butun xona qayta chizilmaydi.
function TimeLeft({ endsAt }) {
  const remaining = useRemaining(endsAt);
  const warn = remaining <= WARN_MS;
  return (
    <span
      title={translate("studyRoom.timeLeft")}
      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold tabular-nums ${
        warn ? "bg-amber-400 text-[#12213D]" : "bg-white/10 text-white"
      }`}
    >
      <LuTimer size={14} /> {formatMs(remaining)}
    </span>
  );
}

function TimeWarning({ endsAt, limitMinutes }) {
  const remaining = useRemaining(endsAt);
  if (remaining <= 0 || remaining > WARN_MS) return null;
  return (
    <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
      {translate("studyRoom.timeWarning", { limit: limitMinutes, n: Math.ceil(remaining / 60_000) })}
    </div>
  );
}

// ---------------- Video ko'rinishi (Meet uslubi) ----------------
// Kichik suzuvchi oyna — bosilsa onClick. Telefonda tik (9:16), kompyuterda keng (16:9).
function FloatingTile({ tile, onClick, wide = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={translate("studyRoom.swapVideo")}
      className={`absolute z-20 overflow-hidden rounded-2xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/20 ${
        wide ? "aspect-video w-[240px]" : "aspect-[9/16] w-[28vw] max-w-[132px]"
      } ${className}`}
    >
      <ParticipantTile tile={tile} className="h-full w-full" compact forceCover={tile.isLocal} />
    </button>
  );
}

// Sherik katta, o'zimiz burchakda kichik oynada (bosilsa o'rin almashadi).
// Sherik hali kirmagan bo'lsa — o'zimiz katta.
function VideoStage({ local, remote, wide }) {
  const [swapped, setSwapped] = useState(false);
  const big = remote && !swapped ? remote : local;
  const small = remote ? (swapped ? remote : local) : null;

  return (
    <div className="relative h-full w-full">
      <ParticipantTile tile={big} className="h-full w-full" />
      {small && (
        <FloatingTile tile={small} wide={wide} onClick={() => setSwapped((v) => !v)} className="right-3 top-3" />
      )}
      {!remote && (
        <div className="absolute inset-x-4 top-1/2 mx-auto max-w-sm -translate-y-1/2">
          <WaitingTile className="border-white/25 bg-black/45 backdrop-blur" />
        </div>
      )}
    </div>
  );
}

// ---------------- Internet sifati haqida ogohlantirish ----------------
const NOTICE_DELAY_MS = 3000;

// Holat 3 soniya o'zgarmay tursa — ko'rsatiladi/yashiriladi (miltillamaydi).
function useSustained(flag) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (flag === shown) return;
    const t = setTimeout(() => setShown(flag), NOTICE_DELAY_MS);
    return () => clearTimeout(t);
  }, [flag, shown]);
  return shown;
}

function NetworkNotices({ stats, peerName, cameraOn, outgoing, onCameraOff, onLowerQuality }) {
  const { t } = useI18n();
  const localBad = useSustained(stats.local === "poor");
  const remoteBad = useSustained(Boolean(peerName) && stats.remote === "poor");
  return (
    <>
      {localBad && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-red-500 px-4 py-1.5 text-center text-xs font-semibold text-white">
          <span>{t("studyRoom.slowInternet")}</span>
          {cameraOn && outgoing !== "low" && (
            <button type="button" onClick={onLowerQuality} className="shrink-0 rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30">
              {t("studyRoom.lowerQuality")}
            </button>
          )}
          {cameraOn && (
            <button type="button" onClick={onCameraOff} className="shrink-0 rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30">
              {t("studyRoom.cameraOff")}
            </button>
          )}
        </div>
      )}
      {remoteBad && !localBad && (
        <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
          {t("studyRoom.peerSlow", { name: peerName })}
        </div>
      )}
    </>
  );
}

// Sherik ovozi. Brauzer avtomatik ijroni bloklasa — tugma chiqadi.
function RemoteAudio({ stream }) {
  const ref = useMediaRef(stream);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!stream || !ref.current) return;
    ref.current.play().then(
      () => setBlocked(false),
      () => setBlocked(true)
    );
  }, [stream, ref]);
  return (
    <>
      <audio ref={ref} autoPlay playsInline />
      {blocked && (
        <button
          type="button"
          onClick={() => ref.current?.play().then(() => setBlocked(false), () => {})}
          className="fixed bottom-24 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#087fd1] px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          <LuVolume2 size={16} /> {translate("studyRoom.enableSound")}
        </button>
      )}
    </>
  );
}

// ---------------- Xona ichi ----------------
// Desktop, doska/ekran ochiq paytda: o'ng ustunda 16:9 plitkalar.
const TILE_CLASS = "aspect-video w-full shrink-0";

function RoomView({ code, iceServers, camOn, micOn, onLeave, onEnded }) {
  const { t } = useI18n();
  const isDesktop = useIsDesktop();
  const [device] = useState(deviceInfo);
  const [constraints] = useState(() => cameraConstraints(device));
  const [quality, updateQuality] = useQualitySettings();
  const [qualityOpen, setQualityOpen] = useState(false);

  const call = useP2PCall({
    code,
    iceServers,
    initialCam: camOn,
    initialMic: micOn,
    cameraConstraints: constraints,
    outgoing: quality.outgoing,
    incoming: quality.incoming,
  });
  const { peer, stats, connection, route, clock } = call;

  useEffect(() => {
    if (call.ended) onEnded(call.ended, clock?.limitMinutes);
  }, [call.ended, clock?.limitMinutes, onEnded]);

  // "video" | "board" | "screen". Hamma qurilmada video'dan boshlanadi (Meet kabi).
  const [view, setView] = useState("video");
  const videoView = view === "video";
  const screenStream = call.remoteScreen || call.localScreen;
  const screenOwner = call.remoteScreen ? peer?.name : t("studyRoom.you");

  // Ekran ulashilsa — o'sha ko'rinishga o'tamiz; tugasa videoga qaytamiz.
  const hasScreen = Boolean(screenStream);
  useEffect(() => {
    setView((v) => (hasScreen ? "screen" : v === "screen" ? "video" : v));
  }, [hasScreen]);

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch {
      /* ruxsat berilmadi yoki ekran tanlash bekor qilindi */
    } finally {
      setBusy(false);
    }
  };

  const leave = () => {
    call.leave();
    onLeave();
  };

  const localTile = {
    stream: call.localStream,
    name: t("studyRoom.you"),
    isLocal: true,
    cam: call.cam,
    mic: call.mic,
    quality: stats.local,
    speaking: stats.speakingLocal,
  };
  const remoteTile = peer
    ? {
        stream: call.remoteVideo,
        name: peer.name,
        cam: peer.cam && Boolean(call.remoteVideo),
        mic: peer.mic,
        quality: connection === "connected" ? stats.remote : "unknown",
        speaking: stats.speakingRemote,
      }
    : null;
  const screenTile = screenStream ? { stream: screenStream, name: screenOwner, isScreen: true } : null;

  const mainArea = (
    <>
      <div className={`h-full overflow-hidden rounded-2xl bg-white ${view === "screen" && screenTile ? "hidden" : ""}`}>
        <Whiteboard code={code} />
      </div>
      {view === "screen" && screenTile && <ParticipantTile tile={screenTile} className="h-full w-full" />}
      {/* Telefonda doska/ekran ochiq bo'lsa ham sherik kichik oynada ko'rinadi. */}
      {!isDesktop && remoteTile && (
        <FloatingTile tile={remoteTile} onClick={() => setView("video")} className="bottom-3 right-3" />
      )}
    </>
  );

  const tab = (id, label, Icon) => (
    <button
      type="button"
      onClick={() => setView(id)}
      title={label}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[13px] font-semibold transition ${
        view === id ? "bg-white text-[#12213D]" : "text-white/70 hover:text-white"
      }`}
    >
      {/* Telefonda joy tor — faol tabda matn, qolganlarida faqat ikonka. */}
      <Icon size={15} /> <span className={view === id ? "" : "hidden sm:inline"}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-[#0f1b33] text-white">
      {/* Yuqori panel */}
      <header className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <div className="min-w-0">
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 sm:block">
            Study Room · Beta
          </p>
          <p className="font-mono text-sm font-bold tracking-[0.14em]">{code}</p>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
        >
          {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
          <span className="hidden sm:inline">{copied ? t("studyRoom.copied") : t("studyRoom.inviteLink")}</span>
        </button>
        {clock && <TimeLeft endsAt={clock.endsAt} />}
        {route && (
          <span
            title={
              route === "direct" ? t("studyRoom.directTitle") : t("studyRoom.viaServerTitle")
            }
            className={`hidden items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold md:inline-flex ${
              route === "direct" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${route === "direct" ? "bg-emerald-400" : "bg-amber-400"}`} />
            {route === "direct" ? t("studyRoom.direct") : t("studyRoom.viaServer")}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1 rounded-2xl bg-white/[0.06] p-1">
          {tab("video", `Video · ${peer ? 2 : 1}`, LuVideo)}
          {tab("board", t("studyRoom.board"), LuPencilLine)}
          {screenTile && tab("screen", t("studyRoom.screen"), LuMonitorUp)}
        </div>
      </header>

      {clock && <TimeWarning endsAt={clock.endsAt} limitMinutes={clock.limitMinutes} />}
      <NetworkNotices
        stats={stats}
        peerName={peer?.name}
        cameraOn={call.cam}
        outgoing={quality.outgoing}
        onCameraOff={() => run(call.toggleCam)}
        onLowerQuality={() => updateQuality({ outgoing: "low" })}
      />
      {connection === "reconnecting" && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
          {t("studyRoom.reconnecting")}
        </div>
      )}
      {peer && connection === "connecting" && (
        <div className="bg-white/10 px-4 py-1.5 text-center text-xs font-semibold text-white/80">
          {t("studyRoom.connectingWith", { name: peer.name })}
        </div>
      )}

      {/* Asosiy qism */}
      <div className="flex min-h-0 flex-1 gap-3 px-2 pb-2 sm:px-3">
        <main className={`relative min-h-0 flex-1 ${videoView ? "hidden" : ""}`}>{mainArea}</main>

        {/* Video ko'rinishi: sherik katta, o'zimiz burchakda (telefonda tik oyna). */}
        {videoView && (
          <div className="min-h-0 flex-1">
            <VideoStage local={localTile} remote={remoteTile} wide={isDesktop} />
          </div>
        )}
        {isDesktop && !videoView && (
          <aside className="flex min-h-0 w-[300px] flex-col gap-3 overflow-y-auto xl:w-[340px]">
            <ParticipantTile tile={localTile} className={TILE_CLASS} />
            {remoteTile ? <ParticipantTile tile={remoteTile} className={TILE_CLASS} /> : <WaitingTile className={TILE_CLASS} />}
          </aside>
        )}
      </div>

      {/* Boshqaruv paneli */}
      <footer className="flex items-center justify-center gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <RoundButton
          active={call.mic}
          onClick={call.toggleMic}
          title={call.mic ? t("studyRoom.micOff") : t("studyRoom.micOn")}
        >
          {call.mic ? <LuMic size={20} /> : <LuMicOff size={20} />}
        </RoundButton>
        <RoundButton
          active={call.cam}
          onClick={() => run(call.toggleCam)}
          title={call.cam ? t("studyRoom.camOff") : t("studyRoom.camOn")}
        >
          {call.cam ? <LuVideo size={20} /> : <LuVideoOff size={20} />}
        </RoundButton>
        {canScreenShare && (
          <RoundButton
            active
            onClick={() => run(call.toggleScreen)}
            disabled={Boolean(call.remoteScreen)}
            title={call.screenOn ? t("studyRoom.stopShare") : t("studyRoom.share")}
          >
            {call.screenOn ? <LuMonitorX size={20} className="text-sky-300" /> : <LuMonitorUp size={20} />}
          </RoundButton>
        )}
        <div className="relative">
          <RoundButton active data-quality-toggle onClick={() => setQualityOpen((v) => !v)} title={t("studyRoom.quality")}>
            <LuSettings2 size={20} className={qualityOpen ? "text-sky-300" : ""} />
          </RoundButton>
          {qualityOpen && (
            <QualityPanel
              incoming={quality.incoming}
              outgoing={quality.outgoing}
              onIncoming={(id) => updateQuality({ incoming: id })}
              onOutgoing={(id) => updateQuality({ outgoing: id })}
              applying={false}
              onClose={() => setQualityOpen(false)}
            />
          )}
        </div>
        <RoundButton danger onClick={leave} title={t("studyRoom.leave")}>
          <LuPhoneOff size={20} />
        </RoundButton>
      </footer>

      <RemoteAudio stream={call.remoteAudio} />
    </div>
  );
}

// ---------------- Dars tugadi / xonaga kirib bo'lmadi ----------------
function EndScreen({ title, message }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F7FB] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_20px_50px_-24px_rgba(18,33,61,0.35)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <LuAlarmClock size={26} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-[#12213D]">{title}</h1>
        <p className="mt-2 text-sm text-[#12213D]/55">{message}</p>
        <Button to="/study-room" className="mt-6 w-full">
          {t("studyRoom.backToLobby")}
        </Button>
      </div>
    </div>
  );
}

const END_TEXT = {
  "time-up": (min) => [translate("studyRoom.end.timeUp"), translate("studyRoom.end.timeUpText", { min: min || 40 })],
  replaced: () => [translate("studyRoom.end.replaced"), translate("studyRoom.end.replacedText")],
  full: () => [translate("studyRoom.end.full"), translate("studyRoom.end.fullText")],
  "not-found": () => [translate("studyRoom.end.notFound"), translate("studyRoom.end.notFoundText")],
};

// ---------------- Sahifa ----------------
export default function StudyRoom() {
  const { code: rawCode } = useParams();
  const code = String(rawCode || "").toUpperCase();
  const navigate = useNavigate();

  const [conn, setConn] = useState(null); // { iceServers, camOn, micOn }
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [end, setEnd] = useState(null); // [title, message]

  const join = async ({ camOn, micOn }) => {
    setJoining(true);
    setError("");
    try {
      const { iceServers } = await api.post(`/study-room/${code}/join`);
      setConn({ iceServers, camOn, micOn });
    } catch (err) {
      if (err.code === "study-room/time-up") {
        setEnd([translate("studyRoom.end.timeUp"), `${err.message} ${translate("studyRoom.end.timeUpSuffix")}`]);
      }
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const onEnded = useRef((reason, min) => setEnd((END_TEXT[reason] || END_TEXT["not-found"])(min))).current;

  if (end) return <EndScreen title={end[0]} message={end[1]} />;
  if (!conn) return <PreJoin code={code} onJoin={join} joining={joining} error={error} />;

  return (
    <RoomView
      code={code}
      iceServers={conn.iceServers}
      camOn={conn.camOn}
      micOn={conn.micOn}
      onLeave={() => navigate("/study-room")}
      onEnded={onEnded}
    />
  );
}
