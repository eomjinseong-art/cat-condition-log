import Link from "next/link";
import { toggleMedicationDoseAction } from "@/app/actions/meds";
import { displayDate, todayKey } from "@/lib/dates";
import type { DayDose } from "@/lib/meds";
import type { PublicVisit } from "@/lib/serialize";

export function TodayMedsCard({
  doses,
  catName,
  emptyHint,
}: {
  doses: DayDose[];
  catName: string;
  emptyHint?: boolean;
}) {
  if (doses.length === 0) {
    if (!emptyHint) return null;
    return (
      <Link href="/care" className="card mb-4 block p-4">
        <p className="text-xs font-bold text-accent">오늘의 약</p>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          {catName}의 약 스케줄을 남겨 두면 홈에서 「줬어요」로 남길 수 있어요.
        </p>
      </Link>
    );
  }

  return (
    <section className="card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-accent">오늘의 약</p>
          <h2 className="font-extrabold">{catName}</h2>
        </div>
        <Link href="/care" className="text-xs font-bold text-accent">
          관리
        </Link>
      </div>
      <ul className="space-y-2">
        {doses.map((dose) => (
          <li key={`${dose.plan.id}-${dose.slot}`} className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-bold ${dose.given ? "opacity-60 line-through" : ""}`}>
                {dose.plan.name}
                {dose.slotLabel !== "오늘" ? ` · ${dose.slotLabel}` : ""}
              </p>
              <p className="text-xs text-ink-soft">
                {dose.plan.doseNotes || "용량 메모 없음"}
                {dose.missed ? " · 놓쳤어요" : dose.pending ? " · 아직" : ""}
              </p>
            </div>
            <form action={toggleMedicationDoseAction.bind(null, dose.plan.id, dose.dateKey, dose.slot)}>
              <button
                className={dose.given ? "btn-ghost px-3 py-2 text-xs" : "btn-primary px-3 py-2 text-xs"}
                type="submit"
              >
                {dose.given ? "줬어요 ✓" : "줬어요"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NextVisitCard({
  visit,
  catName,
  emptyHint,
}: {
  visit: PublicVisit | null;
  catName: string;
  emptyHint?: boolean;
}) {
  if (!visit) {
    if (!emptyHint) return null;
    return (
      <Link href="/care" className="card mb-4 block p-4">
        <p className="text-xs font-bold text-accent">다음 병원</p>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          재진·검사 날짜를 적어 두면 홈과 병원 리포트에 같이 나가요.
        </p>
      </Link>
    );
  }

  const overdue = !visit.completedAt && visit.visitOn < todayKey();
  const remind =
    visit.reminderOn && !visit.completedAt && visit.reminderOn <= todayKey() && visit.visitOn >= todayKey();

  return (
    <Link href="/care" className="card mb-4 block p-4">
      <p className="text-xs font-bold text-accent">다음 병원</p>
      <p className="mt-1 font-extrabold">
        {displayDate(visit.visitOn)} · {catName}
      </p>
      <p className={`text-sm ${overdue ? "text-rose" : "text-ink-soft"}`}>
        {visit.clinicName || "병원 이름 미입력"}
        {visit.reason ? ` · ${visit.reason}` : ""}
        {overdue ? " · 지남" : remind ? " · 오늘 알림" : ""}
      </p>
    </Link>
  );
}
