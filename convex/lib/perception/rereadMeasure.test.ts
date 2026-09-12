import { describe, expect, it } from "vitest";
import { hashesDiffer, normalizeHash } from "./hashes.ts";
import { findingClosedOnReread, measureVerifiedGate } from "./rereadMeasure.ts";

describe("normalizeHash", () => {
  it("izjednačava sirovi hex iz UI-ja sa sha256: prefiksom", () => {
    const hex = "a".repeat(64);
    expect(normalizeHash(hex)).toBe(`sha256:${hex}`);
    expect(hashesDiffer(hex, `sha256:${hex}`)).toBe(false);
    expect(hashesDiffer(hex, "b".repeat(64))).toBe(true);
  });
});

describe("findingClosedOnReread", () => {
  it("zatvara kad nalaz više nije fail/conflict", () => {
    expect(findingClosedOnReread("find_r1", [])).toBe(true);
    expect(findingClosedOnReread("find_r1", [{ id: "find_r1", status: "unknown" }])).toBe(
      true,
    );
    expect(findingClosedOnReread("find_r1", [{ id: "find_r1", status: "pass" }])).toBe(true);
  });

  it("ne zatvara dok je fail ili conflict", () => {
    expect(findingClosedOnReread("find_r1", [{ id: "find_r1", status: "fail" }])).toBe(false);
    expect(findingClosedOnReread("find_r3", [{ id: "find_r3", status: "conflict" }])).toBe(
      false,
    );
  });
});

describe("measureVerifiedGate", () => {
  it("ne veruje klijentu: bez ingest teksta nema verified", () => {
    const gate = measureVerifiedGate({
      hasIngestText: false,
      inputHashChanged: true,
      findingId: "find_r1",
      findings: [],
    });
    expect(gate.ok).toBe(false);
  });

  it("isti hash nije provera", () => {
    const gate = measureVerifiedGate({
      hasIngestText: true,
      inputHashChanged: false,
      findingId: "find_r1",
      findings: [],
    });
    expect(gate.ok).toBe(false);
  });
});
