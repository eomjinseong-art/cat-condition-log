import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[1.45rem] font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-ink-soft">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  href,
  actionLabel,
}: {
  title: string;
  body: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card px-5 py-10 text-center">
      <p className="text-lg font-bold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-soft">{body}</p>
      {href && actionLabel ? (
        <Link href={href} className="btn-primary mx-auto mt-5 w-full max-w-xs">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-soft">{children}</h2>;
}

export function ChipButton({
  active,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button type="button" className="chip" data-active={active ? "true" : "false"} {...props}>
      {children}
    </button>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-[#f6ead6] px-4 py-3 text-sm leading-6 text-ink-soft">{children}</p>
  );
}
