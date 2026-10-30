import { useState } from "react";

// ------------------------------------------------------------------
// Study Room video sifati sozlamalari (P2P qo'ng'iroq).
//   Ko'radigan sifat  — sherikka "menga ko'pi bilan shu sifatda yubor" deymiz.
//   Yuboradigan sifat — o'z kameramiz qaysi bitreyt/o'lchamda yuboriladi
//                       (RTCRtpSender.setParameters — qayta ulanishsiz).
// Tanlov shu brauzerda eslab qolinadi (localStorage — faqat qulaylik uchun).
// ------------------------------------------------------------------

export const QUALITY_OPTIONS = [
  { id: "auto" },
  { id: "medium" },
  { id: "low" },
];

// Kameradan so'raladigan kadr. aspectRatio majburlanmaydi: aks holda tik
// ushlangan telefon sensor o'rtasini kesib, tasvir juda yaqin bo'lib qoladi.
export function cameraConstraints({ phone = false, portrait = false } = {}) {
  const [w, h] = portrait ? [720, 1280] : [1280, 720];
  return {
    width: { ideal: w },
    height: { ideal: h },
    frameRate: { ideal: phone ? 24 : 30, max: 30 },
    facingMode: "user",
  };
}

// Yuborish parametrlari. "auto" — kompyuter 2.5 Mbps / 30fps, telefon
// 1.5 Mbps / 24fps; brauzerning o'z tiqilinch nazorati internetga qarab
// pasaytiradi. shortSide — kadrning qisqa tomoni (o'lchamni kichraytirish uchun).
export function outgoingEncoding(level, { phone = false, shortSide = 720 } = {}) {
  if (level === "low") {
    return { maxBitrate: 150_000, maxFramerate: 15, scaleResolutionDownBy: Math.max(1, shortSide / 180), degradation: "balanced" };
  }
  if (level === "medium") {
    return { maxBitrate: 600_000, maxFramerate: 24, scaleResolutionDownBy: Math.max(1, shortSide / 360), degradation: "balanced" };
  }
  return {
    maxBitrate: phone ? 1_500_000 : 2_500_000,
    maxFramerate: phone ? 24 : 30,
    scaleResolutionDownBy: 1,
    degradation: "balanced",
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
