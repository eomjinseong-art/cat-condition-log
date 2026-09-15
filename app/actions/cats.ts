"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deletePhoto } from "@/lib/blob";
import { dateFromKey } from "@/lib/dates";
import { parseEstimatedAgeYears } from "@/lib/form-parse";
import { prisma } from "@/lib/prisma";
import { requireOwnedCat, requireUserId, writeSelectedCatId } from "@/lib/session";
import { parseConditions } from "@/lib/conditions";
import { catSchema } from "@/lib/validations";

function parseWeight(value?: string) {
  if (!value || value.trim() === "") return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return Number(parsed.toFixed(2));
}

export async function createCatAction(formData: FormData) {
  const userId = await requireUserId();
  const parsed = catSchema.safeParse({
    name: formData.get("name"),
    birthDate: formData.get("birthDate") || undefined,
    estimatedAgeYears: formData.get("estimatedAgeYears") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    notes: formData.get("notes") || undefined,
    seniorCare: formData.get("seniorCare") === "on",
    conditions: parseConditions(formData.getAll("conditions")),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  }

  const cat = await prisma.cat.create({
    data: {
      userId,
      name: parsed.data.name,
      birthDate: parsed.data.birthDate ? dateFromKey(parsed.data.birthDate) : null,
      estimatedAgeYears: parseEstimatedAgeYears(parsed.data.estimatedAgeYears),
      weightKg: parseWeight(parsed.data.weightKg),
      photoUrl: parsed.data.photoUrl || null,
      notes: parsed.data.notes || null,
      seniorCare: Boolean(parsed.data.seniorCare),
      conditions: parsed.data.conditions ?? [],
    },
  });

  await writeSelectedCatId(cat.id);
  revalidatePath("/", "layout");
  redirect("/home");
}

export async function updateCatAction(catId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireOwnedCat(userId, catId);
  const parsed = catSchema.safeParse({
    name: formData.get("name"),
    birthDate: formData.get("birthDate") || undefined,
    estimatedAgeYears: formData.get("estimatedAgeYears") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    notes: formData.get("notes") || undefined,
    seniorCare: formData.get("seniorCare") === "on",
    conditions: parseConditions(formData.getAll("conditions")),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  }

  await prisma.cat.update({
    where: { id: catId },
    data: {
      name: parsed.data.name,
      birthDate: parsed.data.birthDate ? dateFromKey(parsed.data.birthDate) : null,
      estimatedAgeYears: parseEstimatedAgeYears(parsed.data.estimatedAgeYears),
      weightKg: parseWeight(parsed.data.weightKg),
      photoUrl: parsed.data.photoUrl || null,
      notes: parsed.data.notes || null,
      seniorCare: Boolean(parsed.data.seniorCare),
      conditions: parsed.data.conditions ?? [],
    },
  });

  revalidatePath("/", "layout");
  redirect("/cats");
}

export async function deleteCatAction(catId: string) {
  const userId = await requireUserId();
  const cat = await requireOwnedCat(userId, catId);
  const media = await prisma.media.findMany({ where: { userId, catId } });
  await Promise.all(media.map((item) => deletePhoto(item.url)));
  if (cat.photoUrl) await deletePhoto(cat.photoUrl);
  await prisma.cat.delete({ where: { id: catId } });
  revalidatePath("/", "layout");
  redirect("/cats");
}

export async function selectCatAction(catId: string) {
  const userId = await requireUserId();
  await requireOwnedCat(userId, catId);
  await writeSelectedCatId(catId);
  revalidatePath("/", "layout");
}
