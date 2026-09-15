import Link from "next/link";
import { createReminderAction, deleteReminderAction, toggleReminderAction } from "@/app/actions/reminders";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { EmptyState, PageHeader } from "@/components/ui";
import { displayDate, todayKey } from "@/lib/dates";
import { reminderLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { GuestRemindersPage } from "@/components/guest/guest-settings";
import { serializeCat, serializeReminder } from "@/lib/serialize";
import { getSessionUser } from "@/lib/session";

export default async function RemindersPage() {
  const user = await getSessionUser();
  if (!user?.id) return <GuestRemindersPage />;
  const userId = user.id;
  const [cats, reminders] = await Promise.all([
    prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }).then((rows) => rows.map(serializeCat)),
    prisma.reminder.findMany({ where: { userId }, orderBy: [{ completedAt: "asc" }, { dueOn: "asc" }] }).then((rows) =>
      rows.map(serializeReminder),
    ),
  ]);

  return (
    <>
      <PageHeader title="돌봄 일정" subtitle="백신, 구충, 모래 전체갈이처럼 날짜 한 번인 일정을 남겨 두세요." />
      <Link href="/care" className="card mb-5 block px-4 py-3">
        <p className="font-bold">매일 먹는 약 · 재진은 노묘 돌봄에서</p>
        <p className="mt-1 text-sm text-ink-soft">줬어요 체크, 병원 일정, 검사 숫자를 따로 모아 두었어요.</p>
      </Link>
      <form action={createReminderAction} className="card mb-5 space-y-3 p-4">
        <select name="type" className="field" defaultValue="MEDS">
          {Object.entries(reminderLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input name="title" required placeholder="예: 신장약, 종합백신" className="field" />
        <input name="dueOn" type="date" required defaultValue={todayKey()} className="field" />
        {cats.length > 0 ? (
          <select name="catId" className="field" defaultValue="">
            <option value="">모든 고양이</option>
            {cats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : null}
        <input name="notes" placeholder="메모 (선택)" className="field" />
        <button className="btn-primary w-full" type="submit">
          일정 추가
        </button>
      </form>

      {reminders.length === 0 ? (
        <EmptyState title="예정된 일정이 없어요" body="병원 가기 전에 약과 백신 날짜를 먼저 적어 두면 리포트에도 같이 나가요." />
      ) : (
        <ul className="space-y-3">
          {reminders.map((item) => {
            const overdue = !item.completedAt && item.dueOn < todayKey();
            const catName = cats.find((cat) => cat.id === item.catId)?.name;
            return (
              <li key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-accent">{reminderLabels[item.type]}</p>
                    <p className={`font-extrabold ${item.completedAt ? "line-through opacity-60" : ""}`}>
                      {item.title}
                    </p>
                    <p className={`text-sm ${overdue ? "text-rose" : "text-ink-soft"}`}>
                      {displayDate(item.dueOn)}
                      {catName ? ` · ${catName}` : ""}
                      {overdue ? " · 지남" : ""}
                    </p>
                    {item.notes ? <p className="mt-1 text-sm text-ink-soft">{item.notes}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <form action={toggleReminderAction.bind(null, item.id)}>
                      <button className="btn-ghost text-xs" type="submit">
                        {item.completedAt ? "되돌리기" : "완료"}
                      </button>
                    </form>
                    <form action={deleteReminderAction.bind(null, item.id)}>
                      <ConfirmSubmit
                        message="이 일정을 삭제할까요?"
                        className="text-xs font-bold text-rose"
                      >
                        삭제
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
