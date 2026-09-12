import type { Dossier, Evidence, Finding, Observation } from "../../../contracts/types.ts";
import { isCadKind } from "../../lib/fileKind.ts";
import { observationsForFinding } from "./dossierView.ts";

export type LoopDocument = {
  _id: string;
  filename: string;
  kind: string;
  sha256: string;
  revisionId?: string;
};

export type LoopActionKind =
  | "ask"
  | "propose_patch"
  | "design_task"
  | "verify_revision";

function hashBare(inputHash: string): string {
  return inputHash.replace(/^sha256:/, "");
}

/** Prefer the evidence document; never invent an ID. Office before CAD. */
export function documentForFinding(input: {
  observations: Observation[];
  evidence: Evidence[];
  documents: LoopDocument[];
}): LoopDocument | undefined {
  for (const observation of input.observations) {
    const row = input.evidence.find((item) => item.id === observation.evidence_id);
    if (!row) continue;
    const match = input.documents.find(
      (doc) =>
        String(doc._id) === row.document_id || doc.sha256 === hashBare(row.input_hash),
    );
    if (match) return match;
  }
  const office = input.documents.find((doc) => !isCadKind(doc.kind));
  return office ?? input.documents[0];
}

export function actionKindForFinding(input: {
  finding: Finding;
  dossier: Dossier;
  document: LoopDocument | undefined;
}): LoopActionKind | null {
  if (input.document && isCadKind(input.document.kind) && input.finding.status !== "conflict") {
    return "design_task";
  }
  const next = input.dossier.next_actions.find((action) => {
    if (action.kind === "ask") {
      return input.dossier.questions.some(
        (question) =>
          question.id === action.question_id &&
          question.finding_ids.includes(input.finding.id),
      );
    }
    if (action.kind === "propose_patch") {
      return action.change_set_id === `cs_${input.finding.id}`;
    }
    if (action.kind === "design_task") {
      return action.description.includes(input.finding.rule_id);
    }
    return false;
  });
  if (next && next.kind !== "verify_revision") return next.kind;
  if (input.finding.status === "conflict") return "ask";
  if (input.finding.status === "fail") return "propose_patch";
  if (input.finding.status === "unknown") return "design_task";
  return null;
}

export function resolveFindingLoop(input: {
  finding: Finding;
  dossier: Dossier;
  evidence: Evidence[];
  documents: LoopDocument[];
}): {
  document: LoopDocument | undefined;
  actionKind: LoopActionKind | null;
} {
  const observations = observationsForFinding(input.dossier, input.finding);
  const document = documentForFinding({
    observations,
    evidence: input.evidence,
    documents: input.documents,
  });
  return {
    document,
    actionKind: actionKindForFinding({
      finding: input.finding,
      dossier: input.dossier,
      document,
    }),
  };
}
