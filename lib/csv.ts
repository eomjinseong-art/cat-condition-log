import {
  appetiteLabels,
  energyLabels,
  labelOrDash,
  stoolLabels,
  urineLabels,
  waterLabels,
} from "@/lib/labels";
import type { PublicCat, PublicLog } from "@/lib/serialize";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function logsToCsv(cats: PublicCat[], logs: PublicLog[]) {
  const catNames = new Map(cats.map((cat) => [cat.id, cat.name]));
  const header = [
    "날짜",
    "고양이",
    "식욕",
    "음수",
    "대변횟수",
    "대변성상",
    "소변",
    "구토",
    "컨디션",
    "체중kg",
    "음식메모",
    "구토메모",
    "메모",
  ];

  const rows = [...logs]
    .sort((a, b) => a.loggedOn.localeCompare(b.loggedOn) || (catNames.get(a.catId) ?? "").localeCompare(catNames.get(b.catId) ?? ""))
    .map((log) => [
      log.loggedOn,
      catNames.get(log.catId) ?? log.catId,
      labelOrDash(log.appetite, appetiteLabels),
      labelOrDash(log.water, waterLabels),
      log.stoolCount === null ? "" : String(log.stoolCount),
      labelOrDash(log.stoolQuality, stoolLabels),
      labelOrDash(log.urine, urineLabels),
      labelOrDash(log.vomit),
      labelOrDash(log.energy, energyLabels),
      log.weightKg === null ? "" : log.weightKg.toFixed(2),
      log.foodNote ?? "",
      log.vomitNote ?? "",
      log.memo ?? "",
    ]);

  return [header, ...rows].map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");
}
