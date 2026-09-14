import { appetiteScore, type AppetiteKey } from "./labels";
import type { PublicLog } from "./serialize";

export type MetricKey = "weight" | "appetite" | "vomit" | "litter";

export function defaultCompareIds(ids: string[], selectedId: string, max = 3) {
  if (ids.length === 0) return [];
  const selected = ids.includes(selectedId) ? selectedId : ids[0];
  const rest = ids.filter((id) => id !== selected);
  return [selected, ...rest].slice(0, Math.min(max, ids.length));
}

export function toggleCompareId(current: string[], id: string, max = 3) {
  if (current.includes(id)) {
    if (current.length === 1) return current;
    return current.filter((item) => item !== id);
  }
  if (current.length >= max) return current;
  return [...current, id];
}

export function metricPoints(logs: PublicLog[], catId: string, metric: MetricKey) {
  const points: Array<{ date: string; value: number }> = [];
  for (const log of logs) {
    if (log.catId !== catId) continue;
    if (metric === "weight" && log.weightKg != null) {
      points.push({ date: log.loggedOn, value: log.weightKg });
    } else if (metric === "appetite" && log.appetite) {
      points.push({ date: log.loggedOn, value: appetiteScore[log.appetite as AppetiteKey] });
    } else if (metric === "vomit" && log.vomit === true) {
      points.push({ date: log.loggedOn, value: 1 });
    } else if (metric === "litter" && log.stoolCount != null) {
      points.push({ date: log.loggedOn, value: log.stoolCount });
    }
  }
  return points;
}
