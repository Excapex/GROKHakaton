export type ExportableChangeSet = {
  _id: string;
  lifecycle: string;
  approvalState: string;
  documentId: string;
  baseHashes: Record<string, string>;
  designTask?: string | null;
  approvedBy?: string | null;
  approvedAt?: number | null;
  patches?: Array<{
    document_id: string;
    format: "docx" | "xlsx";
    op: "replace_text" | "set_cell" | "insert_row";
    locator: string;
    from: string;
    to: string;
  }>;
};

export type ExportableDocument = {
  _id: string;
  filename: string;
  kind: string;
  sha256: string;
};

/**
 * Package an accepted ChangeSet for the apply CLI.
 * Patches come from the engine plan stored on the server, not from the browser.
 */
export function buildChangeSetExport(
  changeSet: ExportableChangeSet,
  documents: ExportableDocument[],
) {
  const target = documents.find((doc) => doc._id === changeSet.documentId);
  return {
    schema_version: "1.0.0",
    id: changeSet._id,
    lifecycle: changeSet.lifecycle,
    approval: {
      state: changeSet.approvalState,
      by: changeSet.approvedBy ?? null,
      at: changeSet.approvedAt ? new Date(changeSet.approvedAt).toISOString() : null,
      /** Acceptance is the designer's decision, not a certificate of compliance. */
      not_consent: true,
    },
    target_document: target
      ? { id: target._id, filename: target.filename, kind: target.kind, sha256: target.sha256 }
      : null,
    base_hashes: changeSet.baseHashes,
    patches: changeSet.patches ?? [],
    design_tasks: changeSet.designTask
      ? [
          {
            id: `dt_${changeSet._id}`,
            description: changeSet.designTask,
            reason: "unsupported_format",
            document_id: changeSet.documentId,
          },
        ]
      : [],
    apply: {
      originals_untouched: true,
      cli: "python3 sandbox/compute/cli.py apply --change-set changeset.json --source <document_id>=<putanja> --out <izlazni_direktorijum>",
      note: "Patch ide na kopije. Ako se hash originala promenio, apply odbija izmenu umesto da prepiše noviju verziju.",
    },
  };
}

export function changeSetFilename(changeSet: ExportableChangeSet): string {
  return `changeset-${changeSet._id}.json`;
}

export function downloadChangeSet(
  changeSet: ExportableChangeSet,
  documents: ExportableDocument[],
) {
  const blob = new Blob(
    [JSON.stringify(buildChangeSetExport(changeSet, documents), null, 2) + "\n"],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = changeSetFilename(changeSet);
  link.click();
  URL.revokeObjectURL(url);
}
