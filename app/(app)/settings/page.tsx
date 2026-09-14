import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { deleteAccountAction } from "@/app/actions/account";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { PartnerLinks } from "@/components/partner-links";
import { Notice, PageHeader } from "@/components/ui";
import { GuestSettings } from "@/components/guest/guest-settings";
import { DISCLAIMER } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user?.id) return <GuestSettings />;
  const userId = user.id;
  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  return (
    <>
      <PageHeader title="더보기" subtitle={account?.email ?? ""} />
      <Notice>{DISCLAIMER}</Notice>

      <nav className="mt-5 space-y-2">
        <Link href="/cats" className="card block px-4 py-4 font-bold">
          고양이 프로필
        </Link>
        <Link href="/reminders" className="card block px-4 py-4 font-bold">
          돌봄 일정
        </Link>
        <a href="/api/export" className="card block px-4 py-4 font-bold">
          기록 CSV 내보내기
        </a>
        <div className="card px-4 py-4">
          <p className="font-bold">가족 공유</p>
          <p className="mt-1 text-sm text-ink-soft">준비 중이에요. 지금은 계정 하나만 동기화돼요.</p>
        </div>
        <div className="card px-4 py-4">
          <PartnerLinks variant="settings" />
        </div>
      </nav>

      <form action={logoutAction} className="mt-6">
        <button className="btn-ghost w-full" type="submit">
          로그아웃
        </button>
      </form>

      <form action={deleteAccountAction} className="mt-8">
        <p className="mb-2 text-xs leading-5 text-ink-soft">
          계정 삭제는 고양이, 기록, 일정 데이터를 함께 지워요. 되돌릴 수 없어요.
        </p>
        <ConfirmSubmit
          message="계정과 모든 고양이 기록이 삭제돼요. 정말 진행할까요?"
          className="w-full text-sm font-bold text-rose"
        >
          계정과 모든 데이터 삭제
        </ConfirmSubmit>
      </form>
    </>
  );
}
