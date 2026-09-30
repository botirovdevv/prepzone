// ------------------------------------------------------------------
// Lokal ishlab chiqish uchun: `npm run dev` paytida /api/* so'rovlarini
// api/ papkasidagi Vercel Function'larga (Web Request/Response
// imzosi: export const GET/POST) yo'naltiradi. Production'da Vercel
// o'zi bajaradi — bu fayl faqat vite.config.js dan ishlatiladi.
// ------------------------------------------------------------------
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const API_DIR = fileURLToPath(new URL("../api/", import.meta.url));

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export function devApiPlugin() {
  return {
    name: "prepzone-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();
        const route = url.pathname.slice(5).replace(/\/$/, "");
        const file = `${API_DIR}${route}.js`;
        if (!/^[a-z0-9/-]+$/.test(route) || route.split("/").some((p) => p.startsWith("_")) || !existsSync(file)) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "Not found" }));
        }
        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod[req.method];
          if (!handler) {
            res.statusCode = 405;
            return res.end(JSON.stringify({ error: "Method not allowed" }));
          }
          const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
          const request = new Request(new URL(req.url, `http://${req.headers.host}`), {
            method: req.method,
            headers: req.headers,
            body,
          });
          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        }
      });
    },
  };
}
