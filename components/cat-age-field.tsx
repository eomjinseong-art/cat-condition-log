"use client";

import { useMemo, useState } from "react";
import { CAT_AGE_COPY, catAgeView } from "@/lib/cat-age";
import { parseEstimatedAgeYears } from "@/lib/form-parse";

export function CatAgeField({
  birthLabel = "생일 (선택)",
  defaultBirthDate = "",
  defaultEstimatedYears = null,
}: {
  birthLabel?: string;
  defaultBirthDate?: string;
  defaultEstimatedYears?: number | null;
}) {
  const [birthDate, setBirthDate] = useState(defaultBirthDate);
  const [estimatedYears, setEstimatedYears] = useState(
    defaultEstimatedYears == null ? "" : String(defaultEstimatedYears),
  );

  const view = useMemo(
    () =>
      catAgeView({
        birthDate: birthDate || null,
        estimatedYears: parseEstimatedAgeYears(estimatedYears),
      }),
    [birthDate, estimatedYears],
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold">
        {birthLabel}
        <input
          name="birthDate"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          className="field mt-1"
        />
      </label>
      <label className="block text-sm font-bold">
        대략 나이 (살, 선택)
        <input
          name="estimatedAgeYears"
          type="number"
          min={0}
          max={40}
          step={1}
          inputMode="numeric"
          value={estimatedYears}
          onChange={(event) => setEstimatedYears(event.target.value)}
          className="field mt-1"
          placeholder="예: 8"
        />
        <span className="mt-1 block text-xs font-normal leading-5 text-ink-soft">
          생일을 모르면 대략 나이만 적어도 돼요.
        </span>
      </label>
      {view ? (
        <div className="rounded-2xl bg-[#f6ead6]/70 px-3 py-3">
          <p className="text-sm font-bold text-ink">{view.previewLine}</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">{CAT_AGE_COPY.previewDisclaimer}</p>
          {view.estimatedNote ? (
            <p className="mt-1 text-xs leading-5 text-ink-soft">{view.estimatedNote}</p>
          ) : null}
          <p className="mt-1 text-xs leading-5 text-ink-soft" title={CAT_AGE_COPY.shortTooltip}>
            {CAT_AGE_COPY.tooltip}
          </p>
        </div>
      ) : null}
    </div>
  );
}
