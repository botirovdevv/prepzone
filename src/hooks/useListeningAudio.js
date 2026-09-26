import { useCallback, useEffect, useRef, useState } from "react";

// ------------------------------------------------------------------
// IELTS Listening audio boshqaruvi.
//
// Real imtihondagidek: audio bir marta, to'xtatilmasdan ijro etiladi,
// har bir part oldidan savollarni o'qib olish uchun vaqt beriladi.
// Part'da `audioUrl` bo'lsa — o'sha mp3; bo'lmasa `script` brauzer
// ovozi (Web Speech API) bilan o'qiladi, har bir spikerga alohida ovoz.
// ------------------------------------------------------------------

const PREP_SECONDS = 20;
const LINE_GAP_MS = 350;

const FEMALE = /female|libby|sonia|hazel|susan|kate|serena|zira|jenny|aria|samantha|karen|moira|tessa|fiona|victoria|emma|amy|mia|natasha|clara|maisie|ava|allison|joanna|salli|kimberly/i;
const MALE = /\bmale|ryan|george|thomas|daniel|arthur|oliver|guy|david|mark|alex|fred|james|william|brian|christopher|eric|roger|matthew|justin|joey|liam/i;

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function loadVoices() {
  if (!speechSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

// Ingliz ovozlarini ayol/erkak guruhlariga ajratadi (en-GB ustun).
function voicePools(voices) {
  const english = voices
    .filter((v) => /^en[-_]/i.test(v.lang))
    .sort((a, b) => (/en[-_]GB/i.test(b.lang) ? 1 : 0) - (/en[-_]GB/i.test(a.lang) ? 1 : 0));
  const female = english.filter((v) => FEMALE.test(v.name) && !/\bmale/i.test(v.name.replace(/female/i, "")));
  const male = english.filter((v) => MALE.test(v.name) && !FEMALE.test(v.name));
  return { english, female, male };
}

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]*\s*/g)?.map((s) => s.trim()).filter(Boolean) || [text];
}

export function questionRange(part) {
  const ns = part.groups.flatMap((g) => g.questions.map((q) => q.n));
  return [Math.min(...ns), Math.max(...ns)];
}

export function useListeningAudio({ parts, volume }) {
  const [status, setStatus] = useState("idle"); // idle | preparing | playing | done | unsupported
  const [partIndex, setPartIndex] = useState(0);
  const [prepLeft, setPrepLeft] = useState(0);
  const [speaker, setSpeaker] = useState(null);

  const runIdRef = useRef(0);
  const volumeRef = useRef(volume);
  const audioRef = useRef(null);
  const voicesRef = useRef(null);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const stop = useCallback(() => {
    runIdRef.current += 1;
    if (speechSupported()) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  // Chrome uzoq o'qishda speechSynthesis'ni "uxlatib" qo'yishi mumkin — vaqti-vaqti bilan uyg'otamiz.
  useEffect(() => {
    if (status !== "playing" && status !== "preparing") return;
    const id = setInterval(() => {
      if (speechSupported() && window.speechSynthesis.speaking) window.speechSynthesis.resume();
    }, 5000);
    return () => clearInterval(id);
  }, [status]);

  const speak = useCallback((text, voice, pitch, runId) => {
    return splitSentences(text).reduce(
      (chain, sentence) =>
        chain.then(
          () =>
            new Promise((resolve) => {
              if (runIdRef.current !== runId) return resolve();
              const u = new SpeechSynthesisUtterance(sentence);
              if (voice) {
                u.voice = voice;
                u.lang = voice.lang;
              } else {
                u.lang = "en-GB";
              }
              u.pitch = pitch;
              u.rate = 0.95;
              u.volume = volumeRef.current;
              u.onend = resolve;
              u.onerror = resolve;
              window.speechSynthesis.speak(u);
            })
        ),
      Promise.resolve()
    );
  }, []);

  const wait = (ms, runId) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      if (runIdRef.current !== runId) {
        clearTimeout(t);
        resolve();
      }
    });

  const playUrl = (url, runId) =>
    new Promise((resolve) => {
      const el = new Audio(url);
      el.volume = volumeRef.current;
      audioRef.current = el;
      el.onended = resolve;
      el.onerror = resolve;
      el.play().catch(resolve);
      const check = setInterval(() => {
        if (runIdRef.current !== runId) {
          el.pause();
          clearInterval(check);
          resolve();
        }
      }, 300);
      el.addEventListener("ended", () => clearInterval(check));
    });

  const start = useCallback(
    async (fromPart = 0) => {
      stop();
      const runId = runIdRef.current;
      const needsSpeech = parts.some((p) => !p.audioUrl);
      if (needsSpeech && !speechSupported()) {
        setStatus("unsupported");
        return;
      }
      if (!voicesRef.current) voicesRef.current = voicePools(await loadVoices());
      const pools = voicesRef.current;
      const narrator = pools.female[0] || pools.english[0] || null;

      for (let p = fromPart; p < parts.length; p++) {
        if (runIdRef.current !== runId) return;
        const part = parts[p];
        const [from, to] = questionRange(part);
        setPartIndex(p);
        setSpeaker(null);
        setStatus("preparing");
        if (speechSupported()) {
          await speak(
            `${part.title}. ${part.intro} First, you have some time to look at questions ${from} to ${to}.`,
            narrator,
            1,
            runId
          );
        }
        for (let s = PREP_SECONDS; s > 0; s--) {
          if (runIdRef.current !== runId) return;
          setPrepLeft(s);
          await wait(1000, runId);
        }
        setPrepLeft(0);
        if (runIdRef.current !== runId) return;
        setStatus("playing");

        if (part.audioUrl) {
          await playUrl(part.audioUrl, runId);
        } else {
          // Har bir spikerga o'z ovozi; ovoz yetmasa — balandlik (pitch) bilan farqlanadi.
          const assigned = {};
          let fi = 0;
          let mi = 0;
          for (const name of Object.keys(part.speakers || {})) {
            const g = part.speakers[name];
            const pool = g === "f" ? pools.female : pools.male;
            const idx = g === "f" ? fi++ : mi++;
            const voice = pool[idx % (pool.length || 1)] || pools.english[idx % (pools.english.length || 1)] || null;
            const pitch = (g === "f" ? 1.1 : 0.85) + (pool.length > idx ? 0 : idx * 0.12);
            assigned[name] = { voice, pitch };
          }
          for (const line of part.script) {
            if (runIdRef.current !== runId) return;
            setSpeaker(line.speaker);
            const cfg = assigned[line.speaker] || { voice: narrator, pitch: 1 };
            await speak(line.text, cfg.voice, cfg.pitch, runId);
            await wait(LINE_GAP_MS, runId);
          }
        }
        setSpeaker(null);
        if (p < parts.length - 1) {
          if (speechSupported()) await speak(`That is the end of ${part.title}.`, narrator, 1, runId);
          await wait(1500, runId);
        }
      }
      if (runIdRef.current !== runId) return;
      if (speechSupported()) {
        await speak(
          "That is the end of the listening test. You now have two minutes to check your answers.",
          narrator,
          1,
          runId
        );
      }
      setStatus("done");
    },
    [parts, speak, stop]
  );

  return { status, partIndex, prepLeft, speaker, start, stop };
}

// Ovozni tekshirish (sound check) uchun qisqa namuna.
export async function playSoundCheck(volume) {
  if (!speechSupported()) return false;
  window.speechSynthesis.cancel();
  const pools = voicePools(await loadVoices());
  const u = new SpeechSynthesisUtterance(
    "This is a sound check. You should be able to hear this voice clearly. Adjust the volume if necessary."
  );
  const v = pools.female[0] || pools.english[0];
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  }
  u.volume = volume;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
  return true;
}
