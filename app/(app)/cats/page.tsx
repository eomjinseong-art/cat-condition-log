import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui";
import { ageLabel } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { serializeCat } from "@/lib/serialize";
import { requireUserId } from "@/lib/session";

export default async function CatsPage() {
  const userId = await requireUserId();
  const cats = (await prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(
    serializeCat,
  );

  return (
    <>
      <PageHeader
        title="고양이"
        subtitle="여러 마리면 홈에서 오늘 현황이 같이 보여요."
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
                {cat.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.photoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-soft text-xl">
                    🐱
                  </div>
                )}
                <div>
                  <p className="font-extrabold">{cat.name}</p>
                  <p className="text-sm text-ink-soft">
                    {ageLabel(cat.birthDate) ?? "나이 미입력"}
                    {cat.weightKg !== null ? ` · ${cat.weightKg.toFixed(2)}kg` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
