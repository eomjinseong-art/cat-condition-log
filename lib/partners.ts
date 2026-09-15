export const WIKI_HREF = "https://b-cat-cpang.vercel.app/wiki/";
export const SHOP_HREF = "https://b-cat-cpang.vercel.app/";

export const partners = {
  wiki: {
    href: WIKI_HREF,
    name: "숨숨마을위키",
    kind: "안내",
    blurb: "일상 돌봄을 천천히 읽어 볼 수 있어요.",
  },
  shop: {
    href: SHOP_HREF,
    name: "숨숨마을 고양이 용품 큐레이션",
    shortName: "숨숨마을",
    kind: "용품",
    blurb: "필요한 물건만 골라 둔 목록이에요.",
    landingTitle: "기록에 도움이 되는 용품은 숨숨마을",
    homeTitle: "오늘 챙길 용품 · 숨숨마을",
  },
} as const;
