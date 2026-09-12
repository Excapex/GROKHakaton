import { describe, expect, it } from "vitest";
import { assembleFromRoles } from "./assemble";
import { gate, judge } from "./judge";
import { runExtract } from "./slots";
import type { IngestDoc } from "./types";
import { ingestUnavailableReason } from "../daytona/client";

function doc(
  id: string,
  hash: string,
  text: string,
  roleRevision = "rev_extract",
): IngestDoc {
  return {
    document_id: id,
    revision_id: roleRevision,
    input_hash: hash,
    pages: [{ page_no: 1, text }],
  };
}

const FIX = {
  gpzop: doc(
    "doc_anon_gpzop",
    "sha256:anon-extract-gpzop",
    "GPZOP anon fixture\nOtpornost: F60 za protivpožarna vrata D-12.\nFasada: A1 klasa obloga izolacije.\nEI 60 prema SRPS EN 13501-1.\nPovršina sale 180 m2 za 90 lica.\n",
  ),
  arh: doc(
    "doc_anon_arh",
    "sha256:anon-extract-arh",
    "Arhitektura anon fixture\nFasada: mineralna vuna za izolaciju.\n",
  ),
  predmer: doc(
    "doc_anon_predmer",
    "sha256:anon-extract-predmer",
    "Predmer anon fixture\nBeton C25/30, malter, obična stolarija.\n",
  ),
  elektro: doc(
    "doc_anon_elektro",
    "sha256:anon-extract-elektro",
    "Elektro anon fixture\nSigurnosna rasveta, autonomija 1 h.\n",
  ),
};

describe("perception R1–R6", () => {
  it("ne izmišlja dosije bez teksta strane", () => {
    const empty = assembleFromRoles(
      {
        gpzop: { ...FIX.gpzop, pages: [{ page_no: 1, text: "   " }] },
      },
      { projectId: "proj_anon", revisionId: "rev_extract" },
    );
    expect(empty.pipelineReady).toBe(false);
    if (empty.pipelineReady === false) expect(empty.dossier).toBeNull();
  });

  it("R1 fail, R3 conflict sa dva izvora, R5 unknown, R6 unknown", () => {
    const extracted = runExtract(FIX);
    const r1 = extracted.observations.find(
      (o) => o.slot === "fire_resistance_mark" && o.value === "F60",
    );
    expect(r1).toBeTruthy();
    const ev = extracted.evidence.find((e) => e.id === r1?.evidence_id);
    expect(ev?.page_no).toBe(1);
    expect(ev?.document_id).toBe("doc_anon_gpzop");

    const findings = judge(extracted.observations, extracted.evidence);
    expect(findings.find((f) => f.id === "find_r1")?.status).toBe("fail");
    expect(findings.find((f) => f.id === "find_r3")?.status).toBe("conflict");
    expect(findings.find((f) => f.id === "find_r3")?.observation_ids.length).toBeGreaterThanOrEqual(
      2,
    );
    expect(findings.find((f) => f.id === "find_r5")?.status).toBe("unknown");
    expect(findings.find((f) => f.id === "find_r6")?.status).toBe("unknown");
    expect(findings.some((f) => f.status === "pass")).toBe(false);

    const report = gate(extracted.observations, extracted.evidence, findings);
    expect(report.ok).toBe(true);

    const ready = assembleFromRoles(FIX, { projectId: "proj_anon", revisionId: "rev_extract" });
    expect(ready.pipelineReady).toBe(true);
    if (ready.pipelineReady) {
      expect(ready.dossier.findings.some((f) => f.id === "find_r3")).toBe(true);
      expect(ready.dossier.questions.length).toBeGreaterThan(0);
    }
  });

  it("uklonjen dokaz -> unknown, ne PASS", () => {
    const extracted = runExtract(FIX);
    const stripped = extracted.evidence.filter(
      (e) => !extracted.observations.some((o) => o.slot === "fire_resistance_mark" && o.evidence_id === e.id),
    );
    const findings = judge(extracted.observations, stripped);
    expect(findings.find((f) => f.id === "find_r1")?.status).toBe("unknown");
    expect(findings.find((f) => f.id === "find_r1")?.status).not.toBe("pass");
  });
});

describe("daytona adapter", () => {
  it("bez ingest-a ne izmišlja strane", () => {
    expect(ingestUnavailableReason()).toMatch(/nije pokrenut/i);
  });
});
