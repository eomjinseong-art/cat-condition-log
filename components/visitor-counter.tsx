"use client";

import { useEffect, useState } from "react";
import { loadSiteVisitCount } from "@/lib/visits";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadSiteVisitCount().then((value) => {
      if (!cancelled) setCount(value);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 no-print">
      <div className="mx-auto flex max-w-lg justify-end px-4 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium tabular-nums tracking-tight text-ink-soft">{`👁 ${count}`}</p>
      </div>
    </header>
  );
}
