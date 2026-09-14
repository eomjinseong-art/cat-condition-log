"use client";

import Link from "next/link";
import { gatedCopy, type GatedFeature } from "@/lib/guest";

export function SignupPrompt({
  feature,
  onClose,
}: {
  feature: GatedFeature;
  onClose: () => void;
}) {
  const copy = gatedCopy[feature];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center">
      <div className="card mx-auto w-full max-w-md p-5" role="dialog" aria-modal="true" aria-labelledby="signup-prompt-title">
        <p className="text-xs font-bold tracking-wide text-accent">계정 안내</p>
        <h2 id="signup-prompt-title" className="mt-2 text-xl font-extrabold">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.body}</p>
        <p className="mt-2 text-xs leading-6 text-ink-soft">
          가입하거나 로그인하면 이 기기에 남긴 기록을 계정으로 옮겨 드려요.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/register" className="btn-primary w-full text-center">
            계정 만들기
          </Link>
          <Link href="/login" className="btn-ghost w-full text-center">
            로그인
          </Link>
          <button type="button" className="btn-ghost w-full" onClick={onClose}>
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuestFeatureGate({ feature }: { feature: GatedFeature }) {
  const copy = gatedCopy[feature];

  return (
    <section className="card p-5">
      <p className="text-xs font-bold tracking-wide text-accent">계정 안내</p>
      <h2 className="mt-2 text-xl font-extrabold">{copy.title}</h2>
      <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.body}</p>
      <p className="mt-2 text-xs leading-6 text-ink-soft">
        홈에서 남긴 기록은 그대로 있어요. 가입 후에도 잃지 않아요.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Link href="/register" className="btn-primary w-full text-center">
          계정 만들기
        </Link>
        <Link href="/login" className="btn-ghost w-full text-center">
          로그인
        </Link>
        <Link href="/home" className="btn-ghost w-full text-center">
          기록으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
