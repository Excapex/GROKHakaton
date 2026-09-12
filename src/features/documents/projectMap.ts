import { SCHEMA_VERSION } from "../../../contracts/schema_version.ts";
import type { Discipline, Phase, Project } from "../../../contracts/types.ts";
import { DISCIPLINE_LABELS, PHASE_LABELS } from "../shell/disciplines.ts";

export const DEMO_PROJECT_CODE = "PZI-DEMO-01-2026";

function asDiscipline(value: string): Discipline {
  return value in DISCIPLINE_LABELS ? (value as Discipline) : "other";
}

function asPhase(value: string): Phase {
  return value in PHASE_LABELS ? (value as Phase) : "other";
}

export function toContractProject(row: {
  _id: string;
  name: string;
  discipline: string;
  phase: string;
  activeRevisionId: string | null;
}): Project {
  return {
    schema_version: SCHEMA_VERSION,
    id: row._id,
    name: row.name,
    discipline: asDiscipline(row.discipline),
    phase: asPhase(row.phase),
    active_revision_id: row.activeRevisionId,
  };
}

/**
 * Krug provere, ne izmena projekta. Inženjeru „revizija" znači promenu
 * dokumentacije, a ovde označava koliko je puta dokumentacija pregledana.
 */
export function revisionLabel(index: number): string {
  return `Provera ${index}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const KIND_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
  dwg: "DWG",
  dwfx: "DWFX",
};
