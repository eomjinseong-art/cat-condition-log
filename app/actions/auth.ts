"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clearDisclaimerAccepted, markDisclaimerAccepted, requireUserId } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations";

export type FormState = { error?: string; ok?: boolean } | null;

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "이미 가입된 이메일이에요." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/disclaimer",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "가입은 되었지만 로그인에 실패했어요. 다시 로그인해 주세요." };
    }
    throw error;
  }
  return null;
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/home",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "이메일 또는 비밀번호가 맞지 않아요." };
    }
    throw error;
  }
  return null;
}

export async function logoutAction() {
  await clearDisclaimerAccepted();
  await signOut({ redirectTo: "/" });
}

export async function acceptDisclaimerAction(
  _prev: FormState,
  _formData?: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { disclaimerAcceptedAt: new Date() },
    });
  } catch {
    return { error: "안내 확인을 저장하지 못했어요. 잠시 후 다시 눌러 주세요." };
  }

  await markDisclaimerAccepted();
  revalidatePath("/", "layout");
  revalidatePath("/disclaimer");
  revalidatePath("/home");
  return { ok: true };
}
