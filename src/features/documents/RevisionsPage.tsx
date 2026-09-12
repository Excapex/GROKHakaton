import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Dossier, Evidence } from "../../../contracts/types.ts";
import { Icon } from "../../components/generated/Icon.tsx";
import {
  LIFECYCLE_LABELS,
  pageForFinding,
} from "../dossier/dossierView.ts";
import { eventLabel, findingTitle } from "../dossier/engineLabels.ts";
import { formatBytes, KIND_LABELS, revisionLabel } from "./projectMap.ts";
import { ChangeSetLifecycleActions } from "../tasks/ChangeSetLifecycleActions.tsx";
import { changeSetsVisibleOnRevision } from "../tasks/changeSetLifecycle.ts";

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
  embedded = false,
}: {
  projectId: Id<"projects">;
  activeRevisionId: Id<"revisions"> | null;
  revisions: WorkspaceRevision[];
  documents: WorkspaceDocument[];
  events: WorkspaceEvent[];
  embedded?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<Id<"revisions"> | null>(
    activeRevisionId,
  );

  return (
    <section
      className={embedded ? "embedded-section" : "page-content"}
      aria-label="Provere"
    >
      {!embedded && (
        <div className="page-heading">
          <h2>Provere</h2>
          <p>
            Provera je jedan krug pregleda dokumentacije. Kad ispravite projekat
            i ubacite novu dokumentaciju, otvara se sledeća provera i vidi se šta
            se promenilo. Originali starijih provera ostaju nedirnuti.
          </p>
        </div>
      )}

      {revisions.length === 0 ? (
        <p className="availability-note">
          <Icon name="info-circle" size={16} />
          Prva provera nastaje kad na stranici Dokumenti ubacite prvi set
          dokumentacije. Prazna provera se ne otvara.
        </p>
      ) : (
        <ol className="revision-chain">
          {[...revisions].reverse().map((revision) => {
            const files = documents.filter(
              (doc) => doc.revisionId === revision._id,
            );
            const active = revision._id === activeRevisionId;
            const open = revision._id === openIndex;
            return (
              <li
                key={revision._id}
                className={`check-card${active ? " is-active" : ""}${
                  files.length === 0 ? " is-empty" : ""
                }`}
              >
                <button
                  type="button"
                  className="check-head"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : revision._id)}
                >
                  <span className="check-number" aria-hidden="true">
                    {revision.index}
                  </span>
                  <span className="check-title">
                    <strong>{revisionLabel(revision.index)}</strong>
                    <small>
                      {new Date(revision.createdAt).toLocaleString("sr-Latn")} ·{" "}
                      {files.length === 0
                        ? "bez dokumenata"
                        : `${files.length} ${files.length === 1 ? "dokument" : "dokumenta"}`}
                    </small>
                  </span>
                  {active && <span className="status-badge">Tekuća</span>}
                  <Icon name={open ? "chevron-down" : "chevron-right"} size={16} />
                </button>

                {open && (
                  <div className="check-body">
                    {files.length === 0 ? (
                      <p className="availability-note">
                        <Icon name="info-circle" size={16} />
                        Ova provera je otvorena bez dokumenata, pa nije ni
                        pokrenuta. Nove provere se otvaraju samo uz ubačenu
                        dokumentaciju.
                      </p>
                    ) : (
                      <ul>
                        {files.map((doc) => (
                          <li key={doc._id}>
                            <span>
                              {doc.filename} ·{" "}
                              {KIND_LABELS[doc.kind] ?? doc.kind} ·{" "}
                              {formatBytes(doc.byteSize)}
                            </span>
                            <code className="hash-value">{doc.sha256}</code>
                            {doc.downloadUrl && (
                              <a
                                href={doc.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Otvori original
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <RevisionDiff
                      projectId={projectId}
                      revisionId={revision._id}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {events.length > 0 && (
        <div className="event-log">
          <h3>Događaji</h3>
          <ol>
            {events.map((event) => (
              <li key={event._id}>
                <span className="kind-chip">{eventLabel(event.type)}</span>
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
  const changeSets = useQuery(api.changeSets.listForProject, { projectId });
  const threads = useQuery(api.questions.listForProject, { projectId });
  const workspace = useQuery(api.projects.getWorkspace, { projectId });
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
  const findingIds = dossier?.findings.map((row) => row.id) ?? [];

  if (
    diff === undefined ||
    changeSets === undefined ||
    threads === undefined ||
    workspace === undefined
  ) {
    return (
      <div className="revision-diff">
        <h3>Šta se promenilo prema prethodnoj proveri</h3>
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
        Šta se promenilo prema prethodnoj proveri
        {diff.previousIndex !== null && (
          <span className="status-badge">
            Provera {diff.previousIndex} → {diff.revisionIndex}
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

      <h4>Po kom predlogu ispravke</h4>
      <p className="availability-note">
        <Icon name="info-circle" size={16} />
        Označi primenjeno ide samo posle kopija na novoj reviziji.
        Proveri novu reviziju ide samo ako je hash promenjen i
        nalaz zatvoren na ingestovanom čitanju. Integritet šeme nije semantika.
        Veza ide po nazivu fajla, jer original ostaje na prethodnoj reviziji.
      </p>
      {(() => {
        const visible = changeSetsVisibleOnRevision(
          changeSets,
          workspace.documents,
          revisionId,
        );
        const findingByQuestion = new Map(
          threads.map(({ question }) => [String(question._id), question.findingId]),
        );
        if (visible.length === 0) {
          return (
            <p className="availability-note">
              <Icon name="info-circle" size={16} />
              Nema predloga ispravke vezanog za fajl na ovoj reviziji. Zamenjen
              fajl bez predloga ostaje ručna izmena projektanta.
            </p>
          );
        }
        return (
          <ul className="diff-list">
            {visible.map((row) => {
              const findingId = findingByQuestion.get(String(row.questionId)) ?? null;
              const finding = findingId
                ? dossier?.findings.find((item) => item.id === findingId)
                : undefined;
              const page =
                dossier && finding
                  ? pageForFinding(dossier, finding, evidence)
                  : null;
              const original = workspace.documents.find(
                (doc) => doc._id === row.documentId,
              );
              return (
                <li key={row._id}>
                  <span className="kind-chip">
                    {LIFECYCLE_LABELS[row.lifecycle] ?? row.lifecycle}
                  </span>
                  <span>
                    {original?.filename ?? "dokument"}
                    {findingId
                      ? ` · ${findingTitle(findingId, findingIds)}`
                      : ""}
                    {page !== null ? ` · strana ${page}` : " · strana nije zabeležena"}
                  </span>
                  {row.designTask && (
                    <span className="inline-status">{row.designTask}</span>
                  )}
                  <ChangeSetLifecycleActions
                    changeSet={row}
                    documents={workspace.documents}
                    revisions={workspace.revisions}
                    findingId={findingId}
                    review={review}
                  />
                </li>
              );
            })}
          </ul>
        );
      })()}
    </div>
  );
}
