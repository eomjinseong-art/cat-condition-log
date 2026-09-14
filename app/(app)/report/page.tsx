import { PrintButton } from "@/components/print-button";
import { ReportDocument } from "@/components/report-document";
import { EmptyState, Notice, PageHeader } from "@/components/ui";
import { DISCLAIMER } from "@/lib/constants";
import { addDays, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { buildReport } from "@/lib/report";
import { serializeCat, serializeLog, serializeReminder } from "@/lib/serialize";
import { readSelectedCatId, requireUserId } from "@/lib/session";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; catId?: string }>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const to = params.to && /^\d{4}-\d{2}-\d{2}$/.test(params.to) ? params.to : todayKey();
  const from =
    params.from && /^\d{4}-\d{2}-\d{2}$/.test(params.from) ? params.from : addDays(to, -29);
  const cats = (await prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(
    serializeCat,
  );
  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="병원 리포트" />
        <EmptyState title="리포트를 만들 고양이가 없어요" body="프로필을 먼저 만들어 주세요." href="/cats/new" actionLabel="등록하기" />
      </>
    );
  }

  const cookieId = await readSelectedCatId();
  const cat = cats.find((item) => item.id === (params.catId || cookieId)) ?? cats[0];
  const [logs, reminders] = await Promise.all([
    prisma.log
      .findMany({
        where: {
          userId,
          catId: cat.id,
          loggedOn: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T00:00:00.000Z`) },
        },
        orderBy: { loggedOn: "asc" },
      })
      .then((rows) => rows.map(serializeLog)),
    prisma.reminder
      .findMany({
        where: {
          userId,
          dueOn: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T00:00:00.000Z`) },
          OR: [{ catId: cat.id }, { catId: null }],
        },
        orderBy: { dueOn: "asc" },
      })
      .then((rows) => rows.map(serializeReminder)),
  ]);

  const report = buildReport({ cat, from, to, logs, reminders });

  return (
    <>
      <div className="no-print">
        <PageHeader title="병원 리포트" subtitle="입력한 숫자만 모아요. 진단 문장은 넣지 않아요." />
        <Notice>{DISCLAIMER}</Notice>
        <form method="get" action="/report" className="card mt-4 grid gap-3 p-4">
          <label className="text-sm font-bold">
            고양이
            <select name="catId" defaultValue={cat.id} className="field mt-1">
              {cats.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm font-bold">
              시작
              <input name="from" type="date" defaultValue={from} className="field mt-1" />
            </label>
            <label className="text-sm font-bold">
              끝
              <input name="to" type="date" defaultValue={to} className="field mt-1" />
            </label>
          </div>
          <button className="btn-ghost w-full" type="submit">
            기간 적용
          </button>
        </form>
        <div className="my-4">
          <PrintButton />
          <p className="mt-2 text-center text-xs text-ink-soft">
            인쇄 창에서 대상을 PDF로 저장하면 한글이 그대로 들어갑니다.
          </p>
        </div>
      </div>
      <ReportDocument report={report} />
    </>
  );
}
