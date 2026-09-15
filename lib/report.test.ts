import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReport } from "./report";
import { emptyPublicLog, type PublicCat, type PublicLog } from "./serialize";

const cat: PublicCat = {
  id: "c1",
  name: "치즈",
  birthDate: "2014-09-14",
  weightKg: 5,
  photoUrl: null,
  notes: "중성화 완료",
  seniorCare: true,
  conditions: ["CKD"],
};

function log(partial: Partial<PublicLog>): PublicLog {
  return {
    ...emptyPublicLog("c1", partial.loggedOn ?? "2026-09-01", partial.id ?? "l"),
    ...partial,
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
    assert.match(report.identity.join("\n"), /노묘\/만성케어/);
    assert.match(report.identity.join("\n"), /만성신장병/);
    assert.equal(report.caregiverMemo, "중성화 완료");
  });

  it("summarizes medication adherence and lab numbers without diagnosis", () => {
    const report = buildReport({
      cat,
      from: "2026-09-01",
      to: "2026-09-03",
      logs: [log({ loggedOn: "2026-09-01", waterChange: "MORE", nightVocal: "SOME", mobility: "STIFF" })],
      reminders: [],
      medicationPlans: [
        {
          id: "p1",
          catId: "c1",
          name: "신장약",
          doseNotes: "아침 1정",
          frequency: "DAILY",
          timesPerDay: null,
          weekdays: [],
          intervalDays: null,
          startOn: "2026-09-01",
          endOn: null,
          active: true,
        },
      ],
      doses: [
        {
          id: "d1",
          planId: "p1",
          catId: "c1",
          takenOn: "2026-09-01",
          slot: 0,
          givenAt: "2026-09-01T01:00:00.000Z",
        },
      ],
      visits: [
        {
          id: "v1",
          catId: "c1",
          visitOn: "2026-09-20",
          clinicName: "숨숨동물병원",
          reason: "피검사",
          reminderOn: "2026-09-18",
          completedAt: null,
        },
      ],
      asOf: "2026-09-15",
      labs: [
        {
          id: "lab1",
          catId: "c1",
          takenOn: "2026-09-02",
          creatinine: 1.8,
          sdma: 18,
          bun: 32,
          phosphorus: 4.2,
          t4: null,
          bloodPressure: 140,
          weightKg: 4.9,
          notes: "손기록",
        },
      ],
    });

    assert.match(report.adherence[0]?.line ?? "", /예정 3회 중 줬어요 1회, 놓침 2회/);
    assert.match(report.visitLines.join("\n"), /숨숨동물병원/);
    assert.match(report.labLines.join("\n"), /크레아티닌 1\.800/);
    assert.match(report.seniorTrends.join("\n"), /밤중 울음/);
    assert.doesNotMatch(report.adherence.join("\n"), /진단|처방|의심|IRIS/);
    assert.doesNotMatch(report.labLines.join("\n"), /정상|비정상|위험/);
  });
});
