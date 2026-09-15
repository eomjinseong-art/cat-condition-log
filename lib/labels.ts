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

export const changeLabels = {
  LESS: "줄음",
  SAME: "비슷",
  MORE: "늘음",
} as const;

export const mobilityLabels = {
  GOOD: "잘 걸어요",
  STIFF: "뻣뻣해요",
  PAIN: "통증 제스처",
  HARD: "잘 못 걸어요",
} as const;

export const nightVocalLabels = {
  NONE: "안 울어요",
  SOME: "조금 울어요",
  MUCH: "많이 울어요",
} as const;

export const medFrequencyLabels = {
  DAILY: "매일",
  TIMES_PER_DAY: "하루 여러 번",
  WEEKDAYS: "요일 지정",
  EVERY_N_DAYS: "며칠마다",
} as const;

export const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const fluidSiteLabels = {
  LEFT_SCRUFF: "목덜미 왼쪽",
  RIGHT_SCRUFF: "목덜미 오른쪽",
  OTHER: "다른 곳",
} as const;

export type AppetiteKey = keyof typeof appetiteLabels;
export type WaterKey = keyof typeof waterLabels;
export type StoolKey = keyof typeof stoolLabels;
export type UrineKey = keyof typeof urineLabels;
export type EnergyKey = keyof typeof energyLabels;
export type ReminderKey = keyof typeof reminderLabels;
export type ChangeKey = keyof typeof changeLabels;
export type MobilityKey = keyof typeof mobilityLabels;
export type NightVocalKey = keyof typeof nightVocalLabels;
export type MedFrequencyKey = keyof typeof medFrequencyLabels;
export type FluidSiteKey = keyof typeof fluidSiteLabels;

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
