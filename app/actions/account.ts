"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { deletePhoto } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function deleteAccountAction() {
  const userId = await requireUserId();
  const media = await prisma.media.findMany({ where: { userId } });
  const cats = await prisma.cat.findMany({ where: { userId }, select: { photoUrl: true } });
  const logs = await prisma.log.findMany({
    where: { userId },
    select: { photoUrl: true, vomitPhotoUrl: true },
  });

  const urls = [
    ...media.map((item) => item.url),
    ...cats.map((cat) => cat.photoUrl),
    ...logs.map((log) => log.photoUrl),
    ...logs.map((log) => log.vomitPhotoUrl),
  ].filter((url): url is string => Boolean(url));

  await Promise.all(urls.map((url) => deletePhoto(url)));
  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirect: false });
  redirect("/");
}
