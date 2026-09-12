import type {
  ChangeLifecycle,
  Dossier,
  Evidence,
  Finding,
  Observation,
} from "../../../contracts/types.ts";

export const LIFECYCLE_ORDER: ChangeLifecycle[] = [
  "proposed",
  "accepted",
  "applied",
  "verified",
];

export const LIFECYCLE_LABELS: Record<ChangeLifecycle, string> = {
  proposed: "Predloženo",
  accepted: "Prihvaćeno",
  applied: "Primenjeno",
  verified: "Provereno",
};

/** Status se prevodi po značenju za projektanta, ne doslovno iz engine-a. */
export const FINDING_STATUS_LABELS: Record<Finding["status"], string> = {
  pass: "Usklađeno",
  fail: "Primedba",
  conflict: "Neusaglašenost dokumenata",
  unknown: "Nije moguće proveriti",
};

export function observationsForFinding(
  dossier: Dossier,
  finding: Finding,
): Observation[] {
  const wanted = new Set(finding.observation_ids);
  return dossier.observations.filter((row) => wanted.has(row.id));
}

export function isConflictFinding(finding: Finding): boolean {
  return finding.status === "conflict";
}

/** Physical page behind a finding, or null. Never guessed when evidence is missing. */
export function pageForFinding(
  dossier: Dossier,
  finding: Finding,
  evidence: Evidence[],
): number | null {
  for (const observation of observationsForFinding(dossier, finding)) {
    const row = evidence.find((item) => item.id === observation.evidence_id);
    if (row) return row.page_no;
  }
  return null;
}

export function evidenceById(dossier: Dossier, evidenceId: string) {
  return dossier.observations.find((row) => row.evidence_id === evidenceId);
}
