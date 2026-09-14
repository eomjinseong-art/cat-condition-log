import { auth } from "@/auth";
import { dateFromKey } from "@/lib/dates";
import { birthDateForDb, guestImportSchema, planGuestImport } from "@/lib/guest-import";
import { guestSnapshotHasData, parseGuestSnapshot } from "@/lib/guest-store";
import { prisma } from "@/lib/prisma";
import { writeSelectedCatId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "가져올 기록이 올바르지 않아요." }, { status: 400 });
  }

  const parsed = guestImportSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "가져올 기록이 올바르지 않아요." }, { status: 400 });
  }

  const snapshot = parseGuestSnapshot(JSON.stringify(parsed.data));
  if (snapshot && !guestSnapshotHasData(snapshot) && !parsed.data.disclaimerAcceptedAt) {
    return Response.json({ imported: false, cats: 0, logs: 0 });
  }

  const plan = planGuestImport(parsed.data);
  const idMap = new Map<string, string>();

  try {
    await prisma.$transaction(async (tx) => {
      for (const cat of plan.cats) {
        const created = await tx.cat.create({
          data: {
            userId,
            name: cat.name,
            birthDate: birthDateForDb(cat.birthDate),
            weightKg: cat.weightKg,
            photoUrl: null,
            notes: cat.notes,
          },
        });
        idMap.set(cat.guestId, created.id);
      }

      for (const log of plan.logs) {
        const catId = idMap.get(log.guestCatId);
        if (!catId) continue;
        await tx.log.create({
          data: {
            userId,
            catId,
            loggedOn: dateFromKey(log.loggedOn),
            appetite: log.appetite ?? undefined,
            foodNote: log.foodNote,
            water: log.water ?? undefined,
            stoolCount: log.stoolCount,
            stoolQuality: log.stoolQuality ?? undefined,
            urine: log.urine ?? undefined,
            vomit: log.vomit,
            vomitNote: log.vomitNote,
            energy: log.energy ?? undefined,
            weightKg: log.weightKg,
            memo: log.memo,
            photoUrl: null,
            vomitPhotoUrl: null,
          },
        });
      }

      if (plan.disclaimerAcceptedAt) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { disclaimerAcceptedAt: true },
        });
        if (user && !user.disclaimerAcceptedAt) {
          const accepted = new Date(plan.disclaimerAcceptedAt);
          await tx.user.update({
            where: { id: userId },
            data: { disclaimerAcceptedAt: Number.isNaN(accepted.getTime()) ? new Date() : accepted },
          });
        }
      }
    });
  } catch {
    return Response.json({ error: "기록을 옮기지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  const selected = plan.selectedGuestCatId ? idMap.get(plan.selectedGuestCatId) : undefined;
  if (selected) {
    await writeSelectedCatId(selected);
  }

  return Response.json({
    imported: plan.cats.length > 0 || plan.logs.length > 0 || Boolean(plan.disclaimerAcceptedAt),
    cats: plan.cats.length,
    logs: plan.logs.length,
  });
}
