import type { TemperatureReading } from "@/lib/types/database";

export const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const SERIES_COLORS = ["var(--primary)", "var(--accent)", "var(--moss)", "var(--primary-light)"];

export type ChartSeries = {
  name: string;
  color: string;
  values: (number | null)[];
};

function readingCount(months: number[][]) {
  return months.reduce((sum, m) => sum + m.length, 0);
}

export function buildTemperatureSeries(
  readings: TemperatureReading[],
  options?: { only?: string[]; maxSeries?: number },
): ChartSeries[] {
  const maxSeries = options?.maxSeries ?? 4;
  const byBody = new Map<string, number[][]>();

  for (const r of readings) {
    const month = new Date(r.recorded_at).getMonth();
    if (!byBody.has(r.water_body_name)) {
      byBody.set(r.water_body_name, Array.from({ length: 12 }, () => []));
    }
    byBody.get(r.water_body_name)![month].push(r.temperature_celsius);
  }

  const only = options?.only?.filter((name) => byBody.has(name)) ?? [];
  const names =
    only.length > 0
      ? only
      : [...byBody.entries()]
          .sort((a, b) => readingCount(b[1]) - readingCount(a[1]))
          .slice(0, maxSeries)
          .map(([name]) => name);

  return names.map((name, i) => ({
    name,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    values: byBody.get(name)!.map((vals) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null)),
  }));
}

export function distinctWaterBodies(readings: TemperatureReading[]): string[] {
  return [...new Set(readings.map((r) => r.water_body_name))].sort((a, b) => a.localeCompare(b, "it"));
}
