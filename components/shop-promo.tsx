import { partners } from "@/lib/partners";

const shopLink = {
  href: partners.shop.href,
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/** Soft landing card. Sits around auth CTAs — not inside forms. */
export function LandingShopPromo() {
  return (
    <a {...shopLink} className="card mt-8 block px-4 py-4 no-print">
      <span className="text-[10px] font-semibold tracking-wider text-ink-soft/80">
        {partners.shop.kind}
      </span>
      <p className="mt-1 text-sm font-bold">{partners.shop.landingTitle}</p>
      <p className="mt-1 text-xs leading-6 text-ink-soft">
        {partners.shop.shortName}은 이 기록 앱과는 별도 사이트예요. 새 탭에서 천천히 둘러보세요.
        <span className="sr-only"> (새 탭에서 열림)</span>
      </p>
    </a>
  );
}

/** Quiet one-line card for the bottom of /home. Keep off diary/med forms. */
export function HomeShopPromo() {
  return (
    <a
      {...shopLink}
      className="no-print mt-10 block rounded-2xl border border-line/80 px-4 py-3 text-sm leading-6 text-ink-soft hover:text-ink"
    >
      {partners.shop.homeTitle}
      <span className="sr-only"> (새 탭에서 열림)</span>
    </a>
  );
}
