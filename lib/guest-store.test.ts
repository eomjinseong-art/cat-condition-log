import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addGuestCat,
  applyGuestLogPatch,
  canAddGuestCat,
  deleteGuestCat,
  emptyGuestSnapshot,
  parseGuestSnapshot,
  selectGuestCat,
} from "./guest-store";

describe("guest-store", () => {
  it("parses a valid snapshot and drops photos", () => {
    const parsed = parseGuestSnapshot(
      JSON.stringify({
        version: 1,
        disclaimerAcceptedAt: "2026-09-14T00:00:00.000Z",
        selectedCatId: "cat_1",
        cats: [
          {
            id: "cat_1",
            name: "치즈",
            birthDate: "2022-01-01",
            weightKg: 4.2,
            photoUrl: "https://evil.example/x.jpg",
            notes: "중성화",
          },
        ],
        logs: [
          {
            id: "log_1",
            catId: "cat_1",
            loggedOn: "2026-09-14",
            appetite: "NORMAL",
            photoUrl: "https://evil.example/y.jpg",
            vomitPhotoUrl: "https://evil.example/z.jpg",
          },
        ],
      }),
    );
    assert.ok(parsed);
    assert.equal(parsed.cats[0]?.photoUrl, null);
    assert.equal(parsed.logs[0]?.photoUrl, null);
    assert.equal(parsed.logs[0]?.vomitPhotoUrl, null);
    assert.equal(parsed.logs[0]?.appetite, "NORMAL");
  });

  it("caps guest cats at two", () => {
    let snapshot = emptyGuestSnapshot();
    snapshot = addGuestCat(snapshot, { name: "하나" });
    snapshot = addGuestCat(snapshot, { name: "둘" });
    assert.equal(canAddGuestCat(snapshot), false);
    assert.throws(() => addGuestCat(snapshot, { name: "셋" }), /GUEST_CAT_LIMIT/);
  });

  it("merges one-tap log patches and updates weight", () => {
    let snapshot = addGuestCat(emptyGuestSnapshot(), { name: "나비" });
    const catId = snapshot.cats[0].id;
    const first = applyGuestLogPatch(snapshot, { catId, loggedOn: "2026-09-14", appetite: "LOW" });
    const second = applyGuestLogPatch(first.snapshot, { catId, loggedOn: "2026-09-14", weightKg: 3.21 });
    assert.equal(second.snapshot.logs.length, 1);
    assert.equal(second.log.appetite, "LOW");
    assert.equal(second.log.weightKg, 3.21);
    assert.equal(second.snapshot.cats[0].weightKg, 3.21);
  });

  it("deletes a cat and its logs, then selects the remaining cat", () => {
    let snapshot = addGuestCat(emptyGuestSnapshot(), { name: "하나" });
    snapshot = addGuestCat(snapshot, { name: "둘" });
    const [first, second] = snapshot.cats;
    snapshot = applyGuestLogPatch(snapshot, { catId: first.id, loggedOn: "2026-09-14", energy: "HIGH" }).snapshot;
    snapshot = selectGuestCat(snapshot, first.id);
    snapshot = deleteGuestCat(snapshot, first.id);
    assert.equal(snapshot.cats.length, 1);
    assert.equal(snapshot.cats[0].id, second.id);
    assert.equal(snapshot.logs.length, 0);
    assert.equal(snapshot.selectedCatId, second.id);
  });

  it("ignores logs that do not belong to a known cat", () => {
    const parsed = parseGuestSnapshot(
      JSON.stringify({
        cats: [{ id: "cat_1", name: "치즈" }],
        logs: [{ id: "log_x", catId: "other", loggedOn: "2026-09-14", appetite: "HIGH" }],
      }),
    );
    assert.ok(parsed);
    assert.equal(parsed.logs.length, 0);
  });
});
