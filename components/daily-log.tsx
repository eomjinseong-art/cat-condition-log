"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { upsertLogAction } from "@/app/actions/logs";
import { RelatedResources } from "@/components/partner-links";
import { ChipButton, SectionTitle } from "@/components/ui";
import { todayKey } from "@/lib/dates";
import { appetiteLabels, energyLabels, stoolLabels, urineLabels, waterLabels } from "@/lib/labels";
import type { PublicLog } from "@/lib/serialize";

const stoolCounts = [0, 1, 2, 3, 4];

type Draft = {
  appetite: PublicLog["appetite"];
  foodNote: string;
  water: PublicLog["water"];
  stoolCount: number | null;
  stoolQuality: PublicLog["stoolQuality"];
  urine: PublicLog["urine"];
  vomit: boolean | null;
  vomitNote: string;
  energy: PublicLog["energy"];
  weightKg: string;
  memo: string;
};

function fromLog(log: PublicLog | null): Draft {
  return {
    appetite: log?.appetite ?? null,
    foodNote: log?.foodNote ?? "",
    water: log?.water ?? null,
    stoolCount: log?.stoolCount ?? null,
    stoolQuality: log?.stoolQuality ?? null,
    urine: log?.urine ?? null,
    vomit: log?.vomit ?? null,
    vomitNote: log?.vomitNote ?? "",
    energy: log?.energy ?? null,
    weightKg: log?.weightKg != null ? String(log.weightKg) : "",
    memo: log?.memo ?? "",
  };
}

export function DailyLog({
  catId,
  loggedOn,
  initial,
}: {
  catId: string;
  loggedOn: string;
  initial: PublicLog | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => fromLog(initial));
  const [saved, setSaved] = useState(() => fromLog(initial));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("고르신 내용은 아래 저장을 눌러야 남아요.");
  const [flash, setFlash] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const saveLabel = loggedOn === todayKey() ? "오늘 기록 저장" : "이 날 기록 저장";

  function patch(update: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...update }));
    setFlash(false);
    setMessage("아직 저장 전이에요. 아래 버튼으로 확정해 주세요.");
  }

  function save() {
    const trimmedWeight = draft.weightKg.trim();
    let weightKg: number | null = null;
    if (trimmedWeight !== "") {
      const parsed = Number(trimmedWeight);
      if (!Number.isFinite(parsed) || parsed < 0.01 || parsed > 30) {
        setMessage("체중은 0.01부터 30kg 사이 숫자로 입력해 주세요.");
        return;
      }
      weightKg = Number(parsed.toFixed(2));
    }

    startTransition(async () => {
      try {
        const next = await upsertLogAction({
          catId,
          loggedOn,
          appetite: draft.appetite,
          foodNote: draft.foodNote.trim() || null,
          water: draft.water,
          stoolCount: draft.stoolCount,
          stoolQuality: draft.stoolQuality,
          urine: draft.urine,
          vomit: draft.vomit,
          vomitNote: draft.vomitNote.trim() || null,
          energy: draft.energy,
          weightKg,
          memo: draft.memo.trim() || null,
        });
        const nextDraft = fromLog(next);
        setDraft(nextDraft);
        setSaved(nextDraft);
        setMessage("저장했어요");
        setFlash(true);
        router.refresh();
      } catch (error) {
        setFlash(false);
        setMessage(error instanceof Error ? error.message : "저장에 실패했어요.");
      }
    });
  }

  return (
    <div className="space-y-5 pb-28">
      <p className="text-xs text-ink-soft" aria-live="polite">
        {pending ? "저장 중…" : message}
      </p>

      <section className="card p-4">
        <SectionTitle>식욕 · 식사</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(appetiteLabels).map(([key, label]) => (
            <ChipButton key={key} active={draft.appetite === key} onClick={() => patch({ appetite: key as Draft["appetite"] })}>
              {label}
            </ChipButton>
          ))}
        </div>
        <textarea
          value={draft.foodNote}
          placeholder="어떤 사료·간식을 먹었는지 (선택)"
          className="field mt-3 min-h-20"
          onChange={(event) => patch({ foodNote: event.target.value })}
        />
        {draft.appetite || draft.foodNote ? <RelatedResources context="food" /> : null}
      </section>

      <section className="card p-4">
        <SectionTitle>물</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(waterLabels).map(([key, label]) => (
            <ChipButton key={key} active={draft.water === key} onClick={() => patch({ water: key as Draft["water"] })}>
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
            <ChipButton key={count} active={draft.stoolCount === count} onClick={() => patch({ stoolCount: count })}>
              {count}회
            </ChipButton>
          ))}
        </div>
        <p className="mb-2 text-xs text-ink-soft">성상</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stoolLabels).map(([key, label]) => (
            <ChipButton
              key={key}
              active={draft.stoolQuality === key}
              onClick={() => patch({ stoolQuality: key as Draft["stoolQuality"] })}
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
            <ChipButton key={key} active={draft.urine === key} onClick={() => patch({ urine: key as Draft["urine"] })}>
              {label}
            </ChipButton>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>구토</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <ChipButton active={draft.vomit === false} onClick={() => patch({ vomit: false })}>
            없음
          </ChipButton>
          <ChipButton active={draft.vomit === true} onClick={() => patch({ vomit: true })}>
            있음
          </ChipButton>
        </div>
        {draft.vomit ? (
          <>
            <textarea
              value={draft.vomitNote}
              placeholder="색·횟수 등 짧게 (선택)"
              className="field mt-3 min-h-20"
              onChange={(event) => patch({ vomitNote: event.target.value })}
            />
            <RelatedResources context="vomit" />
          </>
        ) : null}
      </section>

      <section className="card p-4">
        <SectionTitle>컨디션 · 활력</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {Object.entries(energyLabels).map(([key, label]) => (
            <ChipButton key={key} active={draft.energy === key} onClick={() => patch({ energy: key as Draft["energy"] })}>
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
            value={draft.weightKg}
            placeholder="4.25"
            className="field"
            onChange={(event) => patch({ weightKg: event.target.value })}
          />
          <span className="self-center text-sm text-ink-soft">kg</span>
        </div>
      </section>

      <section className="card p-4">
        <SectionTitle>짧은 메모</SectionTitle>
        <textarea
          value={draft.memo}
          placeholder="오늘 눈에 띈 점만 적어 주세요"
          className="field min-h-24"
          onChange={(event) => patch({ memo: event.target.value })}
        />
      </section>

      <div className="log-save-bar">
        {flash ? (
          <p
            role="status"
            className="mb-2 rounded-2xl bg-sage-soft px-4 py-3 text-center text-sm font-extrabold text-sage"
          >
            저장했어요
          </p>
        ) : null}
        <button
          type="button"
          className="btn-primary w-full shadow-[0_10px_24px_rgba(196,92,38,0.28)]"
          onClick={save}
          disabled={pending}
        >
          {pending ? "저장 중…" : saveLabel}
        </button>
        {dirty && !pending && !flash ? (
          <p className="mt-1.5 text-center text-[11px] font-semibold text-accent">아직 저장하지 않은 선택이 있어요</p>
        ) : null}
      </div>
    </div>
  );
}
