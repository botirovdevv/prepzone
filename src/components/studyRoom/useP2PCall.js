import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "../../api/socket";
import { outgoingEncoding } from "./quality";

// ------------------------------------------------------------------
// Study Room qo'ng'irog'i: ikki brauzer orasida to'g'ridan-to'g'ri WebRTC
// (Google Meet'ning ikki kishilik qo'ng'iroqlari kabi). Media server orqali
// o'tmaydi — talabalar bir shaharda bo'lsa video mamlakat ichida qoladi.
// To'g'ridan-to'g'ri ulanib bo'lmasa brauzer o'zi TURN relay'ni tanlaydi.
// Signal (offer/answer/ICE) Socket.IO orqali (server/src/lib/realtime.js).
//
// Soddalik va ishonchlilik uchun:
//  - doim 3 ta transceiver: [audio, kamera, ekran]. Kamera/ekran yoqilib-
//    o'chirilganda faqat replaceTrack — qayta kelishuv (renegotiation) kerak
//    emas, shuning uchun "glare" (ikkala tomon bir vaqtda offer) bo'lmaydi;
//  - offer'ni doim socket id'si kichik tomon yuboradi ("offerer"), ICE
//    qayta ishga tushirish ham faqat u orqali.
// ------------------------------------------------------------------

const STATS_MS = 2000;
const RESTART_AFTER_MS = 3000;

const isPhoneDevice = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(pointer: coarse)").matches);

// Qabul qilish uchun kodek tartibi. Sherik telefon bo'lsa — u arzon (apparat)
// kodlaydigan VP8/H.264 ni so'raymiz; kompyuterdan esa tiniqroq VP9.
function preferCodecs(transceiver, peerIsPhone) {
  const caps = RTCRtpReceiver.getCapabilities?.("video");
  if (!caps || !transceiver.setCodecPreferences) return;
  const order = peerIsPhone ? ["video/VP8", "video/H264", "video/VP9"] : ["video/VP9", "video/VP8", "video/H264"];
  const rank = (c) => {
    const i = order.indexOf(c.mimeType);
    return i === -1 ? order.length : i;
  };
  try {
    transceiver.setCodecPreferences([...caps.codecs].sort((a, b) => rank(a) - rank(b)));
  } catch {
    /* eski brauzer — standart tartib */
  }
}

// Chrome tarmoq tezligini past (~300 kbps) baholashdan boshlab sekin oshiradi —
// qo'ng'iroqning birinchi o'nlab soniyasi xira. Jitsi kabi boshlang'ich
// bitreytni SDP orqali yuqoriroq beramiz (boshqa brauzerlar e'tiborsiz qoldiradi).
const START_BITRATE_KBPS = 1200;
function withStartBitrate(desc) {
  if (!desc?.sdp) return desc;
  const EOL = "\r\n";
  const lines = desc.sdp.split(EOL);
  const pts = new Set();
  for (const l of lines) {
    const m = l.match(/^a=rtpmap:(\d+) (VP8|VP9|H264|AV1)\//i);
    if (m) pts.add(m[1]);
  }
  const hasFmtp = new Set();
  const out = lines.map((l) => {
    const m = l.match(/^a=fmtp:(\d+) (.*)$/);
    if (m && pts.has(m[1])) {
      hasFmtp.add(m[1]);
      return l.includes("x-google-start-bitrate") ? l : `${l};x-google-start-bitrate=${START_BITRATE_KBPS}`;
    }
    return l;
  });
  // fmtp qatori yo'q kodeklar (masalan VP8) uchun — rtpmap'dan keyin qo'shamiz.
  const final = [];
  for (const l of out) {
    final.push(l);
    const m = l.match(/^a=rtpmap:(\d+) /);
    if (m && pts.has(m[1]) && !hasFmtp.has(m[1])) final.push(`a=fmtp:${m[1]} x-google-start-bitrate=${START_BITRATE_KBPS}`);
  }
  return { type: desc.type, sdp: final.join(EOL) };
}

async function setSenderParams(sender, { maxBitrate, scaleResolutionDownBy, maxFramerate, degradation }) {
  if (!sender?.track) return;
  try {
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    const enc = params.encodings[0];
    enc.maxBitrate = maxBitrate;
    if (scaleResolutionDownBy) enc.scaleResolutionDownBy = scaleResolutionDownBy;
    if (maxFramerate) enc.maxFramerate = maxFramerate;
    if (degradation) params.degradationPreference = degradation;
    await sender.setParameters(params);
  } catch {
    /* ba'zi brauzerlar ayrim maydonlarni qo'llamaydi */
  }
}

function qualityFrom(lossPct, rttMs) {
  if (lossPct == null && rttMs == null) return "unknown";
  if ((lossPct ?? 0) >= 12 || (rttMs ?? 0) >= 700) return "poor";
  if ((lossPct ?? 0) >= 4 || (rttMs ?? 0) >= 300) return "good";
  return "excellent";
}

export default function useP2PCall({ code, iceServers, initialCam, initialMic, cameraConstraints, outgoing, incoming }) {
  const [localStream, setLocalStream] = useState(null);
  const [localScreen, setLocalScreen] = useState(null);
  const [remoteVideo, setRemoteVideo] = useState(null);
  const [remoteAudio, setRemoteAudio] = useState(null);
  const [remoteScreen, setRemoteScreen] = useState(null);
  const [peer, setPeer] = useState(null); // { id, name, phone, mic, cam, screen }
  const [connection, setConnection] = useState("joining"); // joining|waiting|connecting|connected|reconnecting
  const [route, setRoute] = useState(null); // direct | relay
  const [stats, setStats] = useState({ local: "unknown", remote: "unknown", speakingLocal: false, speakingRemote: false });
  const [mic, setMic] = useState(initialMic);
  const [cam, setCam] = useState(initialCam);
  const [ended, setEnded] = useState(null); // null | "time-up" | "replaced" | "full" | "not-found"
  const [clock, setClock] = useState(null); // { endsAt, limitMinutes }

  const pcRef = useRef(null);
  const sessionRef = useRef(null); // joriy pc sessiyasi id'si — eski signallar tashlanadi
  const selfIdRef = useRef(null);
  const peerRef = useRef(null);
  const localRef = useRef(null); // MediaStream (audio + kamera)
  const screenRef = useRef(null);
  const pendingIce = useRef([]);
  const restartTimer = useRef(null);
  const peerQualityRef = useRef("auto"); // sherik so'ragan eng yuqori sifat
  const outgoingRef = useRef(outgoing);
  const stateRef = useRef({ mic: initialMic, cam: initialCam });
  outgoingRef.current = outgoing;

  const socket = getSocket();
  const isOfferer = () => Boolean(peerRef.current && selfIdRef.current && selfIdRef.current < peerRef.current.id);
  const signal = (msg) => socket.emit("call:signal", { ...msg, sid: sessionRef.current });
  const sendState = useCallback(
    (patch = {}) => {
      stateRef.current = { ...stateRef.current, ...patch };
      socket.emit("call:state", { ...stateRef.current, screen: Boolean(screenRef.current) });
    },
    [socket]
  );

  // ---------------- Sifat (bitreyt / o'lcham) ----------------
  const applyCameraParams = useCallback(() => {
    const pc = pcRef.current;
    const sender = pc?.getTransceivers()[1]?.sender;
    const track = localRef.current?.getVideoTracks()[0];
    if (!sender || !track) return;
    const { width, height } = track.getSettings();
    // O'zim tanlagan va sherik so'ragan sifatdan pastrog'i.
    const levels = ["low", "medium", "auto"];
    const level = levels[Math.min(levels.indexOf(outgoingRef.current), levels.indexOf(peerQualityRef.current))];
    setSenderParams(sender, outgoingEncoding(level, { phone: isPhoneDevice(), shortSide: Math.min(width || 720, height || 720) }));
  }, []);

  useEffect(() => {
    applyCameraParams();
  }, [outgoing, applyCameraParams]);

  // Ko'radigan sifatimni sherikka aytamiz (u o'z yuborishini cheklaydi).
  useEffect(() => {
    socket.emit("call:quality", incoming);
  }, [incoming, socket, peer?.id]);

  // ---------------- Peer connection ----------------
  const closePc = useCallback(() => {
    clearTimeout(restartTimer.current);
    pcRef.current?.close();
    pcRef.current = null;
    sessionRef.current = null;
    pendingIce.current = [];
    setRemoteVideo(null);
    setRemoteAudio(null);
    setRemoteScreen(null);
    setRoute(null);
  }, []);

  const restartIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    if (!isOfferer()) return signal({ type: "restart" });
    try {
      pc.restartIce?.();
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(withStartBitrate(offer));
      signal({ description: pc.localDescription });
    } catch {
      /* keyingi urinishda */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPc = useCallback(
    (sid) => {
      closePc();
      sessionRef.current = sid;
      const pc = new RTCPeerConnection({ iceServers, bundlePolicy: "max-bundle" });
      pcRef.current = pc;
      // Faqat lokal ishlab chiqishda: diagnostika uchun (getStats).
      if (import.meta.env.DEV) window.__studyRoomPc = pc;

      pc.onicecandidate = (e) => e.candidate && signal({ candidate: e.candidate });

      pc.ontrack = (e) => {
        const index = pc.getTransceivers().indexOf(e.transceiver);
        const stream = new MediaStream([e.track]);
        if (e.track.kind === "audio") setRemoteAudio(stream);
        else if (index === 2) setRemoteScreen(stream);
        else setRemoteVideo(stream);
      };

      pc.onconnectionstatechange = () => {
        if (pcRef.current !== pc) return;
        const st = pc.connectionState;
        if (st === "connected") {
          clearTimeout(restartTimer.current);
          setConnection("connected");
          applyCameraParams();
        } else if (st === "disconnected") {
          setConnection("reconnecting");
          clearTimeout(restartTimer.current);
          restartTimer.current = setTimeout(restartIce, RESTART_AFTER_MS);
        } else if (st === "failed") {
          setConnection("reconnecting");
          restartIce();
        }
      };
      return pc;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [iceServers, closePc, restartIce, applyCameraParams]
  );

  // 3 ta transceiver'ga mahalliy track'larni ulash (offerer — yaratadi,
  // answerer — offer'dan kelganlarini sendrecv qiladi).
  const attachLocal = useCallback((pc, create) => {
    const local = localRef.current;
    const audio = local?.getAudioTracks()[0] || null;
    const video = local?.getVideoTracks()[0] || null;
    const screen = screenRef.current?.getVideoTracks()[0] || null;
    const peerIsPhone = Boolean(peerRef.current?.phone);
    let ts = pc.getTransceivers();
    if (create) {
      pc.addTransceiver(audio || "audio", { direction: "sendrecv" });
      pc.addTransceiver(video || "video", { direction: "sendrecv" });
      pc.addTransceiver(screen || "video", { direction: "sendrecv" });
      ts = pc.getTransceivers();
    } else {
      ts.forEach((t) => (t.direction = "sendrecv"));
      ts[0]?.sender.replaceTrack(audio);
      ts[1]?.sender.replaceTrack(video);
      ts[2]?.sender.replaceTrack(screen);
    }
    if (ts[1]) preferCodecs(ts[1], peerIsPhone);
    if (ts[2]) preferCodecs(ts[2], false);
  }, []);

  const startOffer = useCallback(async () => {
    const sid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    const pc = createPc(sid);
    attachLocal(pc, true);
    setConnection("connecting");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(withStartBitrate(offer));
    signal({ description: pc.localDescription });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPc, attachLocal]);

  const flushIce = async (pc) => {
    for (const c of pendingIce.current.splice(0)) {
      try {
        await pc.addIceCandidate(c);
      } catch {
        /* eskirgan nomzod */
      }
    }
  };

  // ---------------- Signal qabul qilish ----------------
  useEffect(() => {
    const onSignal = async (msg) => {
      try {
        if (msg.type === "restart") {
          if (isOfferer()) restartIce();
          return;
        }
        if (msg.description) {
          const desc = msg.description;
          if (desc.type === "offer") {
            // Yangi sessiya (sherik qayta ulangan) yoki ICE restart.
            let pc = pcRef.current;
            if (!pc || sessionRef.current !== msg.sid) {
              pc = createPc(msg.sid);
              await pc.setRemoteDescription(desc);
              attachLocal(pc, false);
            } else {
              await pc.setRemoteDescription(desc);
            }
            setConnection((c) => (c === "connected" ? c : "connecting"));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(withStartBitrate(answer));
            signal({ description: pc.localDescription });
            await flushIce(pc);
          } else if (desc.type === "answer") {
            const pc = pcRef.current;
            if (!pc || sessionRef.current !== msg.sid || pc.signalingState !== "have-local-offer") return;
            await pc.setRemoteDescription(desc);
            await flushIce(pc);
          }
        } else if (msg.candidate) {
          const pc = pcRef.current;
          if (!pc || sessionRef.current !== msg.sid) return;
          if (pc.remoteDescription) await pc.addIceCandidate(msg.candidate).catch(() => {});
          else pendingIce.current.push(msg.candidate);
        }
      } catch {
        /* buzilgan signal — keyingi restart tuzatadi */
      }
    };

    const onPeerJoined = (p) => {
      peerRef.current = { ...p, mic: true, cam: true, screen: false };
      setPeer(peerRef.current);
      closePc();
      setConnection("connecting");
      if (isOfferer()) startOffer();
      sendState();
    };
    const onPeerLeft = ({ id }) => {
      if (peerRef.current?.id !== id) return;
      peerRef.current = null;
      setPeer(null);
      closePc();
      setConnection("waiting");
    };
    const onState = (st) => {
      if (!peerRef.current) return;
      peerRef.current = { ...peerRef.current, ...st };
      setPeer(peerRef.current);
    };
    const onQuality = (q) => {
      peerQualityRef.current = q;
      applyCameraParams();
    };
    const onEnded = () => setEnded("time-up");
    const onReplaced = () => setEnded("replaced");

    socket.on("call:signal", onSignal);
    socket.on("call:peer-joined", onPeerJoined);
    socket.on("call:peer-left", onPeerLeft);
    socket.on("call:state", onState);
    socket.on("call:quality", onQuality);
    socket.on("call:ended", onEnded);
    socket.on("call:replaced", onReplaced);
    return () => {
      socket.off("call:signal", onSignal);
      socket.off("call:peer-joined", onPeerJoined);
      socket.off("call:peer-left", onPeerLeft);
      socket.off("call:state", onState);
      socket.off("call:quality", onQuality);
      socket.off("call:ended", onEnded);
      socket.off("call:replaced", onReplaced);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, createPc, attachLocal, startOffer, closePc, restartIce, applyCameraParams, sendState]);

  // ---------------- Kamera/mikrofon va xonaga kirish ----------------
  useEffect(() => {
    let cancelled = false;
    const join = () =>
      socket.emit("call:join", { code, phone: isPhoneDevice() }, (res) => {
        if (cancelled) return;
        if (!res?.ok) return setEnded(res?.reason || "not-found");
        selfIdRef.current = res.self;
        setClock({ endsAt: res.endsAt, limitMinutes: res.limitMinutes });
        if (res.peer) {
          peerRef.current = { ...res.peer, mic: true, cam: true, screen: false };
          setPeer(peerRef.current);
          setConnection("connecting");
          if (isOfferer()) startOffer();
        } else {
          peerRef.current = null;
          setPeer(null);
          setConnection("waiting");
        }
        sendState();
      });

    (async () => {
      let stream = new MediaStream();
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: initialCam ? cameraConstraints : false,
        });
      } catch {
        // Kamera band/ruxsat yo'q — faqat mikrofon bilan urinib ko'ramiz.
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stateRef.current.cam = false;
          setCam(false);
        } catch {
          stateRef.current = { mic: false, cam: false };
          setMic(false);
          setCam(false);
        }
      }
      if (cancelled) return stream.getTracks().forEach((t) => t.stop());
      stream.getAudioTracks().forEach((t) => (t.enabled = initialMic));
      const vt = stream.getVideoTracks()[0];
      if (vt) vt.contentHint = "motion";
      localRef.current = stream;
      setLocalStream(stream);
      if (socket.connected) join();
      socket.on("connect", join);
    })();

    return () => {
      cancelled = true;
      socket.off("connect", join);
      socket.emit("call:leave");
      closePc();
      localRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
    };
    // Faqat bir marta (xonaga kirishda).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ---------------- Statistika: aloqa sifati, yo'l, kim gapiryapti ----------------
  useEffect(() => {
    let prev = null;
    const timer = setInterval(async () => {
      const pc = pcRef.current;
      if (!pc || pc.connectionState !== "connected") return;
      let report;
      try {
        report = await pc.getStats();
      } catch {
        return;
      }
      let pairId = null;
      let rtt = null;
      let upLoss = null;
      let inLost = 0;
      let inRecv = 0;
      let remoteLevel = 0;
      let localLevel = 0;
      const byId = new Map();
      report.forEach((s) => byId.set(s.id, s));
      report.forEach((s) => {
        if (s.type === "transport" && s.selectedCandidatePairId) pairId = s.selectedCandidatePairId;
        if (s.type === "remote-inbound-rtp" && s.kind === "video" && s.fractionLost != null) {
          upLoss = Math.max(upLoss ?? 0, s.fractionLost * 100);
        }
        if (s.type === "inbound-rtp" && s.kind === "video") {
          inLost += s.packetsLost || 0;
          inRecv += s.packetsReceived || 0;
        }
        if (s.type === "inbound-rtp" && s.kind === "audio") remoteLevel = s.audioLevel || 0;
        if (s.type === "media-source" && s.kind === "audio") localLevel = s.audioLevel || 0;
      });
      if (!pairId) {
        report.forEach((s) => {
          if (s.type === "candidate-pair" && s.nominated && s.state === "succeeded") pairId = s.id;
        });
      }
      const pair = pairId ? byId.get(pairId) : null;
      if (pair) {
        rtt = pair.currentRoundTripTime != null ? pair.currentRoundTripTime * 1000 : null;
        const localCand = byId.get(pair.localCandidateId);
        const remoteCand = byId.get(pair.remoteCandidateId);
        const relayed = localCand?.candidateType === "relay" || remoteCand?.candidateType === "relay";
        setRoute(relayed ? "relay" : "direct");
      }
      let downLoss = null;
      if (prev) {
        const lost = inLost - prev.inLost;
        const recv = inRecv - prev.inRecv;
        if (lost + recv > 0) downLoss = (Math.max(0, lost) / (lost + recv)) * 100;
      }
      prev = { inLost, inRecv };
      setStats({
        local: qualityFrom(upLoss, rtt),
        remote: qualityFrom(downLoss, rtt),
        speakingLocal: stateRef.current.mic && localLevel > 0.04,
        speakingRemote: Boolean(peerRef.current?.mic) && remoteLevel > 0.04,
        rtt,
      });
    }, STATS_MS);
    return () => clearInterval(timer);
  }, []);

  // ---------------- Boshqaruv ----------------
  const toggleMic = useCallback(() => {
    const next = !stateRef.current.mic;
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMic(next);
    sendState({ mic: next });
  }, [sendState]);

  const toggleCam = useCallback(async () => {
    const next = !stateRef.current.cam;
    const local = localRef.current;
    const sender = pcRef.current?.getTransceivers()[1]?.sender;
    if (!next) {
      // Kamerani to'liq o'chiramiz (chiroq ham o'chadi).
      local?.getVideoTracks().forEach((t) => {
        t.stop();
        local.removeTrack(t);
      });
      await sender?.replaceTrack(null);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: cameraConstraints });
        const track = s.getVideoTracks()[0];
        track.contentHint = "motion";
        local?.addTrack(track);
        await sender?.replaceTrack(track);
        applyCameraParams();
      } catch {
        return;
      }
    }
    setLocalStream(local ? new MediaStream(local.getTracks()) : null);
    setCam(next);
    sendState({ cam: next });
  }, [cameraConstraints, applyCameraParams, sendState]);

  const stopScreen = useCallback(async () => {
    screenRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current = null;
    setLocalScreen(null);
    await pcRef.current?.getTransceivers()[2]?.sender.replaceTrack(null);
    sendState();
  }, [sendState]);

  const toggleScreen = useCallback(async () => {
    if (screenRef.current) return stopScreen();
    const s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false });
    const track = s.getVideoTracks()[0];
    track.contentHint = "detail";
    track.onended = () => stopScreen();
    screenRef.current = s;
    setLocalScreen(s);
    const sender = pcRef.current?.getTransceivers()[2]?.sender;
    await sender?.replaceTrack(track);
    setSenderParams(sender, { maxBitrate: 2_500_000, maxFramerate: 15, degradation: "maintain-resolution" });
    sendState();
  }, [stopScreen, sendState]);

  const leave = useCallback(() => {
    socket.emit("call:leave");
    closePc();
  }, [socket, closePc]);

  return {
    localStream,
    localScreen,
    remoteVideo,
    remoteAudio,
    remoteScreen: peer?.screen ? remoteScreen : null,
    peer,
    connection,
    route,
    stats,
    mic,
    cam,
    screenOn: Boolean(localScreen),
    ended,
    clock,
    toggleMic,
    toggleCam,
    toggleScreen,
    leave,
  };
}
