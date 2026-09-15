import type { Cat, FluidLog, LabEntry, Log, MedicationDose, MedicationPlan, Reminder, Visit } from "@prisma/client";
import { parseConditions, type CatCondition } from "@/lib/conditions";

export type PublicCat = {
  id: string;
  name: string;
  birthDate: string | null;
  estimatedAgeYears: number | null;
  weightKg: number | null;
  photoUrl: string | null;
  notes: string | null;
  seniorCare: boolean;
  conditions: CatCondition[];
};

export type PublicLog = {
  id: string;
  catId: string;
  loggedOn: string;
  appetite: Log["appetite"];
  foodNote: string | null;
  water: Log["water"];
  stoolCount: number | null;
  stoolQuality: Log["stoolQuality"];
  urine: Log["urine"];
  vomit: boolean | null;
  vomitNote: string | null;
  vomitPhotoUrl: string | null;
  energy: Log["energy"];
  weightKg: number | null;
  memo: string | null;
  photoUrl: string | null;
  waterChange: Log["waterChange"];
  urineChange: Log["urineChange"];
  mobility: Log["mobility"];
  nightVocal: Log["nightVocal"];
};

export type PublicReminder = {
  id: string;
  catId: string | null;
  type: Reminder["type"];
  title: string;
  dueOn: string;
  notes: string | null;
  completedAt: string | null;
};

export type PublicMedicationPlan = {
  id: string;
  catId: string;
  name: string;
  doseNotes: string | null;
  frequency: MedicationPlan["frequency"];
  timesPerDay: number | null;
  weekdays: number[];
  intervalDays: number | null;
  startOn: string | null;
  endOn: string | null;
  active: boolean;
};

export type PublicMedicationDose = {
  id: string;
  planId: string;
  catId: string;
  takenOn: string;
  slot: number;
  givenAt: string;
};

export type PublicVisit = {
  id: string;
  catId: string;
  visitOn: string;
  clinicName: string | null;
  reason: string | null;
  reminderOn: string | null;
  completedAt: string | null;
};

export type PublicLabEntry = {
  id: string;
  catId: string;
  takenOn: string;
  creatinine: number | null;
  sdma: number | null;
  bun: number | null;
  phosphorus: number | null;
  t4: number | null;
  bloodPressure: number | null;
  weightKg: number | null;
  notes: string | null;
};

export type PublicFluidLog = {
  id: string;
  catId: string;
  givenOn: string;
  volumeMl: number;
  site: FluidLog["site"];
  notes: string | null;
};

function dateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function decimalToNumber(value: { toString(): string } | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function parseWeekdays(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number(part))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
}

export function serializeWeekdays(days: number[]): string | null {
  const unique = [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b);
  return unique.length ? unique.join(",") : null;
}

export function emptyPublicLog(catId: string, loggedOn: string, id = ""): PublicLog {
  return {
    id,
    catId,
    loggedOn,
    appetite: null,
    foodNote: null,
    water: null,
    stoolCount: null,
    stoolQuality: null,
    urine: null,
    vomit: null,
    vomitNote: null,
    vomitPhotoUrl: null,
    energy: null,
    weightKg: null,
    memo: null,
    photoUrl: null,
    waterChange: null,
    urineChange: null,
    mobility: null,
    nightVocal: null,
  };
}

export function serializeCat(cat: Cat): PublicCat {
  return {
    id: cat.id,
    name: cat.name,
    birthDate: dateOnly(cat.birthDate),
    estimatedAgeYears: cat.estimatedAgeYears ?? null,
    weightKg: decimalToNumber(cat.weightKg),
    photoUrl: cat.photoUrl,
    notes: cat.notes,
    seniorCare: Boolean(cat.seniorCare),
    conditions: parseConditions(cat.conditions),
  };
}

export function serializeLog(log: Log): PublicLog {
  return {
    id: log.id,
    catId: log.catId,
    loggedOn: dateOnly(log.loggedOn) ?? "",
    appetite: log.appetite,
    foodNote: log.foodNote,
    water: log.water,
    stoolCount: log.stoolCount,
    stoolQuality: log.stoolQuality,
    urine: log.urine,
    vomit: log.vomit,
    vomitNote: log.vomitNote,
    vomitPhotoUrl: log.vomitPhotoUrl,
    energy: log.energy,
    weightKg: decimalToNumber(log.weightKg),
    memo: log.memo,
    photoUrl: log.photoUrl,
    waterChange: log.waterChange,
    urineChange: log.urineChange,
    mobility: log.mobility,
    nightVocal: log.nightVocal,
  };
}

export function serializeReminder(reminder: Reminder): PublicReminder {
  return {
    id: reminder.id,
    catId: reminder.catId,
    type: reminder.type,
    title: reminder.title,
    dueOn: dateOnly(reminder.dueOn) ?? "",
    notes: reminder.notes,
    completedAt: reminder.completedAt ? reminder.completedAt.toISOString() : null,
  };
}

export function serializeMedicationPlan(plan: MedicationPlan): PublicMedicationPlan {
  return {
    id: plan.id,
    catId: plan.catId,
    name: plan.name,
    doseNotes: plan.doseNotes,
    frequency: plan.frequency,
    timesPerDay: plan.timesPerDay,
    weekdays: parseWeekdays(plan.weekdays),
    intervalDays: plan.intervalDays,
    startOn: dateOnly(plan.startOn),
    endOn: dateOnly(plan.endOn),
    active: plan.active,
  };
}

export function serializeMedicationDose(dose: MedicationDose): PublicMedicationDose {
  return {
    id: dose.id,
    planId: dose.planId,
    catId: dose.catId,
    takenOn: dateOnly(dose.takenOn) ?? "",
    slot: dose.slot,
    givenAt: dose.givenAt.toISOString(),
  };
}

export function serializeVisit(visit: Visit): PublicVisit {
  return {
    id: visit.id,
    catId: visit.catId,
    visitOn: dateOnly(visit.visitOn) ?? "",
    clinicName: visit.clinicName,
    reason: visit.reason,
    reminderOn: dateOnly(visit.reminderOn),
    completedAt: visit.completedAt ? visit.completedAt.toISOString() : null,
  };
}

export function serializeLabEntry(entry: LabEntry): PublicLabEntry {
  return {
    id: entry.id,
    catId: entry.catId,
    takenOn: dateOnly(entry.takenOn) ?? "",
    creatinine: decimalToNumber(entry.creatinine),
    sdma: decimalToNumber(entry.sdma),
    bun: decimalToNumber(entry.bun),
    phosphorus: decimalToNumber(entry.phosphorus),
    t4: decimalToNumber(entry.t4),
    bloodPressure: entry.bloodPressure,
    weightKg: decimalToNumber(entry.weightKg),
    notes: entry.notes,
  };
}

export function serializeFluidLog(log: FluidLog): PublicFluidLog {
  return {
    id: log.id,
    catId: log.catId,
    givenOn: dateOnly(log.givenOn) ?? "",
    volumeMl: log.volumeMl,
    site: log.site,
    notes: log.notes,
  };
}
