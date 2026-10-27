import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./client";

// ------------------------------------------------------------------
// Jonli yangilanishlar uchun bitta umumiy Socket.IO ulanishi (Firestore
// onSnapshot o'rnini bosadi). Faqat sessiya testlari va admin monitoring
// sahifalarida ishlatiladi.
// ------------------------------------------------------------------

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(API_URL || undefined, { withCredentials: true, autoConnect: true });
  }
  return socket;
}

// Login/logout'dan keyin eski cookie bilan ochilgan ulanishni yopamiz.
export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Sessiya xonasiga qo'shiladi va berilgan hodisalarni tinglaydi.
// handlers: { "session:update": fn, "participant:update": fn, "event:new": fn }
// onReconnect — ulanish uzilib qayta tiklanganda (o'tkazib yuborilgan
// yangilanishlarni qayta yuklash uchun) chaqiriladi.
export function useSessionLive(sessionId, handlers, onReconnect) {
  const handlersRef = useRef(handlers);
  const reconnectRef = useRef(onReconnect);
  handlersRef.current = handlers;
  reconnectRef.current = onReconnect;

  useEffect(() => {
    if (!sessionId) return;
    const s = getSocket();
    let firstConnect = true;

    const join = () => {
      s.emit("session:watch", sessionId);
      if (!firstConnect) reconnectRef.current?.();
      firstConnect = false;
    };
    if (s.connected) join();
    s.on("connect", join);

    const listeners = Object.keys(handlersRef.current || {}).map((event) => {
      const fn = (payload) => handlersRef.current?.[event]?.(payload);
      s.on(event, fn);
      return [event, fn];
    });

    return () => {
      s.emit("session:unwatch", sessionId);
      s.off("connect", join);
      listeners.forEach(([event, fn]) => s.off(event, fn));
    };
  }, [sessionId]);
}
