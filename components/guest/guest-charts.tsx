"use client";

import Link from "next/link";
import { ChartsView } from "@/components/charts-view";
import { GuestLoading, GuestLocalBanner } from "@/components/guest/guest-shell";
import { EmptyState, PageHeader } from "@/components/ui";
import { useGuestActions, useGuestHydrated } from "@/components/guest/guest-runtime";
import { rangeKeys, todayKey } from "@/lib/dates";

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
  const logs = snapshot.logs.filter((log) => log.loggedOn >= from && log.loggedOn <= todayKey());

  return (
    <>
      <PageHeader title="그래프" subtitle={`최근 ${days}일 · 같은 지표를 겹쳐 볼 수 있어요.`} />
      <GuestLocalBanner />
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
