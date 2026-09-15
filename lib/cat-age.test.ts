import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAT_AGE_COPY,
  FORBIDDEN_AGE_COPY,
  catAgeView,
  formatReportAgeLine,
  humanYearsFromCatYears,
  lifeStageFromCatYears,
  roundHumanYears,
} from "./cat-age";
import { isSeniorCat } from "./dates";
import { parseEstimatedAgeYears } from "./form-parse";

describe("cat-age AAFP conversion", () => {
  it("interpolates the kitten month chart", () => {
    assert.equal(humanYearsFromCatYears(1 / 12), 1);
    assert.equal(humanYearsFromCatYears(3 / 12), 4);
    assert.equal(humanYearsFromCatYears(6 / 12), 10);
    assert.equal(humanYearsFromCatYears(1), 15);
    assert.equal(humanYearsFromCatYears(2 / 12), 2.5);
    assert.equal(humanYearsFromCatYears(4.5 / 12), 7);
  });

  it("uses 1y=15, 2y=24, then +4 each year, including fractions", () => {
    assert.equal(humanYearsFromCatYears(1.5), 19.5);
    assert.equal(humanYearsFromCatYears(2), 24);
    assert.equal(humanYearsFromCatYears(3), 28);
    assert.equal(humanYearsFromCatYears(5), 36);
    assert.equal(humanYearsFromCatYears(12), 64);
    assert.equal(humanYearsFromCatYears(12.25), 65);
    assert.equal(roundHumanYears(19.5), 20);
  });

  it("labels AAHA/AAFP 2021 life stages", () => {
    assert.equal(lifeStageFromCatYears(0.5), "kitten");
    assert.equal(lifeStageFromCatYears(0.999), "kitten");
    assert.equal(lifeStageFromCatYears(1), "young");
    assert.equal(lifeStageFromCatYears(6), "young");
    assert.equal(lifeStageFromCatYears(6.99), "young");
    assert.equal(lifeStageFromCatYears(7), "mature");
    assert.equal(lifeStageFromCatYears(10), "mature");
    assert.equal(lifeStageFromCatYears(10.01), "senior");
    assert.equal(lifeStageFromCatYears(12), "senior");
  });

  it("formats agreed Korean copy from a birthdate", () => {
    const view = catAgeView({ name: "나비", birthDate: "2014-09-14", asOf: "2026-09-14" });
    assert.ok(view);
    assert.equal(view.catAgeLabel, "12살");
    assert.equal(view.humanYears, 64);
    assert.equal(view.stageLabel, "노령");
    assert.equal(view.primaryLine, "나비 · 12살");
    assert.equal(view.secondaryLine, "사람 나이 약 64세 · 노령");
    assert.equal(view.homeLine, "12살 · 약 64세 · 노령");
    assert.equal(view.previewLine, "→ 사람 나이 약 64세 · 노령");
    assert.equal(view.reportLine, "나이 12살 (사람 나이 약 64세, 참고)");
    assert.equal(view.estimatedNote, null);

    const withMonths = catAgeView({ birthDate: "2014-06-14", asOf: "2026-09-14" });
    assert.equal(withMonths?.catAgeLabel, "12살 3개월");
    assert.equal(withMonths?.humanYears, 65);
  });

  it("formats estimated cat age and the reference note", () => {
    const view = catAgeView({ estimatedYears: 8, asOf: "2026-09-14" });
    assert.ok(view);
    assert.equal(view.estimated, true);
    assert.equal(view.catAgeLabel, "약 8살 (추정)");
    assert.equal(view.humanYears, 48);
    assert.equal(view.stageLabel, "성숙");
    assert.equal(view.estimatedNote, "나이 정확하지 않으면 참고만 해 주세요");
  });

  it("prefers a birthdate over estimated years", () => {
    const view = catAgeView({
      birthDate: "2021-09-14",
      estimatedYears: 8,
      asOf: "2026-09-14",
    });
    assert.ok(view);
    assert.equal(view.estimated, false);
    assert.equal(view.catAgeLabel, "5살");
    assert.equal(view.humanYears, 36);
    assert.equal(view.previewLine, "→ 사람 나이 약 36세 · 청년");
  });

  it("builds the hospital report age line without emphasis copy", () => {
    assert.equal(
      formatReportAgeLine({ birthDate: "2014-09-14", asOf: "2026-09-14" }),
      "나이 12살 (사람 나이 약 64세, 참고)",
    );
    assert.equal(formatReportAgeLine({ asOf: "2026-09-14" }), "나이: 미입력");
  });

  it("keeps locked help strings and rejects forbidden wording", () => {
    assert.equal(
      CAT_AGE_COPY.tooltip,
      "사람 나이는 AAFP 기준 참고값이에요. 1년≈15세, 2년≈24세, 이후 매년 +4세. 실제 건강은 기록·검진이 더 중요해요.",
    );
    assert.equal(CAT_AGE_COPY.shortTooltip, "참고용이에요. 개체마다 달라요.");
    assert.equal(
      CAT_AGE_COPY.previewDisclaimer,
      "병원에서 쓰는 정확한 나이는 아니에요. 이해를 돕는 환산이에요.",
    );
    const blob = [
      CAT_AGE_COPY.tooltip,
      CAT_AGE_COPY.shortTooltip,
      CAT_AGE_COPY.previewDisclaimer,
      CAT_AGE_COPY.estimatedNote,
      catAgeView({ name: "나비", birthDate: "2014-09-14", asOf: "2026-09-14" })?.reportLine,
    ].join("\n");
    for (const pattern of FORBIDDEN_AGE_COPY) {
      assert.equal(pattern.test(blob), false, String(pattern));
    }
  });

  it("parses estimated age years without treating a blank as 0", () => {
    assert.equal(parseEstimatedAgeYears(""), null);
    assert.equal(parseEstimatedAgeYears("  "), null);
    assert.equal(parseEstimatedAgeYears("8"), 8);
    assert.equal(parseEstimatedAgeYears("8.5"), null);
  });

  it("does not use human-equivalent years for senior-care triggering", () => {
    assert.equal(lifeStageFromCatYears(3), "young");
    assert.equal(isSeniorCat({ birthDate: "2023-09-14", seniorCare: false }, "2026-09-14"), false);
    assert.equal(lifeStageFromCatYears(10), "mature");
    assert.equal(isSeniorCat({ birthDate: "2016-09-14", seniorCare: false }, "2026-09-14"), true);
    assert.equal(isSeniorCat({ birthDate: "2023-09-14", seniorCare: true }, "2026-09-14"), true);
  });
});
