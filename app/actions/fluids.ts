"use server";

import { revalidatePath } from "next/cache";
import { dateFromKey } from "@/lib/dates";
import { optionalInt, optionalText } from "@/lib/form-parse";
import { prisma } from "@/lib/prisma";
import { requireOwnedCat, requireUserId } from "@/lib/session";
import { fluidLogSchema } from "@/lib/validations";

function revalidateFluids() {
  revalidatePath("/care");
  revalidatePath("/report");
}

export async function createFluidLogAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = fluidLogSchema.safeParse({
    catId: formData.get("catId"),
    givenOn: formData.get("givenOn"),
    volumeMl: optionalInt(formData.get("volumeMl")),
    site: optionalText(formData.get("site")) || undefined,
    notes: optionalText(formData.get("notes"), 200),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "피하수액 기록을 저장하지 못했어요.");
  }
  await requireOwnedCat(userId, parsed.data.catId);

  await prisma.fluidLog.create({
    data: {
      userId,
      catId: parsed.data.catId,
      givenOn: dateFromKey(parsed.data.givenOn),
      volumeMl: parsed.data.volumeMl,
      site: parsed.data.site ?? null,
      notes: parsed.data.notes || null,
    },
  });
  revalidateFluids();
}

export async function deleteFluidLogAction(id: string) {
  const userId = await requireUserId();
  const log = await prisma.fluidLog.findFirst({ where: { id, userId } });
  if (!log) throw new Error("피하수액 기록을 찾을 수 없어요.");
  await prisma.fluidLog.delete({ where: { id } });
  revalidateFluids();
}
