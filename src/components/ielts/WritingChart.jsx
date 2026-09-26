// Writing Task 1 grafigi (ma'lumotlardan SVG): chiziqli yoki ustunli.
const COLORS = ["#1d1d1b", "#e4002b", "#1f6fb2", "#8a8a8a", "#2a9d8f"];
const DASHES = ["", "6 4", "2 3", "10 3 2 3", ""];

export default function WritingChart({ chart }) {
  const w = 560;
  const h = 320;
  const pad = { t: 36, r: 16, b: 64, l: 44 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = chart.yMax || Math.max(...chart.series.flatMap((s) => s.values)) * 1.1;
  const n = chart.categories.length;
  const x = (i) => pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  const ticks = Array.from({ length: 7 }, (_, i) => Math.round((max / 6) * i));

  return (
    <figure className="rounded border border-[#d7d7d7] bg-white p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={chart.title}>
        <text x={w / 2} y={18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1d1d1b">
          {chart.title}
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#1d1d1b" strokeOpacity="0.08" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#1d1d1b" fillOpacity="0.7">
              {t}
              {chart.unit}
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={w - pad.r} y1={pad.t + innerH} y2={pad.t + innerH} stroke="#1d1d1b" strokeOpacity="0.5" />
        {chart.categories.map((c, i) => (
          <text key={c} x={x(i)} y={pad.t + innerH + 18} textAnchor="middle" fontSize="11" fill="#1d1d1b">
            {c}
          </text>
        ))}
        {chart.series.map((s, si) => (
          <g key={s.name}>
            <polyline
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={COLORS[si % COLORS.length]}
              strokeWidth="2.2"
              strokeDasharray={DASHES[si % DASHES.length]}
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill={COLORS[si % COLORS.length]} />
            ))}
          </g>
        ))}
        {chart.series.map((s, si) => {
          const lx = pad.l + (si % 4) * (innerW / 4);
          return (
            <g key={s.name} transform={`translate(${lx}, ${h - 18})`}>
              <line x1="0" x2="22" y1="-4" y2="-4" stroke={COLORS[si % COLORS.length]} strokeWidth="2.2" strokeDasharray={DASHES[si % DASHES.length]} />
              <text x="28" y="0" fontSize="11" fill="#1d1d1b">
                {s.name}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
