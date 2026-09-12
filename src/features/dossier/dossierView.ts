import type {
  ChangeLifecycle,
  Dossier,
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

export const FINDING_STATUS_LABELS: Record<Finding["status"], string> = {
  pass: "Prošlo",
  fail: "Nije usklađeno",
  conflict: "Konflikt",
  unknown: "Nepoznato",
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

export function evidenceById(dossier: Dossier, evidenceId: string) {
  return dossier.observations.find((row) => row.evidence_id === evidenceId);
}
