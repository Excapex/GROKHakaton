import { describe, expect, it } from "vitest";
import { assembleFromRoles } from "./lib/perception/assemble.ts";
import { anonDocsByRole, hasPageText } from "./pageRoles.ts";

describe("getActive izvor nalaza", () => {
  it("anon tekst daje R3 konflikt sa dva izvora i nijedan PASS", () => {
    const assembled = assembleFromRoles(anonDocsByRole("rev_extract"), {
      projectId: "proj_demo",
      revisionId: "rev_extract",
    });
    expect(assembled.pipelineReady).toBe(true);
    if (!assembled.pipelineReady) return;

    const conflict = assembled.dossier.findings.find((row) => row.status === "conflict");
    expect(conflict?.observation_ids.length).toBeGreaterThanOrEqual(2);
    expect(assembled.dossier.findings.some((row) => row.status === "pass")).toBe(false);
  });

  it("prazne strane ostaju bez dosijea", () => {
    const blank = {
      gpzop: {
        document_id: "d1",
        revision_id: "r1",
        input_hash: "h",
        pages: [{ page_no: 1, text: "" }],
      },
    };
    expect(hasPageText(blank)).toBe(false);
    const assembled = assembleFromRoles(blank, {
      projectId: "proj_demo",
      revisionId: "r1",
    });
    expect(assembled.pipelineReady).toBe(false);
    expect(assembled.dossier).toBeNull();
  });
});
