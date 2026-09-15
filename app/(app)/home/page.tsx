import Link from "next/link";
import { DailyLog } from "@/components/daily-log";
import { NextVisitCard, TodayMedsCard } from "@/components/care-widgets";
import { CatPicker, StickyCatBar } from "@/components/cat-picker";
import { GuestHome } from "@/components/guest/guest-home";
import { RelatedResources } from "@/components/partner-links";
import { EmptyState, Notice, PageHeader } from "@/components/ui";
import { displayDate, isSeniorCat, todayKey } from "@/lib/dates";
import { labelOrDash, reminderLabels, stoolLabels } from "@/lib/labels";
import { buildDayDoses, nextVisitOf } from "@/lib/meds";
import { prisma } from "@/lib/prisma";
import {
  serializeCat,
  serializeLog,
  serializeMedicationDose,
  serializeMedicationPlan,
  serializeReminder,
  serializeVisit,
} from "@/lib/serialize";
import { getSessionUser, readSelectedCatId } from "@/lib/session";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getSessionUser();
  const { date } = await searchParams;
  if (!user?.id) {
    return <GuestHome date={date} />;
  }
  const userId = user.id;
  const loggedOn = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey();
  const [catsRaw, remindersRaw, plansRaw, dosesRaw, visitsRaw] = await Promise.all([
    prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.reminder.findMany({
      where: { userId, completedAt: null, dueOn: { lte: new Date() } },
      orderBy: { dueOn: "asc" },
      take: 4,
    }),
    prisma.medicationPlan.findMany({ where: { userId, active: true } }),
    prisma.medicationDose.findMany({
      where: { userId, takenOn: new Date(`${loggedOn}T00:00:00.000Z`) },
    }),
    prisma.visit.findMany({ where: { userId, completedAt: null }, orderBy: { visitOn: "asc" } }),
  ]);
  const cats = catsRaw.map(serializeCat);
  const reminders = remindersRaw.map(serializeReminder);
  const plans = plansRaw.map(serializeMedicationPlan);
  const doses = dosesRaw.map(serializeMedicationDose);
  const visits = visitsRaw.map(serializeVisit);

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

      <StickyCatBar>
        <CatPicker cats={cats} selectedId={current.id} loggedCatIds={logs.map((log) => log.catId)} />
        <p className="mt-2 flex items-center justify-between text-xs text-ink-soft">
          <span>
            지금 기록 중 <span className="font-bold text-ink">{current.name}</span>
          </span>
          <Link href={`/cats/${current.id}`} className="font-bold text-accent">
            프로필
          </Link>
        </p>
      </StickyCatBar>

      {reminders.length > 0 ? (
        <Link href="/reminders" className="mb-4 block">
          <Notice>
            돌봄 일정 {reminders.length}건 · {reminders.map((item) => reminderLabels[item.type]).join(", ")}
          </Notice>
        </Link>
      ) : null}

      <TodayMedsCard
        doses={buildDayDoses(
          plans.filter((plan) => plan.catId === current.id),
          doses,
          loggedOn,
        )}
        catName={current.name}
        emptyHint={isSeniorCat(current)}
      />
      <NextVisitCard
        visit={nextVisitOf(visits.filter((visit) => visit.catId === current.id))}
        catName={current.name}
        emptyHint={isSeniorCat(current)}
      />

      <DailyLog
        key={`${current.id}-${loggedOn}`}
        catId={current.id}
        loggedOn={loggedOn}
        initial={currentLog}
        senior={isSeniorCat(current)}
      />

      {currentLog?.stoolQuality ? (
        <p className="mt-4 text-xs text-ink-soft">
          오늘 대변 성상: {labelOrDash(currentLog.stoolQuality, stoolLabels)}
        </p>
      ) : null}
    </>
  );
}
