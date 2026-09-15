"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { dateFromKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { serializeLog } from "@/lib/serialize";
import { requireOwnedCat, requireUserId } from "@/lib/session";
import { logPatchSchema } from "@/lib/validations";

export async function upsertLogAction(raw: unknown) {
  const userId = await requireUserId();
  const parsed = logPatchSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "기록을 저장하지 못했어요.");
  }

  const { catId, loggedOn, ...patch } = parsed.data;
  await requireOwnedCat(userId, catId);

  const data: Prisma.LogUncheckedCreateInput = {
    userId,
    catId,
    loggedOn: dateFromKey(loggedOn),
    appetite: patch.appetite ?? undefined,
    foodNote: patch.foodNote ?? undefined,
    water: patch.water ?? undefined,
    stoolCount: patch.stoolCount ?? undefined,
    stoolQuality: patch.stoolQuality ?? undefined,
    urine: patch.urine ?? undefined,
    vomit: patch.vomit ?? undefined,
    vomitNote: patch.vomitNote ?? undefined,
    vomitPhotoUrl: patch.vomitPhotoUrl ?? undefined,
    energy: patch.energy ?? undefined,
    weightKg: patch.weightKg ?? undefined,
    memo: patch.memo ?? undefined,
    photoUrl: patch.photoUrl ?? undefined,
    waterChange: patch.waterChange ?? undefined,
    urineChange: patch.urineChange ?? undefined,
    mobility: patch.mobility ?? undefined,
    nightVocal: patch.nightVocal ?? undefined,
  };

  const update: Prisma.LogUncheckedUpdateInput = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (update as Record<string, unknown>)[key] = value;
    }
  }

  const log = await prisma.log.upsert({
    where: {
      catId_loggedOn: {
        catId,
        loggedOn: dateFromKey(loggedOn),
      },
    },
    create: data,
    update,
  });

  if (patch.weightKg != null) {
    await prisma.cat.update({
      where: { id: catId },
      data: { weightKg: patch.weightKg },
    });
  }

  revalidatePath("/home");
  revalidatePath("/calendar");
  revalidatePath("/charts");
  revalidatePath("/report");
  return serializeLog(log);
}
