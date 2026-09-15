import { parseConditions, type CatCondition } from "@/lib/conditions";
import { dateFromKey } from "@/lib/dates";
import { GUEST_MAX_CATS } from "@/lib/guest";
import type { PublicLog } from "@/lib/serialize";
import { z } from "zod";

const guestCatSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(30),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  weightKg: z.number().min(0.01).max(30).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  seniorCare: z.boolean().optional(),
  conditions: z.array(z.string()).optional(),
});

const guestLogSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  catId: z.string().min(1).max(80),
  loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appetite: z.enum(["NONE", "LOW", "NORMAL", "HIGH"]).nullable().optional(),
  foodNote: z.string().max(200).nullable().optional(),
  water: z.enum(["LITTLE", "NORMAL", "MUCH"]).nullable().optional(),
  stoolCount: z.number().int().min(0).max(20).nullable().optional(),
  stoolQuality: z.enum(["NONE", "HARD", "NORMAL", "SOFT", "DIARRHEA"]).nullable().optional(),
  urine: z.enum(["LITTLE", "NORMAL", "MUCH", "BLOOD"]).nullable().optional(),
  vomit: z.boolean().nullable().optional(),
  vomitNote: z.string().max(200).nullable().optional(),
  energy: z.enum(["LOW", "NORMAL", "HIGH"]).nullable().optional(),
  weightKg: z.number().min(0.01).max(30).nullable().optional(),
  memo: z.string().max(400).nullable().optional(),
  waterChange: z.enum(["LESS", "SAME", "MORE"]).nullable().optional(),
  urineChange: z.enum(["LESS", "SAME", "MORE"]).nullable().optional(),
  mobility: z.enum(["GOOD", "STIFF", "PAIN", "HARD"]).nullable().optional(),
  nightVocal: z.enum(["NONE", "SOME", "MUCH"]).nullable().optional(),
});

export const guestImportSchema = z.object({
  version: z.literal(1).optional(),
  disclaimerAcceptedAt: z.string().nullable().optional(),
  selectedCatId: z.string().nullable().optional(),
  cats: z.array(guestCatSchema).max(GUEST_MAX_CATS),
  logs: z.array(guestLogSchema).max(800),
});

export type GuestImportPayload = z.infer<typeof guestImportSchema>;

export type PlannedGuestCat = {
  guestId: string;
  name: string;
  birthDate: string | null;
  weightKg: number | null;
  notes: string | null;
  seniorCare: boolean;
  conditions: CatCondition[];
};

export type PlannedGuestLog = Omit<PublicLog, "id" | "photoUrl" | "vomitPhotoUrl"> & {
  guestCatId: string;
};

export function planGuestImport(payload: GuestImportPayload): {
  cats: PlannedGuestCat[];
  logs: PlannedGuestLog[];
  disclaimerAcceptedAt: string | null;
  selectedGuestCatId: string | null;
} {
  const cats: PlannedGuestCat[] = payload.cats.map((cat) => ({
    guestId: cat.id,
    name: cat.name,
    birthDate: cat.birthDate ?? null,
    weightKg: cat.weightKg ?? null,
    notes: cat.notes ?? null,
    seniorCare: Boolean(cat.seniorCare),
    conditions: parseConditions(cat.conditions),
  }));
  const catIds = new Set(cats.map((cat) => cat.guestId));
  const logs: PlannedGuestLog[] = [];
  const seen = new Set<string>();

  for (const log of payload.logs) {
    if (!catIds.has(log.catId)) continue;
    const key = `${log.catId}:${log.loggedOn}`;
    if (seen.has(key)) {
      const index = logs.findIndex((item) => item.guestCatId === log.catId && item.loggedOn === log.loggedOn);
      if (index >= 0) {
        logs[index] = toPlannedLog(log);
      }
      continue;
    }
    seen.add(key);
    logs.push(toPlannedLog(log));
  }

  return {
    cats,
    logs,
    disclaimerAcceptedAt: payload.disclaimerAcceptedAt ?? null,
    selectedGuestCatId:
      payload.selectedCatId && catIds.has(payload.selectedCatId) ? payload.selectedCatId : (cats[0]?.guestId ?? null),
  };
}

function toPlannedLog(log: z.infer<typeof guestLogSchema>): PlannedGuestLog {
  return {
    guestCatId: log.catId,
    catId: log.catId,
    loggedOn: log.loggedOn,
    appetite: log.appetite ?? null,
    foodNote: log.foodNote ?? null,
    water: log.water ?? null,
    stoolCount: log.stoolCount ?? null,
    stoolQuality: log.stoolQuality ?? null,
    urine: log.urine ?? null,
    vomit: log.vomit ?? null,
    vomitNote: log.vomitNote ?? null,
    energy: log.energy ?? null,
    weightKg: log.weightKg ?? null,
    memo: log.memo ?? null,
    waterChange: log.waterChange ?? null,
    urineChange: log.urineChange ?? null,
    mobility: log.mobility ?? null,
    nightVocal: log.nightVocal ?? null,
  };
}

export function birthDateForDb(value: string | null) {
  return value ? dateFromKey(value) : null;
}
