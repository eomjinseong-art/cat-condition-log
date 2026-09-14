import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { GuestImporter } from "@/components/guest/guest-importer";
import { GuestShell } from "@/components/guest/guest-shell";
import { PartnerLinks } from "@/components/partner-links";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasDisclaimerCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) {
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

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { disclaimerAcceptedAt: true },
  });
  if (!user) redirect("/login");
  if (!user.disclaimerAcceptedAt && !(await hasDisclaimerCookie())) {
    redirect("/disclaimer");
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-6">
      <GuestImporter />
      {children}
      <footer className="no-print mt-12 border-t border-line/80 pt-5">
        <PartnerLinks variant="footer" />
      </footer>
      <BottomNav />
    </div>
  );
}
