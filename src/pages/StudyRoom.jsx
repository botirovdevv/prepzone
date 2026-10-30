import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VideoTrack,
  isTrackReference,
  useConnectionQualityIndicator,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { ConnectionQuality, ConnectionState, DisconnectReason, ScreenSharePresets, Track } from "livekit-client";
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
} from "react-icons/lu";
import { api } from "../api/client";
import { Button } from "../components/ui";
import Whiteboard from "../components/studyRoom/Whiteboard";
import { QualityPanel } from "../components/studyRoom/QualitySettings";
import { INCOMING_QUALITY, loadQuality, outgoingProfile, useQualitySettings } from "../components/studyRoom/quality";

// ------------------------------------------------------------------
// Study Room — ikki talaba uchun video dars xonasi.
//   Video/ovoz/ekran: o'z LiveKit serverimiz (token: POST /api/study-room/:code/token)
//   Doska: Socket.IO (components/studyRoom/Whiteboard.jsx)
//
// Sifat va qotmaslik uchun: adaptiveStream (ekran zichligiga mos sifat qatlami),
// dynacast (hech kim ko'rmayotgan qatlam yuborilmaydi), simulcast, ekran
// 1080p/15fps ("detail" — matn tiniq qoladi). Telefonda Meet uslubidagi tik
// (9:16) ko'rinish; internet sekinlashsa foydalanuvchiga aytiladi.
// ------------------------------------------------------------------

// Telefon/planshet: asosiy kiritish — barmoq.
function isPhone() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(pointer: coarse)").matches);
}

function isPortraitPhone() {
  return isPhone() && Boolean(window.matchMedia?.("(orientation: portrait)").matches);
}

// Kameradan kadr nisbatini (aspectRatio) majburlamasdan so'raymiz: aks holda
// tik ushlangan telefon keng kadr berish uchun sensor o'rtasini kesib oladi va
// tasvir juda yaqin (zoom) bo'lib qoladi. Profillar: components/studyRoom/quality.js.
function cameraProfile(outgoing = loadQuality().outgoing) {
  return outgoingProfile(outgoing, { phone: isPhone(), portrait: isPortraitPhone() });
}

// LiveKit'ga beriladigan kamera sozlamalari (yoqish/qayta e'lon qilishda ham).
function cameraOptions(profile) {
  return {
    capture: { resolution: profile.resolution, facingMode: "user" },
    publish: {
      videoCodec: profile.codec,
      ...(profile.scalabilityMode && { scalabilityMode: profile.scalabilityMode, backupCodec: { codec: "vp8" } }),
      simulcast: profile.simulcast,
      videoEncoding: profile.encoding,
      // Qatlamlar kadrning qisqa tomoniga qarab hisoblanadi — tik video ham to'g'ri.
      videoSimulcastLayers: profile.layers,
      degradationPreference: "balanced",
    },
  };
}

// Xonaga kirish paytida (telefonning o'sha paytdagi holatiga qarab) quriladi.
function buildRoomOptions() {
  const camera = cameraOptions(cameraProfile());
  return {
    // "screen" — telefonning haqiqiy piksel zichligi hisobga olinadi (aks holda
    // kichik plitka uchun 180p tanlanib, video xira ko'rinadi).
    adaptiveStream: { pixelDensity: "screen" },
    dynacast: true,
    videoCaptureDefaults: camera.capture,
    audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    publishDefaults: {
      ...camera.publish,
      screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
      dtx: true,
      red: true,
    },
  };
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

const canScreenShare = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

// ---------------- Kirishdan oldin: kamera/mikrofon tekshiruvi ----------------
function PreJoin({ code, onJoin, joining, error }) {
  const videoRef = useRef(null);
  const [profile] = useState(() => cameraProfile());
  const portrait = profile.resolution.height > profile.resolution.width;
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!camOn) return;
    let stream;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          width: { ideal: profile.resolution.width },
          height: { ideal: profile.resolution.height },
          facingMode: "user",
        },
      })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        setMediaError("");
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {
        setMediaError("Kameraga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering yoki kamerasiz kiring.");
        setCamOn(false);
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camOn, profile]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F7FB] px-4 py-8">
      <div className="w-full max-w-xl">
        <Link
          to="/study-room"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#12213D]/55 hover:text-[#12213D]"
        >
          <LuArrowLeft size={16} /> Orqaga
        </Link>
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-24px_rgba(18,33,61,0.35)]">
          {/* Telefonda oldindan ko'rish ham tik (9:16) — yuboriladigan kadrning o'zi. */}
          <div
            className={`relative mx-auto bg-[#12213D] ${portrait ? "aspect-[9/16] h-[58dvh] max-w-full" : "aspect-video"}`}
          >
            {camOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/60">
                <LuVideoOff size={40} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
              <RoundButton active={micOn} onClick={() => setMicOn((v) => !v)} title="Mikrofon">
                {micOn ? <LuMic size={20} /> : <LuMicOff size={20} />}
              </RoundButton>
              <RoundButton active={camOn} onClick={() => setCamOn((v) => !v)} title="Kamera">
                {camOn ? <LuVideo size={20} /> : <LuVideoOff size={20} />}
              </RoundButton>
            </div>
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087fd1]">Study Room</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-[#12213D]">
              Xona <span className="font-mono tracking-[0.12em]">{code}</span>
            </h1>
            <p className="mt-1 text-sm text-[#12213D]/55">Kamera va mikrofonni tekshirib, xonaga kiring.</p>
            {(mediaError || error) && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error || mediaError}</p>
            )}
            <Button className="mt-5 w-full" size="lg" onClick={() => onJoin({ camOn, micOn })} disabled={joining}>
              {joining ? <LuLoaderCircle size={18} className="animate-spin" /> : <LuUsers size={18} />}
              {joining ? "Ulanmoqda…" : "Xonaga kirish"}
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
function QualityBars({ participant }) {
  const { quality } = useConnectionQualityIndicator({ participant });
  const level =
    quality === ConnectionQuality.Excellent ? 3 : quality === ConnectionQuality.Good ? 2 : quality === ConnectionQuality.Poor ? 1 : 0;
  const color = level >= 2 ? "bg-emerald-400" : level === 1 ? "bg-amber-400" : "bg-red-400";
  return (
    <span className="flex items-end gap-[2px]" title="Aloqa sifati">
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

// compact — kichik suzuvchi oyna (faqat ism va mikrofon belgisi);
// forceCover — kadrni doim to'ldiradi (o'z kichik oynamiz uchun).
function ParticipantTile({ trackRef, className = "", compact = false, forceCover = false }) {
  const participant = trackRef.participant;
  const speaking = useIsSpeaking(participant);
  const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;
  const name = participant.name || participant.identity;
  const isScreen = trackRef.source === Track.Source.ScreenShare;
  const { boxRef, onVideoSize, cover } = useVideoFit();

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden rounded-2xl bg-[#1b2c4d] ring-2 transition ${
        speaking && !isScreen ? "ring-emerald-400" : "ring-transparent"
      } ${className}`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          onLoadedMetadata={onVideoSize}
          onResize={onVideoSize}
          className={`h-full w-full ${(cover || forceCover) && !isScreen ? "object-cover" : "object-contain"} ${
            participant.isLocal && !isScreen ? "-scale-x-100" : ""
          }`}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span
            className={`flex items-center justify-center rounded-full bg-[#087fd1] font-display font-bold text-white ${
              compact ? "h-9 w-9 text-base" : "h-16 w-16 text-2xl"
            }`}
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}
      <div className={`absolute flex items-center gap-2 ${compact ? "inset-x-1 bottom-1" : "inset-x-2 bottom-2"}`}>
        <span
          className={`flex min-w-0 items-center gap-1.5 rounded-lg bg-black/45 font-semibold text-white backdrop-blur ${
            compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
          }`}
        >
          {!isScreen && !participant.isMicrophoneEnabled && <LuMicOff size={12} className="shrink-0 text-red-300" />}
          <span className="truncate">
            {isScreen ? `${name} — ekran` : name}
            {participant.isLocal && " (siz)"}
          </span>
        </span>
        {!isScreen && !compact && (
          <span className="ml-auto rounded-lg bg-black/45 px-1.5 py-1 backdrop-blur">
            <QualityBars participant={participant} />
          </span>
        )}
      </div>
    </div>
  );
}

function WaitingTile({ className = "" }) {
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
      <p className="text-sm font-semibold text-white/70">Sherigingiz kutilmoqda</p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
      >
        {copied ? <LuCheck size={14} /> : <LuCopy size={14} />} {copied ? "Nusxalandi" : "Linkni nusxalash"}
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
      title="Dars uchun qolgan vaqt"
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
      Dars vaqti ({limitMinutes} daqiqa) tugashiga {Math.ceil(remaining / 60_000)} daqiqa qoldi. Doskani saqlab
      qo'ying.
    </div>
  );
}

// ---------------- Video ko'rinishi (Meet uslubi) ----------------
// Kichik suzuvchi oyna — bosilsa onClick. Telefonda tik (9:16), kompyuterda keng (16:9).
function FloatingTile({ trackRef, onClick, wide = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Videoni almashtirish"
      className={`absolute z-20 overflow-hidden rounded-2xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/20 ${
        wide ? "aspect-video w-[240px]" : "aspect-[9/16] w-[28vw] max-w-[132px]"
      } ${className}`}
    >
      <ParticipantTile trackRef={trackRef} className="h-full w-full" compact forceCover={trackRef.participant.isLocal} />
    </button>
  );
}

// Sherik katta (adaptiveStream to'liq 720p qatlamni so'raydi), o'zimiz burchakda
// kichik oynada (bosilsa o'rin almashadi). Sherik hali kirmagan bo'lsa — o'zimiz katta.
function VideoStage({ cameraTracks, wide }) {
  const [swapped, setSwapped] = useState(false);
  const local = cameraTracks.find((t) => t.participant.isLocal);
  const remote = cameraTracks.find((t) => !t.participant.isLocal);
  const big = remote && !swapped ? remote : local;
  const small = remote ? (swapped ? remote : local) : null;

  return (
    <div className="relative h-full w-full">
      {big && <ParticipantTile trackRef={big} className="h-full w-full" />}
      {small && (
        <FloatingTile trackRef={small} wide={wide} onClick={() => setSwapped((v) => !v)} className="right-3 top-3" />
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

const isBad = (q) => q === ConnectionQuality.Poor || q === ConnectionQuality.Lost;

function LocalNetworkNotice({ participant, cameraOn, onCameraOff, onLowerQuality }) {
  const { quality } = useConnectionQualityIndicator({ participant });
  if (!useSustained(isBad(quality))) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-red-500 px-4 py-1.5 text-center text-xs font-semibold text-white">
      <span>Internetingiz sekin — video qotishi yoki xiralashishi mumkin.</span>
      {cameraOn && onLowerQuality && (
        <button type="button" onClick={onLowerQuality} className="shrink-0 rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30">
          Sifatni pasaytirish
        </button>
      )}
      {cameraOn && (
        <button type="button" onClick={onCameraOff} className="shrink-0 rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30">
          Kamerani o'chirish
        </button>
      )}
    </div>
  );
}

function RemoteNetworkNotice({ participant }) {
  const { quality } = useConnectionQualityIndicator({ participant });
  if (!useSustained(isBad(quality))) return null;
  return (
    <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
      {participant.name || "Sherigingiz"}ning interneti sekin — uning videosi qotishi mumkin.
    </div>
  );
}

// ---------------- Xona ichi ----------------
// Desktop, doska/ekran ochiq paytda: o'ng ustunda 16:9 plitkalar.
const TILE_CLASS = "aspect-video w-full shrink-0";
function RoomView({ code, endsAt, limitMinutes, onLeave }) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]).filter(isTrackReference);
  const screen = screenTracks[0];
  const remoteCamera = cameraTracks.find((t) => !t.participant.isLocal);
  const remoteParticipant = participants.find((p) => !p.isLocal);
  const isDesktop = useIsDesktop();

  // "video" | "board" | "screen". Hamma qurilmada video'dan boshlanadi (Meet kabi):
  // sherik katta ko'rinsa, adaptiveStream to'liq sifatli qatlamni so'raydi.
  // Doska/ekran ochiq bo'lsa — desktopda videolar o'ng ustunda, telefonda burchakda.
  const [view, setView] = useState("video");
  const videoView = view === "video";

  // ---------------- Video sifati ----------------
  const [quality, updateQuality] = useQualitySettings();
  const [qualityOpen, setQualityOpen] = useState(false);
  const [applyingOutgoing, setApplyingOutgoing] = useState(false);

  // Ko'radigan sifat: sherik kamerasining eng yuqori qatlami. Sherik qayta
  // ulanganda (yangi track) ham qayta qo'llanadi.
  const remotePub = remoteCamera && isTrackReference(remoteCamera) ? remoteCamera.publication : null;
  const remoteSubscribed = remotePub?.isSubscribed;
  useEffect(() => {
    if (remotePub && remoteSubscribed) remotePub.setVideoQuality(INCOMING_QUALITY[quality.incoming]);
  }, [remotePub, remoteSubscribed, quality.incoming]);

  // Yuboradigan sifat: kamerani yangi o'lcham/bitreyt bilan qayta e'lon qilamiz
  // (eski e'lon olib tashlanmasa LiveKit uni eski sozlama bilan qayta yoqadi).
  const applyOutgoing = async (id) => {
    if (applyingOutgoing) return;
    updateQuality({ outgoing: id });
    setApplyingOutgoing(true);
    try {
      const wasOn = localParticipant.isCameraEnabled;
      const pub = localParticipant.getTrackPublication(Track.Source.Camera);
      if (pub?.track) await localParticipant.unpublishTrack(pub.track);
      if (wasOn) {
        const camera = cameraOptions(cameraProfile(id));
        await localParticipant.setCameraEnabled(true, camera.capture, camera.publish);
      }
    } catch {
      /* kamera ruxsati yo'q — keyingi yoqishda yangi sozlama ishlaydi */
    } finally {
      setApplyingOutgoing(false);
    }
  };

  const setCamera = (on) => {
    const camera = cameraOptions(cameraProfile(quality.outgoing));
    return localParticipant.setCameraEnabled(on, camera.capture, camera.publish);
  };
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Yangi ekran ulashilsa — avtomatik o'sha ko'rinishga o'tamiz; tugasa videoga qaytamiz.
  const screenSid = screen?.publication.trackSid;
  useEffect(() => {
    setView((v) => (screenSid ? "screen" : v === "screen" ? "video" : v));
  }, [screenSid]);

  const toggle = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch {
      /* foydalanuvchi ruxsat bermadi yoki ekran tanlashni bekor qildi */
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const leave = async () => {
    await room.disconnect();
    onLeave();
  };

  const tiles = (
    <>
      {cameraTracks.map((t) => (
        <ParticipantTile key={`${t.participant.identity}-cam`} trackRef={t} className={TILE_CLASS} />
      ))}
      {participants.length < 2 && <WaitingTile className={TILE_CLASS} />}
    </>
  );

  // Doska yashirilganda ham DOM'da qoladi — tab almashganda qayta ulanmaydi.
  const showScreen = view === "screen" && screen;
  const mainArea = (
    <>
      <div className={`h-full overflow-hidden rounded-2xl bg-white ${showScreen ? "hidden" : ""}`}>
        <Whiteboard code={code} />
      </div>
      {showScreen && <ParticipantTile trackRef={screen} className="h-full w-full" />}
      {/* Telefonda doska/ekran ochiq bo'lsa ham sherik kichik oynada ko'rinadi. */}
      {!isDesktop && !videoView && remoteCamera && (
        <FloatingTile trackRef={remoteCamera} onClick={() => setView("video")} className="bottom-3 right-3" />
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
          <span className="hidden sm:inline">{copied ? "Nusxalandi" : "Taklif linki"}</span>
        </button>
        <TimeLeft endsAt={endsAt} />
        <div className="ml-auto flex items-center gap-1 rounded-2xl bg-white/[0.06] p-1">
          {tab("video", `Video · ${participants.length}`, LuVideo)}
          {tab("board", "Doska", LuPencilLine)}
          {screen && tab("screen", "Ekran", LuMonitorUp)}
        </div>
      </header>

      <TimeWarning endsAt={endsAt} limitMinutes={limitMinutes} />
      <LocalNetworkNotice
        participant={localParticipant}
        cameraOn={isCameraEnabled}
        onCameraOff={() => toggle(() => setCamera(false))}
        onLowerQuality={quality.outgoing !== "low" ? () => applyOutgoing("low") : undefined}
      />
      {remoteParticipant && <RemoteNetworkNotice participant={remoteParticipant} />}
      {connectionState === ConnectionState.Reconnecting && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
          Aloqa uzildi — qayta ulanmoqda…
        </div>
      )}

      {/* Asosiy qism */}
      <div className="flex min-h-0 flex-1 gap-3 px-2 pb-2 sm:px-3">
        <main className={`relative min-h-0 flex-1 ${videoView ? "hidden" : ""}`}>{mainArea}</main>

        {/* Video ko'rinishi: sherik katta, o'zimiz burchakda (telefonda tik oyna). */}
        {videoView && (
          <div className="min-h-0 flex-1">
            <VideoStage cameraTracks={cameraTracks} wide={isDesktop} />
          </div>
        )}
        {isDesktop && !videoView && (
          <aside className="flex min-h-0 w-[300px] flex-col gap-3 overflow-y-auto xl:w-[340px]">{tiles}</aside>
        )}
      </div>

      {/* Boshqaruv paneli */}
      <footer className="flex items-center justify-center gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <RoundButton
          active={isMicrophoneEnabled}
          onClick={() => toggle(() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled))}
          title={isMicrophoneEnabled ? "Mikrofonni o'chirish" : "Mikrofonni yoqish"}
        >
          {isMicrophoneEnabled ? <LuMic size={20} /> : <LuMicOff size={20} />}
        </RoundButton>
        <RoundButton
          active={isCameraEnabled}
          onClick={() => toggle(() => setCamera(!isCameraEnabled))}
          title={isCameraEnabled ? "Kamerani o'chirish" : "Kamerani yoqish"}
        >
          {isCameraEnabled ? <LuVideo size={20} /> : <LuVideoOff size={20} />}
        </RoundButton>
        {canScreenShare && (
          <RoundButton
            active
            onClick={() =>
              toggle(() =>
                localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
                  audio: false,
                  contentHint: "detail",
                  resolution: ScreenSharePresets.h1080fps15.resolution,
                })
              )
            }
            disabled={Boolean(screen && !screen.participant.isLocal)}
            title={isScreenShareEnabled ? "Ulashishni to'xtatish" : "Ekranni ulashish"}
          >
            {isScreenShareEnabled ? <LuMonitorX size={20} className="text-sky-300" /> : <LuMonitorUp size={20} />}
          </RoundButton>
        )}
        <div className="relative">
          <RoundButton
            active
            data-quality-toggle
            onClick={() => setQualityOpen((v) => !v)}
            title="Video sifati"
          >
            <LuSettings2 size={20} className={qualityOpen ? "text-sky-300" : ""} />
          </RoundButton>
          {qualityOpen && (
            <QualityPanel
              incoming={quality.incoming}
              outgoing={quality.outgoing}
              onIncoming={(id) => updateQuality({ incoming: id })}
              onOutgoing={applyOutgoing}
              applying={applyingOutgoing}
              onClose={() => setQualityOpen(false)}
            />
          )}
        </div>
        <RoundButton danger onClick={leave} title="Chiqish">
          <LuPhoneOff size={20} />
        </RoundButton>
      </footer>

      <RoomAudioRenderer />
      {/* Brauzer ovozni avtomatik yoqishga ruxsat bermasa — tugma chiqadi. */}
      <StartAudio
        label="Ovozni yoqish"
        className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#087fd1] px-4 py-2 text-sm font-semibold text-white shadow-lg"
      />
    </div>
  );
}

// ---------------- Vaqt tugadi ----------------
function TimeUp({ message }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F7FB] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_20px_50px_-24px_rgba(18,33,61,0.35)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <LuAlarmClock size={26} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-[#12213D]">Dars vaqti tugadi</h1>
        <p className="mt-2 text-sm text-[#12213D]/55">
          {message} Davom ettirish uchun yangi xona oching.
        </p>
        <Button to="/study-room" className="mt-6 w-full">
          Study Room'ga qaytish
        </Button>
      </div>
    </div>
  );
}

// ---------------- Sahifa ----------------
export default function StudyRoom() {
  const { code: rawCode } = useParams();
  const code = String(rawCode || "").toUpperCase();
  const navigate = useNavigate();

  const [conn, setConn] = useState(null); // { token, url, endsAt, limitMinutes, camOn, micOn }
  const [timeUp, setTimeUp] = useState(""); // xona vaqti tugagan bo'lsa — xabar
  // Kamera sozlamalari xonaga kirish paytidagi telefon holatiga qarab.
  const roomOptions = useMemo(() => (conn ? buildRoomOptions() : null), [conn]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const join = async ({ camOn, micOn }) => {
    setJoining(true);
    setError("");
    try {
      const { token, url, endsAt, limitMinutes } = await api.post(`/study-room/${code}/token`);
      setConn({ token, url, endsAt, limitMinutes, camOn, micOn });
    } catch (err) {
      if (err.code === "study-room/time-up") setTimeUp(err.message);
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (timeUp) return <TimeUp message={timeUp} />;
  if (!conn) return <PreJoin code={code} onJoin={join} joining={joining} error={error} />;

  return (
    <LiveKitRoom
      serverUrl={conn.url}
      token={conn.token}
      connect
      video={conn.camOn}
      audio={conn.micOn}
      options={roomOptions}
      onError={(err) => setError(err.message)}
      onDisconnected={(reason) => {
        // Server xona vaqti tugaganda xonani o'chiradi.
        if (reason === DisconnectReason.ROOM_DELETED || Date.now() >= conn.endsAt) setTimeUp(`Bitta dars ${conn.limitMinutes} daqiqa davom etadi.`);
        setConn(null);
      }}
    >
      <RoomView
        code={code}
        endsAt={conn.endsAt}
        limitMinutes={conn.limitMinutes}
        onLeave={() => navigate("/study-room")}
      />
    </LiveKitRoom>
  );
}
