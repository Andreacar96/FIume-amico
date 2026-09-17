import type { TemperatureReading } from "@/lib/types/database";

export const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const SERIES_COLORS = ["var(--primary)", "var(--accent)", "var(--moss)", "var(--primary-light)"];

export type ChartSeries = {
  name: string;
  color: string;
  values: (number | null)[];
};

export function buildTemperatureSeries(readings: TemperatureReading[], maxSeries = 4): ChartSeries[] {
  const byBody = new Map<string, number[][]>();

  for (const r of readings) {
    const month = new Date(r.recorded_at).getMonth();
    if (!byBody.has(r.water_body_name)) {
      byBody.set(r.water_body_name, Array.from({ length: 12 }, () => []));
    }
    byBody.get(r.water_body_name)![month].push(r.temperature_celsius);
  }

  const ranked = [...byBody.entries()].sort((a, b) => {
    const countA = a[1].reduce((sum, m) => sum + m.length, 0);
    const countB = b[1].reduce((sum, m) => sum + m.length, 0);
    return countB - countA;
  });

  return ranked.slice(0, maxSeries).map(([name, months], i) => ({
    name,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    values: months.map((vals) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null)),
  }));
}
