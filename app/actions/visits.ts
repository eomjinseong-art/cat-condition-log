"use server";

import { revalidatePath } from "next/cache";
import { dateFromKey } from "@/lib/dates";
import { optionalText } from "@/lib/form-parse";
import { prisma } from "@/lib/prisma";
import { requireOwnedCat, requireUserId } from "@/lib/session";
import { visitSchema } from "@/lib/validations";

function revalidateVisits() {
  revalidatePath("/home");
  revalidatePath("/care");
  revalidatePath("/report");
}

export async function createVisitAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = visitSchema.safeParse({
    catId: formData.get("catId"),
    visitOn: formData.get("visitOn"),
    clinicName: optionalText(formData.get("clinicName"), 80),
    reason: optionalText(formData.get("reason"), 300),
    reminderOn: optionalText(formData.get("reminderOn")),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "병원 일정을 저장하지 못했어요.");
  }
  await requireOwnedCat(userId, parsed.data.catId);

  await prisma.visit.create({
    data: {
      userId,
      catId: parsed.data.catId,
      visitOn: dateFromKey(parsed.data.visitOn),
      clinicName: parsed.data.clinicName || null,
      reason: parsed.data.reason || null,
      reminderOn: parsed.data.reminderOn ? dateFromKey(parsed.data.reminderOn) : null,
    },
  });
  revalidateVisits();
}

export async function toggleVisitAction(id: string) {
  const userId = await requireUserId();
  const visit = await prisma.visit.findFirst({ where: { id, userId } });
  if (!visit) throw new Error("병원 일정을 찾을 수 없어요.");
  await prisma.visit.update({
    where: { id },
    data: { completedAt: visit.completedAt ? null : new Date() },
  });
  revalidateVisits();
}

export async function deleteVisitAction(id: string) {
  const userId = await requireUserId();
  const visit = await prisma.visit.findFirst({ where: { id, userId } });
  if (!visit) throw new Error("병원 일정을 찾을 수 없어요.");
  await prisma.visit.delete({ where: { id } });
  revalidateVisits();
}
