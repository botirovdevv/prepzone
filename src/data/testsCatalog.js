// ------------------------------------------------------------------
// Tayyor (statik) mock testlar ro'yxati. Bular admin panelidan
// qo'shiladigan "Doimiy ochiq" testlar bilan birga TestSelect
// sahifasida ko'rsatiladi. `id` — data/satTest.js dagi SAT_TESTS kaliti.
// ------------------------------------------------------------------

export const testsCatalog = [
  {
    id: "bluebook-1",
    title: "SAT Practice Test 1",
    description: "Bluebook formati · adaptiv · 98 savol · 2 soat 14 daqiqa",
  },
  {
    id: "bluebook-2",
    title: "SAT Practice Test 2",
    description: "Bluebook formati · adaptiv · 98 savol · 2 soat 14 daqiqa",
  },
  {
    id: "bluebook-3",
    title: "SAT Practice Test 3",
    description: "Bluebook formati · adaptiv · 98 savol · 2 soat 14 daqiqa",
  },
];

// Faqat nom kerak bo'lgan joylar uchun (Dashboard, History) — og'ir test
// ma'lumotlarini (data/satTest.js) yuklamaslik uchun. Noma'lum/eski natijalar
// 1-testga qaytadi (data/satTest.loadSatTest kabi).
export function getSatTestTitle(id) {
  return (testsCatalog.find((t) => t.id === id) || testsCatalog[0]).title;
}
