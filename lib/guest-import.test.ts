import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guestImportSchema, planGuestImport } from "./guest-import";

describe("guest-import", () => {
  it("remaps and keeps the last log for the same cat and day", () => {
    const parsed = guestImportSchema.parse({
      version: 1,
      selectedCatId: "g1",
      cats: [
        { id: "g1", name: "치즈", birthDate: "2022-09-14", weightKg: 5, notes: "메모" },
        { id: "g2", name: "나비" },
      ],
      logs: [
        { catId: "g1", loggedOn: "2026-09-01", appetite: "LOW" },
        { catId: "g1", loggedOn: "2026-09-01", appetite: "HIGH", memo: "나중에" },
        { catId: "missing", loggedOn: "2026-09-01", energy: "LOW" },
      ],
    });
    const plan = planGuestImport(parsed);
    assert.equal(plan.cats.length, 2);
    assert.equal(plan.logs.length, 1);
    assert.equal(plan.logs[0]?.appetite, "HIGH");
    assert.equal(plan.logs[0]?.memo, "나중에");
    assert.equal(plan.selectedGuestCatId, "g1");
  });

  it("rejects a third guest cat in the import payload", () => {
    const result = guestImportSchema.safeParse({
      cats: [
        { id: "a", name: "하나" },
        { id: "b", name: "둘" },
        { id: "c", name: "셋" },
      ],
      logs: [],
    });
    assert.equal(result.success, false);
  });
});
