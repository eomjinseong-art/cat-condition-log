"use server";

import { revalidatePath } from "next/cache";
import { dateFromKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireOwnedCat, requireUserId } from "@/lib/session";
import { reminderSchema } from "@/lib/validations";

export async function createReminderAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = reminderSchema.safeParse({
    catId: formData.get("catId") || undefined,
    type: formData.get("type"),
    title: formData.get("title"),
    dueOn: formData.get("dueOn"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "일정을 저장하지 못했어요.");
  }
  if (parsed.data.catId) {
    await requireOwnedCat(userId, parsed.data.catId);
  }

  await prisma.reminder.create({
    data: {
      userId,
      catId: parsed.data.catId || null,
      type: parsed.data.type,
      title: parsed.data.title,
      dueOn: dateFromKey(parsed.data.dueOn),
      notes: parsed.data.notes || null,
    },
  });
  revalidatePath("/reminders");
  revalidatePath("/home");
  revalidatePath("/report");
}

export async function toggleReminderAction(id: string) {
  const userId = await requireUserId();
  const reminder = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!reminder) throw new Error("일정을 찾을 수 없어요.");
  await prisma.reminder.update({
    where: { id },
    data: { completedAt: reminder.completedAt ? null : new Date() },
  });
  revalidatePath("/reminders");
  revalidatePath("/home");
}

export async function deleteReminderAction(id: string) {
  const userId = await requireUserId();
  const reminder = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!reminder) throw new Error("일정을 찾을 수 없어요.");
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/reminders");
  revalidatePath("/home");
}
