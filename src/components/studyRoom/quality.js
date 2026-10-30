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

// Yuboriladigan kamera profili. portrait — tik ushlangan telefon.
// "auto": telefon 540p (arzon telefonlar 720p'ni kodlashda qotadi), kompyuter 720p.
export function outgoingProfile(id, portrait) {
  const size = (w, h) => (portrait ? { width: h, height: w } : { width: w, height: h });
  if (id === "low") {
    return {
      resolution: { ...size(320, 180), frameRate: 15 },
      encoding: { maxBitrate: 150_000, maxFramerate: 15 },
      simulcast: false,
      layers: [],
    };
  }
  if (id === "medium") {
    return {
      resolution: { ...size(640, 360), frameRate: 20 },
      encoding: { maxBitrate: 450_000, maxFramerate: 20 },
      simulcast: true,
      layers: [VideoPresets.h180],
    };
  }
  return portrait
    ? {
        resolution: { width: 540, height: 960, frameRate: 24 },
        encoding: { maxBitrate: 900_000, maxFramerate: 24 },
        simulcast: true,
        layers: [VideoPresets.h180, VideoPresets.h360],
      }
    : {
        resolution: { width: 1280, height: 720, frameRate: 24 },
        encoding: { maxBitrate: 1_200_000, maxFramerate: 24 },
        simulcast: true,
        layers: [VideoPresets.h180, VideoPresets.h360],
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
