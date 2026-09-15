import { createCatAction } from "@/app/actions/cats";
import { CatAgeField } from "@/components/cat-age-field";
import { CatCareFields } from "@/components/cat-care-fields";
import { GuestNewCatForm } from "@/components/guest/guest-cat-form";
import { PageHeader } from "@/components/ui";
import { getSessionUser } from "@/lib/session";

export default async function NewCatPage() {
  const user = await getSessionUser();
  if (!user?.id) return <GuestNewCatForm />;

  return (
    <>
      <PageHeader title="고양이 등록" subtitle="이름만 필수예요. 나머지는 나중에 채워도 돼요." />
      <form action={createCatAction} className="card space-y-4 p-5">
        <label className="block text-sm font-bold">
          이름
          <input name="name" required maxLength={30} className="field mt-1" placeholder="나비" />
        </label>
        <CatAgeField />
        <label className="block text-sm font-bold">
          체중 kg (선택, 0.01 단위)
          <input name="weightKg" type="number" step="0.01" min="0.01" max="30" className="field mt-1" />
        </label>
        <label className="block text-sm font-bold">
          메모
          <textarea name="notes" className="field mt-1 min-h-24" placeholder="중성화, 알러지 등" />
        </label>
        <CatCareFields />
        <button className="btn-primary w-full" type="submit">
          저장하고 기록하기
        </button>
      </form>
    </>
  );
}
