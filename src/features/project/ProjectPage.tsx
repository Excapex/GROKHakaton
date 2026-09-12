import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Dossier, Evidence, Finding } from "../../../contracts/types.ts";
import { StatePanel } from "../../components/generated/StatePanel.tsx";
import { DocumentsPage } from "../documents/DocumentsPage.tsx";
import { RevisionsPage } from "../documents/RevisionsPage.tsx";
import { FindingCard } from "../dossier/FindingCard.tsx";
import {
  FINDING_STATUS_LABELS,
} from "../dossier/dossierView.ts";
import { slotLabel } from "../dossier/engineLabels.ts";
import { mappedRuleCopy } from "../../../convex/lib/perception/mappedRuleCopy.ts";
import { ModulesPage } from "../modules/ModulesPage.tsx";
import type { SelectedReviewModule } from "../shell/projectFacts.ts";

type WorkspaceDocument = {
  _id: Id<"documents">;
  revisionId: Id<"revisions">;
  filename: string;
  kind: string;
  sha256: string;
  parsePolicy: "ingest" | "store_only";
  byteSize: number;
  downloadUrl: string | null;
};

type WorkspaceRevision = {
  _id: Id<"revisions">;
  index: number;
  createdAt: number;
};

type WorkspaceEvent = {
  _id: string;
  type: string;
  message: string;
  createdAt: number;
};

export function ProjectPage({
  projectId,
  revisionId,
  revisions,
  documents,
  allDocuments,
  events,
  onReviewAccepted,
}: {
  projectId: Id<"projects">;
  revisionId: Id<"revisions"> | null;
  revisions: WorkspaceRevision[];
  documents: WorkspaceDocument[];
  allDocuments: WorkspaceDocument[];
  events: WorkspaceEvent[];
  onReviewAccepted: (module: SelectedReviewModule) => void;
}) {
  const payload = useQuery(api.dossiers.getActive, { projectId });
  const threads = useQuery(api.questions.listForProject, { projectId });
  const changeSets = useQuery(api.changeSets.listForProject, { projectId });
  const [filter, setFilter] = useState<Finding["status"] | "all">("all");

  const dossier = (payload?.dossier ?? null) as Dossier | null;
  const evidence = (payload && "evidence" in payload
    ? (payload.evidence as Evidence[] | undefined)
    : []) ?? [];
  const findings = dossier?.findings ?? [];
  const findingIds = findings.map((row) => row.id);
  const visible =
    filter === "all"
      ? findings
      : findings.filter((row) => row.status === filter);

  const counts = {
    all: findings.length,
    fail: findings.filter((row) => row.status === "fail").length,
    conflict: findings.filter((row) => row.status === "conflict").length,
    unknown: findings.filter((row) => row.status === "unknown").length,
    pass: findings.filter((row) => row.status === "pass").length,
  };

  return (
    <section className="page-content project-page" aria-label="Projekat">
      <div className="page-heading">
        <h2>Projekat</h2>
        <p>
          Ubaci dokumentaciju, izaberi tip pregleda i pročitaj primedbe tamo gde
          stoje. Kad ispraviš projekat, ubaci novi set — otvara se sledeća
          provera.
        </p>
      </div>

      <section className="project-section" aria-labelledby="sec-docs">
        <h3 id="sec-docs">1. Dokumentacija</h3>
        <DocumentsPage
          projectId={projectId}
          revisionId={revisionId}
          documents={documents}
          embedded
        />
      </section>

      <section className="project-section" aria-labelledby="sec-type">
        <h3 id="sec-type">2. Tip pregleda</h3>
        <p className="dossier-hint">
          Sada je aktivan samo pregled zaštite od požara. Ostali moduli ostaju
          planirani i ne izmišljaju nalaze.
        </p>
        <ModulesPage
          projectId={projectId}
          revisionId={revisionId}
          onReviewAccepted={onReviewAccepted}
        />
      </section>

      <section className="project-section" aria-labelledby="sec-findings">
        <h3 id="sec-findings">3. Primedbe</h3>
        {payload === undefined || threads === undefined || changeSets === undefined ? (
          <StatePanel
            tone="progress"
            label="Učitavanje"
            title="Primedbe se učitavaju"
            message="Čitamo nalaze iz dokumentacije tekuće provere."
          />
        ) : !payload || payload.pipelineReady === false ? (
          <StatePanel
            tone="warning"
            label="Čeka dokumentaciju"
            title="Još nema primedbi"
            message={
              payload?.reason ??
              "Ubaci dokumentaciju i pokreni pregled. Prazan spisak nije potvrda usaglašenosti."
            }
          />
        ) : (
          <>
            {payload.source === "anon_fixture" && (
              <StatePanel
                tone="warning"
                label="Primer"
                title="Nalazi nisu iz vaših dokumenata"
                message={payload.sourceNote ?? ""}
              />
            )}
            <div className="finding-filters" role="tablist" aria-label="Filter primedbi">
              {(
                [
                  ["all", `Sve (${counts.all})`],
                  ["fail", `${FINDING_STATUS_LABELS.fail} (${counts.fail})`],
                  [
                    "conflict",
                    `${FINDING_STATUS_LABELS.conflict} (${counts.conflict})`,
                  ],
                  [
                    "unknown",
                    `${FINDING_STATUS_LABELS.unknown} (${counts.unknown})`,
                  ],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  className={filter === id ? "is-selected" : ""}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {visible.length === 0 ? (
              <p className="availability-note">Nema primedbi u ovom filteru.</p>
            ) : (
              <ul className="finding-cards">
                {visible.map((finding) => (
                  <li key={finding.id}>
                    <FindingCard
                      projectId={projectId}
                      finding={finding}
                      findingIds={findingIds}
                      dossier={dossier!}
                      evidence={evidence}
                      documents={documents}
                      threads={threads}
                      changeSets={changeSets}
                      revisions={revisions}
                      review={payload}
                    />
                  </li>
                ))}
              </ul>
            )}
            {dossier && <CoverageBlock dossier={dossier} />}
          </>
        )}
      </section>

      <section className="project-section" aria-labelledby="sec-history">
        <h3 id="sec-history">4. Istorija provera</h3>
        <RevisionsPage
          projectId={projectId}
          activeRevisionId={revisionId}
          revisions={revisions}
          documents={allDocuments}
          events={events}
          embedded
        />
      </section>
    </section>
  );
}

function CoverageBlock({ dossier }: { dossier: Dossier }) {
  return (
    <dl className="coverage-list">
      <div>
        <dt>Provereno</dt>
        <dd>
          {dossier.coverage.checked_rules.length > 0
            ? dossier.coverage.checked_rules
                .map((id) => mappedRuleCopy(id)?.section ?? id)
                .join("; ")
            : "Nijedno pravilo"}
        </dd>
      </div>
      <div>
        <dt>Preskočeno</dt>
        <dd>
          {dossier.coverage.skipped_rules.length > 0
            ? dossier.coverage.skipped_rules
                .map((id) => mappedRuleCopy(id)?.section ?? id)
                .join("; ")
            : "Ništa nije preskočeno"}
        </dd>
      </div>
      <div>
        <dt>Nije pronađeno</dt>
        <dd>
          {dossier.coverage.unknown_slots.length > 0
            ? dossier.coverage.unknown_slots.map(slotLabel).join(", ")
            : "Svi traženi podaci su pronađeni"}
        </dd>
      </div>
    </dl>
  );
}
