import Link from "next/link";
import type { ReactNode } from "react";
import { selectCatAction } from "@/app/actions/cats";
import { catColor, catInitial } from "@/lib/cat-colors";
import type { PublicCat } from "@/lib/serialize";

export function CatAvatar({
  name,
  photoUrl,
  color,
  size = "md",
}: {
  name: string;
  photoUrl?: string | null;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="" className={`${dim} rounded-full object-cover`} />
    );
  }
  return (
    <span
      className={`inline-flex ${dim} items-center justify-center rounded-full font-extrabold text-white`}
      style={{ background: color }}
      aria-hidden
    >
      {catInitial(name)}
    </span>
  );
}

export function CatLegend({ cats }: { cats: Array<Pick<PublicCat, "id" | "name">> }) {
  const ids = cats.map((cat) => cat.id);
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
      {cats.map((cat) => (
        <li key={cat.id} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: catColor(cat.id, ids).hex }} />
          {cat.name}
        </li>
      ))}
    </ul>
  );
}

export function StickyCatBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-line/80 bg-paper/95 px-4 py-2 backdrop-blur-md">
      {children}
    </div>
  );
}

export function CatPicker({
  cats,
  selectedId,
  loggedCatIds,
  hrefFor,
}: {
  cats: Array<Pick<PublicCat, "id" | "name" | "photoUrl">>;
  selectedId: string;
  loggedCatIds?: string[];
  hrefFor?: (catId: string) => string;
}) {
  const ids = cats.map((cat) => cat.id);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label="고양이 선택"
    >
      {cats.map((cat) => {
        const selected = cat.id === selectedId;
        const color = catColor(cat.id, ids).hex;
        const logged = loggedCatIds?.includes(cat.id);
        const chip = (
          <span
            className="cat-chip"
            data-selected={selected ? "true" : "false"}
            style={{ ["--chip-color" as string]: color }}
          >
            <span className="relative">
              <CatAvatar name={cat.name} photoUrl={cat.photoUrl} color={color} size="sm" />
              {logged ? (
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-white bg-sage" />
              ) : null}
            </span>
            <span className="pr-1 font-bold">{cat.name}</span>
          </span>
        );

        if (hrefFor) {
          return (
            <Link
              key={cat.id}
              href={hrefFor(cat.id)}
              role="listitem"
              className="shrink-0"
              aria-current={selected ? "true" : undefined}
            >
              {chip}
            </Link>
          );
        }

        return (
          <form key={cat.id} action={selectCatAction.bind(null, cat.id)} role="listitem" className="shrink-0">
            <button
              type="submit"
              aria-pressed={selected}
              aria-label={`${cat.name} 기록으로 전환`}
              className="rounded-full bg-transparent p-0"
            >
              {chip}
            </button>
          </form>
        );
      })}
    </div>
  );
}
