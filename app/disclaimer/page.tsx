import { redirect } from "next/navigation";
import { DisclaimerGate } from "@/components/disclaimer-gate";
import { prisma } from "@/lib/prisma";
import { hasDisclaimerCookie, requireUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DisclaimerPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { disclaimerAcceptedAt: true },
  });
  if (!user) redirect("/login");
  if (user.disclaimerAcceptedAt || (await hasDisclaimerCookie())) redirect("/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <DisclaimerGate />
    </main>
  );
}
