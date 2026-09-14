import { ageLabel, displayDate, displayShort } from "@/lib/dates";
import {
  appetiteLabels,
  appetiteScore,
  energyLabels,
  labelOrDash,
  stoolLabels,
  urineLabels,
  waterLabels,
  type AppetiteKey,
} from "@/lib/labels";
import type { PublicCat, PublicLog, PublicReminder } from "@/lib/serialize";

export type ReportInput = {
  cat: PublicCat;
  from: string;
  to: string;
  logs: PublicLog[];
  reminders: PublicReminder[];
};

function countBy<T extends string>(values: Array<T | null | undefined>) {
  const counts = new Map<T, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function formatCounts<T extends string>(counts: Map<T, number>, labels: Record<T, string>) {
  const parts = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${labels[key]} ${count}일`);
  return parts.length ? parts.join(", ") : "기록 없음";
}

export function buildReport(input: ReportInput) {
  const { cat, from, to, logs, reminders } = input;
  const sorted = [...logs].sort((a, b) => a.loggedOn.localeCompare(b.loggedOn));
  const weights = sorted.filter((log) => log.weightKg !== null) as Array<PublicLog & { weightKg: number }>;
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const weightDelta =
    firstWeight && lastWeight ? Number((lastWeight.weightKg - firstWeight.weightKg).toFixed(2)) : null;

  const vomitDays = sorted.filter((log) => log.vomit === true).length;
  const noVomitDays = sorted.filter((log) => log.vomit === false).length;
  const stoolDays = sorted.filter((log) => log.stoolCount !== null);
  const stoolAverage =
    stoolDays.length > 0
      ? Number((stoolDays.reduce((sum, log) => sum + (log.stoolCount ?? 0), 0) / stoolDays.length).toFixed(2))
      : null;

  const appetiteCounts = countBy(sorted.map((log) => log.appetite));
  const waterCounts = countBy(sorted.map((log) => log.water));
  const stoolCounts = countBy(sorted.map((log) => log.stoolQuality));
  const urineCounts = countBy(sorted.map((log) => log.urine));
  const energyCounts = countBy(sorted.map((log) => log.energy));

  const identity = [
    `이름: ${cat.name}`,
    `나이: ${ageLabel(cat.birthDate) ?? "미입력"}`,
    `최근 체중: ${lastWeight ? `${lastWeight.weightKg.toFixed(2)}kg` : cat.weightKg !== null ? `${cat.weightKg.toFixed(2)}kg` : "미입력"}`,
    cat.notes ? `보호자 메모: ${cat.notes}` : null,
  ].filter(Boolean) as string[];

  const trends = [
    `기간: ${displayDate(from)} – ${displayDate(to)}`,
    `기록 일수: ${sorted.length}일`,
    weightDelta === null
      ? "체중: 기간 내 체중 기록 없음"
      : `체중: ${firstWeight.weightKg.toFixed(2)}kg → ${lastWeight.weightKg.toFixed(2)}kg (변화 ${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(2)}kg, 기록 ${weights.length}일)`,
    `식욕: ${formatCounts(appetiteCounts, appetiteLabels)}`,
    `음수: ${formatCounts(waterCounts, waterLabels)}`,
    `대변 횟수 평균: ${stoolAverage === null ? "기록 없음" : `${stoolAverage}회`} / 성상: ${formatCounts(stoolCounts, stoolLabels)}`,
    `소변: ${formatCounts(urineCounts, urineLabels)}`,
    `구토: 있음 ${vomitDays}일, 없음 ${noVomitDays}일`,
    `컨디션: ${formatCounts(energyCounts, energyLabels)}`,
  ];

  const timeline = sorted.map((log) => ({
    date: log.loggedOn,
    dateLabel: displayShort(log.loggedOn),
    rows: [
      ["식욕", labelOrDash(log.appetite, appetiteLabels)],
      ["음수", labelOrDash(log.water, waterLabels)],
      ["대변", [log.stoolCount !== null ? `${log.stoolCount}회` : null, labelOrDash(log.stoolQuality, stoolLabels)].filter((part) => part && part !== "—").join(" · ") || "—"],
      ["소변", labelOrDash(log.urine, urineLabels)],
      ["구토", labelOrDash(log.vomit)],
      ["컨디션", labelOrDash(log.energy, energyLabels)],
      ["체중", log.weightKg !== null ? `${log.weightKg.toFixed(2)}kg` : "—"],
      ["메모", log.memo || log.foodNote || log.vomitNote || "—"],
    ] as Array<[string, string]>,
  }));

  const meds = reminders.map((reminder) => ({
    title: reminder.title,
    dueOn: reminder.dueOn,
    completed: Boolean(reminder.completedAt),
    notes: reminder.notes,
    type: reminder.type,
  }));

  return {
    catName: cat.name,
    from,
    to,
    identity,
    trends,
    timeline,
    meds,
    logCount: sorted.length,
    weightSeries: weights.map((log) => ({ date: log.loggedOn, value: log.weightKg })),
    appetiteSeries: sorted
      .filter((log) => log.appetite)
      .map((log) => ({ date: log.loggedOn, value: appetiteScore[log.appetite as AppetiteKey] })),
    vomitSeries: sorted.map((log) => ({ date: log.loggedOn, value: log.vomit === true ? 1 : 0 })),
    litterSeries: stoolDays.map((log) => ({ date: log.loggedOn, value: log.stoolCount ?? 0 })),
  };
}

export type BuiltReport = ReturnType<typeof buildReport>;
