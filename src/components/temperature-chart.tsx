import { MONTHS, type ChartSeries } from "@/lib/temperature-chart";

export function TemperatureChart({ series }: { series: ChartSeries[] }) {
  const w = 640;
  const h = 260;
  const padL = 34;
  const padB = 26;
  const padT = 14;
  const padR = 10;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const allValues = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const minT = allValues.length ? Math.floor(Math.min(0, ...allValues) / 5) * 5 : 0;
  const maxT = allValues.length ? Math.ceil(Math.max(25, ...allValues) / 5) * 5 : 25;

  const xFor = (i: number) => padL + (i / (MONTHS.length - 1)) * innerW;
  const yFor = (v: number) => padT + innerH - ((v - minT) / (maxT - minT)) * innerH;

  const gridLines: number[] = [];
  for (let t = minT; t <= maxT; t += 5) gridLines.push(t);

  function pathFor(values: (number | null)[]) {
    let d = "";
    let started = false;
    values.forEach((v, i) => {
      if (v == null) {
        started = false;
        return;
      }
      d += `${started ? "L" : "M"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)} `;
      started = true;
    });
    return d.trim();
  }

  return (
    <div className="bg-surface border border-border rounded-md p-6">
      <div className="flex gap-5 flex-wrap mb-4 text-[0.85rem]">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-text-muted">
            <span className="w-3.5 h-[3px] rounded-sm inline-block" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
        {series.length === 0 && <span className="text-text-muted">Nessun rilievo ancora.</span>}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {gridLines.map((t) => {
          const y = yFor(t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={4} y={y + 3} fontSize={10} fill="var(--text-muted)">
                {t}°
              </text>
            </g>
          );
        })}
        {series.map((s) => (
          <path key={s.name} d={pathFor(s.values)} fill="none" stroke={s.color} strokeWidth={2.5} />
        ))}
        {MONTHS.map((m, i) => (
          <text key={m} x={xFor(i)} y={h - 6} fontSize={10} fill="var(--text-muted)" textAnchor="middle">
            {m}
          </text>
        ))}
      </svg>
    </div>
  );
}
