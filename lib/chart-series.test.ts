import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultCompareIds, metricPoints, toggleCompareId } from "./chart-series";
import { emptyPublicLog, type PublicLog } from "./serialize";

function log(partial: Partial<PublicLog>): PublicLog {
  return {
    ...emptyPublicLog(partial.catId ?? "c1", partial.loggedOn ?? "2026-09-01", partial.id ?? "l"),
    ...partial,
  };
}

describe("chart series", () => {
  it("defaults to the active cat then up to two more", () => {
    assert.deepEqual(defaultCompareIds(["a", "b", "c", "d"], "c"), ["c", "a", "b"]);
    assert.deepEqual(defaultCompareIds(["a"], "a"), ["a"]);
  });

  it("toggles cats while keeping at least one and at most three", () => {
    assert.deepEqual(toggleCompareId(["a"], "a"), ["a"]);
    assert.deepEqual(toggleCompareId(["a"], "b"), ["a", "b"]);
    assert.deepEqual(toggleCompareId(["a", "b", "c"], "d"), ["a", "b", "c"]);
    assert.deepEqual(toggleCompareId(["a", "b"], "a"), ["b"]);
  });

  it("extracts per-cat metric points", () => {
    const logs = [
      log({ catId: "a", loggedOn: "2026-09-01", weightKg: 4.2, appetite: "LOW", vomit: true, stoolCount: 2 }),
      log({ catId: "b", loggedOn: "2026-09-01", weightKg: 5.1 }),
    ];
    assert.deepEqual(metricPoints(logs, "a", "weight"), [{ date: "2026-09-01", value: 4.2 }]);
    assert.deepEqual(metricPoints(logs, "a", "appetite"), [{ date: "2026-09-01", value: 1 }]);
    assert.deepEqual(metricPoints(logs, "b", "vomit"), []);
  });
});
