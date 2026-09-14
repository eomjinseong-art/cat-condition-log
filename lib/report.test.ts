import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReport } from "./report";
import type { PublicCat, PublicLog } from "./serialize";

const cat: PublicCat = {
  id: "c1",
  name: "치즈",
  birthDate: "2022-09-14",
  weightKg: 5,
  photoUrl: null,
  notes: "중성화 완료",
};

function log(partial: Partial<PublicLog>): PublicLog {
  return {
    id: partial.id ?? "l",
    catId: "c1",
    loggedOn: partial.loggedOn ?? "2026-09-01",
    appetite: partial.appetite ?? null,
    foodNote: null,
    water: partial.water ?? null,
    stoolCount: partial.stoolCount ?? null,
    stoolQuality: partial.stoolQuality ?? null,
    urine: partial.urine ?? null,
    vomit: partial.vomit ?? null,
    vomitNote: null,
    vomitPhotoUrl: null,
    energy: partial.energy ?? null,
    weightKg: partial.weightKg ?? null,
    memo: partial.memo ?? null,
    photoUrl: null,
  };
}

describe("report", () => {
  it("summarizes entered numbers without diagnosis wording", () => {
    const report = buildReport({
      cat,
      from: "2026-09-01",
      to: "2026-09-03",
      logs: [
        log({ id: "1", loggedOn: "2026-09-01", appetite: "LOW", vomit: true, weightKg: 5.1, stoolCount: 1 }),
        log({ id: "2", loggedOn: "2026-09-02", appetite: "NORMAL", vomit: false, weightKg: 5.05, stoolCount: 2 }),
        log({ id: "3", loggedOn: "2026-09-03", appetite: "NORMAL", vomit: false, weightKg: 5.0, stoolCount: 1, memo: "병원 방문 예정" }),
      ],
      reminders: [
        {
          id: "r1",
          catId: "c1",
          type: "MEDS",
          title: "신장약",
          dueOn: "2026-09-02",
          notes: "아침 1정",
          completedAt: "2026-09-02T00:00:00.000Z",
        },
      ],
    });

    assert.equal(report.catName, "치즈");
    assert.equal(report.logCount, 3);
    assert.match(report.trends.join("\n"), /5\.10kg → 5\.00kg/);
    assert.match(report.trends.join("\n"), /구토: 있음 1일, 없음 2일/);
    assert.doesNotMatch(report.trends.join("\n"), /진단|처방|의심/);
    assert.equal(report.meds[0]?.title, "신장약");
    assert.equal(report.timeline[2]?.rows.find((row) => row[0] === "메모")?.[1], "병원 방문 예정");
  });
});
