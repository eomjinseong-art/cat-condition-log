import {
  appetiteLabels,
  energyLabels,
  labelOrDash,
  stoolLabels,
  urineLabels,
  waterLabels,
} from "@/lib/labels";
import type { PublicLog } from "@/lib/serialize";

export function LogFacts({ log }: { log: PublicLog }) {
  return (
    <ul className="mt-2 space-y-1 text-sm leading-7">
      <li>식욕 {labelOrDash(log.appetite, appetiteLabels)}</li>
      <li>음수 {labelOrDash(log.water, waterLabels)}</li>
      <li>
        대변 {log.stoolCount ?? "—"}회 · {labelOrDash(log.stoolQuality, stoolLabels)}
      </li>
      <li>소변 {labelOrDash(log.urine, urineLabels)}</li>
      <li>구토 {labelOrDash(log.vomit)}</li>
      <li>컨디션 {labelOrDash(log.energy, energyLabels)}</li>
      <li>체중 {log.weightKg !== null ? `${log.weightKg.toFixed(2)}kg` : "—"}</li>
      {log.memo ? <li>메모 {log.memo}</li> : null}
    </ul>
  );
}
