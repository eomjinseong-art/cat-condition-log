import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { DisclaimerGate } from "@/components/disclaimer-gate";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

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

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-24 pt-6">
      {children}
      <BottomNav />
      {user.disclaimerAcceptedAt ? null : <DisclaimerGate />}
    </div>
  );
}
