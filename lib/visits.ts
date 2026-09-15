import { todayKey } from "@/lib/dates";

export const ABACUS_ORIGIN = "https://abacus.jasoncameron.dev";
export const ABACUS_NAMESPACE = "cat-condition-log";
export const ABACUS_KEY = "visits";
export const VISIT_DAY_STORAGE_KEY = "cat-condition-log:visits-day";

export type VisitAction = "hit" | "get";
export type VisitStorage = Pick<Storage, "getItem" | "setItem">;

let visitRequest: Promise<number | null> | null = null;

export function abacusUrl(action: VisitAction): string {
  return `${ABACUS_ORIGIN}/${action}/${ABACUS_NAMESPACE}/${ABACUS_KEY}`;
}

export function visitAction(storedDay: string | null, today: string): VisitAction {
  return storedDay === today ? "get" : "hit";
}

export function parseAbacusValue(payload: unknown): number | null {
  if (typeof payload !== "object" || payload === null || !("value" in payload)) {
    return null;
  }
  const value = (payload as { value: unknown }).value;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.trunc(value);
}

export function readStoredVisitDay(storage: VisitStorage): string | null {
  try {
    return storage.getItem(VISIT_DAY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredVisitDay(storage: VisitStorage, day: string): void {
  try {
    storage.setItem(VISIT_DAY_STORAGE_KEY, day);
  } catch {
    // Private mode / quota — skip; the next load may hit again.
  }
}

export function browserVisitStorage(): VisitStorage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function recordSiteVisit(options?: {
  today?: string;
  storage?: VisitStorage | null;
  fetchImpl?: typeof fetch;
}): Promise<number | null> {
  const today = options?.today ?? todayKey();
  const storage = options && "storage" in options ? options.storage ?? null : browserVisitStorage();
  const fetchImpl = options?.fetchImpl ?? fetch;
  const action = visitAction(storage ? readStoredVisitDay(storage) : null, today);

  try {
    const response = await fetchImpl(abacusUrl(action), {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const value = parseAbacusValue(await response.json());
    if (value === null) return null;
    if (action === "hit" && storage) {
      writeStoredVisitDay(storage, today);
    }
    return value;
  } catch {
    return null;
  }
}

/** Dedupes React Strict Mode / remounts so a day is hit at most once per session. */
export function loadSiteVisitCount(): Promise<number | null> {
  if (!visitRequest) {
    visitRequest = recordSiteVisit().then((value) => {
      if (value === null) visitRequest = null;
      return value;
    });
  }
  return visitRequest;
}

export function resetSiteVisitRequest(): void {
  visitRequest = null;
}
