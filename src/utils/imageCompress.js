// Rasmni brauzerda siqib, base64 (data URL) shaklida qaytaradi.
// Firebase Storage ishlatmaslik uchun (qo'shimcha xarajat/sozlash
// kerak bo'lmasin deb) — to'g'ridan-to'g'ri Firestore hujjatiga
// saqlanadigan darajada kichik holatga keltiramiz.
export function compressImageToDataUrl(file, { maxWidth = 900, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Fayl rasm emas."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Rasmni yuklab bo'lmadi."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Profil rasmi: markazdan kvadrat qilib kesib, size x size JPEG'ga siqadi.
export function compressAvatar(file, { size = 256, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Fayl rasm emas."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Rasmni yuklab bo'lmadi."));
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const out = Math.min(size, side);
      const canvas = document.createElement("canvas");
      canvas.width = out;
      canvas.height = out;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out, out);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  });
}
