import { logsToCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { serializeCat, serializeLog } from "@/lib/serialize";
import { requireUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireUserId();
  const [cats, logs] = await Promise.all([
    prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.log.findMany({ where: { userId }, orderBy: [{ loggedOn: "asc" }, { createdAt: "asc" }] }),
  ]);

  const csv = logsToCsv(cats.map(serializeCat), logs.map(serializeLog));
  const bom = "\uFEFF";
  return new Response(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cat-condition-logs.csv"',
      "Cache-Control": "no-store",
    },
  });
}
