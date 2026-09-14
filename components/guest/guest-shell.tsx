"use client";

import { useState, type ReactNode } from "react";
import { GuestGateProvider, useGuestActions, useGuestGate, useGuestHydrated } from "@/components/guest/guest-runtime";
import { SignupPrompt } from "@/components/guest/signup-prompt";
import { DISCLAIMER } from "@/lib/constants";

function GuestDisclaimer() {
  const hydrated = useGuestHydrated();
  const { snapshot, acceptDisclaimer } = useGuestActions();
  if (!hydrated || snapshot.disclaimerAcceptedAt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center">
      <div className="card mx-auto w-full max-w-md p-5" role="dialog" aria-modal="true" aria-labelledby="guest-disclaimer-title">
        <p className="text-xs font-bold tracking-wide text-accent">꼭 읽어 주세요</p>
        <h2 id="guest-disclaimer-title" className="mt-2 text-xl font-extrabold">
          기록 도구 안내
        </h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{DISCLAIMER}</p>
        <button className="btn-primary mt-5 w-full" type="button" onClick={() => acceptDisclaimer()}>
          이해했어요
        </button>
      </div>
    </div>
  );
}

function GuestGateOverlay() {
  const { feature, closeGate } = useGuestGate();
  if (!feature) return null;
  return <SignupPrompt feature={feature} onClose={closeGate} />;
}

export function GuestShell({ children }: { children: ReactNode }) {
  return (
    <GuestGateProvider>
      {children}
      <GuestDisclaimer />
      <GuestGateOverlay />
    </GuestGateProvider>
  );
}

export function GuestLocalBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-4 rounded-2xl bg-[#f6ead6] px-4 py-3 text-sm leading-6 text-ink-soft">
      <p>이 기기에서만 저장 중이에요. 다른 폰과 맞추려면 계정을 만들어 주세요.</p>
      <button type="button" className="mt-1 text-xs font-bold text-accent" onClick={() => setDismissed(true)}>
        닫기
      </button>
    </div>
  );
}

export function GuestLoading() {
  return <p className="text-sm leading-6 text-ink-soft">이 기기 기록을 불러오는 중이에요…</p>;
}
