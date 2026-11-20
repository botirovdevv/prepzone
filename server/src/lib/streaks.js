import { dayKey } from "./limits.js";

// ------------------------------------------------------------------
// Kunlik streak va XP. Har qanday o'quv faolligi (kun savollari, xatolarni
// takrorlash, mock) streakni davom ettiradi.
// ------------------------------------------------------------------

export const XP = { dailyCorrect: 10, dailyDone: 20, mistakeFixed: 5, mockComplete: 100, mockSection: 40, duelPlay: 10, duelWin: 30 };

const yesterday = () => dayKey(new Date(Date.now() - 86400_000));

export async function addXp(client, userId, xp) {
  const today = dayKey();
  const { rows } = await client.query(
    `INSERT INTO user_streaks (user_id, current, best, last_day, xp) VALUES ($1, 1, 1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET
       current = CASE
         WHEN user_streaks.last_day = $2 THEN user_streaks.current
         WHEN user_streaks.last_day = $4 THEN user_streaks.current + 1
         ELSE 1 END,
       last_day = $2,
       xp = user_streaks.xp + $3,
       updated_at = now()
     RETURNING *`,
    [userId, today, xp, yesterday()]
  );
  const row = rows[0];
  if (row.current > row.best) {
    await client.query("UPDATE user_streaks SET best = current WHERE user_id = $1", [userId]);
    row.best = row.current;
  }
  return streakDoc(row);
}

export function streakDoc(row) {
  if (!row) return { current: 0, best: 0, xp: 0, today: false };
  const alive = row.last_day === dayKey() || row.last_day === yesterday();
  return { current: alive ? row.current : 0, best: row.best, xp: row.xp, today: row.last_day === dayKey() };
}
