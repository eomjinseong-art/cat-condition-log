import Link from "next/link";
import { BarChart, LineChart } from "@/components/simple-charts";
import { EmptyState, PageHeader } from "@/components/ui";
import { rangeKeys, todayKey } from "@/lib/dates";
import { appetiteScore, type AppetiteKey } from "@/lib/labels";
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
        catId: current.id,
        loggedOn: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${todayKey()}T00:00:00.000Z`) },
      },
    })
  ).map(serializeLog);

  const weights = logs
    .filter((log) => log.weightKg !== null)
    .map((log) => ({ date: log.loggedOn, value: log.weightKg as number }));
  const appetite = logs
    .filter((log) => log.appetite)
    .map((log) => ({ date: log.loggedOn, value: appetiteScore[log.appetite as AppetiteKey] }));
  const vomit = logs.filter((log) => log.vomit === true).map((log) => ({ date: log.loggedOn, value: 1 }));
  const litter = logs
    .filter((log) => log.stoolCount !== null)
    .map((log) => ({ date: log.loggedOn, value: log.stoolCount as number }));

  return (
    <>
      <PageHeader title="그래프" subtitle={`${current.name} · 최근 ${days}일`} />
      <div className="mb-4 flex gap-2">
        <Link href="/charts?range=7" className={days === 7 ? "btn-primary px-4 text-sm" : "btn-ghost text-sm"}>
          7일
        </Link>
        <Link href="/charts?range=30" className={days === 30 ? "btn-primary px-4 text-sm" : "btn-ghost text-sm"}>
          30일
        </Link>
      </div>
      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-extrabold">체중</h2>
        <LineChart points={weights} days={keys} unit="kg" empty="체중 기록이 아직 없어요." />
      </section>
      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-extrabold">식욕 (0 안 먹음–3 많음)</h2>
        <BarChart points={appetite} days={keys} empty="식욕 기록이 아직 없어요." />
      </section>
      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-extrabold">구토 있는 날</h2>
        <BarChart points={vomit} days={keys} empty="구토 기록이 아직 없어요." />
      </section>
      <section className="card p-4">
        <h2 className="mb-2 font-extrabold">화장실 횟수</h2>
        <BarChart points={litter} days={keys} empty="대변 횟수 기록이 아직 없어요." />
      </section>
    </>
  );
}
