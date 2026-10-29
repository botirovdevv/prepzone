import { useRef, useState } from "react";
import { api } from "../api/client";
import { compressImageToDataUrl } from "../utils/imageCompress";
import { CONCURRENCY, applyAnswerKey, dedupeQuestions, runPool, splitPdf } from "../utils/pdfImport";

// ------------------------------------------------------------------
// AI import jarayoni (admin): PDF'lar brauzerda bo'laklarga bo'linib,
// parallel yuboriladi (utils/pdfImport.js), PDF oxiridan javoblar kaliti
// alohida o'qiladi. Rasmlar va matn — bitta so'rov. O'qilmagan bo'laklarni
// `retry()` faqat o'zini qayta yuboradi.
//   subject: "rw" | "math" | "auto" (butun test — bo'limni AI aniqlaydi)
// ------------------------------------------------------------------

export const MAX_PDF_BYTES = 40 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const RETRY_DELAY_MS = 8000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const isPdf = (f) => f.type === "application/pdf";

// Sahifa ochiq turganda bir xil material qayta o'qilmaydi: masalan Module 1 ga
// qo'shilgan PDF'ni Module 2 muharririda yuklasangiz — natija darhol chiqadi.
const CACHE = new Map();
const cacheKey = (subject, files, text) =>
  [subject, text.trim(), ...files.map((f) => `${f.name}:${f.size}:${f.lastModified}`)].join("|");

// Rasm OCR uchun yetarli aniqlikda siqiladi (savol rasmiga biriktirilmaydi).
async function imagePart(file) {
  const dataUrl = await compressImageToDataUrl(file, { maxWidth: 1800, quality: 0.85 });
  return { mimeType: "image/jpeg", data: dataUrl.split(",")[1] };
}

// Limit yoki bandlik (429/503/504) bo'lsa — 2 martagacha, kutish vaqtini
// oshirib qayta urinadi (tekin Gemini ko'pincha bir necha soniyada bo'shaydi).
async function postWithRetry(path, body) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await api.post(path, body);
    } catch (err) {
      // Kunlik limit tugagan bo'lsa — kutish foyda bermaydi.
      if (attempt >= 2 || err.code === "ai/daily-limit" || ![429, 503, 504].includes(err.status)) throw err;
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

// Fayl tanlash cheklovlari: xato matni yoki null.
export function checkFileLimits(files) {
  const size = (list) => list.reduce((n, f) => n + f.size, 0);
  if (size(files.filter(isPdf)) > MAX_PDF_BYTES) return "PDF fayllar jami 40 MB dan oshmasin.";
  if (size(files.filter((f) => !isPdf(f))) > MAX_IMAGE_BYTES) return "Rasmlar jami 15 MB dan oshmasin.";
  return null;
}

async function buildTasks(subject, files, text, onPreparing) {
  const tasks = [];
  const order = [];
  const others = files.filter((f) => !isPdf(f));

  if (others.length || text.trim()) {
    const parts = await Promise.all(others.map(imagePart));
    order.push("misc");
    tasks.push({
      kind: "questions",
      key: "misc",
      label: "Rasmlar / matn",
      path: "/admin/ai/parse-questions",
      body: { subject, text: text.trim() || undefined, files: parts.length ? parts : undefined },
    });
  }

  for (const [fi, file] of files.filter(isPdf).entries()) {
    onPreparing(file.name);
    const { chunks, keyPart } = await splitPdf(await file.arrayBuffer());
    if (fi === 0 && keyPart) {
      tasks.unshift({
        kind: "key",
        key: "answer-key",
        path: "/admin/ai/parse-answer-key",
        body: { subject, files: [{ mimeType: "application/pdf", data: keyPart }] },
      });
    }
    for (const c of chunks) {
      const key = `${fi}:${c.index}`;
      order.push(key);
      tasks.push({
        kind: "questions",
        key,
        label: `${file.name} · ${c.firstPage}-sahifadan`,
        path: "/admin/ai/parse-questions",
        body: {
          subject,
          files: [{ mimeType: "application/pdf", data: c.data }],
          chunk: { index: c.index, total: chunks.length, firstPage: c.firstPage },
        },
      });
    }
  }
  return { tasks, order };
}

export function usePdfImport() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, found, preparing? }
  const [failed, setFailed] = useState([]); // qayta yuborish kerak bo'lgan bo'laklar
  // Joriy import: bo'lak kaliti -> savollar, tartib, javoblar kaliti.
  const runRef = useRef(null);

  // Hamma bo'laklar natijasi tartib bilan, takrorlarsiz, kalit qo'llangan holda.
  const collect = () => {
    const { results, order, keys } = runRef.current;
    return applyAnswerKey(dedupeQuestions(order.flatMap((k) => results.get(k) || [])), keys);
  };

  const runTasks = async (tasks) => {
    const state = runRef.current;
    const stillFailed = [];
    let done = 0;
    setProgress({ done, total: tasks.length, found: 0 });
    await runPool(
      tasks,
      CONCURRENCY,
      async (task) => {
        try {
          const res = await postWithRetry(task.path, task.body);
          if (task.kind === "key") state.keys = res.keys || [];
          else state.results.set(task.key, res.items || []);
        } catch (err) {
          // Kalit o'qilmasa — AI o'zi yechgan javoblar qoladi.
          if (task.kind !== "key") stillFailed.push({ ...task, message: err.message });
        }
      },
      () => {
        done += 1;
        const found = [...state.results.values()].reduce((n, list) => n + list.length, 0);
        setProgress({ done, total: tasks.length, found });
      }
    );
    setFailed(stillFailed);
    if (!stillFailed.length) CACHE.set(state.cacheKey, state);
    return stillFailed;
  };

  const guard = async (fn) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // Qaytaradi: savollar ro'yxati (xato bo'laklar `failed` da).
  const start = ({ subject, files, text = "" }) =>
    guard(async () => {
      setFailed([]);
      const ck = cacheKey(subject, files, text);
      if (CACHE.has(ck)) {
        runRef.current = CACHE.get(ck);
        return collect();
      }
      const { tasks, order } = await buildTasks(subject, files, text, (name) =>
        setProgress({ done: 0, total: 0, found: 0, preparing: name })
      );
      runRef.current = { results: new Map(), order, keys: [], cacheKey: ck };
      await runTasks(tasks);
      return collect();
    });

  const retry = () =>
    guard(async () => {
      await runTasks(failed);
      return collect();
    });

  const reset = () => setFailed([]);

  return { busy, progress, failed, start, retry, reset };
}
