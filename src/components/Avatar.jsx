import { useState } from "react";
import { API_URL } from "../api/client";

// ------------------------------------------------------------------
// Foydalanuvchi rasmi; rasm bo'lmasa (yoki yuklanmasa) — ism bosh harflari.
// `user` ({ displayName, email, avatarUrl }) yoki `name` + `src` beriladi.
// ------------------------------------------------------------------

function initials(nameOrEmail) {
  const parts = (nameOrEmail || "?").split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Avatar({ user, name, src, className = "h-9 w-9 rounded-xl bg-ink-3 text-xs" }) {
  const label = name ?? (user?.displayName || user?.email || "");
  const path = src ?? user?.avatarUrl;
  const url = path ? `${API_URL}${path}` : null;
  // Rasm buzilgan bo'lsa bosh harflarga qaytamiz (URL o'zgarsa qayta urinadi).
  const [failedUrl, setFailedUrl] = useState(null);
  const showImage = url && failedUrl !== url;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden font-bold text-white ${className}`}
    >
      {showImage ? (
        <img
          src={url}
          alt={label}
          loading="lazy"
          onError={() => setFailedUrl(url)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(label)
      )}
    </span>
  );
}
