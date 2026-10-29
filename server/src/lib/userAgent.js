// ------------------------------------------------------------------
// User-Agent'dan qisqa tavsif: "Chrome · Windows", qurilma turi (ikonka
// uchun). Kutubxonasiz, eng ko'p uchraydigan holatlar yetarli.
// ------------------------------------------------------------------

const BROWSERS = [
  [/Telegram/i, "Telegram"],
  [/Instagram/i, "Instagram"],
  [/EdgA?\/|Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/YaBrowser/, "Yandex"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox\/|FxiOS/, "Firefox"],
  [/CriOS|Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS = [
  [/iPhone|iPod/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

export function describeUserAgent(ua = "") {
  const browser = BROWSERS.find(([re]) => re.test(ua))?.[1] || "Brauzer";
  const os = SYSTEMS.find(([re]) => re.test(ua))?.[1] || "Noma'lum qurilma";
  const device = /Mobi|iPhone|iPod|Android(?!.*Tablet)/.test(ua) ? "phone" : /iPad|Tablet/.test(ua) ? "tablet" : "desktop";
  return { browser, os, device };
}
