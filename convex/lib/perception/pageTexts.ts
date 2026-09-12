import type { IngestDoc } from "./types";

/** Row shape B plans to store in `pageTexts` (A does not edit schema.ts). */
export type PageTextRow = {
  documentId: string;
  revisionId: string;
  pageNo: number;
  text: string;
  inputHash?: string;
  filename?: string;
};

export function guessRole(filename: string): string | null {
  const n = filename.toLowerCase();
  if (n.includes("gpzop")) return "gpzop";
  if (n.includes("arhitekt") || /(^|[^a-z])arh([^a-z]|$)/.test(n)) return "arh";
  if (n.includes("predmer") || n.includes("predračun") || n.includes("predracun")) return "predmer";
  if (n.includes("elektro")) return "elektro";
  return null;
}

/**
 * Group stored page rows into role docs for `assembleFromRoles`.
 * Missing role/hash → skip that document (do not invent).
 */
export function rolesFromPageTexts(
  rows: PageTextRow[],
  roleByDocumentId: Record<string, string>,
): Record<string, IngestDoc> {
  const byDoc = new Map<string, PageTextRow[]>();
  for (const row of rows) {
    const list = byDoc.get(row.documentId) ?? [];
    list.push(row);
    byDoc.set(row.documentId, list);
  }
  const out: Record<string, IngestDoc> = {};
  for (const [documentId, docRows] of byDoc) {
    const filename = docRows.find((r) => r.filename)?.filename;
    const role = roleByDocumentId[documentId] ?? (filename ? guessRole(filename) : null);
    if (!role) continue;
    const hash = docRows.find((r) => r.inputHash)?.inputHash;
    if (!hash) continue;
    const pages = [...docRows]
      .sort((a, b) => a.pageNo - b.pageNo)
      .filter((r) => r.pageNo >= 1)
      .map((r) => ({ page_no: r.pageNo, text: r.text }));
    if (pages.length === 0) continue;
    out[role] = {
      document_id: documentId,
      revision_id: docRows[0].revisionId,
      input_hash: hash,
      pages,
    };
  }
  return out;
}
