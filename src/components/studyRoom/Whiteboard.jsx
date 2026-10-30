import { useCallback, useEffect, useRef, useState } from "react";
import { LuPen, LuHighlighter, LuEraser, LuUndo2, LuTrash2, LuDownload, LuGrid3X3 } from "react-icons/lu";
import { getSocket } from "../../api/socket";
import { useI18n } from "../../i18n";

// ------------------------------------------------------------------
// Umumiy doska (Study Room). Chiziqlar Socket.IO orqali sinxronlanadi
// (server/src/lib/realtime.js → board:*), video aloqasiga bog'liq emas.
//
// Qotmaslik uchun:
//  - ikki qatlam: "base" — tugagan chiziqlar (bir marta chiziladi),
//    "live" — hozir chizilayotganlar (faqat ular har kadrda qayta chiziladi);
//  - kadr faqat o'zgarish bo'lganda chiziladi (requestAnimationFrame);
//  - nuqtalar 40 ms'da bir paket bo'lib yuboriladi.
// Koordinatalar 0..1 — doska nisbati (4:3) hammada bir xil, shuning uchun
// telefon va noutbukda rasm bir xil joylashadi.
// ------------------------------------------------------------------

const ASPECT = 4 / 3;
const COLORS = ["#12213D", "#087fd1", "#e11d48", "#16a34a", "#f59e0b", "#7c3aed"];
const SIZES = [0.003, 0.006, 0.012]; // doska kengligiga nisbatan
const TOOL_SCALE = { pen: 1, highlighter: 4, eraser: 5 };
const FLUSH_MS = 40;
const LIVE_IDLE_MS = 300; // sherik chizig'i shuncha vaqt jim tursa — "tugagan"
const MIN_STEP = 0.0015;

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(18,33,61,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(18,33,61,0.06) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function drawStroke(ctx, stroke, w, h, preview = false) {
  const pts = stroke.points;
  if (!pts.length) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, stroke.size * w);
  if (stroke.tool === "eraser") {
    if (preview) {
      ctx.strokeStyle = "rgba(18,33,61,0.12)";
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000";
    }
  } else {
    ctx.strokeStyle = stroke.color;
    if (stroke.tool === "highlighter") ctx.globalAlpha = 0.3;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
  if (pts.length === 1) {
    ctx.lineTo(pts[0][0] * w + 0.01, pts[0][1] * h);
  } else {
    // Nuqtalar orasidagi o'rtalar orqali silliq egri chiziq.
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = ((pts[i][0] + pts[i + 1][0]) / 2) * w;
      const my = ((pts[i][1] + pts[i + 1][1]) / 2) * h;
      ctx.quadraticCurveTo(pts[i][0] * w, pts[i][1] * h, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0] * w, last[1] * h);
  }
  ctx.stroke();
  ctx.restore();
}

function ToolButton({ active, onClick, title, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition disabled:opacity-35 ${
        active ? "bg-[#12213D] text-white" : "text-[#12213D]/70 hover:bg-[#12213D]/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

export default function Whiteboard({ code }) {
  const { t } = useI18n();
  const wrapRef = useRef(null);
  const baseRef = useRef(null);
  const liveRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  // Barcha chiziqlar (tartib bilan) va hozir "jonli" bo'lganlar.
  const strokesRef = useRef(new Map());
  const liveIdsRef = useRef(new Map()); // id -> oxirgi yangilanish vaqti
  const myStackRef = useRef([]); // o'z chiziqlarim (undo uchun)
  const drawingRef = useRef(null); // { stroke, unsent: [], sentMeta }
  const frameRef = useRef(0);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [grid, setGrid] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [connected, setConnected] = useState(false);

  // ---------------- Chizish ----------------
  const redrawBase = useCallback(() => {
    const canvas = baseRef.current;
    if (!canvas) return;
    const { w, h, dpr } = sizeRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const [id, s] of strokesRef.current) {
      if (!liveIdsRef.current.has(id)) drawStroke(ctx, s, w, h);
    }
  }, []);

  const commitToBase = useCallback((stroke) => {
    const canvas = baseRef.current;
    if (!canvas) return;
    const { w, h, dpr } = sizeRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawStroke(ctx, stroke, w, h);
  }, []);

  const renderLive = useCallback(() => {
    frameRef.current = 0;
    const canvas = liveRef.current;
    if (!canvas) return;
    const { w, h, dpr } = sizeRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const now = performance.now();
    let pending = false;
    for (const [id, touchedAt] of liveIdsRef.current) {
      const stroke = strokesRef.current.get(id);
      const mine = drawingRef.current?.stroke.id === id;
      if (!stroke) {
        liveIdsRef.current.delete(id);
      } else if (!mine && now - touchedAt > LIVE_IDLE_MS) {
        liveIdsRef.current.delete(id);
        commitToBase(stroke);
      } else {
        drawStroke(ctx, stroke, w, h, true);
        pending = true;
      }
    }
    // Sherik chizig'i "tugaganini" aniqlash uchun kadrlarni davom ettiramiz.
    if (pending) frameRef.current = requestAnimationFrame(renderLive);
  }, [commitToBase]);

  const requestRender = useCallback(() => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(renderLive);
  }, [renderLive]);

  // ---------------- O'lcham (4:3, konteynerga sig'adigan) ----------------
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      let w = width;
      let h = width / ASPECT;
      if (h > height) {
        h = height;
        w = height * ASPECT;
      }
      w = Math.floor(w);
      h = Math.floor(h);
      if (w <= 0 || h <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w, h, dpr };
      for (const c of [baseRef.current, liveRef.current]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      }
      redrawBase();
      requestRender();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    return () => ro.disconnect();
  }, [redrawBase, requestRender]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // ---------------- Socket ----------------
  useEffect(() => {
    const socket = getSocket();

    const join = () => {
      socket.emit("board:join", code, (res) => {
        setConnected(Boolean(res?.ok));
        if (!res?.ok) return;
        const map = new Map();
        for (const s of res.strokes) map.set(s.id, s);
        // O'zim chizayotgan (hali yuborilmagan) chiziq yo'qolmasin.
        const mine = drawingRef.current?.stroke;
        if (mine && !map.has(mine.id)) map.set(mine.id, mine);
        strokesRef.current = map;
        myStackRef.current = myStackRef.current.filter((id) => map.has(id));
        setCanUndo(myStackRef.current.length > 0);
        redrawBase();
        requestRender();
      });
    };
    const onDisconnect = () => setConnected(false);

    const onStroke = (msg) => {
      const existing = strokesRef.current.get(msg.id);
      if (existing) {
        existing.points.push(...msg.points);
      } else {
        strokesRef.current.set(msg.id, { ...msg, points: [...msg.points] });
      }
      liveIdsRef.current.set(msg.id, performance.now());
      requestRender();
    };
    const onUndo = (id) => {
      if (strokesRef.current.delete(id)) {
        liveIdsRef.current.delete(id);
        redrawBase();
        requestRender();
      }
    };
    const onClear = () => {
      strokesRef.current.clear();
      liveIdsRef.current.clear();
      myStackRef.current = [];
      setCanUndo(false);
      redrawBase();
      requestRender();
    };

    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("disconnect", onDisconnect);
    socket.on("board:stroke", onStroke);
    socket.on("board:undo", onUndo);
    socket.on("board:clear", onClear);
    return () => {
      socket.emit("board:leave");
      socket.off("connect", join);
      socket.off("disconnect", onDisconnect);
      socket.off("board:stroke", onStroke);
      socket.off("board:undo", onUndo);
      socket.off("board:clear", onClear);
    };
  }, [code, redrawBase, requestRender]);

  // ---------------- Yuborish (40 ms paketlar) ----------------
  const flush = useCallback(() => {
    const d = drawingRef.current;
    if (!d || d.unsent.length === 0) return;
    const socket = getSocket();
    // Server bitta xabarda ko'pi bilan 500 nuqta qabul qiladi.
    while (d.unsent.length) {
      const points = d.unsent.splice(0, 400);
      if (!d.sentMeta) {
        const { id, tool: t, color: c, size } = d.stroke;
        socket.emit("board:stroke", { id, tool: t, color: c, size, points });
        d.sentMeta = true;
      } else {
        socket.emit("board:stroke", { id: d.stroke.id, points });
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(flush, FLUSH_MS);
    return () => clearInterval(timer);
  }, [flush]);

  // ---------------- Pointer ----------------
  const toPoint = (e) => {
    const rect = liveRef.current.getBoundingClientRect();
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
  };

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    liveRef.current.setPointerCapture(e.pointerId);
    const p = toPoint(e);
    const stroke = {
      id: newId(),
      tool,
      color: tool === "eraser" ? "#000000" : color,
      size: SIZES[sizeIdx] * TOOL_SCALE[tool],
      points: [p],
    };
    strokesRef.current.set(stroke.id, stroke);
    liveIdsRef.current.set(stroke.id, performance.now());
    drawingRef.current = { stroke, unsent: [p], sentMeta: false, pointerId: e.pointerId };
    requestRender();
  };

  const onPointerMove = (e) => {
    const d = drawingRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    // Tez harakatda brauzer oraliq nuqtalarni ham beradi — silliqroq chiziq.
    const events = e.nativeEvent.getCoalescedEvents?.() || [e.nativeEvent];
    const pts = d.stroke.points;
    for (const ev of events) {
      const p = toPoint(ev);
      const last = pts[pts.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < MIN_STEP) continue;
      if (pts.length >= 3900) break; // server chegarasi
      pts.push(p);
      d.unsent.push(p);
    }
    liveIdsRef.current.set(d.stroke.id, performance.now());
    requestRender();
  };

  const endStroke = (e) => {
    const d = drawingRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    flush();
    drawingRef.current = null;
    liveIdsRef.current.delete(d.stroke.id);
    commitToBase(d.stroke);
    myStackRef.current.push(d.stroke.id);
    setCanUndo(true);
    requestRender();
  };

  // ---------------- Amallar ----------------
  const undo = () => {
    const id = myStackRef.current.pop();
    setCanUndo(myStackRef.current.length > 0);
    if (!id) return;
    strokesRef.current.delete(id);
    getSocket().emit("board:undo", id);
    redrawBase();
  };

  const clearAll = () => {
    if (!window.confirm(t("studyRoom.whiteboard.clearConfirm"))) return;
    strokesRef.current.clear();
    liveIdsRef.current.clear();
    myStackRef.current = [];
    setCanUndo(false);
    getSocket().emit("board:clear");
    redrawBase();
    requestRender();
  };

  const exportPng = () => {
    const base = baseRef.current;
    const out = document.createElement("canvas");
    out.width = base.width;
    out.height = base.height;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(base, 0, 0);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = `doska-${code}.png`;
    a.click();
  };

  // Ctrl/Cmd+Z — undo.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Asboblar paneli */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#12213D]/[0.07] bg-white px-2 py-1.5">
        <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} title={t("studyRoom.whiteboard.pen")}>
          <LuPen size={17} />
        </ToolButton>
        <ToolButton active={tool === "highlighter"} onClick={() => setTool("highlighter")} title={t("studyRoom.whiteboard.marker")}>
          <LuHighlighter size={17} />
        </ToolButton>
        <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} title={t("studyRoom.whiteboard.eraser")}>
          <LuEraser size={17} />
        </ToolButton>

        <span className="mx-1 h-6 w-px bg-[#12213D]/10" />

        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={t("studyRoom.whiteboard.color", { c })}
            onClick={() => {
              setColor(c);
              if (tool === "eraser") setTool("pen");
            }}
            className={`h-7 w-7 rounded-full border-2 transition ${
              color === c && tool !== "eraser" ? "border-[#12213D] scale-110" : "border-white shadow-sm"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        <span className="mx-1 h-6 w-px bg-[#12213D]/10" />

        {SIZES.map((_, i) => (
          <ToolButton key={i} active={sizeIdx === i} onClick={() => setSizeIdx(i)} title={t("studyRoom.whiteboard.size", { n: i + 1 })}>
            <span className="rounded-full bg-current" style={{ width: 4 + i * 4, height: 4 + i * 4 }} />
          </ToolButton>
        ))}

        <div className="ml-auto flex items-center gap-1">
          {!connected && <span className="mr-1 text-[11px] font-semibold text-amber-600">{t("studyRoom.whiteboard.connecting")}</span>}
          <ToolButton active={grid} onClick={() => setGrid((g) => !g)} title={t("studyRoom.whiteboard.grid")}>
            <LuGrid3X3 size={17} />
          </ToolButton>
          <ToolButton onClick={undo} disabled={!canUndo} title={t("studyRoom.whiteboard.undo")}>
            <LuUndo2 size={17} />
          </ToolButton>
          <ToolButton onClick={exportPng} title={t("studyRoom.whiteboard.save")}>
            <LuDownload size={17} />
          </ToolButton>
          <ToolButton onClick={clearAll} title={t("studyRoom.whiteboard.clear")}>
            <LuTrash2 size={17} />
          </ToolButton>
        </div>
      </div>

      {/* Doska */}
      <div className="flex min-h-0 flex-1 bg-[#eef0f5] p-2">
        <div ref={wrapRef} className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <div
            className="relative overflow-hidden rounded-lg bg-white shadow-sm"
            style={grid ? GRID_STYLE : undefined}
          >
            <canvas ref={baseRef} className="block" />
            <canvas
              ref={liveRef}
              className={`absolute inset-0 block touch-none ${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
