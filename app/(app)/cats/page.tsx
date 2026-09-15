import Link from "next/link";
import { CatAgeDisplay, catAgeExtra } from "@/components/cat-age-display";
import { CatAvatar } from "@/components/cat-picker";
import { GuestCats } from "@/components/guest/guest-cats";
import { EmptyState, PageHeader } from "@/components/ui";
import { catColor } from "@/lib/cat-colors";
import { isSeniorCat } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { serializeCat } from "@/lib/serialize";
import { getSessionUser } from "@/lib/session";

export default async function CatsPage() {
  const user = await getSessionUser();
  if (!user?.id) return <GuestCats />;
  const userId = user.id;
  const cats = (await prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(
    serializeCat,
  );
  const ids = cats.map((cat) => cat.id);

  return (
    <>
      <PageHeader
        title="고양이"
        subtitle="여러 마리면 홈·달력·그래프에서 바로 바꿔 볼 수 있어요."
        action={
          <Link href="/cats/new" className="btn-primary px-4 text-sm">
            추가
          </Link>
        }
      />
      {cats.length === 0 ? (
        <EmptyState
          title="등록된 고양이가 없어요"
          body="이름만 있어도 바로 기록을 시작할 수 있어요."
          href="/cats/new"
          actionLabel="첫 고양이 등록"
        />
      ) : (
        <ul className="space-y-3">
          {cats.map((cat) => (
            <li key={cat.id}>
              <Link href={`/cats/${cat.id}`} className="card flex items-center gap-3 p-4">
                <CatAvatar
                  name={cat.name}
                  photoUrl={cat.photoUrl}
                  color={catColor(cat.id, ids).hex}
                  size="lg"
                />
                <CatAgeDisplay
                  variant="list"
                  name={cat.name}
                  birthDate={cat.birthDate}
                  estimatedYears={cat.estimatedAgeYears}
                  extra={catAgeExtra(cat, isSeniorCat(cat))}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
