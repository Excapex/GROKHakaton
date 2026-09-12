import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Icon } from "../../components/generated/Icon.tsx";
import { StatePanel } from "../../components/generated/StatePanel.tsx";
import { isCadKind, policyForFilename } from "../../lib/fileKind.ts";
import { sha256Hex } from "../../lib/sha256.ts";
import { parsePolicyLabel } from "../dossier/engineLabels.ts";
import { formatBytes, KIND_LABELS } from "./projectMap.ts";

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

type QueueItem = {
  name: string;
  status: "hashing" | "uploading" | "saved" | "error";
  detail: string;
};

export function DocumentsPage({
  projectId,
  revisionId,
  documents,
  embedded = false,
}: {
  projectId: Id<"projects">;
  revisionId: Id<"revisions"> | null;
  documents: WorkspaceDocument[];
  embedded?: boolean;
}) {
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const register = useMutation(api.documents.register);
  const createNext = useMutation(api.revisions.createNext);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  /**
   * `asNewCheck` znači da ovaj set dokumenata pokreće novi krug provere.
   * Provera se otvara ovde, posle izbora fajlova — nikad unaprijed praznim
   * dugmetom, pa prazna provera ne može da nastane.
   */
  async function uploadFiles(
    fileList: FileList | File[],
    { asNewCheck = false }: { asNewCheck?: boolean } = {},
  ) {
    const files = [...fileList];
    if (files.length === 0) return;
    setBusy(true);
    setQueue(
      files.map((file) => ({
        name: file.name,
        status: "hashing",
        detail: "Računam SHA-256…",
      })),
    );
    try {
      let activeRevision = revisionId;
      if (!activeRevision || asNewCheck) {
        activeRevision = await createNext({ projectId });
      }
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const policy = policyForFilename(file.name);
        if (!policy) {
          setQueue((current) =>
            current.map((item, i) =>
              i === index
                ? {
                    ...item,
                    status: "error",
                    detail: "Podržani formati: PDF, DOCX, XLSX, DWG, DWFX.",
                  }
                : item,
            ),
          );
          continue;
        }
        const digest = await sha256Hex(file);
        setQueue((current) =>
          current.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "uploading",
                  detail: `sha256 ${digest.slice(0, 12)}…`,
                }
              : item,
          ),
        );
        const postUrl = await generateUploadUrl();
        const posted = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!posted.ok) {
          throw new Error("Otpremanje na skladište nije uspelo.");
        }
        const { storageId } = (await posted.json()) as {
          storageId: Id<"_storage">;
        };
        await register({
          projectId,
          revisionId: activeRevision,
          storageId,
          filename: file.name,
          mime: file.type || "application/octet-stream",
          sha256: digest,
          byteSize: file.size,
        });
        setQueue((current) =>
          current.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "saved",
                  detail: isCadKind(policy.kind)
                    ? "Original sačuvan. CAD se ne parsira — evidentiran je zadatak za projektanta."
                    : `Original sačuvan. sha256 ${digest}`,
                }
              : item,
          ),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Otpremanje nije uspelo.";
      setQueue((current) =>
        current.map((item) =>
          item.status === "saved"
            ? item
            : { ...item, status: "error", detail: message },
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={embedded ? "embedded-section" : "page-content"}
      aria-label="Dokumenti"
    >
      {!embedded && (
        <div className="page-heading">
          <h2>Dokumenti</h2>
          <p>
            Original ostaje nepromenjen. SHA-256 se računa u pregledaču i čuva
            uz fajl. Nova provera dodaje sveske, ne prepisuje stare.
          </p>
        </div>
      )}

      <label className={`upload-drop${busy ? " is-busy" : ""}`}>
        <input
          type="file"
          multiple
          disabled={busy}
          accept=".pdf,.docx,.xlsx,.dwg,.dwfx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <Icon name="files" size={28} />
        <strong>Ubaci PDF, DOCX, XLSX ili CAD original</strong>
        <span>DWG i DWFX se samo čuvaju. Parsiranje ide kroz ingest, ne ovde.</span>
      </label>

      {revisionId && (
        <label className={`upload-recheck${busy ? " is-busy" : ""}`}>
          <input
            type="file"
            multiple
            disabled={busy}
            accept=".pdf,.docx,.xlsx,.dwg,.dwfx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              if (event.target.files)
                void uploadFiles(event.target.files, { asNewCheck: true });
              event.target.value = "";
            }}
          />
          <Icon name="history" size={20} />
          <span>
            <strong>Ubaci ispravljenu dokumentaciju</strong>
            <small>
              Otvara sledeću proveru i poredi je sa prethodnom. Stari originali
              ostaju na svojoj proveri.
            </small>
          </span>
        </label>
      )}

      {queue.length > 0 && (
        <ul className="upload-queue" aria-live="polite">
          {queue.map((item, index) => (
            <li key={`${item.name}-${index}`} data-status={item.status}>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      )}

      {documents.length === 0 ? (
        <StatePanel
          tone="neutral"
          label="Prazno"
          title="Još nema sačuvanih originala"
          message="Posle otpremanja osvežite stranicu — fajl i hash ostaju. Prvi ubačeni set dokumenata pokreće prvu proveru."
        />
      ) : (
        <div className="document-table-wrap">
          <table className="document-table">
            <caption>Originali tekuće provere</caption>
            <thead>
              <tr>
                <th>Fajl</th>
                <th>Vrsta</th>
                <th>Veličina</th>
                <th>SHA-256</th>
                <th>Pristup</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.filename}</td>
                  <td>
                    <span className="kind-chip">{KIND_LABELS[doc.kind] ?? doc.kind}</span>
                    {parsePolicyLabel(doc.parsePolicy) && (
                      <span className="kind-chip cad">
                        {parsePolicyLabel(doc.parsePolicy)}
                      </span>
                    )}
                  </td>
                  <td>{formatBytes(doc.byteSize)}</td>
                  <td>
                    <code className="hash-value">{doc.sha256}</code>
                  </td>
                  <td>
                    {doc.downloadUrl ? (
                      <a
                        className="button button-secondary"
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Otvori original
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
