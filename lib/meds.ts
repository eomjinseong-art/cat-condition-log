import { eachDateKey, todayKey, dateFromKey, diffDays } from "@/lib/dates";
import { medFrequencyLabels, weekdayLabels } from "@/lib/labels";
import type { PublicMedicationDose, PublicMedicationPlan } from "@/lib/serialize";

export type DayDose = {
  plan: PublicMedicationPlan;
  dateKey: string;
  slot: number;
  slotLabel: string;
  given: boolean;
  missed: boolean;
  pending: boolean;
  dose: PublicMedicationDose | null;
};

export function slotCount(plan: Pick<PublicMedicationPlan, "frequency" | "timesPerDay">): number {
  if (plan.frequency === "TIMES_PER_DAY") {
    return Math.min(4, Math.max(1, plan.timesPerDay ?? 2));
  }
  return 1;
}

export function slotLabel(plan: Pick<PublicMedicationPlan, "frequency" | "timesPerDay">, slot: number): string {
  const count = slotCount(plan);
  if (count <= 1) return "오늘";
  return `${slot + 1}회차`;
}

export function isPlanDueOn(plan: PublicMedicationPlan, dateKey: string): boolean {
  if (!plan.active) return false;
  if (plan.startOn && dateKey < plan.startOn) return false;
  if (plan.endOn && dateKey > plan.endOn) return false;

  switch (plan.frequency) {
    case "DAILY":
    case "TIMES_PER_DAY":
      return true;
    case "WEEKDAYS":
      return plan.weekdays.includes(dateFromKey(dateKey).getUTCDay());
    case "EVERY_N_DAYS": {
      if (!plan.startOn || !plan.intervalDays) return false;
      const interval = Math.max(2, plan.intervalDays);
      const delta = diffDays(plan.startOn, dateKey);
      return delta >= 0 && delta % interval === 0;
    }
    default:
      return false;
  }
}

export function expectedSlots(plan: PublicMedicationPlan, dateKey: string): number[] {
  if (!isPlanDueOn(plan, dateKey)) return [];
  return Array.from({ length: slotCount(plan) }, (_, index) => index);
}

export function buildDayDoses(
  plans: PublicMedicationPlan[],
  doses: PublicMedicationDose[],
  dateKey: string,
  today = todayKey(),
): DayDose[] {
  const given = new Map(doses.map((dose) => [`${dose.planId}:${dose.takenOn}:${dose.slot}`, dose]));
  const rows: DayDose[] = [];

  for (const plan of plans) {
    for (const slot of expectedSlots(plan, dateKey)) {
      const dose = given.get(`${plan.id}:${dateKey}:${slot}`) ?? null;
      const isGiven = Boolean(dose);
      rows.push({
        plan,
        dateKey,
        slot,
        slotLabel: slotLabel(plan, slot),
        given: isGiven,
        missed: !isGiven && dateKey < today,
        pending: !isGiven && dateKey === today,
        dose,
      });
    }
  }

  return rows;
}

export function frequencySummary(plan: PublicMedicationPlan): string {
  switch (plan.frequency) {
    case "DAILY":
      return medFrequencyLabels.DAILY;
    case "TIMES_PER_DAY":
      return `하루 ${slotCount(plan)}번`;
    case "WEEKDAYS":
      return plan.weekdays.map((day) => weekdayLabels[day] ?? day).join("·") || medFrequencyLabels.WEEKDAYS;
    case "EVERY_N_DAYS":
      return `${plan.intervalDays ?? 2}일마다`;
    default:
      return medFrequencyLabels[plan.frequency];
  }
}

export function adherenceForPeriod(
  plans: PublicMedicationPlan[],
  doses: PublicMedicationDose[],
  from: string,
  to: string,
  today = todayKey(),
) {
  const end = to < today ? to : today;
  const days = from > end ? [] : eachDateKey(from, end);
  const given = new Set(doses.map((dose) => `${dose.planId}:${dose.takenOn}:${dose.slot}`));

  return plans.map((plan) => {
    let expected = 0;
    let taken = 0;
    for (const day of days) {
      for (const slot of expectedSlots(plan, day)) {
        expected += 1;
        if (given.has(`${plan.id}:${day}:${slot}`)) taken += 1;
      }
    }
    return {
      plan,
      expected,
      taken,
      missed: Math.max(0, expected - taken),
    };
  });
}

export function nextVisitOf<T extends { visitOn: string; completedAt: string | null }>(
  visits: T[],
  today = todayKey(),
): T | null {
  return [...visits]
    .filter((visit) => !visit.completedAt)
    .sort((a, b) => a.visitOn.localeCompare(b.visitOn))
    .find((visit) => visit.visitOn >= today) ??
    [...visits]
      .filter((visit) => !visit.completedAt)
      .sort((a, b) => a.visitOn.localeCompare(b.visitOn))[0] ??
    null;
}
