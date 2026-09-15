"use server";

import { revalidatePath } from "next/cache";
import { dateFromKey } from "@/lib/dates";
import { optionalNumber, optionalText } from "@/lib/form-parse";
import { prisma } from "@/lib/prisma";
import { requireOwnedCat, requireUserId } from "@/lib/session";
import { labEntrySchema } from "@/lib/validations";

function revalidateLabs() {
  revalidatePath("/care");
  revalidatePath("/report");
  revalidatePath("/cats");
}

export async function createLabEntryAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = labEntrySchema.safeParse({
    catId: formData.get("catId"),
    takenOn: formData.get("takenOn"),
    creatinine: optionalNumber(formData.get("creatinine")),
    sdma: optionalNumber(formData.get("sdma")),
    bun: optionalNumber(formData.get("bun")),
    phosphorus: optionalNumber(formData.get("phosphorus")),
    t4: optionalNumber(formData.get("t4")),
    bloodPressure: optionalNumber(formData.get("bloodPressure")),
    weightKg: optionalNumber(formData.get("weightKg")),
    notes: optionalText(formData.get("notes"), 400),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "검사 기록을 저장하지 못했어요.");
  }
  await requireOwnedCat(userId, parsed.data.catId);

  await prisma.labEntry.create({
    data: {
      userId,
      catId: parsed.data.catId,
      takenOn: dateFromKey(parsed.data.takenOn),
      creatinine: parsed.data.creatinine ?? null,
      sdma: parsed.data.sdma ?? null,
      bun: parsed.data.bun ?? null,
      phosphorus: parsed.data.phosphorus ?? null,
      t4: parsed.data.t4 ?? null,
      bloodPressure: parsed.data.bloodPressure ?? null,
      weightKg: parsed.data.weightKg ?? null,
      notes: parsed.data.notes || null,
    },
  });

  if (parsed.data.weightKg != null) {
    await prisma.cat.update({
      where: { id: parsed.data.catId },
      data: { weightKg: parsed.data.weightKg },
    });
  }
  revalidateLabs();
}

export async function deleteLabEntryAction(id: string) {
  const userId = await requireUserId();
  const entry = await prisma.labEntry.findFirst({ where: { id, userId } });
  if (!entry) throw new Error("검사 기록을 찾을 수 없어요.");
  await prisma.labEntry.delete({ where: { id } });
  revalidateLabs();
}
