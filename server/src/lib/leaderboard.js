// Har bir foydalanuvchining ENG YAXSHI natijasini saqlaydi — faqat yangi
// ball avvalgisidan yuqori bo'lsa yangilanadi (avval frontenddagi
// utils/leaderboard.js'da edi, endi serverda — natija saqlanganda).
export async function maybeUpdateLeaderboard(client, user, total) {
  if (!Number.isInteger(total) || total <= 0) return;
  const name = user.display_name || user.email.split("@")[0] || "Foydalanuvchi";
  await client.query(
    `INSERT INTO leaderboard (user_id, name, best_score, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id) DO UPDATE
       SET best_score = EXCLUDED.best_score, name = EXCLUDED.name, updated_at = now()
       WHERE leaderboard.best_score < EXCLUDED.best_score`,
    [user.id, name, total]
  );
}
