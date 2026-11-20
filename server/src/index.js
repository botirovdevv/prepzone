import http from "node:http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { pool } from "./db/index.js";
import { migrate } from "./db/migrate.js";
import { HttpError } from "./lib/errors.js";
import { localizeErrors } from "./lib/i18n.js";
import { initRealtime } from "./lib/realtime.js";
import { globalLimiter, jsonBody, originCheck } from "./middleware/security.js";
import { loadUser, requireAdmin, requireAuth, requirePerm, requireVerified } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import qrRouter from "./routes/qr.js";
import sessionsRouter from "./routes/sessions.js";
import satRouter from "./routes/sat.js";
import meRouter from "./routes/me.js";
import analyticsRouter from "./routes/analytics.js";
import adminRouter from "./routes/admin.js";
import aiRouter from "./routes/ai.js";
import presenceRouter from "./routes/presence.js";
import studyRoomRouter from "./routes/studyRoom.js";
import avatarsRouter from "./routes/avatars.js";
import { resultsRouter, leaderboardRouter } from "./routes/results.js";
import { questionSetsRouter, desmosRouter } from "./routes/content.js";
import tutorRouter from "./routes/tutor.js";
import learnRouter from "./routes/learn.js";
import duelRouter from "./routes/duel.js";
import rushRouter from "./routes/rush.js";

const app = express();

// Caddy (reverse proxy) ortida ishlaydi — haqiqiy IP rate limit uchun kerak.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
if (config.clientOrigin) {
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
}
// Xato xabarlari brauzer tilida (X-Lang) — body parser xatolari ham.
app.use(localizeErrors);
app.use("/api", globalLimiter);
app.use(cookieParser());
app.use(loadUser);
// Body hajmi yo'l va foydalanuvchiga qarab (middleware/security.js).
app.use(jsonBody);
app.use("/api", originCheck);

app.get("/api/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});

app.use("/api/auth/qr", qrRouter);
app.use("/api/auth", authRouter);
app.use("/api/me", requireAuth, meRouter);
app.use("/api/analytics", requireAuth, analyticsRouter);
app.use("/api/presence", presenceRouter);
app.use("/api/avatars", avatarsRouter);
app.use("/api/tutor", requireVerified, tutorRouter);
app.use("/api/learn", requireVerified, learnRouter);
app.use("/api/admin/ai", requireAdmin, requirePerm("sessions", "sets"), aiRouter);
app.use("/api/admin", requireAdmin, adminRouter);
app.use("/api/sat", requireVerified, satRouter);
app.use("/api/results", requireVerified, resultsRouter);
app.use("/api/leaderboard", requireVerified, leaderboardRouter);
app.use("/api/sessions", requireVerified, sessionsRouter);
app.use("/api/question-sets", requireVerified, questionSetsRouter);
app.use("/api/desmos", requireVerified, desmosRouter);
app.use("/api/study-room", requireVerified, studyRoomRouter);
app.use("/api/duel", requireVerified, duelRouter);
app.use("/api/rush", requireVerified, rushRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ code: "not-found", message: "Bunday API manzili yo'q." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ code: err.code, message: err.message, ...(err.feature ? { feature: err.feature } : {}) });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ code: "too-large", message: "Ma'lumot hajmi juda katta." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ code: "invalid-argument", message: "JSON noto'g'ri." });
  }
  // Postgres unique_violation — masalan, bir vaqtda ikki marta ro'yxatdan o'tish.
  if (err.code === "23505") {
    return res.status(409).json({ code: "already-exists", message: "Bu ma'lumot allaqachon mavjud." });
  }
  console.error(err);
  res.status(500).json({ code: "internal", message: "Serverda xatolik yuz berdi." });
});

const server = http.createServer(app);
initRealtime(server);

await migrate();
server.listen(config.port, () => {
  console.log(`[prepzone] API http://localhost:${config.port} da ishlayapti`);
});

const shutdown = () => {
  server.close(() => pool.end().then(() => process.exit(0)));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
