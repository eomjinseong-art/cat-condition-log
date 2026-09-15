import { CAT_AGE_COPY, catAgeView, type CatAgeSource, type CatLifeStage } from "@/lib/cat-age";

function LifeStageChip({ stage, label }: { stage: CatLifeStage; label: string }) {
  return (
    <span className="life-stage-chip" data-stage={stage}>
      {label}
    </span>
  );
}

export function CatAgeDisplay({
  name,
  birthDate,
  estimatedYears,
  variant,
  extra,
  asOf,
}: CatAgeSource & {
  name?: string;
  estimatedYears?: number | null;
  variant: "profile" | "list" | "home";
  extra?: string;
}) {
  const view = catAgeView({ name, birthDate, estimatedYears, asOf });

  if (variant === "home") {
    if (!view) return null;
    return (
      <p className="text-xs leading-5 text-ink-soft" title={CAT_AGE_COPY.shortTooltip}>
        {view.homeLine}
      </p>
    );
  }

  if (!view) {
    return (
      <div>
        {name ? <p className="font-extrabold">{name}</p> : null}
        <p className="text-sm text-ink-soft">
          {CAT_AGE_COPY.missing}
          {extra ? ` · ${extra}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-extrabold">{view.primaryLine}</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
        <span title={CAT_AGE_COPY.shortTooltip}>사람 나이 약 {view.humanYears}세</span>
        <span aria-hidden>·</span>
        <LifeStageChip stage={view.stage} label={view.stageLabel} />
      </p>
      {extra ? <p className="mt-0.5 text-sm text-ink-soft">{extra}</p> : null}
      {view.estimatedNote ? <p className="mt-1 text-xs leading-5 text-ink-soft">{view.estimatedNote}</p> : null}
      {variant === "profile" ? (
        <p className="mt-1 text-xs leading-5 text-ink-soft" title={CAT_AGE_COPY.tooltip}>
          {CAT_AGE_COPY.tooltip}
        </p>
      ) : null}
    </div>
  );
}

export function catAgeExtra(cat: { weightKg: number | null; seniorCare?: boolean }, senior?: boolean) {
  const parts: string[] = [];
  if (cat.weightKg !== null) parts.push(`${cat.weightKg.toFixed(2)}kg`);
  if (senior) parts.push("노묘 케어");
  return parts.join(" · ") || undefined;
}
