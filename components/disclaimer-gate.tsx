import { acceptDisclaimerAction } from "@/app/actions/auth";
import { DISCLAIMER } from "@/lib/constants";

export function DisclaimerGate() {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center">
      <div className="card mx-auto w-full max-w-md p-5">
        <p className="text-xs font-bold tracking-wide text-accent">꼭 읽어 주세요</p>
        <h2 className="mt-2 text-xl font-extrabold">기록 도구 안내</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{DISCLAIMER}</p>
        <form action={acceptDisclaimerAction} className="mt-5">
          <button className="btn-primary w-full" type="submit">
            이해했어요
          </button>
        </form>
      </div>
    </div>
  );
}
