"use client";

import { useState } from "react";
import { BarChart, LineChart, type ChartSeries } from "@/components/simple-charts";
import { catColor } from "@/lib/cat-colors";
import { defaultCompareIds, metricPoints, toggleCompareId, type MetricKey } from "@/lib/chart-series";
import type { PublicCat, PublicLog } from "@/lib/serialize";

export function ChartsView({
  cats,
  selectedId,
  logs,
  days,
}: {
  cats: PublicCat[];
  selectedId: string;
  logs: PublicLog[];
  days: string[];
}) {
  const ids = cats.map((cat) => cat.id);
  const [activeIds, setActiveIds] = useState(() => defaultCompareIds(ids, selectedId));

  function seriesFor(metric: MetricKey): ChartSeries[] {
    return activeIds.flatMap((id) => {
      const cat = cats.find((item) => item.id === id);
      if (!cat) return [];
      return [
        {
          id,
          name: cat.name,
          color: catColor(id, ids).hex,
          points: metricPoints(logs, id, metric),
        },
      ];
    });
  }

  const weight = seriesFor("weight");
  const appetite = seriesFor("appetite");
  const vomit = seriesFor("vomit");
  const litter = seriesFor("litter");

  return (
    <>
      {cats.length > 1 ? (
        <section className="card mb-4 p-4">
          <p className="mb-2 text-sm font-bold">함께 볼 고양이 (최대 3마리)</p>
          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => {
              const on = activeIds.includes(cat.id);
              const color = catColor(cat.id, ids).hex;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="chip"
                  data-active={on ? "true" : "false"}
                  style={on ? { background: color, borderColor: color, color: "#fff" } : { borderColor: color }}
                  onClick={() => setActiveIds((current) => toggleCompareId(current, cat.id))}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-5 text-ink-soft">
            색은 달력 점과 같아요. 한 마리는 항상 켜져 있어요.
          </p>
        </section>
      ) : null}

      <ul className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
        {activeIds.map((id) => {
          const cat = cats.find((item) => item.id === id);
          if (!cat) return null;
          return (
            <li key={id} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: catColor(id, ids).hex }} />
              {cat.name}
            </li>
          );
        })}
      </ul>

      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-extrabold">체중</h2>
        <LineChart series={weight} days={days} unit="kg" empty="체중 기록이 아직 없어요." />
      </section>
      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-extrabold">식욕 (0 안 먹음–3 많음)</h2>
        <BarChart series={appetite} days={days} empty="식욕 기록이 아직 없어요." />
      </section>
      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-extrabold">구토 있는 날</h2>
        <BarChart series={vomit} days={days} empty="구토 기록이 아직 없어요." />
      </section>
      <section className="card p-4">
        <h2 className="mb-2 font-extrabold">화장실 횟수</h2>
        <BarChart series={litter} days={days} empty="대변 횟수 기록이 아직 없어요." />
      </section>
    </>
  );
}
