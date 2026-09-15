import { parseConditions, type CatCondition } from "@/lib/conditions";
import { GUEST_MAX_CATS, GUEST_SNAPSHOT_VERSION, GUEST_STORAGE_KEY } from "@/lib/guest";
import { emptyPublicLog, type PublicCat, type PublicLog } from "@/lib/serialize";
import { logPatchSchema } from "@/lib/validations";

export type GuestSnapshot = {
  version: typeof GUEST_SNAPSHOT_VERSION;
  disclaimerAcceptedAt: string | null;
  selectedCatId: string | null;
  cats: PublicCat[];
  logs: PublicLog[];
};

export type GuestLogPatch = {
  catId: string;
  loggedOn: string;
  appetite?: PublicLog["appetite"];
  foodNote?: string | null;
  water?: PublicLog["water"];
  stoolCount?: number | null;
  stoolQuality?: PublicLog["stoolQuality"];
  urine?: PublicLog["urine"];
  vomit?: boolean | null;
  vomitNote?: string | null;
  vomitPhotoUrl?: string | null;
  energy?: PublicLog["energy"];
  weightKg?: number | null;
  memo?: string | null;
  photoUrl?: string | null;
  waterChange?: PublicLog["waterChange"];
  urineChange?: PublicLog["urineChange"];
  mobility?: PublicLog["mobility"];
  nightVocal?: PublicLog["nightVocal"];
};

export type GuestCatInput = {
  name: string;
  birthDate?: string | null;
  estimatedAgeYears?: number | null;
  weightKg?: number | null;
  notes?: string | null;
  seniorCare?: boolean;
  conditions?: CatCondition[];
};

const APPETITES = new Set(["NONE", "LOW", "NORMAL", "HIGH"]);
const WATERS = new Set(["LITTLE", "NORMAL", "MUCH"]);
const STOOLS = new Set(["NONE", "HARD", "NORMAL", "SOFT", "DIARRHEA"]);
const URINES = new Set(["LITTLE", "NORMAL", "MUCH", "BLOOD"]);
const ENERGIES = new Set(["LOW", "NORMAL", "HIGH"]);
const CHANGES = new Set(["LESS", "SAME", "MORE"]);
const MOBILITIES = new Set(["GOOD", "STIFF", "PAIN", "HARD"]);
const NIGHT_VOCALS = new Set(["NONE", "SOME", "MUCH"]);

export function emptyGuestSnapshot(): GuestSnapshot {
  return {
    version: GUEST_SNAPSHOT_VERSION,
    disclaimerAcceptedAt: null,
    selectedCatId: null,
    cats: [],
    logs: [],
  };
}

export function guestSnapshotHasData(snapshot: GuestSnapshot) {
  return snapshot.cats.length > 0 || snapshot.logs.length > 0 || Boolean(snapshot.disclaimerAcceptedAt);
}

export function canAddGuestCat(snapshot: GuestSnapshot) {
  return snapshot.cats.length < GUEST_MAX_CATS;
}

export function newGuestId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${random}`;
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function asString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function asWeight(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value < 0.01 || value > 30) return null;
  return Number(value.toFixed(2));
}

function asEstimatedAgeYears(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 40) return null;
  return value;
}

function parseCat(value: unknown): PublicCat | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = asString(row.id, 80);
  const name = asString(row.name, 30);
  if (!id || !name) return null;
  return {
    id,
    name,
    birthDate: isDateKey(row.birthDate) ? row.birthDate : null,
    estimatedAgeYears: asEstimatedAgeYears(row.estimatedAgeYears),
    weightKg: asWeight(row.weightKg),
    photoUrl: null,
    notes: asString(row.notes, 500),
    seniorCare: row.seniorCare === true,
    conditions: parseConditions(row.conditions),
  };
}

function parseLog(value: unknown): PublicLog | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = asString(row.id, 80);
  const catId = asString(row.catId, 80);
  if (!id || !catId || !isDateKey(row.loggedOn)) return null;
  const stoolCount =
    typeof row.stoolCount === "number" && Number.isInteger(row.stoolCount) && row.stoolCount >= 0 && row.stoolCount <= 20
      ? row.stoolCount
      : null;
  return {
    id,
    catId,
    loggedOn: row.loggedOn,
    appetite: typeof row.appetite === "string" && APPETITES.has(row.appetite) ? (row.appetite as PublicLog["appetite"]) : null,
    foodNote: asString(row.foodNote, 200),
    water: typeof row.water === "string" && WATERS.has(row.water) ? (row.water as PublicLog["water"]) : null,
    stoolCount,
    stoolQuality:
      typeof row.stoolQuality === "string" && STOOLS.has(row.stoolQuality)
        ? (row.stoolQuality as PublicLog["stoolQuality"])
        : null,
    urine: typeof row.urine === "string" && URINES.has(row.urine) ? (row.urine as PublicLog["urine"]) : null,
    vomit: typeof row.vomit === "boolean" ? row.vomit : null,
    vomitNote: asString(row.vomitNote, 200),
    vomitPhotoUrl: null,
    energy: typeof row.energy === "string" && ENERGIES.has(row.energy) ? (row.energy as PublicLog["energy"]) : null,
    weightKg: asWeight(row.weightKg),
    memo: asString(row.memo, 400),
    photoUrl: null,
    waterChange:
      typeof row.waterChange === "string" && CHANGES.has(row.waterChange)
        ? (row.waterChange as PublicLog["waterChange"])
        : null,
    urineChange:
      typeof row.urineChange === "string" && CHANGES.has(row.urineChange)
        ? (row.urineChange as PublicLog["urineChange"])
        : null,
    mobility:
      typeof row.mobility === "string" && MOBILITIES.has(row.mobility) ? (row.mobility as PublicLog["mobility"]) : null,
    nightVocal:
      typeof row.nightVocal === "string" && NIGHT_VOCALS.has(row.nightVocal)
        ? (row.nightVocal as PublicLog["nightVocal"])
        : null,
  };
}

export function parseGuestSnapshot(raw: string | null | undefined): GuestSnapshot | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const row = data as Record<string, unknown>;
    const cats = Array.isArray(row.cats)
      ? row.cats.map(parseCat).filter((cat): cat is PublicCat => Boolean(cat)).slice(0, GUEST_MAX_CATS)
      : [];
    const catIds = new Set(cats.map((cat) => cat.id));
    const logs = Array.isArray(row.logs)
      ? row.logs
          .map(parseLog)
          .filter((log): log is PublicLog => log !== null && catIds.has(log.catId))
          .slice(0, 800)
      : [];
    const selected =
      typeof row.selectedCatId === "string" && catIds.has(row.selectedCatId) ? row.selectedCatId : (cats[0]?.id ?? null);
    return {
      version: GUEST_SNAPSHOT_VERSION,
      disclaimerAcceptedAt:
        typeof row.disclaimerAcceptedAt === "string" && row.disclaimerAcceptedAt ? row.disclaimerAcceptedAt : null,
      selectedCatId: selected,
      cats,
      logs,
    };
  } catch {
    return null;
  }
}

export function applyGuestLogPatch(snapshot: GuestSnapshot, raw: GuestLogPatch): { snapshot: GuestSnapshot; log: PublicLog } {
  const parsed = logPatchSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "기록을 저장하지 못했어요.");
  }
  if (!snapshot.cats.some((cat) => cat.id === parsed.data.catId)) {
    throw new Error("고양이를 찾을 수 없어요.");
  }

  const { catId, loggedOn, ...patch } = parsed.data;
  const existing = snapshot.logs.find((log) => log.catId === catId && log.loggedOn === loggedOn);
  const log: PublicLog = {
    ...(existing ?? emptyPublicLog(catId, loggedOn, newGuestId("log"))),
    catId,
    loggedOn,
  };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (log as Record<string, unknown>)[key] = value;
    }
  }
  log.photoUrl = null;
  log.vomitPhotoUrl = null;

  const logs = existing
    ? snapshot.logs.map((item) => (item.catId === catId && item.loggedOn === loggedOn ? log : item))
    : [...snapshot.logs, log];

  const cats =
    patch.weightKg != null
      ? snapshot.cats.map((cat) => (cat.id === catId ? { ...cat, weightKg: patch.weightKg ?? null } : cat))
      : snapshot.cats;

  return { snapshot: { ...snapshot, logs, cats }, log };
}

export function addGuestCat(snapshot: GuestSnapshot, input: GuestCatInput): GuestSnapshot {
  if (!canAddGuestCat(snapshot)) {
    throw new Error("GUEST_CAT_LIMIT");
  }
  const cat: PublicCat = {
    id: newGuestId("cat"),
    name: input.name,
    birthDate: input.birthDate && isDateKey(input.birthDate) ? input.birthDate : null,
    estimatedAgeYears: asEstimatedAgeYears(input.estimatedAgeYears ?? null),
    weightKg: input.weightKg ?? null,
    photoUrl: null,
    notes: input.notes ?? null,
    seniorCare: Boolean(input.seniorCare),
    conditions: parseConditions(input.conditions),
  };
  return {
    ...snapshot,
    cats: [...snapshot.cats, cat],
    selectedCatId: cat.id,
  };
}

export function updateGuestCat(snapshot: GuestSnapshot, catId: string, input: GuestCatInput): GuestSnapshot {
  if (!snapshot.cats.some((cat) => cat.id === catId)) {
    throw new Error("고양이를 찾을 수 없어요.");
  }
  return {
    ...snapshot,
    cats: snapshot.cats.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            name: input.name,
            birthDate: input.birthDate && isDateKey(input.birthDate) ? input.birthDate : null,
            estimatedAgeYears: asEstimatedAgeYears(input.estimatedAgeYears ?? null),
            weightKg: input.weightKg ?? null,
            notes: input.notes ?? null,
            photoUrl: null,
            seniorCare: Boolean(input.seniorCare),
            conditions: parseConditions(input.conditions),
          }
        : cat,
    ),
  };
}

export function deleteGuestCat(snapshot: GuestSnapshot, catId: string): GuestSnapshot {
  const cats = snapshot.cats.filter((cat) => cat.id !== catId);
  return {
    ...snapshot,
    cats,
    logs: snapshot.logs.filter((log) => log.catId !== catId),
    selectedCatId: snapshot.selectedCatId === catId ? (cats[0]?.id ?? null) : snapshot.selectedCatId,
  };
}

export function selectGuestCat(snapshot: GuestSnapshot, catId: string): GuestSnapshot {
  if (!snapshot.cats.some((cat) => cat.id === catId)) {
    throw new Error("고양이를 찾을 수 없어요.");
  }
  return { ...snapshot, selectedCatId: catId };
}

export function acceptGuestDisclaimer(snapshot: GuestSnapshot, at = new Date().toISOString()): GuestSnapshot {
  return { ...snapshot, disclaimerAcceptedAt: at };
}

export function loadGuestSnapshot(): GuestSnapshot {
  if (typeof window === "undefined") return emptyGuestSnapshot();
  try {
    return parseGuestSnapshot(window.localStorage.getItem(GUEST_STORAGE_KEY)) ?? emptyGuestSnapshot();
  } catch {
    return emptyGuestSnapshot();
  }
}

export function persistGuestSnapshot(snapshot: GuestSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // private mode / quota — keep in-memory only
  }
}

export function clearGuestSnapshot() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ignore
  }
}
