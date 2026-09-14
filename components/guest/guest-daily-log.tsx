"use client";

import { useState, useTransition } from "react";
import { RelatedResources } from "@/components/partner-links";
import { ChipButton, SectionTitle } from "@/components/ui";
import type { GuestLogPatch } from "@/lib/guest-store";
import { appetiteLabels, energyLabels, stoolLabels, urineLabels, waterLabels } from "@/lib/labels";
import type { PublicLog } from "@/lib/serialize";

const stoolCounts = [0, 1, 2, 3, 4];

export function GuestDailyLog({
  catId,
  loggedOn,
  initial,
  saveLog,
}: {
  catId: string;
  loggedOn: string;
  initial: PublicLog | null;
  saveLog: (patch: GuestLogPatch) => Promise<PublicLog> | PublicLog;
}) {
  const [log, setLog] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("칩을 누르면 바로 저장돼요.");

  function save(patch: Record<string, unknown>) {
    startTransition(async () => {
      try {
        const next = await saveLog({ catId, loggedOn, ...patch } as GuestLogPatch);
        setLog(next);
        setMessage("저장했어요.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "저장에 실패했어요.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-ink-soft">{pending ? "저장 중…" : message}</p>

      <section className="card p-4">
        <SectionTitle>식욕 · 식사</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(appetiteLabels).map(([key, label]) => (
            <ChipButton key={key} active={log?.appetite === key} onClick={() => save({ appetite: key })}>
              {label}
            </ChipButton>
          ))}
        </div>
        <textarea
          defaultValue={log?.foodNote ?? ""}
          placeholder="어떤 사료·간식을 먹었는지 (선택)"
          className="field mt-3 min-h-20"
          onBlur={(event) => save({ foodNote: event.target.value || null })}
        />
        {log?.appetite || log?.foodNote ? <RelatedResources context="food" /> : null}
      </section>

      <section className="card p-4">
        <SectionTitle>물</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(waterLabels).map(([key, label]) => (
            <ChipButton key={key} active={log?.water === key} onClick={() => save({ water: key })}>
              {label}
            </ChipButton>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>화장실 · 대변</SectionTitle>
        <p className="mb-2 text-xs text-ink-soft">횟수</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {stoolCounts.map((count) => (
            <ChipButton
              key={count}
              active={log?.stoolCount === count}
              onClick={() => save({ stoolCount: count })}
            >
              {count}회
            </ChipButton>
          ))}
        </div>
        <p className="mb-2 text-xs text-ink-soft">성상</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stoolLabels).map(([key, label]) => (
            <ChipButton
              key={key}
              active={log?.stoolQuality === key}
              onClick={() => save({ stoolQuality: key })}
            >
              {label}
            </ChipButton>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>소변</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(urineLabels).map(([key, label]) => (
            <ChipButton key={key} active={log?.urine === key} onClick={() => save({ urine: key })}>
              {label}
            </ChipButton>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>구토</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <ChipButton active={log?.vomit === false} onClick={() => save({ vomit: false })}>
            없음
          </ChipButton>
          <ChipButton active={log?.vomit === true} onClick={() => save({ vomit: true })}>
            있음
          </ChipButton>
        </div>
        {log?.vomit ? (
          <>
            <textarea
              defaultValue={log.vomitNote ?? ""}
              placeholder="색·횟수 등 짧게 (선택)"
              className="field mt-3 min-h-20"
              onBlur={(event) => save({ vomitNote: event.target.value || null })}
            />
            <RelatedResources context="vomit" />
          </>
        ) : null}
      </section>

      <section className="card p-4">
        <SectionTitle>컨디션 · 활력</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(energyLabels).map(([key, label]) => (
            <ChipButton key={key} active={log?.energy === key} onClick={() => save({ energy: key })}>
              {label}
            </ChipButton>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>체중 (0.01kg)</SectionTitle>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max="30"
            defaultValue={log?.weightKg ?? ""}
            placeholder="4.25"
            className="field"
            onBlur={(event) => {
              const value = event.target.value;
              save({ weightKg: value === "" ? null : Number(value) });
            }}
          />
          <span className="self-center text-sm text-ink-soft">kg</span>
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>짧은 메모</SectionTitle>
        <textarea
          defaultValue={log?.memo ?? ""}
          placeholder="오늘 눈에 띈 점만 적어 주세요"
          className="field min-h-24"
          onBlur={(event) => save({ memo: event.target.value || null })}
        />
      </section>
    </div>
  );
}
