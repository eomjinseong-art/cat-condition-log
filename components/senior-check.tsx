"use client";

import { ChipButton, SectionTitle } from "@/components/ui";
import { changeLabels, mobilityLabels, nightVocalLabels } from "@/lib/labels";
import type { PublicLog } from "@/lib/serialize";

export type SeniorCheckValues = {
  waterChange: PublicLog["waterChange"];
  urineChange: PublicLog["urineChange"];
  mobility: PublicLog["mobility"];
  nightVocal: PublicLog["nightVocal"];
};

export function SeniorCheckSection({
  emphasized,
  values,
  onSelect,
}: {
  emphasized: boolean;
  values: SeniorCheckValues;
  onSelect: <K extends keyof SeniorCheckValues>(key: K, value: SeniorCheckValues[K]) => void;
}) {
  return (
    <section className={`card p-4 ${emphasized ? "ring-1 ring-accent/30" : ""}`}>
      <SectionTitle>{emphasized ? "노묘 빠른 체크" : "노묘 빠른 체크 (선택)"}</SectionTitle>
      <p className="mb-3 text-xs leading-5 text-ink-soft">
        {emphasized
          ? "10살이 넘었거나 만성케어로 표시된 고양이예요. 편한 항목만 골라 주세요."
          : "어린 고양이도 필요할 때만 남겨 두세요. 모든 칸을 채우지 않아도 돼요."}
      </p>

      <p className="mb-2 text-xs text-ink-soft">음수 변화 (평소보다)</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(changeLabels).map(([key, label]) => (
          <ChipButton
            key={key}
            active={values.waterChange === key}
            onClick={() => onSelect("waterChange", key as SeniorCheckValues["waterChange"])}
          >
            {label}
          </ChipButton>
        ))}
      </div>

      <p className="mb-2 text-xs text-ink-soft">소변 변화 (평소보다)</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(changeLabels).map(([key, label]) => (
          <ChipButton
            key={key}
            active={values.urineChange === key}
            onClick={() => onSelect("urineChange", key as SeniorCheckValues["urineChange"])}
          >
            {label}
          </ChipButton>
        ))}
      </div>

      <p className="mb-2 text-xs text-ink-soft">보행 · 통증 제스처</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(mobilityLabels).map(([key, label]) => (
          <ChipButton
            key={key}
            active={values.mobility === key}
            onClick={() => onSelect("mobility", key as SeniorCheckValues["mobility"])}
          >
            {label}
          </ChipButton>
        ))}
      </div>

      <p className="mb-2 text-xs text-ink-soft">밤중 울음</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(nightVocalLabels).map(([key, label]) => (
          <ChipButton
            key={key}
            active={values.nightVocal === key}
            onClick={() => onSelect("nightVocal", key as SeniorCheckValues["nightVocal"])}
          >
            {label}
          </ChipButton>
        ))}
      </div>
    </section>
  );
}
