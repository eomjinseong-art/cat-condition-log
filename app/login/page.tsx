import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-3xl font-black">로그인</h1>
      <p className="mt-2 text-sm text-ink-soft">
        클라우드에 기록이 동기화돼요. 이 기기에 남긴 게스트 기록이 있으면 계정으로 옮겨 드려요.
      </p>
      <div className="card mt-6 p-5">
        <AuthForm action={loginAction} submitLabel="로그인" />
      </div>
      <p className="mt-4 text-sm text-ink-soft">
        처음이신가요?{" "}
        <Link href="/register" className="font-bold text-accent">
          회원가입
        </Link>
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        <Link href="/home" className="font-bold text-accent">
          아직 가입하지 않고 기록만 할래요
        </Link>
      </p>
    </main>
  );
}
