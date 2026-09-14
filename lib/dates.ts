import { TIMEZONE } from "@/lib/constants";

const kstDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const kstDisplayFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

export function todayKey(now = new Date()): string {
  return kstDateFormatter.format(now);
}

export function formatDateKey(value: Date | string): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return kstDateFormatter.format(value);
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(key: string, amount: number): string {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function eachDateKey(fromKey: string, toKey: string): string[] {
  const keys: string[] = [];
  let cursor = fromKey;
  while (cursor <= toKey) {
    keys.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export function displayDate(value: Date | string): string {
  if (typeof value === "string") {
    return kstDisplayFormatter.format(dateFromKey(value));
  }
  return kstDisplayFormatter.format(value);
}

export function displayShort(value: Date | string): string {
  const key = formatDateKey(value);
  const [, month, day] = key.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function ageLabel(birthDate: Date | string | null | undefined, asOf = todayKey()): string | null {
  if (!birthDate) return null;
  const birthKey = formatDateKey(birthDate);
  const birth = dateFromKey(birthKey);
  const asOfDate = dateFromKey(asOf);
  let months =
    (asOfDate.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    (asOfDate.getUTCMonth() - birth.getUTCMonth());
  if (asOfDate.getUTCDate() < birth.getUTCDate()) months -= 1;
  if (months < 0) return "0개월";
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years}살` : `${years}살 ${rest}개월`;
}

export function monthGrid(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: Array<{ key: string; inMonth: boolean }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    const date = new Date(Date.UTC(year, monthIndex, i - startOffset + 1));
    cells.push({ key: date.toISOString().slice(0, 10), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, monthIndex, day));
    cells.push({ key: date.toISOString().slice(0, 10), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = dateFromKey(cells[cells.length - 1].key);
    last.setUTCDate(last.getUTCDate() + 1);
    cells.push({ key: last.toISOString().slice(0, 10), inMonth: false });
  }
  return cells;
}

export function rangeKeys(days: number, endKey = todayKey()) {
  return eachDateKey(addDays(endKey, -(days - 1)), endKey);
}

export function parseYearMonth(value?: string) {
  const today = todayKey();
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return { year: Number(today.slice(0, 4)), monthIndex: Number(today.slice(5, 7)) - 1 };
  }
  return { year: Number(value.slice(0, 4)), monthIndex: Number(value.slice(5, 7)) - 1 };
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function composeDateKey(year: number, month: number, day: number) {
  const y = Math.trunc(year);
  const m = Math.min(12, Math.max(1, Math.trunc(month)));
  const dim = daysInMonth(y, m);
  const d = Math.min(dim, Math.max(1, Math.trunc(day)));
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseDateParts(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const today = todayKey();
    return {
      year: Number(today.slice(0, 4)),
      month: Number(today.slice(5, 7)),
      day: Number(today.slice(8, 10)),
    };
  }
  return {
    year: Number(value.slice(0, 4)),
    month: Number(value.slice(5, 7)),
    day: Number(value.slice(8, 10)),
  };
}
