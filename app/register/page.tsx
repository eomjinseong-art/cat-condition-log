import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-3xl font-black">회원가입</h1>
      <p className="mt-2 text-sm text-ink-soft">이메일만으로 바로 시작할 수 있어요.</p>
      <div className="card mt-6 p-5">
        <AuthForm
          action={registerAction}
          submitLabel="계정 만들기"
          extras={
            <label className="block text-sm font-bold">
              이름
              <input name="name" required autoComplete="name" className="field mt-1" />
            </label>
          }
        />
      </div>
      <p className="mt-4 text-sm text-ink-soft">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-bold text-accent">
          로그인
        </Link>
      </p>
    </main>
  );
}
