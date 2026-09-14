import Link from "next/link";
import { auth } from "@/auth";
import { DISCLAIMER } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <p className="text-sm font-bold text-accent">Cat Condition Log</p>
      <h1 className="mt-2 text-4xl font-black leading-tight">
        10초면 끝나는
        <br />
        고양이 컨디션 기록
      </h1>
      <p className="mt-4 text-base leading-7 text-ink-soft">
        식욕·물·화장실·구토를 한 탭으로 남기고, 병원에는 숫자 그대로 정리된 한 장 요약을 가져가세요.
        진단하지 않아요. 기록만 또박또박 모아 드려요.
      </p>

      <ul className="mt-8 space-y-3 text-sm leading-6">
        {[
          "멀티캣 프로필과 오늘 한눈에 보기",
          "달력 · 7일/30일 그래프",
          "약·백신·구충·모래 전체갈이 알림",
          "한글 병원 리포트와 CSV 내보내기",
        ].map((item) => (
          <li key={item} className="card px-4 py-3">
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/register" className="btn-primary">
          무료로 시작하기
        </Link>
        <Link href="/login" className="btn-ghost">
          이미 계정이 있어요
        </Link>
      </div>
      <p className="mt-8 text-xs leading-6 text-ink-soft">{DISCLAIMER}</p>
    </main>
  );
}
