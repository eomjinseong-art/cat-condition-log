import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SHOP_HREF, WIKI_HREF, partners } from "./partners";

describe("partner shop promo", () => {
  it("sends shop links only to 숨숨마을, never Coupang", () => {
    assert.equal(SHOP_HREF, "https://b-cat-cpang.vercel.app/");
    assert.equal(partners.shop.href, SHOP_HREF);
    assert.doesNotMatch(SHOP_HREF, /coupang/i);
    assert.doesNotMatch(partners.shop.href, /coupang/i);
    assert.doesNotMatch(WIKI_HREF, /coupang/i);
  });

  it("keeps landing and home promo copy soft and named 숨숨마을", () => {
    assert.equal(partners.shop.landingTitle, "기록에 도움이 되는 용품은 숨숨마을");
    assert.equal(partners.shop.homeTitle, "오늘 챙길 용품 · 숨숨마을");
    assert.match(partners.shop.shortName, /숨숨마을/);
  });
});
