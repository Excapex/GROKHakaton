import { useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Dossier, Evidence } from "../../../contracts/types.ts";
import { Icon } from "../../components/generated/Icon.tsx";
import {
  LIFECYCLE_LABELS,
  pageForFinding,
} from "../dossier/dossierView.ts";
import { formatBytes, KIND_LABELS, revisionLabel } from "./projectMap.ts";
import {
  evaluateMarkApplied,
  evaluateMarkVerified,
  readChangeSetLifecycleApi,
  type FindingSnapshot,
} from "../tasks/changeSetLifecycle.ts";

type WorkspaceRevision = {
  _id: Id<"revisions">;
  index: number;
  createdAt: number;
};

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

type WorkspaceEvent = {
  _id: string;
  type: string;
  message: string;
  createdAt: number;
};

export function RevisionsPage({
  projectId,
  activeRevisionId,
  revisions,
  documents,
  events,
}: {
  projectId: Id<"projects">;
  activeRevisionId: Id<"revisions"> | null;
  revisions: WorkspaceRevision[];
  documents: WorkspaceDocument[];
  events: WorkspaceEvent[];
}) {
  const createNext = useMutation(api.revisions.createNext);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function openNextRevision() {
    setPending(true);
    setError(null);
    try {
      await createNext({ projectId });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Revizija nije otvorena.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="page-content" aria-label="Revizije">
      <div className="page-heading page-heading-split">
        <div>
          <h2>Revizije</h2>
          <p>
            Lanac se dodaje. Originali prethodne revizije ostaju na svom
            indeksu i ostaju otvorljivi posle osvežavanja. Isti hash na novoj
            reviziji nije provera. Prihvaćeno nije primenjeno.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          disabled={pending}
          onClick={() => void openNextRevision()}
        >
          Nova revizija
          <Icon name="history" size={18} />
        </button>
      </div>

      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}

      {revisions.length === 0 ? (
        <p className="availability-note">
          <Icon name="info-circle" size={16} />
          Lanac počinje prvim otpremanjem na stranici Dokumenti.
        </p>
      ) : (
        <ol className="revision-chain">
          {[...revisions].reverse().map((revision) => {
            const files = documents.filter(
              (doc) => doc.revisionId === revision._id,
            );
            const active = revision._id === activeRevisionId;
            return (
              <li key={revision._id} className={active ? "is-active" : ""}>
                <header>
                  <h3>{revisionLabel(revision.index)}</h3>
                  <time dateTime={new Date(revision.createdAt).toISOString()}>
                    {new Date(revision.createdAt).toLocaleString("sr-Latn")}
                  </time>
                  {active && <span className="status-badge">Aktivna</span>}
                </header>
                {files.length === 0 ? (
                  <p>
                    Čeka originale. Stari fajlovi ostaju na prethodnoj reviziji.
                  </p>
                ) : (
                  <ul>
                    {files.map((doc) => (
                      <li key={doc._id}>
                        <span>
                          {doc.filename} · {KIND_LABELS[doc.kind] ?? doc.kind} ·{" "}
                          {formatBytes(doc.byteSize)}
                        </span>
                        <code className="hash-value">{doc.sha256}</code>
                        {doc.downloadUrl && (
                          <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                            Otvori original
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {activeRevisionId && (
        <RevisionDiff projectId={projectId} revisionId={activeRevisionId} />
      )}

      {events.length > 0 && (
        <div className="event-log">
          <h3>Događaji</h3>
          <ol>
            {events.map((event) => (
              <li key={event._id}>
                <span className="kind-chip">{event.type}</span>
                <span>{event.message}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

const DIFF_LABELS: Record<string, string> = {
  added: "Novo",
  replaced: "Zamenjeno",
  unchanged: "Nepromenjeno",
  carried_over: "Preneto iz prethodne",
};

function RevisionDiff({
  projectId,
  revisionId,
}: {
  projectId: Id<"projects">;
  revisionId: Id<"revisions">;
}) {
  const diff = useQuery(api.revisions.diff, { projectId, revisionId });
  const convex = useConvex();
  const lifecycleApi = readChangeSetLifecycleApi(api.changeSets);
  const changeSets = useQuery(api.changeSets.listForProject, { projectId });
  const workspace = useQuery(api.projects.getWorkspace);
  // The payload widens once the engine writes a dossier; page stays null until then.
  const review = useQuery(api.dossiers.getActive, { projectId }) as
    | {
        pipelineReady: boolean;
        source?: string;
        dossier: Dossier | null;
        evidence?: Evidence[];
        review_run?: { revision_id?: string };
      }
    | null
    | undefined;
  const dossier = review?.pipelineReady ? review.dossier : null;
  const evidence = review?.evidence ?? [];

  if (diff === undefined || changeSets === undefined || workspace === undefined) {
    return (
      <div className="revision-diff">
        <h3>Razlika prema prethodnoj reviziji</h3>
        <p className="availability-note">
          <Icon name="info-circle" size={16} />
          Poređenje se učitava.
        </p>
      </div>
    );
  }
  if (diff === null || workspace === null) return null;

  const changed = diff.entries.filter((row) => row.state !== "unchanged");

  return (
    <div className="revision-diff">
      <h3>
        Razlika prema prethodnoj reviziji
        {diff.previousIndex !== null && (
          <span className="status-badge">
            Revizija {diff.previousIndex} → {diff.revisionIndex}
          </span>
        )}
      </h3>

      {diff.partialReason && (
        <p className="availability-note">
          <Icon name="info-circle" size={16} />
          {diff.partialReason}
        </p>
      )}

      {changed.length === 0 ? (
        <p className="availability-note">
          <Icon name="info-circle" size={16} />
          Nijedan original nije zamenjen. Poređenje ide po nazivu i sha256, pa
          ista datoteka nije izmena i nije nova provera.
        </p>
      ) : (
        <ul className="diff-list">
          {changed.map((row) => (
            <li key={`${row.documentId}-${row.state}`}>
              <span className="kind-chip">{DIFF_LABELS[row.state]}</span>
              <span>{row.filename}</span>
              <code className="hash-value">
                {row.previousSha256
                  ? `${row.previousSha256.slice(0, 12)}… → ${row.sha256.slice(0, 12)}…`
                  : `${row.sha256.slice(0, 12)}…`}
              </code>
            </li>
          ))}
        </ul>
      )}

      <h4>Po kom ChangeSet-u</h4>
      <p className="availability-note">
        <Icon name="info-circle" size={16} />
        Označi primenjeno zove markApplied samo posle kopija na novoj reviziji.
        Proveri novu reviziju zove markVerified samo ako je hash promenjen i
        nalaz zatvoren na ingestovanom čitanju. Integritet šeme nije semantika.
      </p>
      {diff.changeSets.length === 0 ? (
        <p className="availability-note">
          <Icon name="info-circle" size={16} />
          Nema prihvaćenog paketa izmena za ovu reviziju. Zamenjen fajl bez
          ChangeSet-a ostaje ručna izmena projektanta.
        </p>
      ) : (
        <ul className="diff-list">
          {diff.changeSets.map((entry) => {
            const finding = dossier?.findings.find(
              (row) => row.id === entry.findingId,
            );
            const page =
              dossier && finding
                ? pageForFinding(dossier, finding, evidence)
                : null;
            const row = changeSets.find((item) => item._id === entry.changeSetId);
            const applyGate = row
              ? evaluateMarkApplied({
                  hasApi: lifecycleApi.hasMarkApplied,
                  changeSet: row,
                  documents: workspace.documents,
                  revisions: workspace.revisions,
                })
              : { ok: false as const, reason: "ChangeSet nije u listi predmeta." };
            const verifyGate = row
              ? evaluateMarkVerified({
                  hasApi: lifecycleApi.hasMarkVerified,
                  changeSet: row,
                  documents: workspace.documents,
                  revisions: workspace.revisions,
                  findingId: entry.findingId,
                  pipelineReady: review?.pipelineReady === true,
                  dossierSource: review?.source ?? "none",
                  findings: (dossier?.findings ?? []) as FindingSnapshot[],
                  reviewRevisionId: review?.review_run?.revision_id ?? null,
                })
              : { ok: false as const, reason: "ChangeSet nije u listi predmeta." };
            return (
              <li key={entry.changeSetId}>
                <span className="kind-chip">
                  {LIFECYCLE_LABELS[entry.lifecycle] ?? entry.lifecycle}
                </span>
                <span>
                  {entry.filename}
                  {entry.findingId ? ` · nalaz ${entry.findingId}` : ""}
                  {page !== null ? ` · strana ${page}` : " · strana nije zabeležena"}
                </span>
                {entry.designTask && (
                  <span className="inline-status">{entry.designTask}</span>
                )}
                {row && (
                  <div className="task-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={!applyGate.ok}
                      onClick={() => {
                        if (!applyGate.ok || !lifecycleApi.markApplied) return;
                        void convex.mutation(lifecycleApi.markApplied, {
                          changeSetId: row._id,
                          revisionId: applyGate.revisionId as Id<"revisions">,
                        });
                      }}
                    >
                      Označi primenjeno
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={!verifyGate.ok}
                      onClick={() => {
                        if (!verifyGate.ok || !lifecycleApi.markVerified) return;
                        void convex.mutation(lifecycleApi.markVerified, {
                          changeSetId: row._id,
                          revisionId: verifyGate.revisionId as Id<"revisions">,
                        });
                      }}
                    >
                      Proveri novu reviziju
                    </button>
                  </div>
                )}
                {!applyGate.ok && <p className="dossier-hint">{applyGate.reason}</p>}
                {!verifyGate.ok && <p className="dossier-hint">{verifyGate.reason}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
