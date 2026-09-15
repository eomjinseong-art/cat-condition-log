"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatAgeDisplay, catAgeExtra } from "@/components/cat-age-display";
import { GuestLoading, GuestLocalBanner } from "@/components/guest/guest-shell";
import { EmptyState, PageHeader } from "@/components/ui";
import { useGuestActions, useGuestGate, useGuestHydrated } from "@/components/guest/guest-runtime";
import { canAddGuestCat } from "@/lib/guest-store";
import { isSeniorCat } from "@/lib/dates";

export function GuestCats() {
  const router = useRouter();
  const hydrated = useGuestHydrated();
  const { snapshot } = useGuestActions();
  const { openGate } = useGuestGate();

  if (!hydrated) return <GuestLoading />;

  return (
    <>
      <PageHeader
        title="고양이"
        subtitle="게스트에서는 두 마리까지 이 기기에 저장돼요."
        action={
          <button
            type="button"
            className="btn-primary px-4 text-sm"
            onClick={() => {
              if (!canAddGuestCat(snapshot)) {
                openGate("thirdCat");
                return;
              }
              router.push("/cats/new");
            }}
          >
            추가
          </button>
        }
      />
      <GuestLocalBanner />
      {snapshot.cats.length === 0 ? (
        <EmptyState
          title="등록된 고양이가 없어요"
          body="이름만 있어도 바로 기록을 시작할 수 있어요."
          href="/cats/new"
          actionLabel="첫 고양이 등록"
        />
      ) : (
        <ul className="space-y-3">
          {snapshot.cats.map((cat) => (
            <li key={cat.id}>
              <Link href={`/cats/${cat.id}`} className="card flex items-center gap-3 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-soft text-xl">🐱</div>
                <CatAgeDisplay
                  variant="list"
                  name={cat.name}
                  birthDate={cat.birthDate}
                  estimatedYears={cat.estimatedAgeYears}
                  extra={catAgeExtra(cat, isSeniorCat(cat))}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
