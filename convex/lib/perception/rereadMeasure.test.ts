import { describe, expect, it } from "vitest";
import { anonExtractRoles } from "./anonFixture.ts";
import { assembleFromRoles } from "./assemble.ts";
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

  it("F60 → EI 60 na novom ingestu zatvara find_r1 i bez PASS", () => {
    const first = assembleFromRoles(anonExtractRoles("rev1"), {
      projectId: "p",
      revisionId: "rev1",
    });
    expect(first.pipelineReady).toBe(true);
    const firstFindings = first.pipelineReady ? first.dossier.findings : [];
    expect(firstFindings.find((row) => row.id === "find_r1")?.status).toBe("fail");

    const nextRoles = anonExtractRoles("rev2");
    const gpzop = nextRoles.gpzop;
    if (!gpzop?.pages[0]) throw new Error("fixture");
    gpzop.pages[0].text = gpzop.pages[0].text.replace("F60", "EI 60");
    gpzop.input_hash = "sha256:anon-extract-gpzop-rev2";
    const second = assembleFromRoles(nextRoles, {
      projectId: "p",
      revisionId: "rev2",
    });
    expect(second.pipelineReady).toBe(true);
    const secondFindings = second.pipelineReady ? second.dossier.findings : [];
    expect(secondFindings.find((row) => row.id === "find_r1")?.status).not.toBe("fail");
    expect(secondFindings.some((row) => row.status === "pass")).toBe(false);
    expect(findingClosedOnReread("find_r1", secondFindings)).toBe(true);
    expect(
      measureVerifiedGate({
        hasIngestText: true,
        inputHashChanged: true,
        findingId: "find_r1",
        findings: secondFindings,
      }).ok,
    ).toBe(true);
  });
});
