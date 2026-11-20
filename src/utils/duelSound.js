// ------------------------------------------------------------------
// SAT Duel / Rush ovozlari — WebAudio bilan generatsiya (fayl yuklanmaydi).
// Holat localStorage'da (pz-duel-sound). Telefonda xato — qisqa vibratsiya.
// ------------------------------------------------------------------

const KEY = "pz-duel-sound";
let ctx = null;
const listeners = new Set();

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* private rejim */
  }
  listeners.forEach((fn) => fn(on));
}

export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// notes: [[chastota Hz, boshlanish s, davomiylik s]]
function tones(notes, { type = "sine", gain = 0.12 } = {}) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  for (const [freq, start, dur] of notes) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0 + start);
    g.gain.exponentialRampToValueAtTime(gain, t0 + start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.02);
  }
}

const SOUNDS = {
  correct: () => tones([[660, 0, 0.12], [990, 0.09, 0.18]]),
  wrong: () => {
    tones([[220, 0, 0.22], [180, 0.1, 0.25]], { type: "triangle", gain: 0.14 });
    navigator.vibrate?.(60);
  },
  tick: () => tones([[1200, 0, 0.04]], { type: "square", gain: 0.04 }),
  move: () => tones([[520, 0, 0.06]], { gain: 0.05 }),
  start: () => tones([[440, 0, 0.12], [880, 0.14, 0.2]]),
  win: () => tones([[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.36, 0.32]]),
  lose: () => tones([[392, 0, 0.2], [330, 0.18, 0.3]], { type: "triangle" }),
};

export function play(name) {
  if (!isSoundOn()) return;
  try {
    SOUNDS[name]?.();
  } catch {
    /* audio ruxsat yo'q */
  }
}
