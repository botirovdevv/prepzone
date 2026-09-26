import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { trackPageView, upsertUserProfile } from "../utils/analytics";

// Hech narsa render qilmaydi: login qilgan userning profilini (sessiyada
// bir marta) va har bir sahifa o'tishini Firestore'ga yozadi.
export default function AnalyticsTracker() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const profileSavedFor = useRef(null);
  const lastTracked = useRef(null);

  const uid = user?.uid;

  useEffect(() => {
    if (!user || profileSavedFor.current === uid) return;
    profileSavedFor.current = uid;
    upsertUserProfile(user);
  }, [user, uid]);

  useEffect(() => {
    if (!user) return;
    // Bir xil sahifani ketma-ket (masalan re-render/StrictMode) sanamaymiz.
    const marker = `${uid}::${pathname}`;
    if (lastTracked.current === marker) return;
    lastTracked.current = marker;
    trackPageView(user, pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, pathname]);

  return null;
}
