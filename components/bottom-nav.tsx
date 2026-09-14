"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "홈", icon: "⌂" },
  { href: "/calendar", label: "달력", icon: "▦" },
  { href: "/charts", label: "그래프", icon: "∿" },
  { href: "/report", label: "리포트", icon: "▤" },
  { href: "/settings", label: "더보기", icon: "☰" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-strong/95 backdrop-blur">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                  active ? "text-accent" : "text-ink-soft"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
