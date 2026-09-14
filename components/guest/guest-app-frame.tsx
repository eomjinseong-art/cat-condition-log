import { BottomNav } from "@/components/bottom-nav";
import { GuestShell } from "@/components/guest/guest-shell";
import { PartnerLinks } from "@/components/partner-links";

/** Unauthenticated app chrome. Logged-in users go through `(app)/layout.tsx`. */
export function GuestAppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-6">
      <GuestShell>{children}</GuestShell>
      <footer className="no-print mt-12 border-t border-line/80 pt-5">
        <PartnerLinks variant="footer" />
      </footer>
      <BottomNav />
    </div>
  );
}
