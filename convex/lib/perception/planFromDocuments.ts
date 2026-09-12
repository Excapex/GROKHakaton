import { guessRole } from "./pageTexts";
import { planR1, type ChangeSetPlan } from "./changeset";

export type UploadedDoc = {
  id: string;
  filename: string;
  kind: string;
  sha256: string;
};

/** Build R1 plan from stored originals. Missing GPZOP/predmer hash → null. */
export function planFromUploadedDocs(docs: UploadedDoc[]): ChangeSetPlan | null {
  const gpzop = docs.find(
    (doc) => guessRole(doc.filename) === "gpzop" && !isCad(doc.kind),
  );
  const predmer = docs.find(
    (doc) => guessRole(doc.filename) === "predmer" && !isCad(doc.kind),
  );
  const cad = docs.find((doc) => isCad(doc.kind));
  if (!gpzop || !predmer) return null;
  return planR1({
    gpzopId: gpzop.id,
    gpzopHash: gpzop.sha256,
    predmerId: predmer.id,
    predmerHash: predmer.sha256,
    dwgId: cad?.id,
  });
}

function isCad(kind: string): boolean {
  return kind === "dwg" || kind === "dwfx";
}
