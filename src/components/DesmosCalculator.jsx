import { useEffect, useRef, useState } from "react";
import { LuCalculator } from "react-icons/lu";
import FloatingPanel from "./FloatingPanel";

// Bluebook'dagi kabi Desmos grafik kalkulyatori. Kalit .env'dagi
// VITE_DESMOS_API_KEY'dan olinadi; bo'sh bo'lsa Desmos hujjatlaridagi
// umumiy demo kalit ishlatiladi.
const DESMOS_API_KEY = import.meta.env.VITE_DESMOS_API_KEY || "dcb31709b452b1cf9dc26972add0fda6";
const DESMOS_SCRIPT_SRC = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${DESMOS_API_KEY}`;

let scriptPromise = null;
function loadDesmos() {
  if (window.Desmos) return Promise.resolve(window.Desmos);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = DESMOS_SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.Desmos ? resolve(window.Desmos) : reject(new Error("Desmos not loaded")));
    script.onerror = () => {
      // Keyingi ochishda qayta urinib ko'rish uchun.
      scriptPromise = null;
      script.remove();
      reject(new Error("Desmos script failed"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function DesmosCalculator({ onClose }) {
  const mountRef = useRef(null);
  const calcRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadDesmos()
      .then((Desmos) => {
        if (cancelled || !mountRef.current) return;
        calcRef.current = Desmos.GraphingCalculator(mountRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          border: false,
          images: false,
          folders: false,
          notes: false,
          links: false,
        });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      calcRef.current?.destroy();
      calcRef.current = null;
    };
  }, [attempt]);

  return (
    <FloatingPanel title="Calculator" icon={LuCalculator} width={560} initial={{ x: 16, y: 96 }} onClose={onClose}>
      <div className="relative h-[min(520px,calc(100vh-200px))] min-h-[320px]">
        <div ref={mountRef} className="absolute inset-0" />
        {status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
            <LuCalculator size={28} className="text-gray-300" />
            {status === "loading" ? (
              <p className="text-sm text-gray-500">Loading calculator…</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800">Couldn&apos;t load the Desmos calculator.</p>
                <p className="text-xs text-gray-500">Check your internet connection and try again.</p>
                <button
                  type="button"
                  onClick={() => setAttempt((a) => a + 1)}
                  className="rounded-md bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-black/80"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}
