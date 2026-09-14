import { notFound } from "next/navigation";
import { deleteCatAction, updateCatAction } from "@/app/actions/cats";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { PageHeader } from "@/components/ui";
import { GuestEditCatForm } from "@/components/guest/guest-cat-form";
import { serializeCat } from "@/lib/serialize";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function EditCatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  const { id } = await params;
  if (!user?.id) return <GuestEditCatForm catId={id} />;
  const userId = user.id;
  const raw = await prisma.cat.findFirst({ where: { id, userId } });
  if (!raw) notFound();
  const cat = serializeCat(raw);

  return (
    <>
      <PageHeader title={`${cat.name} 프로필`} subtitle="기록과 일정도 함께 정리돼요." />
      <form action={updateCatAction.bind(null, cat.id)} className="card space-y-4 p-5">
        <label className="block text-sm font-bold">
          이름
          <input name="name" required defaultValue={cat.name} className="field mt-1" />
        </label>
        <label className="block text-sm font-bold">
          생일
          <input name="birthDate" type="date" defaultValue={cat.birthDate ?? ""} className="field mt-1" />
        </label>
        <label className="block text-sm font-bold">
          체중 kg
          <input
            name="weightKg"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={cat.weightKg ?? ""}
            className="field mt-1"
          />
        </label>
        <label className="block text-sm font-bold">
          메모
          <textarea name="notes" defaultValue={cat.notes ?? ""} className="field mt-1 min-h-24" />
        </label>
        <button className="btn-primary w-full" type="submit">
          프로필 저장
        </button>
      </form>
      <form action={deleteCatAction.bind(null, cat.id)} className="mt-6">
        <ConfirmSubmit
          message="이 고양이의 기록·일정 정보가 함께 삭제돼요. 진행할까요?"
          className="w-full text-sm font-bold text-rose"
        >
          이 고양이와 관련 기록 삭제
        </ConfirmSubmit>
      </form>
    </>
  );
}
