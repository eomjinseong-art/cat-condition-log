"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyLog } from "@/components/daily-log";
import { GuestLoading, GuestLocalBanner } from "@/components/guest/guest-shell";
import { RelatedResources } from "@/components/partner-links";
import { EmptyState, PageHeader } from "@/components/ui";
import { useGuestActions, useGuestGate, useGuestHydrated } from "@/components/guest/guest-runtime";
import { canAddGuestCat } from "@/lib/guest-store";
import { displayDate, todayKey } from "@/lib/dates";
import { appetiteLabels, energyLabels, labelOrDash, stoolLabels } from "@/lib/labels";

export function GuestHome({ date }: { date?: string }) {
  const router = useRouter();
  const hydrated = useGuestHydrated();
  const { snapshot, selectCat, saveLog } = useGuestActions();
  const { openGate } = useGuestGate();

  if (!hydrated) return <GuestLoading />;

  const loggedOn = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey();
  const { cats, logs } = snapshot;

  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="오늘 기록" subtitle={displayDate(loggedOn)} />
        <GuestLocalBanner />
        <EmptyState
          title="아직 고양이가 없어요"
          body="이름을 등록하면 바로 오늘 컨디션을 남길 수 있어요. 계정 없이 두 마리까지 가능해요."
          href="/cats/new"
          actionLabel="고양이 등록하기"
        />
        <RelatedResources context="empty" />
      </>
    );
  }

  const current = cats.find((cat) => cat.id === (snapshot.selectedCatId ?? cats[0].id)) ?? cats[0];
  const todayLogs = logs.filter((log) => log.loggedOn === loggedOn);
  const currentLog = todayLogs.find((log) => log.catId === current.id) ?? null;

  function addCat() {
    if (!canAddGuestCat(snapshot)) {
      openGate("thirdCat");
      return;
    }
    router.push("/cats/new");
  }

  return (
    <>
      <PageHeader
        title={loggedOn === todayKey() ? "오늘 기록" : "그날 기록"}
        subtitle={displayDate(loggedOn)}
        action={
          <button type="button" className="btn-ghost text-sm" onClick={addCat}>
            + 고양이
          </button>
        }
      />
      <GuestLocalBanner />

      {cats.length > 1 ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold text-ink-soft">오늘 우리 집</h2>
          <div className="grid gap-2">
            {cats.map((cat) => {
              const log = todayLogs.find((item) => item.catId === cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="card flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => selectCat(cat.id)}
                >
                  <span className="font-bold">{cat.name}</span>
                  <span className="text-xs text-ink-soft">
                    {log
                      ? `식욕 ${labelOrDash(log.appetite, appetiteLabels)} · 컨디션 ${labelOrDash(log.energy, energyLabels)}`
                      : "아직 미기록"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-extrabold">{current.name}</p>
          <Link href={`/cats/${current.id}`} className="text-sm font-bold text-accent">
            프로필
          </Link>
        </div>
      )}

      {cats.length > 1 ? (
        <p className="mb-3 text-sm font-bold">
          지금 기록 중: {current.name}{" "}
          <Link href={`/cats/${current.id}`} className="text-accent">
            프로필
          </Link>
        </p>
      ) : null}

      <DailyLog
        key={`${current.id}-${loggedOn}`}
        catId={current.id}
        loggedOn={loggedOn}
        initial={currentLog}
        saveLog={async (payload) => saveLog(payload)}
        hidePhotos
      />

      {currentLog?.stoolQuality ? (
        <p className="mt-4 text-xs text-ink-soft">
          오늘 대변 성상: {labelOrDash(currentLog.stoolQuality, stoolLabels)}
        </p>
      ) : null}
    </>
  );
}
