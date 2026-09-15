"use client";

import Link from "next/link";
import { GuestFeatureGate } from "@/components/guest/signup-prompt";
import { GuestLoading } from "@/components/guest/guest-shell";
import { PartnerLinks } from "@/components/partner-links";
import { Notice, PageHeader } from "@/components/ui";
import { useGuestActions, useGuestGate, useGuestHydrated } from "@/components/guest/guest-runtime";
import { DISCLAIMER } from "@/lib/constants";
import { gatedCopy, type GatedFeature } from "@/lib/guest";
import { useState } from "react";

export function GuestSettings() {
  const hydrated = useGuestHydrated();
  const { snapshot, clearAll } = useGuestActions();
  const { openGate } = useGuestGate();
  const [cleared, setCleared] = useState(false);

  if (!hydrated) return <GuestLoading />;

  return (
    <>
      <PageHeader
        title="더보기"
        subtitle={`이 기기 저장 · 고양이 ${snapshot.cats.length}마리`}
      />
      <Notice>{DISCLAIMER}</Notice>
      <div className="mt-4 rounded-2xl bg-[#f6ead6] px-4 py-3 text-sm leading-6 text-ink-soft">
        {gatedCopy.cloud.body}
      </div>

      <nav className="mt-5 space-y-2">
        <Link href="/cats" className="card block px-4 py-4 font-bold">
          고양이 프로필
        </Link>
        <GateButton feature="reminders" label="돌봄 일정" onGate={openGate} />
        <GateButton feature="care" label="노묘 돌봄 (약·재진·검사)" onGate={openGate} />
        <GateButton feature="export" label="기록 CSV 내보내기" onGate={openGate} />
        <GateButton feature="report" label="병원 리포트 · 인쇄/PDF" onGate={openGate} />
        <div className="card px-4 py-4">
          <p className="font-bold">가족 공유</p>
          <p className="mt-1 text-sm text-ink-soft">준비 중이에요. 지금은 이 기기 또는 계정 하나만 동기화돼요.</p>
        </div>
        <div className="card px-4 py-4">
          <PartnerLinks variant="settings" />
        </div>
      </nav>

      <div className="mt-6 flex flex-col gap-2">
        <Link href="/register" className="btn-primary w-full text-center">
          계정 만들고 기록 옮기기
        </Link>
        <Link href="/login" className="btn-ghost w-full text-center">
          로그인해서 기록 옮기기
        </Link>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-xs leading-5 text-ink-soft">
          이 기기 기록만 지워요. 아직 계정으로 옮기지 않은 내용은 되돌릴 수 없어요.
        </p>
        <button
          type="button"
          className="w-full text-sm font-bold text-rose"
          onClick={() => {
            if (!window.confirm("이 기기의 고양이 기록이 삭제돼요. 진행할까요?")) return;
            clearAll();
            setCleared(true);
          }}
        >
          이 기기 기록 삭제
        </button>
        {cleared ? <p className="mt-2 text-xs text-ink-soft">이 기기 기록을 지웠어요.</p> : null}
      </div>
    </>
  );
}

function GateButton({
  feature,
  label,
  onGate,
}: {
  feature: GatedFeature;
  label: string;
  onGate: (feature: GatedFeature) => void;
}) {
  return (
    <button type="button" className="card block w-full px-4 py-4 text-left font-bold" onClick={() => onGate(feature)}>
      {label}
    </button>
  );
}

export function GuestRemindersPage() {
  return (
    <>
      <PageHeader title="돌봄 일정" subtitle="약, 백신, 구충, 모래 전체갈이를 날짜에 맞춰 남겨 두세요." />
      <GuestFeatureGate feature="reminders" />
    </>
  );
}

export function GuestReportPage() {
  return (
    <>
      <PageHeader title="병원 리포트" subtitle="입력한 숫자만 모아요. 진단 문장은 넣지 않아요." />
      <Notice>{DISCLAIMER}</Notice>
      <div className="mt-4">
        <GuestFeatureGate feature="report" />
      </div>
    </>
  );
}
