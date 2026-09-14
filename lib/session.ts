import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DISCLAIMER_COOKIE, SELECTED_CAT_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireUserId() {
  const user = await getSessionUser();
  if (!user?.id) redirect("/login");
  return user.id;
}

export async function ownedCat(userId: string, catId: string) {
  return prisma.cat.findFirst({
    where: { id: catId, userId },
  });
}

export async function requireOwnedCat(userId: string, catId: string) {
  const cat = await ownedCat(userId, catId);
  if (!cat) {
    throw new Error("고양이를 찾을 수 없어요.");
  }
  return cat;
}

export async function readSelectedCatId() {
  const jar = await cookies();
  return jar.get(SELECTED_CAT_COOKIE)?.value ?? null;
}

export async function writeSelectedCatId(catId: string) {
  const jar = await cookies();
  jar.set(SELECTED_CAT_COOKIE, catId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function markDisclaimerAccepted() {
  const jar = await cookies();
  jar.set(DISCLAIMER_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearDisclaimerAccepted() {
  const jar = await cookies();
  jar.delete(DISCLAIMER_COOKIE);
}

export async function hasDisclaimerCookie() {
  const jar = await cookies();
  return jar.get(DISCLAIMER_COOKIE)?.value === "1";
}
