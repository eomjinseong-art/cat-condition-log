import { ageLabel, ageMonths, dateFromKey, diffDays, formatDateKey, todayKey } from "@/lib/dates";

export const CAT_AGE_COPY = {
  estimatedNote: "나이 정확하지 않으면 참고만 해 주세요",
  tooltip:
    "사람 나이는 AAFP 기준 참고값이에요. 1년≈15세, 2년≈24세, 이후 매년 +4세. 실제 건강은 기록·검진이 더 중요해요.",
  shortTooltip: "참고용이에요. 개체마다 달라요.",
  previewDisclaimer: "병원에서 쓰는 정확한 나이는 아니에요. 이해를 돕는 환산이에요.",
  missing: "나이 미입력",
} as const;

export const LIFE_STAGE_LABELS = {
  kitten: "자묘",
  young: "청년",
  mature: "성숙",
  senior: "노령",
} as const;

export type CatLifeStage = keyof typeof LIFE_STAGE_LABELS;

/** AAFP-aligned kitten month chart: 1mo≈1, 3mo≈4, 6mo≈10, 12mo≈15. */
const KITTEN_MONTH_CHART: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 1],
  [3, 4],
  [6, 10],
  [12, 15],
];

export type CatAgeSource = {
  birthDate?: Date | string | null;
  estimatedYears?: number | null;
  asOf?: string;
};

export type CatAgeView = {
  catYears: number;
  humanYears: number;
  humanYearsExact: number;
  stage: CatLifeStage;
  stageLabel: string;
  catAgeLabel: string;
  estimated: boolean;
  primaryLine: string;
  secondaryLine: string;
  homeLine: string;
  previewLine: string;
  reportLine: string;
  estimatedNote: string | null;
};

function interpolate(x: number, points: ReadonlyArray<readonly [number, number]>): number {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return 0;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    if (!prev || !next) continue;
    if (x <= next[0]) {
      const span = next[0] - prev[0];
      const t = span === 0 ? 0 : (x - prev[0]) / span;
      return prev[1] + t * (next[1] - prev[1]);
    }
  }
  return last[1];
}

function anniversaryAfterMonths(birthKey: string, months: number): string {
  const birth = dateFromKey(birthKey);
  const moved = new Date(Date.UTC(birth.getUTCFullYear(), birth.getUTCMonth() + months, birth.getUTCDate()));
  return moved.toISOString().slice(0, 10);
}

export function catAgeMonthsExact(birthDate: Date | string, asOf = todayKey()): number {
  const whole = ageMonths(birthDate, asOf) ?? 0;
  const birthKey = formatDateKey(birthDate);
  const agedKey = anniversaryAfterMonths(birthKey, whole);
  const leftover = diffDays(agedKey, asOf);
  if (leftover <= 0) return Math.max(0, whole);
  const nextKey = anniversaryAfterMonths(birthKey, whole + 1);
  const span = Math.max(1, diffDays(agedKey, nextKey));
  return whole + leftover / span;
}

export function catAgeYearsFromBirth(birthDate: Date | string, asOf = todayKey()): number {
  return catAgeMonthsExact(birthDate, asOf) / 12;
}

export function humanYearsFromCatYears(catYears: number): number {
  if (!Number.isFinite(catYears) || catYears <= 0) return 0;
  if (catYears < 1) return interpolate(catYears * 12, KITTEN_MONTH_CHART);
  if (catYears < 2) return 15 + (catYears - 1) * 9;
  return 24 + 4 * (catYears - 2);
}

export function lifeStageFromCatYears(catYears: number): CatLifeStage {
  if (catYears < 1) return "kitten";
  if (catYears < 7) return "young";
  if (catYears <= 10) return "mature";
  return "senior";
}

export function roundHumanYears(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

function estimatedCatAgeLabel(catYears: number): string {
  if (catYears < 1) {
    const months = Math.max(0, Math.round(catYears * 12));
    return `약 ${months}개월 (추정)`;
  }
  return `약 ${Math.round(catYears)}살 (추정)`;
}

export function resolveCatAge(source: CatAgeSource): { years: number; estimated: boolean } | null {
  const asOf = source.asOf ?? todayKey();
  if (source.birthDate) {
    return { years: catAgeYearsFromBirth(source.birthDate, asOf), estimated: false };
  }
  if (
    source.estimatedYears != null &&
    Number.isFinite(source.estimatedYears) &&
    source.estimatedYears >= 0 &&
    source.estimatedYears <= 40
  ) {
    return { years: source.estimatedYears, estimated: true };
  }
  return null;
}

export function catAgeView(source: CatAgeSource & { name?: string }): CatAgeView | null {
  const resolved = resolveCatAge(source);
  if (!resolved) return null;
  const asOf = source.asOf ?? todayKey();
  const { years, estimated } = resolved;
  const humanYearsExact = humanYearsFromCatYears(years);
  const humanYears = roundHumanYears(humanYearsExact);
  const stage = lifeStageFromCatYears(years);
  const stageLabel = LIFE_STAGE_LABELS[stage];
  const catAgeLabel = estimated
    ? estimatedCatAgeLabel(years)
    : source.birthDate
      ? (ageLabel(source.birthDate, asOf) ?? CAT_AGE_COPY.missing)
      : estimatedCatAgeLabel(years);
  const namePrefix = source.name?.trim() ? `${source.name.trim()} · ` : "";
  return {
    catYears: years,
    humanYears,
    humanYearsExact,
    stage,
    stageLabel,
    catAgeLabel,
    estimated,
    primaryLine: `${namePrefix}${catAgeLabel}`,
    secondaryLine: `사람 나이 약 ${humanYears}세 · ${stageLabel}`,
    homeLine: `${catAgeLabel} · 약 ${humanYears}세 · ${stageLabel}`,
    previewLine: `→ 사람 나이 약 ${humanYears}세 · ${stageLabel}`,
    reportLine: `나이 ${catAgeLabel} (사람 나이 약 ${humanYears}세, 참고)`,
    estimatedNote: estimated ? CAT_AGE_COPY.estimatedNote : null,
  };
}

export function formatReportAgeLine(source: CatAgeSource): string {
  return catAgeView(source)?.reportLine ?? "나이: 미입력";
}

export const FORBIDDEN_AGE_COPY = [/×\s*7/, /\bx7\b/i, /수명/, /위험/, /죽음/, /사망/, /진단/, /처방/];
