import Link from "next/link";
import { ChartsView } from "@/components/charts-view";
import { EmptyState, PageHeader } from "@/components/ui";
import { rangeKeys, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { serializeCat, serializeLog } from "@/lib/serialize";
import { readSelectedCatId, requireUserId } from "@/lib/session";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const userId = await requireUserId();
  const { range } = await searchParams;
  const days = range === "7" ? 7 : 30;
  const keys = rangeKeys(days);
  const from = keys[0];
  const cats = (await prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(
    serializeCat,
  );
  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="그래프" />
        <EmptyState title="볼 데이터가 없어요" body="고양이를 등록하고 며칠만 남겨 보세요." href="/cats/new" actionLabel="등록하기" />
      </>
    );
  }
  const selectedId = (await readSelectedCatId()) ?? cats[0].id;
  const current = cats.find((cat) => cat.id === selectedId) ?? cats[0];
  const logs = (
    await prisma.log.findMany({
      where: {
        userId,
        loggedOn: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${todayKey()}T00:00:00.000Z`) },
      },
    })
  ).map(serializeLog);

  return (
    <>
      <PageHeader title="그래프" subtitle={`최근 ${days}일 · 같은 지표를 겹쳐 볼 수 있어요.`} />
      <div className="mb-4 flex gap-2">
        <Link href="/charts?range=7" className={days === 7 ? "btn-primary px-4 text-sm" : "btn-ghost text-sm"}>
          7일
        </Link>
        <Link href="/charts?range=30" className={days === 30 ? "btn-primary px-4 text-sm" : "btn-ghost text-sm"}>
          30일
        </Link>
      </div>
      <ChartsView cats={cats} selectedId={current.id} logs={logs} days={keys} />
    </>
  );
}
