// Foydalanuvchini admin qilish: npm run make-admin -- email@example.com
// (Avval Firestore'dagi "admins" kolleksiyasiga qo'lda hujjat qo'shilardi.)
import { pool } from "../src/db/index.js";

const email = process.argv[2];
if (!email) {
  console.error("Foydalanish: npm run make-admin -- <email> [--remove]");
  process.exit(1);
}
const remove = process.argv.includes("--remove");
const { rows } = await pool.query(
  "UPDATE users SET is_admin = $2 WHERE lower(email) = lower($1) RETURNING email, is_admin",
  [email, !remove]
);
console.log(rows[0] ? `${rows[0].email}: is_admin = ${rows[0].is_admin}` : "Bunday foydalanuvchi topilmadi.");
await pool.end();
