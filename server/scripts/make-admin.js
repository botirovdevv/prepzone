// Foydalanuvchini owner (to'liq huquqli admin) qilish:
//   npm run make-admin -- email@example.com [--remove]
// Boshqa adminlar va ularning ruxsatlari saytdagi Analitika > Userlar bo'limida
// owner tomonidan tayinlanadi.
import { pool } from "../src/db/index.js";

const email = process.argv[2];
if (!email) {
  console.error("Foydalanish: npm run make-admin -- <email> [--remove]");
  process.exit(1);
}
const remove = process.argv.includes("--remove");
const { rows } = await pool.query(
  `UPDATE users SET is_admin = $2, is_owner = $2, admin_perms = '{}'
   WHERE lower(email) = lower($1) RETURNING email, is_admin, is_owner`,
  [email, !remove]
);
console.log(
  rows[0]
    ? `${rows[0].email}: is_admin = ${rows[0].is_admin}, is_owner = ${rows[0].is_owner}`
    : "Bunday foydalanuvchi topilmadi."
);
await pool.end();
