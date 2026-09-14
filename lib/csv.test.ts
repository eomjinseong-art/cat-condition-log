import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { logsToCsv } from "./csv";
import type { PublicCat, PublicLog } from "./serialize";

const cat: PublicCat = {
  id: "c1",
  name: "나비",
  birthDate: "2023-01-01",
  weightKg: 4.2,
  photoUrl: null,
  notes: null,
};

const log: PublicLog = {
  id: "l1",
  catId: "c1",
  loggedOn: "2026-09-14",
  appetite: "NORMAL",
  foodNote: "습식, 간식",
  water: "NORMAL",
  stoolCount: 2,
  stoolQuality: "NORMAL",
  urine: "NORMAL",
  vomit: false,
  vomitNote: null,
  vomitPhotoUrl: null,
  energy: "HIGH",
  weightKg: 4.25,
  memo: "잘 놀았어요",
  photoUrl: null,
};

describe("csv", () => {
  it("escapes commas in notes and keeps entered numbers", () => {
    const csv = logsToCsv([cat], [log]);
    assert.match(csv, /"습식, 간식"/);
    assert.match(csv, /4.25/);
    assert.match(csv, /나비/);
  });
});
