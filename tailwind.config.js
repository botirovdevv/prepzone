// Ranglar CSS o'zgaruvchilarida (src/styles/tokens.css) — yorug'/qorong'i
// rejimda avtomatik almashadi. `<alpha-value>` — `text-ink/60` kabi
// shaffoflik modifikatorlari ishlashi uchun. Qoidalar: skill apple-web-design.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const SEMANTIC = {
  canvas: v("c-canvas"),
  surface: { DEFAULT: v("c-surface"), 2: v("c-surface-2") },
  elevated: v("c-elevated"),
  fill: v("c-fill"),
  line: v("c-line"),
  ink: { DEFAULT: v("c-ink"), 2: v("c-ink-2"), 3: v("c-ink-3") },
  "on-ink": v("c-on-ink"),
  // Doim qorong'i panel (tanaffus ekrani, hero kartalar) — ustidagi matn oq.
  night: v("c-night"),
  accent: { DEFAULT: v("c-accent"), press: v("c-accent-press") },
  success: v("c-success"),
  warning: v("c-warning"),
  danger: v("c-danger"),
  info: v("c-info"),
  purple: v("c-purple"),
};

// Tailwind palitrasi ham o'zgaruvchilarga bog'langan (qorong'ida teskari shkala).
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const PALETTES = ["gray", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "fuchsia", "pink", "rose"];
const palette = Object.fromEntries(
  PALETTES.map((n) => [n, Object.fromEntries(SHADES.map((s) => [s, v(`p-${n}-${s}`)]))])
);
// "purple" semantik token bilan to'qnashmasligi uchun Tailwind purple shkalasi DEFAULT'ga qo'shiladi.
const purpleScale = Object.fromEntries(SHADES.map((s) => [s, v(`p-purple-${s}`)]));

/** @type {import('tailwindcss').Config} */
export default {
  // dark: — qo'lda tanlangan Qorong'i rejim YOKI Auto rejimida tizim qorong'i bo'lsa.
  darkMode: [
    "variant",
    [
      '&:is([data-theme="dark"] *)',
      '@media (prefers-color-scheme: dark) { &:not([data-theme="light"] *) }',
    ],
  ],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,TS,TSX,Jsx,JSX}",
  ],
  // hover: effektlari faqat sichqonchali qurilmalarda — sensorli ekranda
  // bosilgandan keyin "yopishib qolgan" hover holati bo'lmaydi.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        ...palette,
        ...SEMANTIC,
        slate: palette.gray,
        zinc: palette.gray,
        neutral: palette.gray,
        stone: palette.gray,
        purple: { DEFAULT: SEMANTIC.purple, ...purpleScale },
        bluebook: {
          blue: v("c-accent"),
          darkblue: v("c-ink"),
          navy: v("c-ink"),
          headerbg: v("c-fill"),
          border: v("c-line"),
        },
      },
      fontFamily: {
        sans: ["var(--font-text)"],
        display: ["var(--font-display)"],
      },
      borderRadius: {
        card: "20px",
        sheet: "28px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
      },
      // Brauzerning standart "ease" egri chiziqlari juda sust — UI uchun
      // kuchliroq ease-out (tez boshlanib, yumshoq to'xtaydi).
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.23, 1, 0.32, 1)",
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      // `scale` va `translate` alohida CSS xususiyatlari (bosilganda
      // kichrayish, kirish animatsiyasi) ham silliq o'tishi uchun.
      transitionProperty: {
        DEFAULT:
          "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, scale, translate",
      },
    },
  },
  plugins: [],
}
