"use server";

import { revalidatePath } from "next/cache";
import { dateFromKey } from "@/lib/dates";
import { optionalInt, optionalText } from "@/lib/form-parse";
import { prisma } from "@/lib/prisma";
import { serializeWeekdays } from "@/lib/serialize";
import { requireOwnedCat, requireUserId } from "@/lib/session";
import { medicationPlanSchema } from "@/lib/validations";

function revalidateCare() {
  revalidatePath("/home");
  revalidatePath("/care");
  revalidatePath("/reminders");
  revalidatePath("/report");
}

export async function createMedicationPlanAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = medicationPlanSchema.safeParse({
    catId: formData.get("catId"),
    name: formData.get("name"),
    doseNotes: optionalText(formData.get("doseNotes"), 200),
    frequency: formData.get("frequency"),
    timesPerDay: optionalInt(formData.get("timesPerDay")) ?? undefined,
    weekdays: formData
      .getAll("weekdays")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value)),
    intervalDays: optionalInt(formData.get("intervalDays")) ?? undefined,
    startOn: optionalText(formData.get("startOn")),
    endOn: optionalText(formData.get("endOn")),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "약 일정을 저장하지 못했어요.");
  }
  await requireOwnedCat(userId, parsed.data.catId);

  await prisma.medicationPlan.create({
    data: {
      userId,
      catId: parsed.data.catId,
      name: parsed.data.name,
      doseNotes: parsed.data.doseNotes || null,
      frequency: parsed.data.frequency,
      timesPerDay: parsed.data.frequency === "TIMES_PER_DAY" ? parsed.data.timesPerDay ?? 2 : null,
      weekdays: parsed.data.frequency === "WEEKDAYS" ? serializeWeekdays(parsed.data.weekdays ?? []) : null,
      intervalDays: parsed.data.frequency === "EVERY_N_DAYS" ? parsed.data.intervalDays ?? null : null,
      startOn: parsed.data.startOn ? dateFromKey(parsed.data.startOn) : null,
      endOn: parsed.data.endOn ? dateFromKey(parsed.data.endOn) : null,
    },
  });
  revalidateCare();
}

export async function toggleMedicationDoseAction(planId: string, takenOn: string, slot: number) {
  const userId = await requireUserId();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(takenOn) || !Number.isInteger(slot) || slot < 0 || slot > 3) {
    throw new Error("약 기록을 저장하지 못했어요.");
  }
  const plan = await prisma.medicationPlan.findFirst({ where: { id: planId, userId } });
  if (!plan) throw new Error("약 일정을 찾을 수 없어요.");

  const existing = await prisma.medicationDose.findFirst({
    where: { userId, planId, takenOn: dateFromKey(takenOn), slot },
  });
  if (existing) {
    await prisma.medicationDose.delete({ where: { id: existing.id } });
  } else {
    await prisma.medicationDose.create({
      data: {
        userId,
        planId,
        catId: plan.catId,
        takenOn: dateFromKey(takenOn),
        slot,
        givenAt: new Date(),
      },
    });
  }
  revalidateCare();
}

export async function toggleMedicationPlanAction(id: string) {
  const userId = await requireUserId();
  const plan = await prisma.medicationPlan.findFirst({ where: { id, userId } });
  if (!plan) throw new Error("약 일정을 찾을 수 없어요.");
  await prisma.medicationPlan.update({
    where: { id },
    data: { active: !plan.active },
  });
  revalidateCare();
}

export async function deleteMedicationPlanAction(id: string) {
  const userId = await requireUserId();
  const plan = await prisma.medicationPlan.findFirst({ where: { id, userId } });
  if (!plan) throw new Error("약 일정을 찾을 수 없어요.");
  await prisma.medicationPlan.delete({ where: { id } });
  revalidateCare();
}
