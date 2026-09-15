import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VISIT_DAY_STORAGE_KEY,
  abacusUrl,
  parseAbacusValue,
  readStoredVisitDay,
  recordSiteVisit,
  visitAction,
  writeStoredVisitDay,
} from "./visits";

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("visits", () => {
  it("builds Abacus hit and get URLs", () => {
    assert.equal(abacusUrl("hit"), "https://abacus.jasoncameron.dev/hit/cat-condition-log/visits");
    assert.equal(abacusUrl("get"), "https://abacus.jasoncameron.dev/get/cat-condition-log/visits");
  });

  it("hits once per day and gets afterwards", () => {
    assert.equal(visitAction(null, "2026-09-15"), "hit");
    assert.equal(visitAction("2026-09-14", "2026-09-15"), "hit");
    assert.equal(visitAction("2026-09-15", "2026-09-15"), "get");
  });

  it("reads a finite non-negative Abacus value", () => {
    assert.equal(parseAbacusValue({ value: 12 }), 12);
    assert.equal(parseAbacusValue({ value: 3.9 }), 3);
    assert.equal(parseAbacusValue({ value: 0 }), 0);
    assert.equal(parseAbacusValue({ value: -1 }), null);
    assert.equal(parseAbacusValue({ value: "12" }), null);
    assert.equal(parseAbacusValue({ error: "Key not found" }), null);
    assert.equal(parseAbacusValue(null), null);
  });

  it("stores the visit day under the app key", () => {
    const storage = new MemoryStorage();
    writeStoredVisitDay(storage, "2026-09-15");
    assert.equal(storage.getItem(VISIT_DAY_STORAGE_KEY), "2026-09-15");
    assert.equal(readStoredVisitDay(storage), "2026-09-15");
  });

  it("calls /hit on the first visit of the day and remembers the day", async () => {
    const storage = new MemoryStorage();
    const urls: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      urls.push(String(input));
      return jsonResponse({ value: 41 });
    };

    const value = await recordSiteVisit({
      today: "2026-09-15",
      storage,
      fetchImpl,
    });

    assert.equal(value, 41);
    assert.deepEqual(urls, ["https://abacus.jasoncameron.dev/hit/cat-condition-log/visits"]);
    assert.equal(storage.getItem(VISIT_DAY_STORAGE_KEY), "2026-09-15");
  });

  it("calls /get when localStorage already has today", async () => {
    const storage = new MemoryStorage();
    storage.setItem(VISIT_DAY_STORAGE_KEY, "2026-09-15");
    const urls: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      urls.push(String(input));
      return jsonResponse({ value: 41 });
    };

    const value = await recordSiteVisit({
      today: "2026-09-15",
      storage,
      fetchImpl,
    });

    assert.equal(value, 41);
    assert.deepEqual(urls, ["https://abacus.jasoncameron.dev/get/cat-condition-log/visits"]);
  });

  it("hides the count when Abacus fails", async () => {
    const storage = new MemoryStorage();
    const failed = await recordSiteVisit({
      today: "2026-09-15",
      storage,
      fetchImpl: async () => jsonResponse({ error: "Error description" }, 500),
    });
    assert.equal(failed, null);
    assert.equal(storage.getItem(VISIT_DAY_STORAGE_KEY), null);

    const invalid = await recordSiteVisit({
      today: "2026-09-15",
      storage,
      fetchImpl: async () => jsonResponse({ nope: true }),
    });
    assert.equal(invalid, null);

    const network = await recordSiteVisit({
      today: "2026-09-15",
      storage,
      fetchImpl: async () => {
        throw new Error("offline");
      },
    });
    assert.equal(network, null);
  });
});
