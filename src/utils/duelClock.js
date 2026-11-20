import { useEffect, useState } from "react";

// ------------------------------------------------------------------
// SAT Duel / Rush soat yordamchilari.
// ------------------------------------------------------------------

export function useNow(active, ms = 100) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}

// chess.com kabi: 20 soniyadan kam qolganda o'ndan biri ham.
export function formatClock(ms) {
  const v = Math.max(0, ms);
  if (v < 20_000) return `0:${String(Math.floor(v / 1000)).padStart(2, "0")}.${Math.floor((v % 1000) / 100)}`;
  const s = Math.ceil(v / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Soatli rejimda o'yinchining hozirgi qolgan vaqti (server holati asosida).
export function clockOf(p, state, serverNow) {
  if (!p || p.clockMs == null) return null;
  if (!p.running) return p.clockMs;
  return Math.max(0, p.clockMs - (serverNow - state.serverNow));
}
