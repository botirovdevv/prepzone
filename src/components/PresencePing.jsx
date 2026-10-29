import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../api/client";
import { routeKey } from "../utils/analytics";

// ------------------------------------------------------------------
// "Hozir saytda" uchun ping (admin → Analitika). Hech narsa render qilmaydi.
// Tab ko'rinib turganda har 30 soniyada va sahifa o'zgarganda serverga
// joriy sahifani yuboradi. Ping kelmay qolsa (tab yopildi/yashirildi), server
// ~1 daqiqada ro'yxatdan chiqaradi. Login qilmagan mehmonlar ham hisoblanadi
// (anonim visitorId, barcha tablarda bitta — bitta odam bir marta sanaladi).
// Server: server/src/routes/presence.js.
// ------------------------------------------------------------------

const INTERVAL_MS = 30_000;
const KEY = "pz-visitor-id";

let memoryId = null;
function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return (memoryId ||= crypto.randomUUID());
  }
}

function send(body) {
  fetch(`${API_URL}/api/presence/ping`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export default function PresencePing() {
  const { pathname } = useLocation();
  const pageRef = useRef(routeKey(pathname));
  pageRef.current = routeKey(pathname);

  // Sahifa o'zgarganda darhol (ko'rinib turgan bo'lsa).
  useEffect(() => {
    if (document.visibilityState === "visible") send({ visitorId: visitorId(), page: pageRef.current });
  }, [pathname]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") send({ visitorId: visitorId(), page: pageRef.current });
    };
    const timer = setInterval(tick, INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  return null;
}
