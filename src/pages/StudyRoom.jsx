import { useEffect, useRef, useState } from "react";
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
import { ConnectionQuality, ConnectionState, DisconnectReason, ScreenSharePresets, Track, VideoPresets } from "livekit-client";
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
} from "react-icons/lu";
import { api } from "../api/client";
import { Button } from "../components/ui";
import Whiteboard from "../components/studyRoom/Whiteboard";

// ------------------------------------------------------------------
// Study Room — ikki talaba uchun video dars xonasi.
//   Video/ovoz/ekran: LiveKit Cloud (token: POST /api/study-room/:code/token)
//   Doska: Socket.IO (components/studyRoom/Whiteboard.jsx)
//
// Qotmaslik uchun: adaptiveStream (ko'rinadigan o'lchamga mos sifat),
// dynacast (hech kim ko'rmayotgan sifat qatlami yuborilmaydi), simulcast,
// kamera 360p, ekran 1080p/15fps ("detail" — matn tiniq qoladi).
// ------------------------------------------------------------------

const ROOM_OPTIONS = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: { resolution: VideoPresets.h360.resolution },
  audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [VideoPresets.h180],
    screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
    dtx: true,
    red: true,
  },
};

const canScreenShare = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

// ---------------- Kirishdan oldin: kamera/mikrofon tekshiruvi ----------------
function PreJoin({ code, onJoin, joining, error }) {
  const videoRef = useRef(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!camOn) return;
    let stream;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 640, height: 360 } })
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
  }, [camOn]);

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
          <div className="relative aspect-video bg-[#12213D]">
            {camOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
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

function RoundButton({ active, danger, onClick, title, children, disabled }) {
  return (
    <button
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

function ParticipantTile({ trackRef, className = "" }) {
  const participant = trackRef.participant;
  const speaking = useIsSpeaking(participant);
  const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;
  const name = participant.name || participant.identity;
  const isScreen = trackRef.source === Track.Source.ScreenShare;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#1b2c4d] ring-2 transition ${
        speaking && !isScreen ? "ring-emerald-400" : "ring-transparent"
      } ${className}`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className={`h-full w-full ${isScreen ? "object-contain" : "object-cover"} ${
            participant.isLocal && !isScreen ? "-scale-x-100" : ""
          }`}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#087fd1] font-display text-2xl font-bold text-white">
            {name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}
      <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
        <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-black/45 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
          {!isScreen && !participant.isMicrophoneEnabled && <LuMicOff size={12} className="shrink-0 text-red-300" />}
          <span className="truncate">
            {isScreen ? `${name} — ekran` : name}
            {participant.isLocal && " (siz)"}
          </span>
        </span>
        {!isScreen && (
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

function TimeLeft({ remaining }) {
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

// ---------------- Xona ichi ----------------
function RoomView({ code, endsAt, limitMinutes, onLeave }) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]).filter(isTrackReference);
  const screen = screenTracks[0];

  // Mobil: "board" | "video" | "screen";  desktop asosiy maydon: "board" | "screen".
  const [view, setView] = useState("board");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const remaining = useRemaining(endsAt);

  // Yangi ekran ulashilsa — avtomatik o'sha ko'rinishga o'tamiz; tugasa doskaga qaytamiz.
  const screenSid = screen?.publication.trackSid;
  useEffect(() => {
    setView((v) => (screenSid ? "screen" : v === "screen" ? "board" : v));
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
        <ParticipantTile key={`${t.participant.identity}-cam`} trackRef={t} className="aspect-video w-full" />
      ))}
      {participants.length < 2 && <WaitingTile className="aspect-video w-full" />}
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
    </>
  );

  const tab = (id, label, Icon) => (
    <button
      type="button"
      onClick={() => setView(id)}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-semibold transition ${
        view === id ? "bg-white text-[#12213D]" : "text-white/70 hover:text-white"
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-[#0f1b33] text-white">
      {/* Yuqori panel */}
      <header className="flex items-center gap-3 px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Study Room · Beta</p>
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
        <TimeLeft remaining={remaining} />
        <div className="ml-auto flex items-center gap-1 rounded-2xl bg-white/[0.06] p-1">
          {tab("board", "Doska", LuPencilLine)}
          {screen && tab("screen", "Ekran", LuMonitorUp)}
          <span className="lg:hidden">{tab("video", `Video (${participants.length})`, LuVideo)}</span>
        </div>
      </header>

      {remaining > 0 && remaining <= WARN_MS && (
        <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
          Dars vaqti ({limitMinutes} daqiqa) tugashiga {Math.ceil(remaining / 60_000)} daqiqa qoldi. Doskani saqlab
          qo'ying.
        </div>
      )}
      {connectionState === ConnectionState.Reconnecting && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-[#12213D]">
          Aloqa uzildi — qayta ulanmoqda…
        </div>
      )}

      {/* Asosiy qism */}
      <div className="flex min-h-0 flex-1 gap-3 px-2 pb-2 sm:px-3">
        <main className={`min-h-0 flex-1 ${view === "video" ? "hidden lg:block" : ""}`}>{mainArea}</main>

        {/* Desktop: o'ng ustunda videolar. Mobil: "Video" tabida to'liq ekran. */}
        <aside
          className={`min-h-0 flex-col gap-3 overflow-y-auto lg:flex lg:w-[300px] xl:w-[340px] ${
            view === "video" ? "flex w-full" : "hidden"
          }`}
        >
          {tiles}
        </aside>
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
          onClick={() => toggle(() => localParticipant.setCameraEnabled(!isCameraEnabled))}
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
      options={ROOM_OPTIONS}
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
