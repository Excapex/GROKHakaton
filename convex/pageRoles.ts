import type { IngestDoc } from "./lib/perception/types";

/** Roles the R1–R6 extractor looks for; R3 needs the GPZOP + arh pair. */
export type IngestRole = "gpzop" | "arh" | "predmer" | "elektro";

/** Same public anon text as `evals/fixtures/extract`. No client project data. */
const ANON_PAGES: Record<IngestRole, { document_id: string; input_hash: string; text: string }> = {
  gpzop: {
    document_id: "doc_anon_gpzop",
    input_hash: "sha256:anon-extract-gpzop",
    text: "GPZOP anon fixture\nOtpornost: F60 za protivpožarna vrata D-12.\nFasada: A1 klasa obloga izolacije.\nEI 60 prema SRPS EN 13501-1.\nPovršina sale 180 m2 za 90 lica.\n",
  },
  arh: {
    document_id: "doc_anon_arh",
    input_hash: "sha256:anon-extract-arh",
    text: "Arhitektura anon fixture\nFasada: mineralna vuna za izolaciju.\n",
  },
  predmer: {
    document_id: "doc_anon_predmer",
    input_hash: "sha256:anon-extract-predmer",
    text: "Predmer anon fixture\nBeton C25/30, malter, obična stolarija.\n",
  },
  elektro: {
    document_id: "doc_anon_elektro",
    input_hash: "sha256:anon-extract-elektro",
    text: "Elektro anon fixture\nSigurnosna rasveta, autonomija 1 h.\n",
  },
};

export function roleFromFilename(filename: string): IngestRole | null {
  const name = filename.toLowerCase();
  if (name.includes("gpzop")) return "gpzop";
  if (
    name.includes("predmer") ||
    name.includes("predracun") ||
    name.includes("predračun")
  ) {
    return "predmer";
  }
  if (name.includes("elektro")) return "elektro";
  if (name.includes("arh")) return "arh";
  return null;
}

export function hasPageText(docsByRole: Record<string, IngestDoc>): boolean {
  return Object.values(docsByRole).some((doc) =>
    doc.pages.some((page) => page.text.trim().length > 0),
  );
}

export function anonDocsByRole(revisionId: string): Record<string, IngestDoc> {
  const docs: Record<string, IngestDoc> = {};
  for (const [role, page] of Object.entries(ANON_PAGES)) {
    docs[role] = {
      document_id: page.document_id,
      revision_id: revisionId,
      input_hash: page.input_hash,
      pages: [{ page_no: 1, text: page.text }],
    };
  }
  return docs;
}
