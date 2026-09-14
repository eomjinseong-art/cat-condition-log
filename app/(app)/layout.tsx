import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { PartnerLinks } from "@/components/partner-links";
import { prisma } from "@/lib/prisma";
import { hasDisclaimerCookie, requireUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { disclaimerAcceptedAt: true },
  });
  if (!user) redirect("/login");
  if (!user.disclaimerAcceptedAt && !(await hasDisclaimerCookie())) {
    redirect("/disclaimer");
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-24 pt-6">
      {children}
      <footer className="no-print mt-12 border-t border-line/80 pt-5">
        <PartnerLinks variant="footer" />
      </footer>
      <BottomNav />
    </div>
  );
}
