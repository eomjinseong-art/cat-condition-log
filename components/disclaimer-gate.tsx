"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { acceptDisclaimerAction } from "@/app/actions/auth";
import { DISCLAIMER } from "@/lib/constants";

export function DisclaimerGate() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(acceptDisclaimerAction, null);

  useEffect(() => {
    if (!state?.ok) return;
    router.replace("/home");
    router.refresh();
  }, [state, router]);

  return (
    <div className="card mx-auto w-full max-w-md p-5">
      <p className="text-xs font-bold tracking-wide text-accent">꼭 읽어 주세요</p>
      <h1 className="mt-2 text-xl font-extrabold">기록 도구 안내</h1>
      <p className="mt-3 text-sm leading-7 text-ink-soft">{DISCLAIMER}</p>
      <form action={formAction} className="mt-5">
        {state?.error ? <p className="mb-3 text-sm text-rose">{state.error}</p> : null}
        <button className="btn-primary w-full" type="submit" disabled={pending || Boolean(state?.ok)}>
          {state?.ok ? "이동 중…" : pending ? "확인하는 중…" : "이해했어요"}
        </button>
      </form>
    </div>
  );
}
