export type EvidenceRegion = { x: number; y: number; w: number; h: number };

export type IngestPage = {
  page_no: number;
  text: string;
  region?: EvidenceRegion;
  render_artifact?: string;
};

export type IngestDoc = {
  document_id: string;
  revision_id: string;
  input_hash: string;
  pages: IngestPage[];
};

export const SCHEMA = "1.0.0" as const;

export const SLOT_QUERIES = {
  R1: ["F30", "F60", "F90", "EI", "REI", "SRPS EN 13501-2"],
  R2: ["EI60", "EI 60", "SRPS EN 13501-1", "13501-1", "13501-2"],
  R3: ["fasada", "izolacija", "mineralna vuna", "A1", "A2", "obloga"],
  R4: ["predmer", "predračun", "protivpožarna vrata", "agregat"],
  R5: ["fotometrijski", "SRPS EN 1838", "sigurnosna rasveta", "DEA"],
  R6: ["m2", "m²", "broj lica", "evakuacija", "sala"],
} as const;

export const MAPPED_RULES = [
  "I-35",
  "VII-75",
  "I-87",
  "VII-31",
  "VII-82",
  "II-34",
  "I-61",
  "I-62",
] as const;
