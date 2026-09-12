# Independent second-pass payload. Must not include fact.value.
export type VerifierPayload = {
  slot: string;
  documentId: string;
  pageNo: number;
  criterion: string;
  text: string;
  queries?: string[];
  region?: { x: number; y: number; w: number; h: number };
};

type EvidenceLike = {
  document_id: string;
  page_no: number;
  region?: { x: number; y: number; w: number; h: number };
};

/** Assemble verifier input. Observation/fact value is not a parameter. */
export function buildVerifierPayload(args: {
  slot: string;
  evidence: EvidenceLike;
  criterion: string;
  text: string;
  queries?: string[];
}): VerifierPayload {
  const payload: VerifierPayload = {
    slot: args.slot,
    documentId: args.evidence.document_id,
    pageNo: args.evidence.page_no,
    criterion: args.criterion,
    text: args.text,
  };
  if (args.queries) payload.queries = args.queries;
  if (args.evidence.region) payload.region = args.evidence.region;
  return payload;
}
