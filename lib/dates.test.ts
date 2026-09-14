import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDays, ageLabel, composeDateKey, daysInMonth, eachDateKey, formatDateKey, monthGrid } from "./dates";

describe("dates", () => {
  it("adds days across month boundaries", () => {
    assert.equal(addDays("2026-01-31", 1), "2026-02-01");
    assert.equal(addDays("2026-09-14", -13), "2026-09-01");
  });

  it("lists inclusive date keys", () => {
    assert.deepEqual(eachDateKey("2026-09-01", "2026-09-03"), [
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
  });

  it("formats Date values as YYYY-MM-DD", () => {
    assert.equal(formatDateKey(new Date("2026-03-05T00:00:00.000Z")), "2026-03-05");
  });

  it("computes Korean age labels", () => {
    assert.equal(ageLabel("2026-01-14", "2026-09-14"), "8개월");
    assert.equal(ageLabel("2023-09-14", "2026-09-14"), "3살");
    assert.equal(ageLabel("2023-03-14", "2026-09-14"), "3살 6개월");
  });

  it("builds a Monday-first month grid", () => {
    const cells = monthGrid(2026, 8);
    assert.equal(cells[0].key, "2026-08-31");
    assert.equal(cells.find((cell) => cell.key === "2026-09-01")?.inMonth, true);
    assert.equal(cells.length % 7, 0);
  });

  it("clamps calendar dates to a real day in the month", () => {
    assert.equal(daysInMonth(2026, 2), 28);
    assert.equal(composeDateKey(2026, 2, 31), "2026-02-28");
    assert.equal(composeDateKey(2026, 9, 14), "2026-09-14");
  });
});
