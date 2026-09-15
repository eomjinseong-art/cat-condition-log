import { CAT_CONDITIONS, conditionLabels } from "@/lib/conditions";
import type { CatCondition } from "@/lib/conditions";

export function CatCareFields({
  seniorCare,
  conditions = [],
}: {
  seniorCare?: boolean;
  conditions?: CatCondition[];
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl bg-[#f6ead6]/70 px-3 py-3">
      <legend className="px-1 text-sm font-bold">노묘 · 만성케어</legend>
      <label className="flex items-start gap-2 text-sm leading-6">
        <input type="checkbox" name="seniorCare" value="on" defaultChecked={seniorCare} className="mt-1" />
        <span>
          노묘/만성케어로 표시해요
          <span className="mt-0.5 block text-xs font-normal text-ink-soft">
            10살이 넘으면 홈·기록에서 노묘 체크가 자동으로 열려요. 더 일찍 쓰고 싶으면 켜 주세요.
          </span>
        </span>
      </label>
      <div>
        <p className="text-sm font-bold">돌봄 태그 (선택)</p>
        <p className="mt-1 text-xs leading-5 text-ink-soft">
          진단이 아니라, 자주 보는 칸을 열어 두는 표시예요.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CAT_CONDITIONS.map((key) => (
            <label key={key} className="chip cursor-pointer">
              <input
                type="checkbox"
                name="conditions"
                value={key}
                defaultChecked={conditions.includes(key)}
                className="mr-1.5"
              />
              {conditionLabels[key]}
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
