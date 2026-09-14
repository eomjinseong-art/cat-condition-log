"use client";

import Link from "next/link";
import { BarChart, LineChart } from "@/components/simple-charts";
import { GuestLoading, GuestLocalBanner } from "@/components/guest/guest-shell";
import { EmptyState, PageHeader } from "@/components/ui";
import { useGuestActions, useGuestHydrated } from "@/components/guest/guest-runtime";
import { rangeKeys, todayKey } from "@/lib/dates";
import { appetiteScore, type AppetiteKey } from "@/lib/labels";

export function GuestCharts({ range }: { range?: string }) {
  const hydrated = useGuestHydrated();
  const { snapshot } = useGuestActions();

  if (!hydrated) return <GuestLoading />;

  const days = range === "7" ? 7 : 30;
  const keys = rangeKeys(days);
  const from = keys[0];
  const cats = snapshot.cats;

  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="그래프" />
        <EmptyState title="볼 데이터가 없어요" body="고양이를 등록하고 며칠만 남겨 보세요." href="/cats/new" actionLabel="등록하기" />
      </>
    );
  }

  const current = cats.find((cat) => cat.id === (snapshot.selectedCatId ?? cats[0].id)) ?? cats[0];
  const logs = snapshot.logs.filter(
    (log) => log.catId === current.id && log.loggedOn >= from && log.loggedOn <= todayKey(),
  );
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
      <GuestLocalBanner />
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
