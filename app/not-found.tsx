import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 text-center">
      <h1 className="text-2xl font-black">페이지를 찾지 못했어요</h1>
      <p className="mt-2 text-sm text-ink-soft">홈으로 돌아가 오늘 기록부터 이어가 주세요.</p>
      <Link href="/home" className="btn-primary mt-6">
        홈으로
      </Link>
    </main>
  );
}
