import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { GuestAppFrame } from "@/components/guest/guest-app-frame";
import { GuestImporter } from "@/components/guest/guest-importer";
import { PartnerLinks } from "@/components/partner-links";
import { APP_NAME, APP_NAME_EN } from "@/lib/constants";
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
    return <GuestAppFrame>{children}</GuestAppFrame>;
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
        <p className="mb-3 text-xs font-bold text-ink-soft">
          {APP_NAME} · {APP_NAME_EN}
        </p>
        <PartnerLinks variant="footer" />
      </footer>
      <BottomNav />
    </div>
  );
}
