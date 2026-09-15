import { z } from "zod";
import { CAT_CONDITIONS } from "@/lib/conditions";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(40),
  email: z.email("이메일 형식을 확인해 주세요.").toLowerCase(),
  password: z.string().min(8, "비밀번호는 8자 이상으로 해 주세요.").max(72),
});

export const loginSchema = z.object({
  email: z.email("이메일 형식을 확인해 주세요.").toLowerCase(),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const catSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(30),
  birthDate: z.string().optional(),
  estimatedAgeYears: z.string().optional(),
  weightKg: z.string().optional(),
  photoUrl: z.string().optional(),
  notes: z.string().max(500).optional(),
  seniorCare: z.boolean().optional(),
  conditions: z.array(z.enum(CAT_CONDITIONS)).optional(),
});

export const logPatchSchema = z.object({
  catId: z.string().min(1),
  loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appetite: z.enum(["NONE", "LOW", "NORMAL", "HIGH"]).nullable().optional(),
  foodNote: z.string().max(200).nullable().optional(),
  water: z.enum(["LITTLE", "NORMAL", "MUCH"]).nullable().optional(),
  stoolCount: z.number().int().min(0).max(20).nullable().optional(),
  stoolQuality: z.enum(["NONE", "HARD", "NORMAL", "SOFT", "DIARRHEA"]).nullable().optional(),
  urine: z.enum(["LITTLE", "NORMAL", "MUCH", "BLOOD"]).nullable().optional(),
  vomit: z.boolean().nullable().optional(),
  vomitNote: z.string().max(200).nullable().optional(),
  vomitPhotoUrl: z.string().nullable().optional(),
  energy: z.enum(["LOW", "NORMAL", "HIGH"]).nullable().optional(),
  weightKg: z.number().min(0.01).max(30).nullable().optional(),
  memo: z.string().max(400).nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  waterChange: z.enum(["LESS", "SAME", "MORE"]).nullable().optional(),
  urineChange: z.enum(["LESS", "SAME", "MORE"]).nullable().optional(),
  mobility: z.enum(["GOOD", "STIFF", "PAIN", "HARD"]).nullable().optional(),
  nightVocal: z.enum(["NONE", "SOME", "MUCH"]).nullable().optional(),
});

export const reminderSchema = z.object({
  catId: z.string().optional(),
  type: z.enum(["MEDS", "VACCINE", "DEWORMING", "LITTER_CHANGE"]),
  title: z.string().trim().min(1, "제목을 입력해 주세요.").max(80),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(300).optional(),
});

export const medicationPlanSchema = z
  .object({
    catId: z.string().min(1, "고양이를 골라 주세요."),
    name: z.string().trim().min(1, "약 이름을 입력해 주세요.").max(80),
    doseNotes: z.string().max(200).optional(),
    frequency: z.enum(["DAILY", "TIMES_PER_DAY", "WEEKDAYS", "EVERY_N_DAYS"]),
    timesPerDay: z.number().int().min(1).max(4).optional(),
    weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    intervalDays: z.number().int().min(2).max(30).optional(),
    startOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.frequency === "TIMES_PER_DAY" && !value.timesPerDay) {
      ctx.addIssue({ code: "custom", message: "하루 몇 번인지 골라 주세요.", path: ["timesPerDay"] });
    }
    if (value.frequency === "WEEKDAYS" && (!value.weekdays || value.weekdays.length === 0)) {
      ctx.addIssue({ code: "custom", message: "요일을 하나 이상 골라 주세요.", path: ["weekdays"] });
    }
    if (value.frequency === "EVERY_N_DAYS") {
      if (!value.intervalDays) {
        ctx.addIssue({ code: "custom", message: "며칠마다인지 입력해 주세요.", path: ["intervalDays"] });
      }
      if (!value.startOn) {
        ctx.addIssue({ code: "custom", message: "시작일을 입력해 주세요.", path: ["startOn"] });
      }
    }
    if (value.startOn && value.endOn && value.endOn < value.startOn) {
      ctx.addIssue({ code: "custom", message: "끝나는 날은 시작일 이후로 해 주세요.", path: ["endOn"] });
    }
  });

export const visitSchema = z.object({
  catId: z.string().min(1, "고양이를 골라 주세요."),
  visitOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clinicName: z.string().max(80).optional(),
  reason: z.string().max(300).optional(),
  reminderOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const labEntrySchema = z.object({
  catId: z.string().min(1, "고양이를 골라 주세요."),
  takenOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  creatinine: z.number().min(0).max(50).nullable().optional(),
  sdma: z.number().min(0).max(200).nullable().optional(),
  bun: z.number().min(0).max(400).nullable().optional(),
  phosphorus: z.number().min(0).max(50).nullable().optional(),
  t4: z.number().min(0).max(50).nullable().optional(),
  bloodPressure: z.number().int().min(40).max(300).nullable().optional(),
  weightKg: z.number().min(0.01).max(30).nullable().optional(),
  notes: z.string().max(400).optional(),
});

export const fluidLogSchema = z.object({
  catId: z.string().min(1, "고양이를 골라 주세요."),
  givenOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  volumeMl: z.number().int().min(1).max(500),
  site: z.enum(["LEFT_SCRUFF", "RIGHT_SCRUFF", "OTHER"]).optional(),
  notes: z.string().max(200).optional(),
});
