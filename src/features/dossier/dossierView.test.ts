import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../../../contracts/schema_version.ts";
import type { Dossier, Finding } from "../../../contracts/types.ts";
import {
  FINDING_STATUS_LABELS,
  LIFECYCLE_LABELS,
  isConflictFinding,
  observationsForFinding,
  pageForFinding,
} from "./dossierView.ts";

const finding: Finding = {
  schema_version: SCHEMA_VERSION,
  id: "f1",
  rule_id: "R3",
  status: "conflict",
  observation_ids: ["o1", "o2"],
  severity: "high",
  rationale: "GPZOP i arhitektura se ne slažu.",
};

const dossier: Dossier = {
  schema_version: SCHEMA_VERSION,
  review_run_id: "run_1",
  summary: "Delimičan dosije",
  coverage: { checked_rules: ["R3"], skipped_rules: ["R6"], unknown_slots: ["evac_n"] },
  observations: [
    {
      schema_version: SCHEMA_VERSION,
      id: "o1",
      slot: "facade_material",
      value: "A1",
      evidence_id: "e1",
    },
    {
      schema_version: SCHEMA_VERSION,
      id: "o2",
      slot: "facade_material",
      value: "wood",
      evidence_id: "e2",
    },
    {
      schema_version: SCHEMA_VERSION,
      id: "o3",
      slot: "other",
      value: "x",
      evidence_id: "e3",
    },
  ],
  findings: [finding],
  questions: [],
  next_actions: [],
  integrity_report: {
    ok: true,
    broken_links: [],
    unknown_without_scope: [],
    positive_without_evidence: [],
    conflicts_with_single_source: [],
  },
  change_set_ids: [],
};

describe("dossierView", () => {
  it("za konflikt vraća oba opažanja, ne treće", () => {
    expect(isConflictFinding(finding)).toBe(true);
    const rows = observationsForFinding(dossier, finding);
    expect(rows.map((row) => row.id)).toEqual(["o1", "o2"]);
  });

  it("strana dolazi iz dokaza, a bez dokaza ostaje null", () => {
    const evidence = [
      {
        schema_version: SCHEMA_VERSION,
        id: "e1",
        document_id: "d1",
        revision_id: "r1",
        page_no: 7,
        input_hash: "sha256:x",
      },
    ];
    expect(pageForFinding(dossier, finding, evidence)).toBe(7);
    expect(pageForFinding(dossier, finding, [])).toBeNull();
  });

  it("ima četiri odvojena stanja izmene", () => {
    expect(LIFECYCLE_LABELS.proposed).toBe("Predloženo");
    expect(LIFECYCLE_LABELS.verified).toBe("Provereno");
  });

  it("status nalaza se čita bez poznavanja engine-a", () => {
    expect(FINDING_STATUS_LABELS.unknown).toBe("Nije moguće proveriti");
    expect(FINDING_STATUS_LABELS.conflict).toBe("Neusaglašenost dokumenata");
    expect(FINDING_STATUS_LABELS.fail).toBe("Primedba");
  });
});
