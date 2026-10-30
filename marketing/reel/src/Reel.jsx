import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/InterTight";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });

const INK = "#111827";
const BLUE = "#087fd1";
const LOGO_BLUE = "#1a6dff";
const RED = "#e4002b";
const BG = "#f5f6f4";
const MUTED = "#667085";
const GREEN = "#10b981";
const AMBER = "#f59e0b";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// Kadr bo'yicha sound effectlar: [kadr, fayl, ovoz balandligi]
const SFX = [
  [0, "whoosh", 0.8],
  [7, "hit", 1],
  [62, "swoosh", 0.7],
  [80, "shimmer", 0.7],
  [96, "pop", 0.6],
  [103, "pop_hi", 0.5],
  [148, "swoosh", 0.6],
  [160, "click", 0.8],
  [178, "click", 0.8],
  [186, "click", 0.8],
  ...[195, 205, 215, 225].map((f) => [f, "tick", 0.7]),
  [232, "ding", 0.6],
  [253, "swoosh", 0.6],
  [264, "type", 0.6],
  [273, "pop", 0.5],
  [281, "pop", 0.5],
  [289, "pop", 0.5],
  [318, "ding", 0.55],
  [342, "riser", 0.75],
  [350, "pop", 0.6],
  [357, "pop_hi", 0.6],
  [364, "pop", 0.6],
  [371, "pop_hi", 0.6],
  [390, "impact", 1],
  [402, "shimmer", 0.45],
];

const useSpring = (delay, config = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 170, mass: 0.6, ...config } });
};

// Sahna oxirida yumshoq chiqib ketish
const useExit = (start, len = 8) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
};

const Grid = ({ color = "rgba(17,24,39,0.05)" }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`,
      backgroundSize: "90px 90px",
      maskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 75%)",
    }}
  />
);

const Glow = ({ color, x = "50%", y = "40%", size = 900, opacity = 0.35 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      background: color,
      filter: "blur(160px)",
      opacity,
    }}
  />
);

// Pastdan blur bilan chiqadigan matn
const Rise = ({ delay, children, style, distance = 60 }) => {
  const s = useSpring(delay);
  return (
    <div
      style={{
        transform: `translateY(${(1 - s) * distance}px)`,
        opacity: interpolate(s, [0, 0.6], [0, 1], clamp),
        filter: `blur(${(1 - s) * 10}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Sahna kamerasi: sekin zoom + chiqishda masshtab
const Camera = ({ children, exit = 0, dir = 1 }) => {
  const frame = useCurrentFrame();
  const zoom = 1 + frame * 0.0006;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom * (1 + exit * 0.08)}) translateX(${exit * -120 * dir}px)`,
        opacity: 1 - exit,
        filter: `blur(${exit * 14}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Title = ({ children, size = 104, color = INK, style }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "-0.045em",
      lineHeight: 1.02,
      color,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- 1. Hook ---------------- */
function SceneHook() {
  const frame = useCurrentFrame();
  const slam = useSpring(5, { damping: 11, stiffness: 220 });
  const shake = frame >= 7 && frame < 16 ? Math.sin(frame * 9) * (16 - frame) * 2.2 : 0;
  const q = useSpring(22, { damping: 7, stiffness: 260 });

  return (
    <AbsoluteFill style={{ background: "#0b1220", overflow: "hidden" }}>
      <Glow color={BLUE} y="45%" size={1000} opacity={0.45 + Math.sin(frame / 8) * 0.05} />
      <Glow color={RED} x="85%" y="80%" size={600} opacity={0.18} />
      <Grid color="rgba(255,255,255,0.05)" />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${shake}px, ${-shake * 0.6}px) scale(${1 + frame * 0.0012})`,
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(slam, [0, 1], [2.4, 1])})`,
            opacity: interpolate(slam, [0, 0.3], [0, 1], clamp),
            filter: `blur(${(1 - slam) * 18}px)`,
            background: BLUE,
            color: "white",
            fontSize: 170,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            padding: "4px 44px 18px",
            borderRadius: 36,
            boxShadow: `0 30px 90px ${BLUE}88`,
          }}
        >
          SAT’ga
        </div>
        <Rise delay={13} style={{ marginTop: 34 }}>
          <Title size={94} color="white">
            tayyorlanyapsizmi
            <span style={{ display: "inline-block", color: "#53b7f5", transform: `scale(${q}) rotate(${(1 - q) * 40}deg)` }}>?</span>
          </Title>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ---------------- 2. Logo ---------------- */
function SceneLogo() {
  const logo = useSpring(6, { damping: 12 });
  const exit = useExit(68);
  const frame = useCurrentFrame();
  const shine = interpolate(frame, [10, 34], [-40, 140], clamp);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Glow color={LOGO_BLUE} y="42%" size={800} opacity={0.18} />
      <Grid />
      <Camera exit={exit}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              transform: `scale(${interpolate(logo, [0, 1], [0.55, 1])})`,
              opacity: interpolate(logo, [0, 0.4], [0, 1], clamp),
              WebkitMaskImage: `linear-gradient(105deg, black ${shine - 20}%, rgba(0,0,0,0.75) ${shine}%, black ${shine + 20}%)`,
            }}
          >
            <Img src={staticFile("logo.png")} style={{ width: 820 }} />
          </div>
          <Rise delay={20} style={{ marginTop: 40 }}>
            <Title size={66} color={INK} style={{ fontWeight: 600 }}>
              Digital SAT mock testlar
            </Title>
          </Rise>
          <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
            {["Online", "Bluebook formati", "Adaptiv"].map((label, i) => (
              <Rise key={label} delay={24 + i * 6} distance={30}>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 600,
                    color: i === 1 ? "white" : INK,
                    background: i === 1 ? INK : "white",
                    border: "2px solid rgba(17,24,39,0.08)",
                    padding: "14px 28px",
                    borderRadius: 999,
                  }}
                >
                  {label}
                </div>
              </Rise>
            ))}
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
}

/* ---------------- 3. Adaptiv format ---------------- */
const ModuleCard = ({ delay, label, sub, bg, color, width = 420, glow }) => {
  const s = useSpring(delay, { damping: 12 });
  return (
    <div
      style={{
        width,
        padding: "34px 30px",
        borderRadius: 32,
        background: bg,
        color,
        textAlign: "center",
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${(1 - s) * 40}px)`,
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        boxShadow: glow ? `0 25px 70px ${glow}` : "0 18px 50px rgba(17,24,39,0.10)",
        border: "2px solid rgba(17,24,39,0.06)",
      }}
    >
      <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, opacity: 0.7, marginTop: 6 }}>{sub}</div>
    </div>
  );
};

function SceneFormat() {
  const frame = useCurrentFrame();
  const exit = useExit(97);
  const branch = interpolate(frame, [18, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const scoreIn = useSpring(40);
  const score = Math.round(interpolate(frame, [45, 82], [400, 1520], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const done = useSpring(82, { damping: 8, stiffness: 240 });
  const secs = 32 * 60 - Math.floor(Math.max(0, frame - 40) / 10);
  const pulse = frame > 82 ? 1 + 0.06 * Math.max(0, 1 - (frame - 82) / 12) : 1;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Glow color={BLUE} x="20%" y="25%" size={700} opacity={0.14} />
      <Grid />
      <Camera exit={exit}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
          <Rise delay={0}>
            <Title>
              Haqiqiy imtihon
              <br />
              <span style={{ color: BLUE }}>formatida</span>
            </Title>
          </Rise>

          <div style={{ marginTop: 90, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ModuleCard delay={10} label="Module 1" sub="Reading & Writing · Math" bg={INK} color="white" width={640} />
            <svg width="640" height="110" style={{ overflow: "visible" }}>
              {[160, 480].map((x) => (
                <path
                  key={x}
                  d={`M320 0 C320 60, ${x} 40, ${x} 110`}
                  fill="none"
                  stroke={x === 160 ? BLUE : "#c4cbd4"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="300"
                  strokeDashoffset={300 * (1 - branch)}
                />
              ))}
            </svg>
            <div style={{ display: "flex", gap: 40 }}>
              <ModuleCard delay={28} label="Module 2" sub="Hard" bg={BLUE} color="white" width={300} glow={`${BLUE}66`} />
              <ModuleCard delay={36} label="Module 2" sub="Easy" bg="white" color="#98a2b3" width={300} />
            </div>
          </div>

          <div
            style={{
              marginTop: 70,
              display: "flex",
              alignItems: "center",
              gap: 34,
              opacity: interpolate(scoreIn, [0, 0.5], [0, 1], clamp),
              transform: `translateY(${(1 - scoreIn) * 50}px) scale(${pulse})`,
            }}
          >
            <div style={{ background: "white", borderRadius: 32, padding: "26px 40px", boxShadow: "0 18px 50px rgba(17,24,39,0.10)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#98a2b3", letterSpacing: "0.12em" }}>BALL · 400–1600</div>
              <div style={{ fontSize: 110, fontWeight: 800, color: INK, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {score}
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 16,
                    fontSize: 54,
                    color: GREEN,
                    transform: `scale(${done})`,
                  }}
                >
                  ✓
                </span>
              </div>
            </div>
            <div style={{ background: INK, color: "white", borderRadius: 28, padding: "24px 30px", fontSize: 46, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              ⏱ {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
            </div>
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
}

/* ---------------- 4. Mavzular tahlili ---------------- */
const Bar = ({ delay, label, pct, color, warn }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 24], [0, pct], { ...clamp, easing: Easing.out(Easing.cubic) });
  const s = useSpring(delay - 4);
  const flag = useSpring(63, { damping: 9, stiffness: 220 });
  return (
    <div style={{ opacity: interpolate(s, [0, 0.5], [0, 1], clamp), transform: `translateX(${(1 - s) * -60}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, fontWeight: 600, color: "#344054", marginBottom: 16 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {label}
          {warn && (
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "white",
                background: RED,
                padding: "8px 20px",
                borderRadius: 999,
                transform: `scale(${flag})`,
                display: "inline-block",
              }}
            >
              E’tibor bering
            </span>
          )}
        </span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(p)}%</span>
      </div>
      <div style={{ height: 26, borderRadius: 999, background: "rgba(17,24,39,0.07)", overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
};

function SceneAnalysis() {
  const exit = useExit(82);
  const card = useSpring(8);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Glow color={GREEN} x="80%" y="70%" size={700} opacity={0.12} />
      <Grid />
      <Camera exit={exit}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
          <Rise delay={0}>
            <Title size={92}>
              Qayerda xato
              <br />
              qilayotganingizni
              <br />
              <span style={{ color: BLUE }}>ko’ring</span>
            </Title>
          </Rise>
          <div
            style={{
              marginTop: 90,
              width: 860,
              background: "white",
              borderRadius: 44,
              padding: "56px 56px",
              display: "flex",
              flexDirection: "column",
              gap: 46,
              boxShadow: "0 30px 80px rgba(17,24,39,0.12)",
              opacity: interpolate(card, [0, 0.5], [0, 1], clamp),
              transform: `translateY(${(1 - card) * 80}px)`,
            }}
          >
            <Bar delay={18} label="Algebra" pct={86} color={GREEN} />
            <Bar delay={26} label="Advanced Math" pct={64} color={AMBER} />
            <Bar delay={34} label="Craft & Structure" pct={52} color={RED} warn />
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
}

/* ---------------- 5. Imkoniyatlar ---------------- */
const FEATURES = [
  ["24", "Study Plan", "kun qoldi", AMBER],
  ["98", "Oylik to’plamlar", "savol · May", RED],
  ["Aa", "Vocabulary", "kartochkalar", INK],
  ["#1", "Reyting", "o’quvchilar orasida", BLUE],
];

function SceneFeatures() {
  const exit = useExit(38, 7);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Grid />
      <Camera exit={exit}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Rise delay={0}>
            <Title size={96}>
              Hammasi <span style={{ color: BLUE }}>bir joyda</span>
            </Title>
          </Rise>
          <div style={{ marginTop: 70, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            {FEATURES.map(([icon, title, sub, color], i) => (
              <FeatureTile key={title} delay={5 + i * 7} icon={icon} title={title} sub={sub} color={color} />
            ))}
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
}

const FeatureTile = ({ delay, icon, title, sub, color }) => {
  const s = useSpring(delay, { damping: 10, stiffness: 240 });
  return (
    <div
      style={{
        width: 420,
        height: 360,
        borderRadius: 40,
        background: "white",
        padding: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 22px 60px rgba(17,24,39,0.10)",
        transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: 30,
          background: `${color}1a`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 50,
          fontWeight: 800,
          letterSpacing: "-0.04em",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 44, fontWeight: 700, color: INK, letterSpacing: "-0.03em" }}>{title}</div>
        <div style={{ fontSize: 30, fontWeight: 500, color: MUTED, marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
};

/* ---------------- 6. CTA ---------------- */
function SceneCTA() {
  const frame = useCurrentFrame();
  const logo = useSpring(2, { damping: 10, stiffness: 200 });
  const btn = useSpring(14, { damping: 9, stiffness: 200 });
  const flash = interpolate(frame, [0, 6], [0.9, 0], clamp);
  const ring = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const breathe = frame > 30 ? 1 + Math.sin((frame - 30) / 5) * 0.025 : 1;
  const arrow = frame > 30 ? Math.sin((frame - 30) / 4) * 10 : 0;

  return (
    <AbsoluteFill style={{ background: BLUE, overflow: "hidden" }}>
      <Glow color="#53b7f5" y="40%" size={1100} opacity={0.5} />
      <Glow color={INK} x="50%" y="110%" size={900} opacity={0.35} />
      <Grid color="rgba(255,255,255,0.07)" />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          width: 1800 * ring,
          height: 1800 * ring,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: `${10 * (1 - ring) + 2}px solid rgba(255,255,255,${0.6 * (1 - ring)})`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${1 + frame * 0.0008})` }}>
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 640,
            filter: "brightness(0) invert(1)",
            transform: `scale(${interpolate(logo, [0, 1], [1.8, 1])})`,
            opacity: interpolate(logo, [0, 0.3], [0, 1], clamp),
          }}
        />
        <Rise delay={8} style={{ marginTop: 70 }}>
          <Title size={112} color="white">
            Hoziroq
            <br />
            boshlang
          </Title>
        </Rise>
        <div
          style={{
            marginTop: 70,
            background: "white",
            color: BLUE,
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            padding: "30px 64px",
            borderRadius: 999,
            boxShadow: "0 30px 80px rgba(11,18,32,0.35)",
            transform: `scale(${btn * breathe})`,
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          prep-zone.uz
          <span style={{ display: "inline-block", transform: `translateX(${arrow}px)` }}>→</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
}

/* ---------------- Montaj ---------------- */
function Wipe() {
  // 1-sahnadan logoga o'tish: ko'k doira ekranni yopadi
  const frame = useCurrentFrame();
  const r = interpolate(frame, [62, 80], [0, 1200], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  if (frame < 62 || frame > 96) return null;
  return <AbsoluteFill style={{ background: BLUE, clipPath: `circle(${r}px at 50% 50%)` }} />;
}

function Reveal({ children }) {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [0, 18], [0, 1200], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>{children}</AbsoluteFill>;
}

export function Reel() {
  return (
    <AbsoluteFill style={{ fontFamily, background: "#0b1220" }}>
      <Sequence durationInFrames={82}>
        <SceneHook />
      </Sequence>
      <Wipe />
      <Sequence from={76} durationInFrames={74}>
        <Reveal>
          <SceneLogo />
        </Reveal>
      </Sequence>
      <Sequence from={150} durationInFrames={105}>
        <SceneFormat />
      </Sequence>
      <Sequence from={255} durationInFrames={90}>
        <SceneAnalysis />
      </Sequence>
      <Sequence from={345} durationInFrames={45}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={390} durationInFrames={60}>
        <SceneCTA />
      </Sequence>

      {SFX.map(([from, name, volume], i) => (
        <Sequence key={i} from={from} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
