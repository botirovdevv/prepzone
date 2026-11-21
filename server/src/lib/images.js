import { badRequest } from "./errors.js";

// Brauzerdan data URL ko'rinishida kelgan rasmni tekshirib, Buffer qiladi.
// MIME'ga ishonmaymiz — fayl boshidagi "magic bytes" haqiqatan rasm ekanini
// tasdiqlashi kerak (profil rasmi, shikoyat screenshot'i).
export function decodeDataImage(dataUrl, maxBytes) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw badRequest("invalid-argument", "Rasm formati noto'g'ri.");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length === 0 || buf.length > maxBytes) {
    throw badRequest("invalid-argument", "Rasm hajmi juda katta.");
  }
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const isWebp = buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  const ok = { "image/jpeg": isJpeg, "image/png": isPng, "image/webp": isWebp }[m[1]];
  if (!ok) throw badRequest("invalid-argument", "Fayl rasm emas.");
  return { mime: m[1], data: buf };
}
