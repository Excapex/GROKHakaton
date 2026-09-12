import type { IngestDoc } from "./types";

/** Anon extract fixture texts (same as evals/fixtures/extract). Not a client project. */
export function anonExtractRoles(revisionId = "rev_extract"): Record<string, IngestDoc> {
  return {
    gpzop: {
      document_id: "doc_anon_gpzop",
      revision_id: revisionId,
      input_hash: "sha256:anon-extract-gpzop",
      pages: [
        {
          page_no: 1,
          text: "GPZOP anon fixture\nOtpornost: F60 za protivpožarna vrata D-12.\nFasada: A1 klasa obloga izolacije.\nEI 60 prema SRPS EN 13501-1.\nPovršina sale 180 m2 za 90 lica.\n",
        },
      ],
    },
    arh: {
      document_id: "doc_anon_arh",
      revision_id: revisionId,
      input_hash: "sha256:anon-extract-arh",
      pages: [
        {
          page_no: 1,
          text: "Arhitektura anon fixture\nFasada: mineralna vuna za izolaciju.\n",
        },
      ],
    },
    predmer: {
      document_id: "doc_anon_predmer",
      revision_id: revisionId,
      input_hash: "sha256:anon-extract-predmer",
      pages: [
        {
          page_no: 1,
          text: "Predmer anon fixture\nBeton C25/30, malter, obična stolarija.\n",
        },
      ],
    },
    elektro: {
      document_id: "doc_anon_elektro",
      revision_id: revisionId,
      input_hash: "sha256:anon-extract-elektro",
      pages: [
        {
          page_no: 1,
          text: "Elektro anon fixture\nSigurnosna rasveta, autonomija 1 h.\n",
        },
      ],
    },
  };
}
