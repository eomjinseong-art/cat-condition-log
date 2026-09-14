import Link from "next/link";
import { CatLegend, CatPicker, StickyCatBar } from "@/components/cat-picker";
import { LogFacts } from "@/components/log-facts";
import { EmptyState, PageHeader } from "@/components/ui";
import { catColor, catIdsByDay } from "@/lib/cat-colors";
import { addDays, displayDate, monthGrid, parseYearMonth, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { GuestCalendar } from "@/components/guest/guest-calendar";
import { serializeCat, serializeLog } from "@/lib/serialize";
import { getSessionUser, readSelectedCatId } from "@/lib/session";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (!user?.id) {
    return <GuestCalendar month={params.month} date={params.date} />;
  }
  const userId = user.id;
  const { year, monthIndex } = parseYearMonth(params.month);
  const monthValue = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayKey();

  const cats = (await prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(
    serializeCat,
  );
  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="달력" />
        <EmptyState title="고양이가 없어요" body="등록 후 달력에 점이 생겨요." href="/cats/new" actionLabel="등록하기" />
      </>
    );
  }

  const selectedId = (await readSelectedCatId()) ?? cats[0].id;
  const current = cats.find((cat) => cat.id === selectedId) ?? cats[0];
  const catIds = cats.map((cat) => cat.id);
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));
  const logs = (
    await prisma.log.findMany({
      where: { userId, loggedOn: { gte: start, lte: end } },
    })
  ).map(serializeLog);
  const dotsByDay = catIdsByDay(logs);
  const dayLogs = logs.filter((log) => log.loggedOn === selectedDate);
  const prev = monthIndex === 0 ? `${year - 1}-12` : `${year}-${String(monthIndex).padStart(2, "0")}`;
  const next =
    monthIndex === 11 ? `${year + 1}-01` : `${year}-${String(monthIndex + 2).padStart(2, "0")}`;

  return (
    <>
      <PageHeader title="달력" subtitle="여러 고양이 기록이 같은 칸에 색 점으로 보여요." />
      <StickyCatBar>
        <CatPicker cats={cats} selectedId={current.id} />
        <p className="mt-2 text-xs text-ink-soft">
          점을 눌러 그날 기록을 보고, 칩을 누르면 홈에서 남길 고양이가 바뀌어요.
        </p>
      </StickyCatBar>
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
        <div className="mb-2 px-1">
          <CatLegend cats={cats} />
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-ink-soft">
          {weekdays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {monthGrid(year, monthIndex).map((cell) => {
            const loggedIds = dotsByDay.get(cell.key) ?? [];
            const selected = cell.key === selectedDate;
            return (
              <Link
                key={cell.key}
                href={`/calendar?month=${monthValue}&date=${cell.key}`}
                aria-label={`${cell.key} 기록`}
                aria-current={selected ? "date" : undefined}
                className={`mx-auto flex h-12 w-11 flex-col items-center justify-center rounded-2xl text-sm ${
                  selected ? "bg-[#f6ead6] font-extrabold text-accent ring-2 ring-accent" : cell.inMonth ? "" : "text-line"
                }`}
              >
                {Number(cell.key.slice(8))}
                <span className="mt-0.5 flex h-2 min-h-2 items-center justify-center gap-0.5">
                  {loggedIds.map((id) => (
                    <span
                      key={id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: catColor(id, catIds).hex }}
                    />
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <section className="card mt-5 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-extrabold">{displayDate(selectedDate)}</h2>
          <Link href={`/home?date=${selectedDate}`} className="text-sm font-bold text-accent">
            {current.name} 기록하기
          </Link>
        </div>
        {dayLogs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">이 날은 아직 기록이 없어요.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {cats.map((cat) => {
              const log = dayLogs.find((item) => item.catId === cat.id);
              return (
                <div key={cat.id} className="border-t border-line/80 pt-3 first:border-0 first:pt-0">
                  <p className="flex items-center gap-2 text-sm font-extrabold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: catColor(cat.id, catIds).hex }} />
                    {cat.name}
                  </p>
                  {log ? <LogFacts log={log} /> : <p className="mt-2 text-sm text-ink-soft">아직 기록이 없어요.</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
      <p className="mt-3 text-xs text-ink-soft">어제: {displayDate(addDays(todayKey(), -1))}</p>
    </>
  );
}
