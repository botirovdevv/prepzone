import { useState } from "react";
import { VideoPresets, VideoQuality } from "livekit-client";

// ------------------------------------------------------------------
// Study Room video sifati sozlamalari.
//   Ko'radigan sifat  — sherik videosining eng yuqori qatlami (setVideoQuality;
//                       "Avto" — plitka o'lchami va internetga qarab o'zi).
//   Yuboradigan sifat — o'z kameramiz qaysi o'lcham/bitreytda yuboriladi.
// Tanlov shu brauzerda eslab qolinadi (localStorage — faqat qulaylik uchun).
// ------------------------------------------------------------------

export const QUALITY_OPTIONS = [
  { id: "auto", label: "Avto" },
  { id: "medium", label: "O'rta" },
  { id: "low", label: "Past" },
];

export const INCOMING_QUALITY = {
  auto: VideoQuality.HIGH,
  medium: VideoQuality.MEDIUM,
  low: VideoQuality.LOW,
};

// Yuboriladigan kamera profili. device: { phone, portrait }.
// "auto":
//   kompyuter — VP9 SVC (Google Meet kabi: bitta oqimda 3 o'lcham x 3 kadr
//               tezligi qatlami; bir xil trafikda VP8'dan ancha tiniq),
//               720p/30fps, 2 Mbps gacha. VP9'ni ocha olmaydigan sherikka
//               (masalan eski Safari) server avtomatik VP8 nusxasini beradi.
//   telefon   — VP8 (ko'p Android'da apparat kodlash — telefon qizimaydi,
//               qotmaydi), 720p/24fps, 1.5 Mbps gacha, simulcast.
// "medium"/"low" — trafikni tejash uchun VP8, kichik o'lcham.
export function outgoingProfile(id, { phone = false, portrait = false } = {}) {
  const size = (w, h) => (portrait ? { width: h, height: w } : { width: w, height: h });
  if (id === "low") {
    return {
      resolution: { ...size(320, 180), frameRate: 15 },
      encoding: { maxBitrate: 150_000, maxFramerate: 15 },
      codec: "vp8",
      simulcast: false,
      layers: [],
    };
  }
  if (id === "medium") {
    return {
      resolution: { ...size(640, 360), frameRate: 20 },
      encoding: { maxBitrate: 450_000, maxFramerate: 20 },
      codec: "vp8",
      simulcast: true,
      layers: [VideoPresets.h180],
    };
  }
  if (phone) {
    return {
      resolution: { ...size(1280, 720), frameRate: 24 },
      encoding: { maxBitrate: 1_500_000, maxFramerate: 24 },
      codec: "vp8",
      simulcast: true,
      layers: [VideoPresets.h180, VideoPresets.h360],
    };
  }
  return {
    resolution: { ...size(1280, 720), frameRate: 30 },
    encoding: { maxBitrate: 2_000_000, maxFramerate: 30 },
    codec: "vp9",
    scalabilityMode: "L3T3_KEY",
    simulcast: true,
    layers: [],
  };
}

const STORAGE_KEY = "studyRoom.quality";
const VALID = new Set(QUALITY_OPTIONS.map((o) => o.id));

export function loadQuality() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      incoming: VALID.has(saved.incoming) ? saved.incoming : "auto",
      outgoing: VALID.has(saved.outgoing) ? saved.outgoing : "auto",
    };
  } catch {
    return { incoming: "auto", outgoing: "auto" };
  }
}

export function saveQuality(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* maxfiy rejim — eslab qolinmaydi */
  }
}

// Tanlovni saqlab boradigan state.
export function useQualitySettings() {
  const [quality, setQuality] = useState(loadQuality);
  const update = (patch) =>
    setQuality((q) => {
      const next = { ...q, ...patch };
      saveQuality(next);
      return next;
    });
  return [quality, update];
}
