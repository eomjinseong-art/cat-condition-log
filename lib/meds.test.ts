import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adherenceForPeriod, buildDayDoses, frequencySummary, isPlanDueOn, nextVisitOf } from "./meds";
import type { PublicMedicationPlan } from "./serialize";

function plan(partial: Partial<PublicMedicationPlan>): PublicMedicationPlan {
  return {
    id: partial.id ?? "p1",
    catId: "c1",
    name: partial.name ?? "신장약",
    doseNotes: "아침 1정",
    frequency: partial.frequency ?? "DAILY",
    timesPerDay: partial.timesPerDay ?? null,
    weekdays: partial.weekdays ?? [],
    intervalDays: partial.intervalDays ?? null,
    startOn: partial.startOn ?? "2026-09-01",
    endOn: partial.endOn ?? null,
    active: partial.active ?? true,
  };
}

describe("medication schedules", () => {
  it("marks daily and times-per-day slots, with missed after today", () => {
    const daily = plan({ frequency: "DAILY" });
    const twice = plan({ id: "p2", frequency: "TIMES_PER_DAY", timesPerDay: 2 });
    const today = buildDayDoses([daily, twice], [], "2026-09-14", "2026-09-14");
    assert.equal(today.length, 3);
    assert.equal(today.filter((row) => row.pending).length, 3);

    const given = buildDayDoses(
      [twice],
      [{ id: "d1", planId: "p2", catId: "c1", takenOn: "2026-09-13", slot: 0, givenAt: "2026-09-13T01:00:00.000Z" }],
      "2026-09-13",
      "2026-09-14",
    );
    assert.equal(given[0]?.given, true);
    assert.equal(given[1]?.missed, true);
  });

  it("honors weekdays, every-N-days, and start/end bounds", () => {
    const weekdays = plan({ frequency: "WEEKDAYS", weekdays: [1, 3] }); // Mon, Wed
    assert.equal(isPlanDueOn(weekdays, "2026-09-14"), true); // Monday
    assert.equal(isPlanDueOn(weekdays, "2026-09-15"), false);

    const every = plan({ frequency: "EVERY_N_DAYS", intervalDays: 2, startOn: "2026-09-01" });
    assert.equal(isPlanDueOn(every, "2026-09-01"), true);
    assert.equal(isPlanDueOn(every, "2026-09-02"), false);
    assert.equal(isPlanDueOn(every, "2026-09-03"), true);

    const ended = plan({ endOn: "2026-09-02" });
    assert.equal(isPlanDueOn(ended, "2026-09-03"), false);
    assert.equal(frequencySummary(weekdays), "월·수");
  });

  it("counts adherence only through today and finds the next visit", () => {
    const daily = plan({ frequency: "DAILY" });
    const rows = adherenceForPeriod(
      [daily],
      [{ id: "d1", planId: "p1", catId: "c1", takenOn: "2026-09-01", slot: 0, givenAt: "2026-09-01T00:00:00.000Z" }],
      "2026-09-01",
      "2026-09-10",
      "2026-09-03",
    );
    assert.equal(rows[0]?.expected, 3);
    assert.equal(rows[0]?.taken, 1);
    assert.equal(rows[0]?.missed, 2);

    const next = nextVisitOf(
      [
        { visitOn: "2026-09-10", completedAt: "2026-09-10T00:00:00.000Z" },
        { visitOn: "2026-09-20", completedAt: null },
        { visitOn: "2026-09-08", completedAt: null },
      ],
      "2026-09-14",
    );
    assert.equal(next?.visitOn, "2026-09-20");
  });
});
