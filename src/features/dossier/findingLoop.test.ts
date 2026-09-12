import { describe, expect, it } from "vitest";
import type { Dossier, Evidence, Finding } from "../../../contracts/types.ts";
import {
  actionKindForFinding,
  documentForFinding,
  type LoopDocument,
} from "./findingLoop.ts";

const office: LoopDocument = {
  _id: "doc_office",
  filename: "GPZOP.docx",
  kind: "docx",
  sha256: "aaa",
  revisionId: "r1",
};

const cad: LoopDocument = {
  _id: "doc_cad",
  filename: "osnova.dwg",
  kind: "dwg",
  sha256: "bbb",
  revisionId: "r1",
};

const evidence: Evidence[] = [
  {
    schema_version: "1.0.0",
    id: "ev1",
    document_id: "doc_office",
    revision_id: "r1",
    page_no: 2,
    input_hash: "sha256:aaa",
  },
];

describe("documentForFinding", () => {
  it("veže evidenciju, ne prvi fajl na praznoj proveri", () => {
    const picked = documentForFinding({
      observations: [
        {
          schema_version: "1.0.0",
          id: "o1",
          slot: "door_rating",
          value: "F60",
          element_id: "e1",
          evidence_id: "ev1",
        },
      ],
      evidence,
      documents: [cad, office],
    });
    expect(picked?._id).toBe("doc_office");
  });

  it("na praznoj aktivnoj proveri uzima kancelarijski original sa starije", () => {
    const picked = documentForFinding({
      observations: [],
      evidence: [],
      documents: [cad, office],
    });
    expect(picked?._id).toBe("doc_office");
  });
});

describe("actionKindForFinding", () => {
  const finding: Finding = {
    schema_version: "1.0.0",
    id: "find_r1",
    rule_id: "R1",
    status: "fail",
    observation_ids: ["o1"],
    severity: "high",
    rationale: "F60",
  };
  const dossier = {
    next_actions: [{ kind: "propose_patch" as const, change_set_id: "cs_find_r1" }],
    questions: [],
  } as unknown as Dossier;

  it("CAD fail ostaje ručni zadatak, bez lažnog patch-a", () => {
    expect(
      actionKindForFinding({ finding, dossier, document: cad }),
    ).toBe("design_task");
  });

  it("office fail predlaže ispravku", () => {
    expect(
      actionKindForFinding({ finding, dossier, document: office }),
    ).toBe("propose_patch");
  });

  it("konflikt ostaje pitanje i bez tačnog next_actions pogotka", () => {
    const conflict: Finding = { ...finding, status: "conflict" };
    expect(
      actionKindForFinding({
        finding: conflict,
        dossier: { next_actions: [], questions: [] } as unknown as Dossier,
        document: office,
      }),
    ).toBe("ask");
  });
});
