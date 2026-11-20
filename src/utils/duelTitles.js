// ------------------------------------------------------------------
// SAT Duel unvonlari — reytingdan (ELO). Ranglar semantik tokenlarda.
// ------------------------------------------------------------------

export const TITLES = [
  { id: "bronze", min: 0, label: "Bronze", tone: "bg-warning/10 text-warning" },
  { id: "silver", min: 900, label: "Silver", tone: "bg-ink/[0.08] text-ink-2" },
  { id: "gold", min: 1100, label: "Gold", tone: "bg-amber-100 text-amber-700" },
  { id: "platinum", min: 1300, label: "Platinum", tone: "bg-info/10 text-info" },
  { id: "diamond", min: 1500, label: "Diamond", tone: "bg-accent/10 text-accent" },
  { id: "master", min: 1700, label: "SAT Master", tone: "bg-purple/10 text-purple" },
  { id: "gm", min: 1900, label: "SAT GM", tone: "bg-danger/10 text-danger" },
];

export function titleFor(rating) {
  if (rating == null) return null;
  let out = TITLES[0];
  for (const t of TITLES) if (rating >= t.min) out = t;
  return out;
}

// Reyting oshib yangi unvonga o'tildimi.
export function promoted(before, after) {
  if (before == null || after == null || after <= before) return null;
  const a = titleFor(before);
  const b = titleFor(after);
  return a.id !== b.id ? b : null;
}
