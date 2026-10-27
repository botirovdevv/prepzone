// Har bir foydalanuvchining ENG YAXSHI to'liq SAT natijasini saqlaydi —
// faqat yangi ball avvalgisidan yuqori bo'lsa yangilanadi. Qachon
// chaqirilishini (faqat to'liq rw+math, statik testda birinchi urinish)
// chaqiruvchi hal qiladi. Qaytaradi: reyting yangilandimi.
export async function maybeUpdateLeaderboard(client, user, total) {
  if (!Number.isInteger(total) || total < 400 || total > 1600) return false;
  const name = (user.display_name || user.email.split("@")[0] || "Foydalanuvchi").slice(0, 60);
  const { rowCount } = await client.query(
    `INSERT INTO leaderboard (user_id, name, best_score, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id) DO UPDATE
       SET best_score = EXCLUDED.best_score, name = EXCLUDED.name, updated_at = now()
       WHERE leaderboard.best_score < EXCLUDED.best_score`,
    [user.id, name, total]
  );
  return rowCount > 0;
}
