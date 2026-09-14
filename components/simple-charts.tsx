import { displayShort } from "@/lib/dates";

type Point = { date: string; value: number };

export function LineChart({
  points,
  days,
  unit,
  empty,
}: {
  points: Point[];
  days: string[];
  unit?: string;
  empty: string;
}) {
  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-soft">{empty}</p>;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = min === max ? 0.2 : (max - min) * 0.15;
  const bottom = min - pad;
  const top = max + pad;
  const width = 320;
  const height = 140;
  const mapX = (index: number) => (days.length <= 1 ? width / 2 : (index / (days.length - 1)) * (width - 16) + 8);
  const mapY = (value: number) => height - ((value - bottom) / (top - bottom)) * (height - 16) - 8;
  const plotted = days
    .map((date, index) => {
      const point = points.find((item) => item.date === date);
      return point ? { x: mapX(index), y: mapY(point.value), ...point } : null;
    })
    .filter((item): item is { x: number; y: number; date: string; value: number } => item !== null);
  const path = plotted.map((item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item.y}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        <path d={path} fill="none" stroke="#c45c26" strokeWidth="3" strokeLinecap="round" />
        {plotted.map((item) => (
          <circle key={item.date} cx={item.x} cy={item.y} r="4" fill="#c45c26" />
        ))}
      </svg>
      <div className="flex justify-between text-[11px] text-ink-soft">
        <span>{displayShort(days[0])}</span>
        <span>
          {values[values.length - 1]?.toFixed(2)}
          {unit}
        </span>
        <span>{displayShort(days[days.length - 1])}</span>
      </div>
    </div>
  );
}

export function BarChart({
  points,
  days,
  empty,
}: {
  points: Point[];
  days: string[];
  empty: string;
}) {
  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-soft">{empty}</p>;
  }
  const max = Math.max(1, ...points.map((point) => point.value));
  return (
    <div className="flex h-40 items-end gap-1">
      {days.map((date) => {
        const point = points.find((item) => item.date === date);
        const value = point?.value ?? 0;
        return (
          <div key={date} className="flex h-full flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-accent"
              style={{ height: `${Math.max(value === 0 ? 2 : (value / max) * 100, 2)}%`, opacity: point ? 1 : 0.2 }}
            />
          </div>
        );
      })}
    </div>
  );
}
