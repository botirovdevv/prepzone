// Dashboard navigatsiyasi — Sidebar (kompyuter), TabBar va "Yana" sahifasi (telefon)
// shu yerdan o'qiydi. label — `nav.*` i18n kaliti.
import {
  LuCompass,
  LuZap,
  LuFileText,
  LuBookOpen,
  LuTrendingUp,
  LuTrophy,
  LuShieldCheck,
  LuLibrary,
  LuKeyRound,
  LuChartColumn,
  LuHouse,
  LuCalculator,
  LuVideo,
  LuSun,
  LuNotebookPen,
  LuEllipsis,
  LuSwords,
} from "react-icons/lu";

// tone — "Yana" sahifasidagi iOS uslubidagi rangli ikonka foni.
export const NAV = [
  {
    label: "main",
    items: [
      { to: "/dashboard", label: "today", icon: LuHouse, tone: "blue" },
      { to: "/daily", label: "daily", icon: LuSun, tone: "orange" },
      { to: "/study-plan", label: "studyPlan", icon: LuCompass, tone: "purple", badge: "beta" },
    ],
  },
  {
    label: "practice",
    items: [
      { to: "/sat/select", label: "practiceTests", icon: LuFileText, tone: "blue" },
      { to: "/duel", label: "duel", icon: LuSwords, tone: "red", badge: "new" },
      { to: "/practice", label: "examQuestions", icon: LuZap, tone: "orange" },
      { to: "/mistakes", label: "mistakes", icon: LuNotebookPen, tone: "red" },
      { to: "/join", label: "mockWithKey", icon: LuKeyRound, tone: "gray" },
    ],
  },
  {
    label: "learn",
    items: [
      { to: "/vocabulary", label: "vocabulary", icon: LuBookOpen, tone: "green" },
      // Desmos darsliklari tayyor bo'lgach shu yerga qaytariladi:
      // { to: "/desmos", label: "desmos", icon: LuCalculator, tone: "green" },
      { to: "/study-room", label: "studyRoom", icon: LuVideo, tone: "purple", badge: "beta" },
    ],
  },
  {
    label: "progress",
    items: [
      { to: "/sat/history", label: "mockScores", icon: LuTrendingUp, tone: "blue" },
      { to: "/leaderboard", label: "leaderboard", icon: LuTrophy, tone: "orange" },
    ],
  },
];

// Telefondagi pastki tab bar: 4 ta asosiy bo'lim + "Yana".
export const TABS = [
  { to: "/dashboard", label: "tabs.today", icon: LuHouse },
  { to: "/sat/select", label: "tabs.tests", icon: LuFileText, match: ["/sat/"] },
  { to: "/practice", label: "tabs.practice", icon: LuZap },
  { to: "/vocabulary", label: "tabs.vocab", icon: LuBookOpen },
  { to: "/more", label: "tabs.more", icon: LuEllipsis },
];

// "Yana" sahifasida ko'rsatiladiganlar — tab bar'da bo'lmagan bo'limlar.
const TAB_PATHS = new Set(TABS.map((t) => t.to));
export const MORE_GROUPS = NAV.map((g) => ({
  ...g,
  items: g.items.filter((i) => !TAB_PATHS.has(i.to)),
})).filter((g) => g.items.length > 0);

// Admin bo'limlari tarjima qilinmaydi (label o'zi matn).
export const ADMIN_ITEMS = [
  { to: "/admin", label: "Testlar (admin)", icon: LuShieldCheck, end: true, perm: "sessions", admin: true, tone: "blue" },
  { to: "/admin/sets", label: "To'plamlar (admin)", icon: LuLibrary, perm: "sets", admin: true, tone: "green" },
  { to: "/admin/desmos", label: "Desmos (admin)", icon: LuCalculator, perm: "desmos", admin: true, tone: "gray" },
  { to: "/admin/analytics", label: "Analitika (admin)", icon: LuChartColumn, perm: ["analytics", "users"], admin: true, tone: "purple" },
];
