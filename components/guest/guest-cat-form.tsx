"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CatAgeDisplay } from "@/components/cat-age-display";
import { CatAgeField } from "@/components/cat-age-field";
import { CatCareFields } from "@/components/cat-care-fields";
import { GuestLoading } from "@/components/guest/guest-shell";
import { GuestFeatureGate } from "@/components/guest/signup-prompt";
import { PageHeader } from "@/components/ui";
import { useGuestActions, useGuestHydrated } from "@/components/guest/guest-runtime";
import { parseConditions, type CatCondition } from "@/lib/conditions";
import { parseEstimatedAgeYears } from "@/lib/form-parse";
import { canAddGuestCat } from "@/lib/guest-store";

function parseWeight(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return Number(parsed.toFixed(2));
}

export function GuestNewCatForm() {
  const hydrated = useGuestHydrated();
  const { snapshot, addCat } = useGuestActions();
  const router = useRouter();

  if (!hydrated) return <GuestLoading />;
  if (!canAddGuestCat(snapshot)) {
    return (
      <>
        <PageHeader title="고양이 등록" subtitle="게스트에서는 두 마리까지 기록할 수 있어요." />
        <GuestFeatureGate feature="thirdCat" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="고양이 등록" subtitle="이름만 필수예요. 나머지는 나중에 채워도 돼요." />
      <GuestCatFields
        submitLabel="저장하고 기록하기"
        onSubmit={(input) => {
          addCat(input);
          router.push("/home");
        }}
      />
    </>
  );
}

export function GuestEditCatForm({ catId }: { catId: string }) {
  const hydrated = useGuestHydrated();
  const { snapshot, updateCat, deleteCat } = useGuestActions();
  const router = useRouter();

  if (!hydrated) return <GuestLoading />;
  const cat = snapshot.cats.find((item) => item.id === catId);
  if (!cat) {
    return (
      <>
        <PageHeader title="프로필" />
        <p className="text-sm text-ink-soft">고양이를 찾을 수 없어요.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title={`${cat.name} 프로필`} subtitle="기록은 이 기기에 남아 있어요." />
      <div className="card mb-4 p-4">
        <CatAgeDisplay
          variant="profile"
          name={cat.name}
          birthDate={cat.birthDate}
          estimatedYears={cat.estimatedAgeYears}
        />
      </div>
      <GuestCatFields
        submitLabel="프로필 저장"
        initial={cat}
        onSubmit={(input) => {
          updateCat(cat.id, input);
          router.push("/cats");
        }}
      />
      <button
        type="button"
        className="mt-6 w-full text-sm font-bold text-rose"
        onClick={() => {
          if (!window.confirm("이 고양이의 기록이 함께 삭제돼요. 진행할까요?")) return;
          deleteCat(cat.id);
          router.push("/cats");
        }}
      >
        이 고양이와 관련 기록 삭제
      </button>
    </>
  );
}

function GuestCatFields({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: {
    name: string;
    birthDate: string | null;
    estimatedAgeYears?: number | null;
    weightKg: number | null;
    notes: string | null;
    seniorCare?: boolean;
    conditions?: CatCondition[];
  };
  submitLabel: string;
  onSubmit: (input: {
    name: string;
    birthDate?: string | null;
    estimatedAgeYears?: number | null;
    weightKg?: number | null;
    notes?: string | null;
    seniorCare?: boolean;
    conditions?: CatCondition[];
  }) => void;
}) {
  const [error, setError] = useState("");

  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") ?? "").trim();
        if (!name) {
          setError("이름을 입력해 주세요.");
          return;
        }
        onSubmit({
          name,
          birthDate: String(form.get("birthDate") ?? "") || null,
          estimatedAgeYears: parseEstimatedAgeYears(form.get("estimatedAgeYears")),
          weightKg: parseWeight(String(form.get("weightKg") ?? "")),
          notes: String(form.get("notes") ?? "") || null,
          seniorCare: form.get("seniorCare") === "on",
          conditions: parseConditions(form.getAll("conditions")),
        });
      }}
    >
      <label className="block text-sm font-bold">
        이름
        <input name="name" required maxLength={30} defaultValue={initial?.name ?? ""} className="field mt-1" placeholder="나비" />
      </label>
      <CatAgeField
        defaultBirthDate={initial?.birthDate ?? ""}
        defaultEstimatedYears={initial?.estimatedAgeYears ?? null}
      />
      <label className="block text-sm font-bold">
        체중 kg (선택, 0.01 단위)
        <input
          name="weightKg"
          type="number"
          step="0.01"
          min="0.01"
          max="30"
          defaultValue={initial?.weightKg ?? ""}
          className="field mt-1"
        />
      </label>
      <label className="block text-sm font-bold">
        메모
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          className="field mt-1 min-h-24"
          placeholder="중성화, 알러지 등"
        />
      </label>
      <CatCareFields seniorCare={initial?.seniorCare} conditions={initial?.conditions} />
      {error ? <p className="text-sm text-rose">{error}</p> : null}
      <button className="btn-primary w-full" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
