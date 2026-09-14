import { displayShort } from "@/lib/dates";

export type ChartPoint = { date: string; value: number };

export type ChartSeries = {
  id: string;
  name: string;
  color: string;
  points: ChartPoint[];
};

function plottedFor(series: ChartSeries, days: string[], mapX: (index: number) => number, mapY: (value: number) => number) {
  return days
    .map((date, index) => {
      const point = series.points.find((item) => item.date === date);
      return point ? { x: mapX(index), y: mapY(point.value), ...point } : null;
    })
    .filter((item): item is { x: number; y: number; date: string; value: number } => item !== null);
}

export function LineChart({
  series,
  days,
  unit,
  empty,
}: {
  series: ChartSeries[];
  days: string[];
  unit?: string;
  empty: string;
}) {
  const values = series.flatMap((item) => item.points.map((point) => point.value));
  if (values.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-soft">{empty}</p>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = min === max ? 0.2 : (max - min) * 0.15;
  const bottom = min - pad;
  const top = max + pad;
  const width = 320;
  const height = 140;
  const mapX = (index: number) => (days.length <= 1 ? width / 2 : (index / (days.length - 1)) * (width - 16) + 8);
  const mapY = (value: number) => height - ((value - bottom) / (top - bottom)) * (height - 16) - 8;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        {series.map((item) => {
          const plotted = plottedFor(item, days, mapX, mapY);
          if (plotted.length === 0) return null;
          const path = plotted.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
          return (
            <g key={item.id}>
              <path d={path} fill="none" stroke={item.color} strokeWidth="2.6" strokeLinecap="round" />
              {plotted.map((point) => (
                <circle key={`${item.id}-${point.date}`} cx={point.x} cy={point.y} r="3.5" fill={item.color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-ink-soft">
        <span>{displayShort(days[0])}</span>
        <span>{unit ? `단위 ${unit}` : ""}</span>
        <span>{displayShort(days[days.length - 1])}</span>
      </div>
    </div>
  );
}

export function BarChart({
  series,
  days,
  empty,
}: {
  series: ChartSeries[];
  days: string[];
  empty: string;
}) {
  const values = series.flatMap((item) => item.points.map((point) => point.value));
  if (values.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-soft">{empty}</p>;
  }
  const max = Math.max(1, ...values);

  return (
    <div className="flex h-40 items-end gap-0.5">
      {days.map((date) => (
        <div key={date} className="flex h-full min-w-0 flex-1 items-end justify-center gap-px">
          {series.map((item) => {
            const point = item.points.find((entry) => entry.date === date);
            const value = point?.value ?? 0;
            return (
              <div
                key={item.id}
                className="min-w-0 flex-1 rounded-t"
                style={{
                  height: `${Math.max(point ? (value / max) * 100 : 0, point ? 3 : 0)}%`,
                  background: item.color,
                  opacity: point ? 1 : 0,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
