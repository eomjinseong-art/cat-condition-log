"use client";

import Link from "next/link";
import { GuestLoading, GuestLocalBanner } from "@/components/guest/guest-shell";
import { EmptyState, PageHeader } from "@/components/ui";
import { useGuestActions, useGuestHydrated } from "@/components/guest/guest-runtime";
import { addDays, displayDate, monthGrid, parseYearMonth, todayKey } from "@/lib/dates";
import {
  appetiteLabels,
  energyLabels,
  labelOrDash,
  stoolLabels,
  urineLabels,
  waterLabels,
} from "@/lib/labels";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export function GuestCalendar({ month, date }: { month?: string; date?: string }) {
  const hydrated = useGuestHydrated();
  const { snapshot } = useGuestActions();

  if (!hydrated) return <GuestLoading />;

  const { year, monthIndex } = parseYearMonth(month);
  const monthValue = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey();
  const cats = snapshot.cats;

  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="달력" />
        <EmptyState title="고양이가 없어요" body="등록 후 달력에 점이 생겨요." href="/cats/new" actionLabel="등록하기" />
      </>
    );
  }

  const current = cats.find((cat) => cat.id === (snapshot.selectedCatId ?? cats[0].id)) ?? cats[0];
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthLogs = snapshot.logs.filter((log) => log.catId === current.id && log.loggedOn.startsWith(prefix));
  const byDay = new Map(monthLogs.map((log) => [log.loggedOn, log]));
  const dayLog = byDay.get(selectedDate) ?? null;
  const prev = monthIndex === 0 ? `${year - 1}-12` : `${year}-${String(monthIndex).padStart(2, "0")}`;
  const next = monthIndex === 11 ? `${year + 1}-01` : `${year}-${String(monthIndex + 2).padStart(2, "0")}`;

  return (
    <>
      <PageHeader title="달력" subtitle={`${current.name} · 기록이 있는 날은 점이 찍혀요.`} />
      <GuestLocalBanner />
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/calendar?month=${prev}`} className="btn-ghost">
          이전
        </Link>
        <p className="font-extrabold">
          {year}년 {monthIndex + 1}월
        </p>
        <Link href={`/calendar?month=${next}`} className="btn-ghost">
          다음
        </Link>
      </div>
      <div className="card p-3">
        <div className="grid grid-cols-7 text-center text-xs text-ink-soft">
          {weekdays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {monthGrid(year, monthIndex).map((cell) => {
            const logged = byDay.has(cell.key);
            const selected = cell.key === selectedDate;
            return (
              <Link
                key={cell.key}
                href={`/calendar?month=${monthValue}&date=${cell.key}`}
                className={`mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-2xl text-sm ${
                  selected ? "bg-accent text-white" : cell.inMonth ? "" : "text-line"
                }`}
              >
                {Number(cell.key.slice(8))}
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${logged ? (selected ? "bg-white" : "bg-accent") : "bg-transparent"}`}
                />
              </Link>
            );
          })}
        </div>
      </div>

      <section className="card mt-5 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">{displayDate(selectedDate)}</h2>
          <Link href={`/home?date=${selectedDate}`} className="text-sm font-bold text-accent">
            이 날 기록하기
          </Link>
        </div>
        {dayLog ? (
          <ul className="mt-3 space-y-1 text-sm leading-7">
            <li>식욕 {labelOrDash(dayLog.appetite, appetiteLabels)}</li>
            <li>음수 {labelOrDash(dayLog.water, waterLabels)}</li>
            <li>
              대변 {dayLog.stoolCount ?? "—"}회 · {labelOrDash(dayLog.stoolQuality, stoolLabels)}
            </li>
            <li>소변 {labelOrDash(dayLog.urine, urineLabels)}</li>
            <li>구토 {labelOrDash(dayLog.vomit)}</li>
            <li>컨디션 {labelOrDash(dayLog.energy, energyLabels)}</li>
            <li>체중 {dayLog.weightKg !== null ? `${dayLog.weightKg.toFixed(2)}kg` : "—"}</li>
            {dayLog.memo ? <li>메모 {dayLog.memo}</li> : null}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">이 날은 아직 기록이 없어요.</p>
        )}
      </section>
      <p className="mt-3 text-xs text-ink-soft">어제: {displayDate(addDays(todayKey(), -1))}</p>
    </>
  );
}
