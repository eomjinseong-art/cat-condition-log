import { z } from "zod";

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
  weightKg: z.string().optional(),
  photoUrl: z.string().optional(),
  notes: z.string().max(500).optional(),
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
});

export const reminderSchema = z.object({
  catId: z.string().optional(),
  type: z.enum(["MEDS", "VACCINE", "DEWORMING", "LITTER_CHANGE"]),
  title: z.string().trim().min(1, "제목을 입력해 주세요.").max(80),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(300).optional(),
});
