import { conditionLabels } from "@/lib/conditions";
import { ageLabel, displayDate, displayShort, isSeniorCat, todayKey } from "@/lib/dates";
import {
  appetiteLabels,
  appetiteScore,
  changeLabels,
  energyLabels,
  labelOrDash,
  mobilityLabels,
  nightVocalLabels,
  stoolLabels,
  urineLabels,
  waterLabels,
  type AppetiteKey,
} from "@/lib/labels";
import { adherenceForPeriod, frequencySummary } from "@/lib/meds";
import type {
  PublicCat,
  PublicLabEntry,
  PublicLog,
  PublicMedicationDose,
  PublicMedicationPlan,
  PublicReminder,
  PublicVisit,
} from "@/lib/serialize";

export type ReportInput = {
  cat: PublicCat;
  from: string;
  to: string;
  logs: PublicLog[];
  reminders: PublicReminder[];
  medicationPlans?: PublicMedicationPlan[];
  doses?: PublicMedicationDose[];
  visits?: PublicVisit[];
  labs?: PublicLabEntry[];
  asOf?: string;
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

function formatLabNumber(value: number | null, digits = 2) {
  if (value === null) return "—";
  return value.toFixed(digits);
}

export function buildReport(input: ReportInput) {
  const {
    cat,
    from,
    to,
    logs,
    reminders,
    medicationPlans = [],
    doses = [],
    visits = [],
    labs = [],
    asOf,
  } = input;
  const today = asOf ?? todayKey();
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
  const waterChangeCounts = countBy(sorted.map((log) => log.waterChange));
  const urineChangeCounts = countBy(sorted.map((log) => log.urineChange));
  const mobilityCounts = countBy(sorted.map((log) => log.mobility));
  const nightVocalCounts = countBy(sorted.map((log) => log.nightVocal));

  const conditionText = cat.conditions.length
    ? cat.conditions.map((key) => conditionLabels[key]).join(", ")
    : "없음";
  const senior = isSeniorCat(cat, today);

  const identity = [
    `이름: ${cat.name}`,
    `나이: ${ageLabel(cat.birthDate) ?? "미입력"}`,
    `최근 체중: ${lastWeight ? `${lastWeight.weightKg.toFixed(2)}kg` : cat.weightKg !== null ? `${cat.weightKg.toFixed(2)}kg` : "미입력"}`,
    `노묘/만성케어: ${senior ? "해당 (나이 또는 보호자 표시)" : "해당 없음"}`,
    `돌봄 태그: ${conditionText}`,
    cat.notes ? `보호자 메모: ${cat.notes}` : null,
  ].filter(Boolean) as string[];

  const weightTrend =
    weightDelta === null
      ? "체중: 기간 내 체중 기록 없음"
      : `체중: ${firstWeight.weightKg.toFixed(2)}kg → ${lastWeight.weightKg.toFixed(2)}kg (변화 ${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(2)}kg, 기록 ${weights.length}일)`;

  const trends = [
    `기간: ${displayDate(from)} – ${displayDate(to)}`,
    `기록 일수: ${sorted.length}일`,
    weightTrend,
    `식욕: ${formatCounts(appetiteCounts, appetiteLabels)}`,
    `음수: ${formatCounts(waterCounts, waterLabels)}`,
    `대변 횟수 평균: ${stoolAverage === null ? "기록 없음" : `${stoolAverage}회`} / 성상: ${formatCounts(stoolCounts, stoolLabels)}`,
    `소변: ${formatCounts(urineCounts, urineLabels)}`,
    `구토: 있음 ${vomitDays}일, 없음 ${noVomitDays}일`,
    `컨디션: ${formatCounts(energyCounts, energyLabels)}`,
  ];

  const seniorTrends = [
    `음수 변화(평소 대비): ${formatCounts(waterChangeCounts, changeLabels)}`,
    `소변 변화(평소 대비): ${formatCounts(urineChangeCounts, changeLabels)}`,
    `구토: 있음 ${vomitDays}일, 없음 ${noVomitDays}일`,
    `보행/통증 제스처: ${formatCounts(mobilityCounts, mobilityLabels)}`,
    `밤중 울음: ${formatCounts(nightVocalCounts, nightVocalLabels)}`,
    weightTrend,
  ];

  const timeline = sorted.map((log) => ({
    date: log.loggedOn,
    dateLabel: displayShort(log.loggedOn),
    rows: [
      ["식욕", labelOrDash(log.appetite, appetiteLabels)],
      ["음수", labelOrDash(log.water, waterLabels)],
      ["음수 변화", labelOrDash(log.waterChange, changeLabels)],
      [
        "대변",
        [log.stoolCount !== null ? `${log.stoolCount}회` : null, labelOrDash(log.stoolQuality, stoolLabels)]
          .filter((part) => part && part !== "—")
          .join(" · ") || "—",
      ],
      ["소변", labelOrDash(log.urine, urineLabels)],
      ["소변 변화", labelOrDash(log.urineChange, changeLabels)],
      ["구토", labelOrDash(log.vomit)],
      ["컨디션", labelOrDash(log.energy, energyLabels)],
      ["보행", labelOrDash(log.mobility, mobilityLabels)],
      ["밤중 울음", labelOrDash(log.nightVocal, nightVocalLabels)],
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

  const adherence = adherenceForPeriod(medicationPlans, doses, from, to, today).map((row) => ({
    name: row.plan.name,
    notes: row.plan.doseNotes,
    frequency: frequencySummary(row.plan),
    expected: row.expected,
    taken: row.taken,
    missed: row.missed,
    line:
      row.expected === 0
        ? `${row.plan.name} (${frequencySummary(row.plan)}): 이 기간에 예정된 횟수 없음`
        : `${row.plan.name} (${frequencySummary(row.plan)}): 예정 ${row.expected}회 중 줬어요 ${row.taken}회, 놓침 ${row.missed}회`,
  }));

  const upcomingVisits = visits
    .filter((visit) => !visit.completedAt && visit.visitOn >= to)
    .sort((a, b) => a.visitOn.localeCompare(b.visitOn));
  const periodVisits = visits
    .filter((visit) => visit.visitOn >= from && visit.visitOn <= to)
    .sort((a, b) => a.visitOn.localeCompare(b.visitOn));

  const visitLines = [
    ...periodVisits.map((visit) => {
      const status = visit.completedAt ? "다녀옴" : visit.visitOn < to ? "미완료" : "예정";
      return `${displayDate(visit.visitOn)} · ${visit.clinicName || "병원"} · ${status}${visit.reason ? ` · ${visit.reason}` : ""}`;
    }),
    ...upcomingVisits
      .filter((visit) => !periodVisits.some((item) => item.id === visit.id))
      .map(
        (visit) =>
          `${displayDate(visit.visitOn)} · ${visit.clinicName || "병원"} · 예정${visit.reason ? ` · ${visit.reason}` : ""}`,
      ),
  ];

  const labLines = [...labs]
    .sort((a, b) => b.takenOn.localeCompare(a.takenOn))
    .slice(0, 6)
    .map((lab) => {
      const parts = [
        `크레아티닌 ${formatLabNumber(lab.creatinine, 3)}`,
        `SDMA ${formatLabNumber(lab.sdma)}`,
        `BUN ${formatLabNumber(lab.bun)}`,
        `인 ${formatLabNumber(lab.phosphorus)}`,
        `T4 ${formatLabNumber(lab.t4)}`,
        lab.bloodPressure !== null ? `혈압 ${lab.bloodPressure}` : "혈압 —",
        lab.weightKg !== null ? `체중 ${lab.weightKg.toFixed(2)}kg` : "체중 —",
      ];
      return `${displayDate(lab.takenOn)} · ${parts.join(" · ")}${lab.notes ? ` · ${lab.notes}` : ""}`;
    });

  return {
    catName: cat.name,
    from,
    to,
    identity,
    trends,
    seniorTrends,
    caregiverMemo: cat.notes,
    timeline,
    meds,
    adherence,
    visitLines,
    labLines,
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
