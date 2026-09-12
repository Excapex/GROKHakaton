import type { Project } from "../../../contracts/types.ts";
import type { ProjectFact } from "../../components/generated/AppShell.tsx";
import { DISCIPLINE_LABELS, PHASE_LABELS } from "./disciplines.ts";

/** Stručni postupak koji je backend prihvatio za tekući predmet. */
export type SelectedReviewModule = {
  domain_pack_id: string;
  name: string;
  pack_version: string;
};

const PROJECT_FIELD_NOTE = "polje predmeta";
const REVIEW_FIELD_NOTE = "polje pregleda";

export const FIELDS_SEPARATION_NOTE =
  "Disciplina opisuje vaš projekat. Stručni modul određuje postupak pregleda i bira se nezavisno od discipline.";

export function buildProjectFacts(
  project: Project,
  revisionLabel: string | null,
  selectedModule: SelectedReviewModule | null,
): ProjectFact[] {
  return [
    {
      id: "discipline",
      label: "Disciplina",
      value: DISCIPLINE_LABELS[project.discipline],
      code: project.discipline,
      note: PROJECT_FIELD_NOTE,
    },
    {
      id: "phase",
      label: "Faza",
      value: PHASE_LABELS[project.phase],
      code: project.phase,
      note: PROJECT_FIELD_NOTE,
    },
    {
      id: "revision",
      label: "Aktivna revizija",
      value: revisionLabel ?? "Nema revizije",
      code: project.active_revision_id ?? "—",
      note: PROJECT_FIELD_NOTE,
    },
    {
      id: "domain_pack",
      label: "Postupak pregleda",
      value: selectedModule?.name ?? "Nije pokrenut",
      code: selectedModule
        ? `${selectedModule.domain_pack_id} ${selectedModule.pack_version}`
        : "—",
      note: REVIEW_FIELD_NOTE,
    },
  ];
}
