// Savol uchun yagona id. Avval "oxirgi id + 1" ishlatilardi — seed
// qilingan to'plamlardagi matnli id'lar ("sat-2026-05-qb-rw-10") bilan
// bu NaN va takroriy id'lar berardi.
export const newQuestionId = () => `q-${crypto.randomUUID().slice(0, 8)}`;

// Takroriy yoki yaroqsiz (NaN, bo'sh) id'li savollarga yangi id beradi.
export function withUniqueIds(questions) {
  const seen = new Set();
  return (questions || []).map((q) => {
    const bad = q.id == null || q.id === "" || Number.isNaN(q.id) || seen.has(q.id);
    const id = bad ? newQuestionId() : q.id;
    seen.add(id);
    return bad ? { ...q, id } : q;
  });
}
