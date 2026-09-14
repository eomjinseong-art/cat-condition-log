import type { Cat, Log, Reminder } from "@prisma/client";

export type PublicCat = {
  id: string;
  name: string;
  birthDate: string | null;
  weightKg: number | null;
  photoUrl: string | null;
  notes: string | null;
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

function dateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function serializeCat(cat: Cat): PublicCat {
  return {
    id: cat.id,
    name: cat.name,
    birthDate: dateOnly(cat.birthDate),
    weightKg: cat.weightKg === null ? null : Number(cat.weightKg),
    photoUrl: cat.photoUrl,
    notes: cat.notes,
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
    weightKg: log.weightKg === null ? null : Number(log.weightKg),
    memo: log.memo,
    photoUrl: log.photoUrl,
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
