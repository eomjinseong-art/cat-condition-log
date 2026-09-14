"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/home",
    label: "홈",
    icon: HomeIcon,
  },
  {
    href: "/calendar",
    label: "달력",
    icon: CalendarIcon,
  },
  {
    href: "/charts",
    label: "그래프",
    icon: ChartIcon,
  },
  {
    href: "/report",
    label: "리포트",
    icon: ReportIcon,
  },
  {
    href: "/settings",
    label: "더보기",
    icon: MoreIcon,
  },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M4.5 11.2 12 4.8l7.5 6.4V19.2a1.3 1.3 0 0 1-1.3 1.3h-4.4v-5.2H10.2v5.2H5.8A1.3 1.3 0 0 1 4.5 19.2v-8Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <rect x="4.2" y="6" width="15.6" height="14" rx="2.2" stroke="currentColor" strokeWidth={active ? 2 : 1.7} />
      <path d="M4.2 10.2h15.6M8 4.6v3.2M16 4.6v3.2" stroke="currentColor" strokeWidth={active ? 2 : 1.7} strokeLinecap="round" />
      {active ? (
        <>
          <rect x="7.4" y="13" width="2.2" height="2.2" rx="0.5" fill="currentColor" />
          <rect x="10.9" y="13" width="2.2" height="2.2" rx="0.5" fill="currentColor" />
        </>
      ) : null}
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M5 19V10.5M12 19V5.5M19 19v-6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
      {active ? (
        <>
          <rect x="3.9" y="10.5" width="2.2" height="8.5" rx="1" fill="currentColor" fillOpacity="0.18" />
          <rect x="10.9" y="5.5" width="2.2" height="13.5" rx="1" fill="currentColor" fillOpacity="0.18" />
          <rect x="17.9" y="13" width="2.2" height="6" rx="1" fill="currentColor" fillOpacity="0.18" />
        </>
      ) : null}
    </svg>
  );
}

function ReportIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M8 4.6h5.2L18.2 9v10.4A1.6 1.6 0 0 1 16.6 21H8a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 8 4.6Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.1 : 0}
      />
      <path d="M13.1 4.8V9h4.2M9 12.6h6M9 16.2h4" stroke="currentColor" strokeWidth={active ? 2 : 1.7} strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" strokeWidth={active ? 2.1 : 1.8} strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-strong/95 backdrop-blur-md">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 pt-1.5 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[11px] font-bold tracking-tight ${
                  active ? "bg-[#f6ead6] text-accent" : "text-ink-soft"
                }`}
              >
                <Icon active={active} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
