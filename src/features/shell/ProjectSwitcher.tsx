import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Icon } from "../../components/generated/Icon.tsx";
import { DISCIPLINE_LABELS, PHASE_LABELS } from "./disciplines.ts";

export type ProjectOption = {
  _id: Id<"projects">;
  name: string;
  discipline: string;
  phase: string;
  isDemo: boolean;
  revisionCount: number;
  lastRevisionAt: number | null;
};

export function ProjectSwitcher({
  projects,
  selectedId,
  onSelect,
}: {
  projects: readonly ProjectOption[];
  selectedId: Id<"projects"> | null;
  onSelect: (projectId: Id<"projects">) => void;
}) {
  const createProject = useMutation(api.projects.create);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("architecture");
  const [phase, setPhase] = useState("PZI");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setError("Unesi naziv predmeta.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const id = await createProject({ name, discipline, phase });
      onSelect(id);
      setName("");
      setAdding(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Predmet nije napravljen.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="project-picker">
      <label className="project-picker-field">
        <Icon name="building" size={18} />
        <select
          className="rail-label"
          aria-label="Izaberi predmet"
          value={selectedId ?? ""}
          onChange={(event) => onSelect(event.target.value as Id<"projects">)}
        >
          {projects.length === 0 && <option value="">Nema predmeta</option>}
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
              {project.revisionCount > 0
                ? ` · ${project.revisionCount} ${provereWord(project.revisionCount)}`
                : " · bez provere"}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={15} />
      </label>

      {adding ? (
        <form
          className="project-picker-new rail-label"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Naziv predmeta"
            aria-label="Naziv predmeta"
            autoFocus
          />
          <div className="project-picker-row">
            <select
              value={discipline}
              onChange={(event) => setDiscipline(event.target.value)}
              aria-label="Disciplina predmeta"
            >
              {Object.entries(DISCIPLINE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={phase}
              onChange={(event) => setPhase(event.target.value)}
              aria-label="Faza projekta"
            >
              {Object.entries(PHASE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {error && <span className="inline-error">{error}</span>}
          <div className="project-picker-row">
            <button
              className="button button-primary"
              type="submit"
              disabled={busy}
            >
              Napravi
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
            >
              Odustani
            </button>
          </div>
        </form>
      ) : (
        <button
          className="project-picker-add rail-label"
          type="button"
          onClick={() => setAdding(true)}
        >
          <span aria-hidden="true">+</span>
          <span>Novi predmet</span>
        </button>
      )}
    </div>
  );
}

function provereWord(count: number): string {
  if (count === 1) return "provera";
  if (count < 5) return "provere";
  return "provera";
}
