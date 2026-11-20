// ------------------------------------------------------------------
// SAT Duel vaqt rejimlari — server/src/lib/duelModes.js nusxasi (id'lar bir xil).
// group — lobby'dagi guruh (chess.com: Bullet / Blitz / Rapid).
// ------------------------------------------------------------------

export const DUEL_MODES = [
  { id: "bullet1", group: "bullet", category: "bullet", label: "1 min", short: "1+0", total: 5, noRw: true },
  { id: "bullet2", group: "bullet", category: "bullet", label: "2 | 1", short: "2+1", total: 8, noRw: true },
  { id: "blitz3", group: "blitz", category: "blitz", label: "3 | 2", short: "3+2", total: 10 },
  { id: "blitz5", group: "blitz", category: "blitz", label: "5 min", short: "5+0", total: 10 },
  { id: "rapid10", group: "rapid", category: "rapid", label: "10 min", short: "10+0", total: 15 },
  { id: "classic", group: "classic", category: "classic", label: "7 × 90s", short: "7×90", total: 7 },
];

export const DUEL_GROUPS = ["bullet", "blitz", "rapid", "classic"];
export const CATEGORIES = ["bullet", "blitz", "rapid", "classic"];

export const modeById = (id) => DUEL_MODES.find((m) => m.id === id) || DUEL_MODES[DUEL_MODES.length - 1];

export const RUSH_MODES = ["rush3", "rush5", "survival"];

export const CHAT_PRESETS = ["gl", "nice", "hurry", "gg", "rematch"];
export const CHAT_EMOJIS = { wow: "😮", fire: "🔥", laugh: "😂", clap: "👏", think: "🤔" };
