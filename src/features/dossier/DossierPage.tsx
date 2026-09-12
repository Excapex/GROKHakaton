import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Dossier, Finding } from "../../../contracts/types.ts";
import { Icon } from "../../components/generated/Icon.tsx";
import { StatePanel } from "../../components/generated/StatePanel.tsx";
import {
  FINDING_STATUS_LABELS,
  LIFECYCLE_LABELS,
  LIFECYCLE_ORDER,
  isConflictFinding,
  observationsForFinding,
} from "./dossierView.ts";
import { isCadKind } from "../../lib/fileKind.ts";
import { ChangeSetLifecycleActions } from "../tasks/ChangeSetLifecycleActions.tsx";

type SourceDoc = {
  filename: string;
  kind: string;
  sha256: string;
};

export function DossierPage({
  projectId,
  documents,
}: {
  projectId: Id<"projects">;
  documents: SourceDoc[];
}) {
  const payload = useQuery(api.dossiers.getActive, { projectId });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((value) => Math.min(3, Number((value + 0.1).toFixed(2))));
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))));
      }
      if (event.key === "0") setZoom(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (payload === undefined) {
    return (
      <div className="state-wrap state-page">
        <StatePanel
          tone="progress"
          label="Učitavanje"
          title="Dosije se učitava"
          message="Tražimo nalaze i dokaze koje je engine upisao za ovaj predmet."
        />
      </div>
    );
  }

  const dossier = (payload?.dossier ?? null) as Dossier | null;
  const findings = dossier?.findings ?? [];
  const selected =
    findings.find((row) => row.id === selectedId) ?? findings[0] ?? null;

  return (
    <section className="page-content dossier-page" aria-label="Pregled projekta">
      <div className="page-heading">
        <h2>Pregled projekta</h2>
        <p>
          Nalazi levo, citiran original u centru, akcije desno. Strana i region
          dolaze samo iz ingestovanih artefakata — model ih ne izmišlja.
        </p>
      </div>

      {!payload || payload.pipelineReady === false ? (
        <StatePanel
          tone="warning"
          label="Delimično"
          title="Dosije još nije upisan"
          message={
            payload?.reason ??
            "Nema nalaza jer obrada dokumenata nije povezana. Prazan dosije nije prolaz."
          }
        />
      ) : payload.source === "anon_fixture" ? (
        <StatePanel
          tone="warning"
          label="Anon fixture"
          title="Nalazi nisu iz vaših dokumenata"
          message={payload.sourceNote ?? ""}
        />
      ) : null}

      <div className="dossier-grid">
        <FindingsColumn
          findings={findings}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
        <EvidenceColumn
          dossier={dossier}
          finding={selected}
          documents={documents}
          zoom={zoom}
          onZoom={setZoom}
        />
        <ActionsColumn
          projectId={projectId}
          dossier={dossier}
          finding={selected}
          documents={documents}
          review={payload}
        />
      </div>
    </section>
  );
}

function FindingsColumn({
  findings,
  selectedId,
  onSelect,
}: {
  findings: Finding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="dossier-col" aria-label="Nalazi">
      <h3>Nalazi</h3>
      {findings.length === 0 ? (
        <p className="dossier-empty">
          Lista je prazna dok engine ne upiše nalaz sa dokazom.
        </p>
      ) : (
        <ul className="finding-list">
          {findings.map((finding) => (
            <li key={finding.id}>
              <button
                type="button"
                className={finding.id === selectedId ? "is-selected" : ""}
                onClick={() => onSelect(finding.id)}
              >
                <span className={`kind-chip status-${finding.status}`}>
                  {FINDING_STATUS_LABELS[finding.status]}
                </span>
                <strong>{finding.rule_id}</strong>
                <span>{finding.rationale}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function EvidenceColumn({
  dossier,
  finding,
  documents,
  zoom,
  onZoom,
}: {
  dossier: Dossier | null;
  finding: Finding | null;
  documents: SourceDoc[];
  zoom: number;
  onZoom: (value: number) => void;
}) {
  const observations =
    dossier && finding ? observationsForFinding(dossier, finding) : [];
  const conflict = finding ? isConflictFinding(finding) : false;

  return (
    <div className="dossier-col dossier-evidence" aria-label="Citiran original">
      <div className="evidence-toolbar">
        <h3>Original</h3>
        <div className="zoom-controls" aria-label="Uvećanje crteža">
          <button type="button" onClick={() => onZoom(Math.max(0.5, zoom - 0.1))}>
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => onZoom(Math.min(3, zoom + 0.1))}>
            +
          </button>
        </div>
      </div>
      <p className="dossier-hint">
        Tastatura: + / − zoom, 0 reset. Region se crta preko renderovane strane
        kada ingest dostavi <code>page_no</code>.
      </p>
      {conflict && observations.length >= 2 ? (
        <div className="conflict-pair">
          {observations.slice(0, 2).map((observation) => (
            <article key={observation.id}>
              <h4>{observation.slot}</h4>
              <p>
                {observation.value}
                {observation.unit ? ` ${observation.unit}` : ""}
              </p>
              <p className="page-meta">
                dokaz {observation.evidence_id}
                {observation.element_id
                  ? ` · element ${observation.element_id}`
                  : ""}
              </p>
            </article>
          ))}
        </div>
      ) : finding && observations[0] ? (
        <article
          className="single-evidence"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          <h4>{observations[0].slot}</h4>
          <p>
            {observations[0].value}
            {observations[0].unit ? ` ${observations[0].unit}` : ""}
          </p>
        </article>
      ) : (
        <div className="evidence-placeholder">
          <Icon name="file-text" size={28} />
          <p>
            Nema citirane strane. Ingest mora da ostavi fizički <code>page_no</code>{" "}
            i render; ovde se ne crta lažan isečak.
          </p>
          {documents.length > 0 && (
            <ul>
              {documents.map((doc) => (
                <li key={doc.sha256}>
                  {doc.filename} · {doc.kind} · {doc.sha256.slice(0, 12)}…
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ActionsColumn({
  projectId,
  dossier,
  finding,
  documents,
  review,
}: {
  projectId: Id<"projects">;
  dossier: Dossier | null;
  finding: Finding | null;
  documents: SourceDoc[];
  review: {
    pipelineReady?: boolean;
    source?: string | null;
    dossier?: Dossier | null;
    review_run?: { revision_id?: string };
  } | null;
}) {
  const changeSets = useQuery(api.changeSets.listForProject, { projectId });
  const threads = useQuery(api.questions.listForProject, { projectId });
  const workspace = useQuery(api.projects.getWorkspace);
  const relatedIds = new Set(
    (threads ?? [])
      .filter(({ question }) => question.findingId === finding?.id)
      .map(({ question }) => String(question._id)),
  );
  const related = (changeSets ?? []).filter((row) =>
    relatedIds.has(String(row.questionId)),
  );
  const currentLifecycle = related[0]?.lifecycle;
  const cadEvidence = documents.some((doc) => isCadKind(doc.kind));

  return (
    <aside className="dossier-col" aria-label="Akcije">
      <h3>Akcije</h3>
      <p className="dossier-hint">
        Prihvaćeno nije primenjeno i nije provereno. Četiri stanja ostaju
        odvojena. Prihvati nikad ne upisuje verified.
      </p>
      <ol className="lifecycle-rail" aria-label="Životni ciklus izmene">
        {LIFECYCLE_ORDER.map((state) => (
          <li key={state}>
            <span
              className="kind-chip"
              aria-current={state === currentLifecycle ? "step" : undefined}
            >
              {LIFECYCLE_LABELS[state]}
            </span>
          </li>
        ))}
      </ol>
      <p>
        <a href="#zadaci">Otvori Zadatke</a> za Prihvati, Označi primenjeno i
        Proveri novu reviziju. Ovde se ne izmišlja finding ID, page_no ni patch.
      </p>
      {cadEvidence && (
        <p className="dossier-hint">
          CAD original nema patch akciju. DWG/DWFX ostaje zadatak projektanta.
        </p>
      )}
      {related.map((row) => (
        <div key={row._id}>
          <p className="dossier-hint">
            ChangeSet {LIFECYCLE_LABELS[row.lifecycle] ?? row.lifecycle} · odobrenje{" "}
            {row.approvalState}. Prihvati je na Zadacima; ovde se meri primena i
            provera, bez izmišljenog ID-a nalaza.
          </p>
          {workspace && (
            <ChangeSetLifecycleActions
              changeSet={row}
              documents={workspace.documents}
              revisions={workspace.revisions}
              findingId={finding?.id ?? null}
              review={review}
            />
          )}
        </div>
      ))}
      {dossier ? (
        <dl className="coverage-list">
          <div>
            <dt>Obuhvat</dt>
            <dd>{dossier.coverage.checked_rules.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Preskočeno</dt>
            <dd>{dossier.coverage.skipped_rules.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Nepoznato</dt>
            <dd>{dossier.coverage.unknown_slots.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Integritet</dt>
            <dd>
              {dossier.integrity_report.ok ? "struktura ok" : "struktura nije ok"}
              {" — nije semantika ni verified"}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="dossier-empty">
          Nema otvorenog pitanja ni zadatka dok nema nalaza
          {finding ? ` za ${finding.rule_id}` : ""}.
        </p>
      )}
    </aside>
  );
}
