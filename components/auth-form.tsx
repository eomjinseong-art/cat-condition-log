"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/app/actions/auth";

export function AuthForm({
  action,
  submitLabel,
  extras,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  extras?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {extras}
      <label className="block text-sm font-bold">
        이메일
        <input name="email" type="email" required autoComplete="email" className="field mt-1" />
      </label>
      <label className="block text-sm font-bold">
        비밀번호
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field mt-1"
        />
      </label>
      {state?.error ? <p className="text-sm text-rose">{state.error}</p> : null}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "잠시만요…" : submitLabel}
      </button>
    </form>
  );
}
