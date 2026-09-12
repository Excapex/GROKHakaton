import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Icon } from "../../components/generated/Icon.tsx";
import { formatBytes, KIND_LABELS, revisionLabel } from "./projectMap.ts";

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
            indeksu i ostaju otvorljivi posle osvežavanja.
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
