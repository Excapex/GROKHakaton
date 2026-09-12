export type SourceKind = "pdf" | "docx" | "xlsx" | "dwg" | "dwfx";

export type FilePolicy = {
  kind: SourceKind;
  parsePolicy: "ingest" | "store_only";
};

const CAD_KINDS = new Set<SourceKind>(["dwg", "dwfx"]);

export function extensionOf(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export function policyForFilename(filename: string): FilePolicy | null {
  const ext = extensionOf(filename);
  const kind =
    ext === "pdf"
      ? "pdf"
      : ext === "docx"
        ? "docx"
        : ext === "xlsx"
          ? "xlsx"
          : ext === "dwg"
            ? "dwg"
            : ext === "dwfx"
              ? "dwfx"
              : null;
  if (!kind) return null;
  return {
    kind,
    parsePolicy: CAD_KINDS.has(kind) ? "store_only" : "ingest",
  };
}

export function isCadKind(kind: string): boolean {
  return kind === "dwg" || kind === "dwfx";
}
