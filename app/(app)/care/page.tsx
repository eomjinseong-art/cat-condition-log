import { createFluidLogAction, deleteFluidLogAction } from "@/app/actions/fluids";
import { createLabEntryAction, deleteLabEntryAction } from "@/app/actions/labs";
import { deleteMedicationPlanAction, toggleMedicationDoseAction, toggleMedicationPlanAction } from "@/app/actions/meds";
import { createVisitAction, deleteVisitAction, toggleVisitAction } from "@/app/actions/visits";
import { MedicationPlanForm } from "@/components/medication-form";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { GuestFeatureGate } from "@/components/guest/signup-prompt";
import { EmptyState, Notice, PageHeader, SectionTitle } from "@/components/ui";
import { hasCondition } from "@/lib/conditions";
import { DISCLAIMER } from "@/lib/constants";
import { displayDate, isSeniorCat, todayKey } from "@/lib/dates";
import { fluidSiteLabels, weekdayLabels } from "@/lib/labels";
import { buildDayDoses, frequencySummary, nextVisitOf } from "@/lib/meds";
import { prisma } from "@/lib/prisma";
import {
  serializeCat,
  serializeFluidLog,
  serializeLabEntry,
  serializeMedicationDose,
  serializeMedicationPlan,
  serializeVisit,
} from "@/lib/serialize";
import { getSessionUser, readSelectedCatId } from "@/lib/session";

export default async function CarePage() {
  const user = await getSessionUser();
  if (!user?.id) {
    return (
      <>
        <PageHeader title="노묘 돌봄" subtitle="약, 재진, 검사 숫자를 기록만 모아요. 진단하지 않아요." />
        <Notice>{DISCLAIMER}</Notice>
        <div className="mt-4">
          <GuestFeatureGate feature="care" />
        </div>
      </>
    );
  }

  const userId = user.id;
  const [catsRaw, plansRaw, dosesRaw, visitsRaw, labsRaw, fluidsRaw] = await Promise.all([
    prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.medicationPlan.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.medicationDose.findMany({
      where: { userId, takenOn: { gte: new Date(`${todayKey()}T00:00:00.000Z`) } },
    }),
    prisma.visit.findMany({ where: { userId }, orderBy: { visitOn: "asc" } }),
    prisma.labEntry.findMany({ where: { userId }, orderBy: { takenOn: "desc" }, take: 20 }),
    prisma.fluidLog.findMany({ where: { userId }, orderBy: { givenOn: "desc" }, take: 12 }),
  ]);

  const cats = catsRaw.map(serializeCat);
  if (cats.length === 0) {
    return (
      <>
        <PageHeader title="노묘 돌봄" />
        <EmptyState
          title="고양이를 먼저 등록해 주세요"
          body="약·재진·검사는 고양이마다 따로 남겨요."
          href="/cats/new"
          actionLabel="고양이 등록"
        />
      </>
    );
  }

  const selectedId = (await readSelectedCatId()) ?? cats[0].id;
  const current = cats.find((cat) => cat.id === selectedId) ?? cats[0];
  const plans = plansRaw.map(serializeMedicationPlan);
  const doses = dosesRaw.map(serializeMedicationDose);
  const visits = visitsRaw.map(serializeVisit);
  const labs = labsRaw.map(serializeLabEntry);
  const fluids = fluidsRaw.map(serializeFluidLog);
  const todayDoses = buildDayDoses(
    plans.filter((plan) => plan.catId === current.id && plan.active),
    doses,
    todayKey(),
  );
  const nextVisit = nextVisitOf(visits.filter((visit) => visit.catId === current.id));
  const currentLabs = labs.filter((lab) => lab.catId === current.id);
  const currentFluids = fluids.filter((log) => log.catId === current.id);
  const lastFluid = currentFluids[0];
  const suggestSite =
    lastFluid?.site === "LEFT_SCRUFF" ? "RIGHT_SCRUFF" : lastFluid?.site === "RIGHT_SCRUFF" ? "LEFT_SCRUFF" : null;
  const showFluids = isSeniorCat(current) || hasCondition(current.conditions, "CKD");

  return (
    <>
      <PageHeader
        title="노묘 돌봄"
        subtitle={`${current.name} · 기록만 모아요. 정상/비정상 판단은 하지 않아요.`}
      />
      <Notice>{DISCLAIMER}</Notice>

      <section className="card mt-4 p-4">
        <SectionTitle>오늘 줄 약</SectionTitle>
        {todayDoses.length === 0 ? (
          <p className="text-sm text-ink-soft">오늘 예정된 약이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {todayDoses.map((dose) => (
              <li key={`${dose.plan.id}-${dose.slot}`} className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-bold ${dose.given ? "opacity-60 line-through" : ""}`}>
                    {dose.plan.name}
                    {dose.slotLabel !== "오늘" ? ` · ${dose.slotLabel}` : ""}
                  </p>
                  <p className={`text-xs ${dose.missed ? "text-rose" : "text-ink-soft"}`}>
                    {dose.plan.doseNotes || frequencySummary(dose.plan)}
                    {dose.given ? " · 줬어요" : dose.pending ? " · 아직" : ""}
                  </p>
                </div>
                <form action={toggleMedicationDoseAction.bind(null, dose.plan.id, dose.dateKey, dose.slot)}>
                  <button className={dose.given ? "btn-ghost px-3 py-2 text-xs" : "btn-primary px-3 py-2 text-xs"} type="submit">
                    {dose.given ? "줬어요 ✓" : "줬어요"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {nextVisit ? (
        <section className="card mt-4 p-4">
          <SectionTitle>다음 병원</SectionTitle>
          <p className="font-extrabold">{displayDate(nextVisit.visitOn)}</p>
          <p className="text-sm text-ink-soft">
            {nextVisit.clinicName || "병원 이름 미입력"}
            {nextVisit.reason ? ` · ${nextVisit.reason}` : ""}
          </p>
        </section>
      ) : null}

      <div className="mt-6 space-y-3">
        <MedicationPlanForm cats={cats} defaultCatId={current.id} />
        {plans.length === 0 ? (
          <p className="text-sm text-ink-soft">등록된 약 스케줄이 없어요.</p>
        ) : (
          <ul className="space-y-3">
            {plans.map((plan) => {
              const catName = cats.find((cat) => cat.id === plan.catId)?.name;
              return (
                <li key={plan.id} className="card p-4">
                  <p className="text-xs font-bold text-accent">{frequencySummary(plan)}</p>
                  <p className={`font-extrabold ${plan.active ? "" : "opacity-50 line-through"}`}>{plan.name}</p>
                  <p className="text-sm text-ink-soft">
                    {catName}
                    {plan.doseNotes ? ` · ${plan.doseNotes}` : ""}
                    {plan.startOn ? ` · ${displayDate(plan.startOn)}부터` : ""}
                    {plan.endOn ? ` · ${displayDate(plan.endOn)}까지` : ""}
                    {plan.frequency === "WEEKDAYS" && plan.weekdays.length
                      ? ` · ${plan.weekdays.map((day) => weekdayLabels[day]).join("")}`
                      : ""}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <form action={toggleMedicationPlanAction.bind(null, plan.id)}>
                      <button className="btn-ghost px-3 py-2 text-xs" type="submit">
                        {plan.active ? "잠시 끄기" : "다시 켜기"}
                      </button>
                    </form>
                    <form action={deleteMedicationPlanAction.bind(null, plan.id)}>
                      <ConfirmSubmit message="이 약 일정을 삭제할까요?" className="text-xs font-bold text-rose">
                        삭제
                      </ConfirmSubmit>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form action={createVisitAction} className="card mt-8 space-y-3 p-4">
        <p className="text-sm font-bold">병원 · 재진 일정</p>
        <select name="catId" className="field" defaultValue={current.id}>
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input name="visitOn" type="date" required defaultValue={todayKey()} className="field" />
        <input name="clinicName" placeholder="병원 이름 (선택)" className="field" />
        <input name="reason" placeholder="이유·가져갈 것 (선택)" className="field" />
        <label className="block text-sm font-bold">
          알림 날짜 (선택)
          <input name="reminderOn" type="date" className="field mt-1" />
        </label>
        <button className="btn-primary w-full" type="submit">
          병원 일정 저장
        </button>
      </form>
      {visits.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">예정된 병원 일정이 없어요.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {visits.map((visit) => {
            const catName = cats.find((cat) => cat.id === visit.catId)?.name;
            const overdue = !visit.completedAt && visit.visitOn < todayKey();
            return (
              <li key={visit.id} className="card p-4">
                <p className={`font-extrabold ${visit.completedAt ? "opacity-60 line-through" : ""}`}>
                  {displayDate(visit.visitOn)} · {catName}
                </p>
                <p className={`text-sm ${overdue ? "text-rose" : "text-ink-soft"}`}>
                  {visit.clinicName || "병원 이름 미입력"}
                  {visit.reason ? ` · ${visit.reason}` : ""}
                  {overdue ? " · 지남" : visit.completedAt ? " · 다녀옴" : ""}
                  {visit.reminderOn ? ` · 알림 ${displayDate(visit.reminderOn)}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <form action={toggleVisitAction.bind(null, visit.id)}>
                    <button className="btn-ghost px-3 py-2 text-xs" type="submit">
                      {visit.completedAt ? "되돌리기" : "다녀왔어요"}
                    </button>
                  </form>
                  <form action={deleteVisitAction.bind(null, visit.id)}>
                    <ConfirmSubmit message="이 병원 일정을 삭제할까요?" className="text-xs font-bold text-rose">
                      삭제
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form action={createLabEntryAction} className="card mt-8 space-y-3 p-4">
        <p className="text-sm font-bold">검사 숫자 기록</p>
        <p className="text-xs leading-5 text-ink-soft">
          검사지에서 본 숫자만 옮겨 적어요. 정상/비정상 표시는 하지 않아요.
          {hasCondition(current.conditions, "CKD") ? " CKD 태그: 크레아티닌·SDMA·BUN·인을 자주 봐요." : ""}
          {hasCondition(current.conditions, "HYPERTHYROID") ? " 갑상선 태그: T4·체중을 자주 봐요." : ""}
          {hasCondition(current.conditions, "HYPERTENSION") ? " 고혈압 태그: 혈압을 자주 봐요." : ""}
        </p>
        <select name="catId" className="field" defaultValue={current.id}>
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input name="takenOn" type="date" required defaultValue={todayKey()} className="field" />
        <div className="grid grid-cols-2 gap-2">
          <input name="creatinine" type="number" step="0.001" min="0" placeholder="크레아티닌" className="field" />
          <input name="sdma" type="number" step="0.01" min="0" placeholder="SDMA" className="field" />
          <input name="bun" type="number" step="0.01" min="0" placeholder="BUN" className="field" />
          <input name="phosphorus" type="number" step="0.01" min="0" placeholder="인(P)" className="field" />
          <input name="t4" type="number" step="0.01" min="0" placeholder="T4" className="field" />
          <input name="bloodPressure" type="number" min="40" max="300" placeholder="혈압" className="field" />
          <input name="weightKg" type="number" step="0.01" min="0.01" max="30" placeholder="체중 kg" className="field" />
        </div>
        <input name="notes" placeholder="메모 (선택)" className="field" />
        <button className="btn-primary w-full" type="submit">
          검사 기록 저장
        </button>
      </form>
      {currentLabs.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">검사 숫자가 아직 없어요.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {currentLabs.map((lab) => (
            <li key={lab.id} className="card p-4 text-sm leading-6">
              <p className="font-extrabold">{displayDate(lab.takenOn)}</p>
              <p className="text-ink-soft">
                크레아티닌 {lab.creatinine ?? "—"} · SDMA {lab.sdma ?? "—"} · BUN {lab.bun ?? "—"} · 인{" "}
                {lab.phosphorus ?? "—"}
              </p>
              <p className="text-ink-soft">
                T4 {lab.t4 ?? "—"} · 혈압 {lab.bloodPressure ?? "—"} · 체중{" "}
                {lab.weightKg !== null ? `${lab.weightKg.toFixed(2)}kg` : "—"}
              </p>
              {lab.notes ? <p className="mt-1">{lab.notes}</p> : null}
              <form action={deleteLabEntryAction.bind(null, lab.id)} className="mt-2">
                <ConfirmSubmit message="이 검사 기록을 삭제할까요?" className="text-xs font-bold text-rose">
                  삭제
                </ConfirmSubmit>
              </form>
            </li>
          ))}
        </ul>
      )}

      {showFluids ? (
        <>
          <form action={createFluidLogAction} className="card mt-8 space-y-3 p-4">
            <p className="text-sm font-bold">피하수액</p>
            <p className="text-xs leading-5 text-ink-soft">
              준 양과 자리만 남겨 두어요. 다음 자리는 돌아가며 적어 두면 좋아요.
              {suggestSite ? ` 지난번: ${fluidSiteLabels[lastFluid!.site!]} → 이번엔 ${fluidSiteLabels[suggestSite]}를 고려해 보세요.` : ""}
            </p>
            <select name="catId" className="field" defaultValue={current.id}>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input name="givenOn" type="date" required defaultValue={todayKey()} className="field" />
            <input name="volumeMl" type="number" min="1" max="500" required placeholder="용량 mL" className="field" />
            <select name="site" className="field" defaultValue={suggestSite ?? ""}>
              <option value="">자리 (선택)</option>
              {Object.entries(fluidSiteLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="메모 (선택)" className="field" />
            <button className="btn-primary w-full" type="submit">
              피하수액 기록
            </button>
          </form>
          {currentFluids.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {currentFluids.map((log) => (
                <li key={log.id} className="card flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-extrabold">{displayDate(log.givenOn)}</p>
                    <p className="text-sm text-ink-soft">
                      {log.volumeMl}mL
                      {log.site ? ` · ${fluidSiteLabels[log.site]}` : ""}
                      {log.notes ? ` · ${log.notes}` : ""}
                    </p>
                  </div>
                  <form action={deleteFluidLogAction.bind(null, log.id)}>
                    <ConfirmSubmit message="이 피하수액 기록을 삭제할까요?" className="text-xs font-bold text-rose">
                      삭제
                    </ConfirmSubmit>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </>
  );
}
