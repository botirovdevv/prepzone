// ------------------------------------------------------------------
// Shikoyatlar (Ctrl+Shift+F) va brauzer JS xatolarini o'qish uchun log.
//
//   node scripts/feedback-log.js                 — yangi (status=new) yozuvlar, 14 kun
//   node scripts/feedback-log.js --since 3d      — oxirgi 3 kun (h/d)
//   node scripts/feedback-log.js --all           — tuzatilganlar ham
//   node scripts/feedback-log.js --shots DIR     — screenshot'larni DIR/<id>.jpg qilib saqlash
//   node scripts/feedback-log.js --resolve 12 15 — shikoyatlarni "fixed" deb belgilash
//   node scripts/feedback-log.js --resolve-error <fingerprint-boshi> — JS xatoni "fixed"
//
// Prod: ssh ... "docker exec prepzone-api-1 node scripts/feedback-log.js"
// ------------------------------------------------------------------
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/db/index.js";
import { describeUserAgent } from "../src/lib/userAgent.js";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const listAfter = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return [];
  const out = [];
  for (const a of args.slice(i + 1)) {
    if (a.startsWith("--")) break;
    out.push(a);
  }
  return out;
};

function sinceInterval(raw = "14d") {
  const m = /^(\d+)([hd])$/.exec(raw);
  if (!m) throw new Error(`--since noto'g'ri: ${raw} (masalan 12h yoki 7d)`);
  return `${m[1]} ${m[2] === "h" ? "hours" : "days"}`;
}

const fmt = (d) => new Date(d).toISOString().replace("T", " ").slice(0, 16) + " UTC";
const indent = (text, pad = "    ") => String(text).split("\n").map((l) => pad + l).join("\n");

async function resolve() {
  const ids = listAfter("--resolve").map(Number).filter(Boolean);
  if (ids.length) {
    const { rowCount } = await pool.query("UPDATE feedback_reports SET status = 'fixed' WHERE id = ANY($1)", [ids]);
    console.log(`${rowCount} ta shikoyat "fixed" deb belgilandi: ${ids.join(", ")}`);
  }
  const fps = listAfter("--resolve-error");
  for (const fp of fps) {
    const { rowCount } = await pool.query("UPDATE client_errors SET status = 'fixed' WHERE fingerprint LIKE $1", [
      `${fp}%`,
    ]);
    console.log(`${fp}: ${rowCount} ta JS xato "fixed" deb belgilandi`);
  }
}

async function report() {
  const since = sinceInterval(value("--since"));
  const all = flag("--all");
  const shotsDir = value("--shots");
  const statusSql = all ? "" : "AND f.status = 'new'";

  const { rows: reports } = await pool.query(
    `SELECT f.id, f.created_at, f.message, f.page_url, f.user_agent, f.viewport, f.theme, f.lang,
            f.context, f.status, f.telegram_ok, f.screenshot IS NOT NULL AS has_shot,
            ${shotsDir ? "f.screenshot, f.screenshot_mime," : ""}
            u.id AS user_id, u.email, u.display_name
       FROM feedback_reports f LEFT JOIN users u ON u.id = f.user_id
      WHERE f.created_at > now() - $1::interval ${statusSql}
      ORDER BY f.id DESC`,
    [since]
  );

  console.log(`=== SHIKOYATLAR (${reports.length} ta, oxirgi ${since}${all ? ", hammasi" : ", faqat yangi"}) ===\n`);
  if (shotsDir) await mkdir(shotsDir, { recursive: true });
  for (const r of reports) {
    const { browser, os, device } = describeUserAgent(r.user_agent);
    const who = r.user_id ? `${r.display_name || "—"} <${r.email}> (${r.user_id})` : "mehmon";
    console.log(`#${r.id}  ${fmt(r.created_at)}  [${r.status}]${r.telegram_ok ? "" : "  (Telegram'ga bormagan)"}`);
    console.log(`  user:    ${who}`);
    console.log(`  sahifa:  ${r.page_url}`);
    console.log(`  qurilma: ${browser} · ${os} · ${device} · ${r.viewport} · ${r.theme} · ${r.lang}`);
    if (r.context?.version) console.log(`  versiya: ${r.context.version}`);
    console.log(`  matn:\n${indent(r.message)}`);
    const logs = r.context?.logs || [];
    if (logs.length) {
      console.log("  oxirgi loglar:");
      for (const l of logs) console.log(indent(`[${l.kind}] ${l.message}`));
    }
    if (r.has_shot) {
      if (shotsDir) {
        const ext = (r.screenshot_mime || "image/jpeg").split("/")[1].replace("jpeg", "jpg");
        const file = path.join(shotsDir, `${r.id}.${ext}`);
        await writeFile(file, r.screenshot);
        console.log(`  screenshot: ${file}`);
      } else {
        console.log("  screenshot: bor (--shots DIR bilan saqlang)");
      }
    }
    console.log("");
  }

  const { rows: errors } = await pool.query(
    `SELECT fingerprint, message, stack, page_url, user_agent, count, status, first_seen, last_seen
       FROM client_errors
      WHERE last_seen > now() - $1::interval ${all ? "" : "AND status = 'new'"}
      ORDER BY count DESC, last_seen DESC
      LIMIT 50`,
    [since]
  );
  console.log(`=== JS XATOLAR (${errors.length} xil, ko'p takrorlangani birinchi) ===\n`);
  for (const e of errors) {
    const { browser, os } = describeUserAgent(e.user_agent);
    console.log(`[${e.fingerprint.slice(0, 8)}] x${e.count}  [${e.status}]  oxirgi: ${fmt(e.last_seen)}  birinchi: ${fmt(e.first_seen)}`);
    console.log(`  xato:    ${e.message}`);
    console.log(`  sahifa:  ${e.page_url}  (${browser} · ${os})`);
    if (e.stack) console.log(indent(e.stack.split("\n").slice(0, 8).join("\n")));
    console.log("");
  }
}

try {
  if (flag("--resolve") || flag("--resolve-error")) await resolve();
  else await report();
} finally {
  await pool.end();
}
