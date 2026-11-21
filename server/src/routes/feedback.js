import { createHash } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { one, query } from "../db/index.js";
import { parseBody } from "../lib/errors.js";
import { decodeDataImage } from "../lib/images.js";
import { perUserLimit } from "../lib/limiters.js";
import { escapeHtml, sendFeedback } from "../lib/telegram.js";
import { describeUserAgent } from "../lib/userAgent.js";

// ------------------------------------------------------------------
// Shikoyat/taklif oynasi (Ctrl+Shift+F) va brauzerdagi JS xatolar.
// Login shart emas — mehmon ham yubora oladi. Hammasi bazaga yoziladi
// (o'qish: scripts/feedback-log.js), shikoyatlar Telegram'ga ham boradi.
// ------------------------------------------------------------------

const router = Router();

const SCREENSHOT_MAX_BYTES = 900 * 1024;

const logLine = z.object({
  kind: z.string().max(20),
  message: z.string().max(600),
  at: z.number().optional(),
});

const reportSchema = z.object({
  message: z.string().trim().min(3).max(2000),
  pageUrl: z.string().max(500).default(""),
  viewport: z.string().max(40).default(""),
  theme: z.string().max(20).default(""),
  lang: z.string().max(10).default(""),
  screenshot: z.string().max(1_300_000).nullish(),
  context: z
    .object({
      logs: z.array(logLine).max(30).default([]),
      version: z.string().max(80).optional(),
      referrer: z.string().max(500).optional(),
    })
    .default({ logs: [] }),
});

const reportLimit = perUserLimit({ windowMs: 10 * 60_000, limit: 5 });
const errorLimit = perUserLimit({ windowMs: 60_000, limit: 30 });

function formatReport(id, body, user, ua) {
  const { browser, os, device } = describeUserAgent(ua);
  const who = user
    ? `${escapeHtml(user.display_name || "—")} · ${escapeHtml(user.email)} · <code>${escapeHtml(user.id)}</code>`
    : "mehmon (login qilmagan)";
  const lines = [
    `🐞 <b>Shikoyat #${id}</b>`,
    `👤 ${who}`,
    `🔗 ${escapeHtml(body.pageUrl || "—")}`,
    `💻 ${escapeHtml(`${browser} · ${os} · ${device}`)} · ${escapeHtml(body.viewport || "?")} · ${escapeHtml(body.theme || "?")} · ${escapeHtml(body.lang || "?")}`,
    "",
    escapeHtml(body.message),
  ];
  const errors = body.context.logs.filter((l) => l.kind !== "info").slice(-3);
  if (errors.length) {
    lines.push("", "<b>Oxirgi xatolar:</b>");
    for (const e of errors) lines.push(`• <code>${escapeHtml(`[${e.kind}] ${e.message.slice(0, 200)}`)}</code>`);
  }
  return lines.join("\n");
}

router.post("/", reportLimit, async (req, res) => {
  const body = parseBody(reportSchema, req.body);
  const photo = body.screenshot ? decodeDataImage(body.screenshot, SCREENSHOT_MAX_BYTES) : null;
  const ua = String(req.get("user-agent") || "").slice(0, 400);
  const user = req.user || null;

  const row = await one(
    `INSERT INTO feedback_reports
       (user_id, message, page_url, user_agent, viewport, theme, lang, context, screenshot, screenshot_mime)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      user?.id || null,
      body.message,
      body.pageUrl,
      ua,
      body.viewport,
      body.theme,
      body.lang,
      JSON.stringify(body.context),
      photo?.data || null,
      photo?.mime || null,
    ]
  );

  // Telegram javobini kutmaymiz — foydalanuvchi darhol "Rahmat" ko'radi.
  sendFeedback({ html: formatReport(row.id, body, user, ua), photo })
    .then((sent) => sent && query("UPDATE feedback_reports SET telegram_ok = TRUE WHERE id = $1", [row.id]))
    .catch((err) => console.error(`[feedback] #${row.id} Telegram'ga yuborilmadi:`, err.message));

  res.json({ ok: true, id: row.id });
});

const errorsSchema = z.object({
  errors: z
    .array(
      z.object({
        message: z.string().trim().min(1).max(1000),
        stack: z.string().max(4000).default(""),
        pageUrl: z.string().max(500).default(""),
      })
    )
    .min(1)
    .max(10),
});

// Bir xil xato (xabar + stack'ning birinchi kadri) bitta qator bo'lib, count oshadi.
function fingerprint(message, stack) {
  const frame = stack.split("\n").map((l) => l.trim()).find((l) => l.startsWith("at ") || l.includes("@")) || "";
  // Build hash'lari (index-AbC123.js) har deployda o'zgaradi — ularsiz guruhlaymiz.
  const norm = `${message}|${frame}`.replace(/-[A-Za-z0-9_]{8}\.js/g, ".js").replace(/:\d+:\d+/g, "");
  return createHash("sha1").update(norm).digest("hex");
}

let lastCleanup = 0;

router.post("/errors", errorLimit, async (req, res) => {
  const { errors } = parseBody(errorsSchema, req.body);
  const ua = String(req.get("user-agent") || "").slice(0, 400);
  for (const e of errors) {
    await query(
      `INSERT INTO client_errors (fingerprint, message, stack, page_url, user_id, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (fingerprint) DO UPDATE SET
         count = client_errors.count + 1, last_seen = now(), page_url = EXCLUDED.page_url,
         user_id = COALESCE(EXCLUDED.user_id, client_errors.user_id), user_agent = EXCLUDED.user_agent,
         stack = EXCLUDED.stack,
         -- Tuzatilgan deb belgilangan xato qaytsa — yana "new".
         status = 'new'`,
      [fingerprint(e.message, e.stack), e.message, e.stack, e.pageUrl, req.user?.id || null, ua]
    );
  }
  if (Date.now() - lastCleanup > 6 * 3600_000) {
    lastCleanup = Date.now();
    query("DELETE FROM client_errors WHERE last_seen < now() - interval '30 days'").catch(() => {});
  }
  res.json({ ok: true });
});

export default router;
