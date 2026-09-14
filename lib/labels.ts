export const appetiteLabels = {
  NONE: "안 먹음",
  LOW: "적음",
  NORMAL: "보통",
  HIGH: "많음",
} as const;

export const waterLabels = {
  LITTLE: "적음",
  NORMAL: "보통",
  MUCH: "많음",
} as const;

export const stoolLabels = {
  NONE: "없음",
  HARD: "단단",
  NORMAL: "보통",
  SOFT: "무름",
  DIARRHEA: "설사",
} as const;

export const urineLabels = {
  LITTLE: "적음",
  NORMAL: "보통",
  MUCH: "많음",
  BLOOD: "혈뇨",
} as const;

export const energyLabels = {
  LOW: "처짐",
  NORMAL: "보통",
  HIGH: "활발",
} as const;

export const reminderLabels = {
  MEDS: "약",
  VACCINE: "백신",
  DEWORMING: "구충",
  LITTER_CHANGE: "모래 전체갈이",
} as const;

export type AppetiteKey = keyof typeof appetiteLabels;
export type WaterKey = keyof typeof waterLabels;
export type StoolKey = keyof typeof stoolLabels;
export type UrineKey = keyof typeof urineLabels;
export type EnergyKey = keyof typeof energyLabels;
export type ReminderKey = keyof typeof reminderLabels;

export const appetiteScore: Record<AppetiteKey, number> = {
  NONE: 0,
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
};

export function labelOrDash(value: string | number | boolean | null | undefined, map?: Record<string, string>) {
  if (value === true) return "있음";
  if (value === false) return "없음";
  if (value === null || value === undefined || value === "") return "—";
  if (map && typeof value === "string") return map[value] ?? value;
  return String(value);
}
