"use client";

import { useState } from "react";
import { createMedicationPlanAction } from "@/app/actions/meds";
import { todayKey } from "@/lib/dates";
import { medFrequencyLabels, weekdayLabels } from "@/lib/labels";
import type { PublicCat } from "@/lib/serialize";

export function MedicationPlanForm({ cats, defaultCatId }: { cats: PublicCat[]; defaultCatId?: string }) {
  const [frequency, setFrequency] = useState<keyof typeof medFrequencyLabels>("DAILY");

  return (
    <form action={createMedicationPlanAction} className="card space-y-3 p-4">
      <p className="text-sm font-bold">약 스케줄 추가</p>
      {cats.length > 0 ? (
        <select name="catId" className="field" defaultValue={defaultCatId ?? cats[0]?.id}>
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      ) : null}
      <input name="name" required placeholder="예: 신장약, 혈압약" className="field" />
      <input name="doseNotes" placeholder="용량·주는 방법 (선택)" className="field" />
      <select
        name="frequency"
        className="field"
        value={frequency}
        onChange={(event) => setFrequency(event.target.value as typeof frequency)}
      >
        {Object.entries(medFrequencyLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {frequency === "TIMES_PER_DAY" ? (
        <label className="block text-sm font-bold">
          하루 횟수
          <select name="timesPerDay" className="field mt-1" defaultValue="2">
            {[2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count}번
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {frequency === "WEEKDAYS" ? (
        <div className="flex flex-wrap gap-2">
          {weekdayLabels.map((label, index) => (
            <label key={label} className="chip cursor-pointer">
              <input type="checkbox" name="weekdays" value={index} className="mr-1.5" />
              {label}
            </label>
          ))}
        </div>
      ) : null}
      {frequency === "EVERY_N_DAYS" ? (
        <label className="block text-sm font-bold">
          며칠마다
          <input name="intervalDays" type="number" min={2} max={30} defaultValue={2} className="field mt-1" />
        </label>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm font-bold">
          시작 (선택)
          <input
            name="startOn"
            type="date"
            defaultValue={frequency === "EVERY_N_DAYS" ? todayKey() : ""}
            className="field mt-1"
          />
        </label>
        <label className="block text-sm font-bold">
          끝 (선택)
          <input name="endOn" type="date" className="field mt-1" />
        </label>
      </div>
      <button className="btn-primary w-full" type="submit">
        약 일정 저장
      </button>
    </form>
  );
}
