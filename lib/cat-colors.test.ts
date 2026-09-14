import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catColor, catIdsByDay, catInitial } from "./cat-colors";

describe("cat colors", () => {
  it("keeps a stable color by registration order", () => {
    const ids = ["a", "b", "c"];
    assert.equal(catColor("a", ids).hex, "#c45c26");
    assert.equal(catColor("b", ids).hex, "#4f7a63");
    assert.equal(catColor("a", ids).hex, catColor("a", ids).hex);
  });

  it("uses the first character as an avatar initial", () => {
    assert.equal(catInitial("치즈"), "치");
    assert.equal(catInitial("  "), "냥");
  });

  it("groups logged cat ids by day without duplicates", () => {
    const map = catIdsByDay([
      { loggedOn: "2026-09-01", catId: "a" },
      { loggedOn: "2026-09-01", catId: "b" },
      { loggedOn: "2026-09-01", catId: "a" },
      { loggedOn: "2026-09-02", catId: "b" },
    ]);
    assert.deepEqual(map.get("2026-09-01"), ["a", "b"]);
    assert.deepEqual(map.get("2026-09-02"), ["b"]);
  });
});
