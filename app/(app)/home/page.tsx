import Link from "next/link";
import { DailyLog } from "@/components/daily-log";
import { RelatedResources } from "@/components/partner-links";
import { EmptyState, Notice, PageHeader } from "@/components/ui";
import { displayDate, todayKey } from "@/lib/dates";
import {
  appetiteLabels,
  energyLabels,
  labelOrDash,
  reminderLabels,
  stoolLabels,
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { serializeCat, serializeLog, serializeReminder } from "@/lib/serialize";
import { readSelectedCatId, requireUserId } from "@/lib/session";
import { selectCatAction } from "@/app/actions/cats";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const userId = await requireUserId();
  const { date } = await searchParams;
  const loggedOn = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey();
  const [catsRaw, remindersRaw] = await Promise.all([
    prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.reminder.findMany({
      where: { userId, completedAt: null, dueOn: { lte: new Date() } },
      orderBy: { dueOn: "asc" },
      take: 4,
    }),
  ]);
  const cats = catsRaw.map(serializeCat);
  const reminders = remindersRaw.map(serializeReminder);

  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="오늘 기록" subtitle={displayDate(loggedOn)} />
        <EmptyState
          title="아직 고양이가 없어요"
          body="이름을 등록하면 바로 오늘 컨디션을 남길 수 있어요."
          href="/cats/new"
          actionLabel="고양이 등록하기"
        />
        <RelatedResources context="empty" />
      </>
    );
  }

  const selectedId = (await readSelectedCatId()) ?? cats[0].id;
  const current = cats.find((cat) => cat.id === selectedId) ?? cats[0];
  const todayLogs = await prisma.log.findMany({
    where: { userId, loggedOn: new Date(`${loggedOn}T00:00:00.000Z`) },
  });
  const logs = todayLogs.map(serializeLog);
  const currentLog = logs.find((log) => log.catId === current.id) ?? null;

  return (
    <>
      <PageHeader
        title={loggedOn === todayKey() ? "오늘 기록" : "그날 기록"}
        subtitle={displayDate(loggedOn)}
        action={
          <Link href="/cats/new" className="btn-ghost text-sm">
            + 고양이
          </Link>
        }
      />

      {cats.length > 1 ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold text-ink-soft">오늘 우리 집</h2>
          <div className="grid gap-2">
            {cats.map((cat) => {
              const log = logs.find((item) => item.catId === cat.id);
              return (
                <form key={cat.id} action={selectCatAction.bind(null, cat.id)}>
                  <button type="submit" className="card flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="font-bold">{cat.name}</span>
                    <span className="text-xs text-ink-soft">
                      {log
                        ? `식욕 ${labelOrDash(log.appetite, appetiteLabels)} · 컨디션 ${labelOrDash(log.energy, energyLabels)}`
                        : "아직 미기록"}
                    </span>
                  </button>
                </form>
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

      {reminders.length > 0 ? (
        <Link href="/reminders" className="mb-4 block">
          <Notice>
            돌봄 일정 {reminders.length}건 · {reminders.map((item) => reminderLabels[item.type]).join(", ")}
          </Notice>
        </Link>
      ) : null}

      <DailyLog catId={current.id} loggedOn={loggedOn} initial={currentLog} />

      {currentLog?.stoolQuality ? (
        <p className="mt-4 text-xs text-ink-soft">
          오늘 대변 성상: {labelOrDash(currentLog.stoolQuality, stoolLabels)}
        </p>
      ) : null}
    </>
  );
}
