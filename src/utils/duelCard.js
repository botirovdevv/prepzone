// ------------------------------------------------------------------
// SAT Duel natija kartasi — Instagram/Telegram story uchun 1080×1920 PNG.
// Rasm (avatar) yuklanmaydi: CORS va tezlik uchun — ism bosh harflari chiziladi.
// ------------------------------------------------------------------

const W = 1080;
const H = 1920;
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif';

function initials(name) {
  const parts = String(name || "?").split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

function fitText(ctx, text, max) {
  let s = String(text || "");
  while (s.length > 1 && ctx.measureText(s).width > max) s = s.slice(0, -1);
  return s === text ? s : `${s.trimEnd()}…`;
}

function player(ctx, cx, cy, name, score, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 92px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials(name), cx, cy + 4);
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 44px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(fitText(ctx, name, 400), cx, cy + 200);
  ctx.font = `700 132px ${FONT}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(String(score), cx, cy + 350);
}

export async function drawDuelCard({ outcome, title, me, opp, rating, challenge, url }) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0B1020");
  g.addColorStop(1, outcome === "win" ? "#0B3D2E" : outcome === "loss" ? "#3A0F1A" : "#1F2440");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `600 44px ${FONT}`;
  ctx.fillText("PrepZone · SAT Duel ⚔️", W / 2, 200);

  ctx.font = `700 140px ${FONT}`;
  ctx.fillText(outcome === "win" ? "🏆" : outcome === "loss" ? "💪" : "🤝", W / 2, 440);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 80px ${FONT}`;
  ctx.fillText(fitText(ctx, title, W - 140), W / 2, 590);

  player(ctx, 290, 860, me.name, me.score, "#0A84FF");
  player(ctx, 790, 860, opp.name, opp.score, "#FF453A");
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `700 64px ${FONT}`;
  ctx.fillText("vs", W / 2, 880);

  if (rating != null) {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    const bw = 520;
    ctx.beginPath();
    ctx.roundRect((W - bw) / 2, 1330, bw, 110, 55);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `600 48px ${FONT}`;
    ctx.fillText(`ELO ${rating}`, W / 2, 1402);
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 76px ${FONT}`;
  ctx.fillText(challenge, W / 2, 1620);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 46px ${FONT}`;
  ctx.fillText(url, W / 2, 1710);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png"));
}
