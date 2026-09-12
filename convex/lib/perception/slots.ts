import { SCHEMA, SLOT_QUERIES, type IngestDoc } from "./types";

const F_MARK = /\bF\s*(30|60|90)\b/gi;
const EI_ON_13501_1 = /\b(?:EI|REI)\s*[-/]?\s*\d{2,3}\b[\s\S]{0,80}13501-1/gi;
const FACADE_A1 =
  /(A1S1D0|\bA1\b).{0,90}(fasad|oblog|izolac|multipor|demit)|(fasad|oblog|izolac|multipor|demit).{0,90}(A1S1D0|\bA1\b)/gis;
const FACADE_WOOL = /mineraln\w*\s+vun/gi;
const FACADE_FINISH = /dekorativn\w*\s+malter|bavalit|kulir\s+fasad/gi;
const PHOTO = /fotometrijsk/gi;
const AREA_M2 = /([1-9]\d{1,3})\s*(?:m2|m²)/gi;
const PEOPLE = /(\d{2,4})\s*(?:ljudi|lica|osoba)/gi;
const GPZOP_ELEMENT = /protivpožarn\w*\s+vrat\w*(?:\s+[A-Za-z]-?\d+)?|\bD-\d+\b/gi;

export type Observation = {
  schema_version: typeof SCHEMA;
  id: string;
  slot: string;
  value: string | number | null;
  unit?: string;
  element_id?: string;
  evidence_id: string;
  search_scope?: { documents: string[]; pages: number[]; queries: string[] };
  confidence_note?: string;
};

export type Evidence = {
  schema_version: typeof SCHEMA;
  id: string;
  document_id: string;
  revision_id: string;
  page_no: number;
  excerpt?: string;
  artifact_id?: string;
  input_hash: string;
  region?: { x: number; y: number; w: number; h: number };
};

function sid(...parts: unknown[]): string {
  const raw = parts.map(String).join("|");
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(h, 33) + raw.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function findAll(re: RegExp, text: string): RegExpExecArray[] {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const r = new RegExp(re.source, flags);
  const out: RegExpExecArray[] = [];
  let m = r.exec(text);
  while (m) {
    out.push(m);
    if (m[0].length === 0) r.lastIndex += 1;
    m = r.exec(text);
  }
  return out;
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function obsPair(args: {
  slot: string;
  value: string | number | null;
  unit: string | null;
  element_id: string;
  doc: IngestDoc;
  page: IngestDoc["pages"][0];
  excerpt: string;
}): [Observation, Evidence] {
  const hid = sid(args.slot, args.doc.document_id, args.page.page_no, args.value);
  const evidence_id = `ev_${hid}`;
  const evidence: Evidence = {
    schema_version: SCHEMA,
    id: evidence_id,
    document_id: args.doc.document_id,
    revision_id: args.doc.revision_id,
    page_no: args.page.page_no,
    excerpt: args.excerpt.trim().slice(0, 240),
    input_hash: args.doc.input_hash,
  };
  if (args.page.render_artifact) evidence.artifact_id = args.page.render_artifact;
  if (args.page.region) evidence.region = args.page.region;
  const observation: Observation = {
    schema_version: SCHEMA,
    id: `obs_${hid}`,
    slot: args.slot,
    value: args.value,
    element_id: args.element_id,
    evidence_id,
  };
  if (args.unit !== null) observation.unit = args.unit;
  return [observation, evidence];
}

export function missing(
  slot: string,
  docs: IngestDoc[],
  queries: readonly string[],
  element_id?: string,
): Observation {
  const hid = sid("missing", slot, ...docs.map((d) => d.document_id));
  const pages = [...new Set(docs.flatMap((d) => d.pages.map((p) => p.page_no)))].sort(
    (a, b) => a - b,
  );
  const obs: Observation = {
    schema_version: SCHEMA,
    id: `obs_${hid}`,
    slot,
    value: null,
    evidence_id: `ev_${hid}`,
    search_scope: {
      documents: docs.map((d) => d.document_id),
      pages: pages.length > 0 ? pages : [1],
      queries: [...queries],
    },
    confidence_note: "Nije nađeno u obuhvatu pretrage; nije izmišljen citat.",
  };
  if (element_id) obs.element_id = element_id;
  return obs;
}

export function extractR1(docs: IngestDoc[]): Array<[Observation, Evidence]> {
  const out: Array<[Observation, Evidence]> = [];
  for (const doc of docs) {
    for (const page of doc.pages) {
      for (const m of findAll(F_MARK, page.text)) {
        const mark = `F${m[1]}`;
        const start = Math.max(0, m.index - 40);
        out.push(
          obsPair({
            slot: "fire_resistance_mark",
            value: mark,
            unit: "class",
            element_id: "element.unspecified",
            doc,
            page,
            excerpt: page.text.slice(start, m.index + m[0].length + 40),
          }),
        );
      }
    }
  }
  return out;
}

export function extractR2(docs: IngestDoc[]): Array<[Observation, Evidence]> {
  const out: Array<[Observation, Evidence]> = [];
  for (const doc of docs) {
    for (const page of doc.pages) {
      for (const m of findAll(EI_ON_13501_1, page.text)) {
        out.push(
          obsPair({
            slot: "fire_resistance_standard",
            value: "EI cited against SRPS EN 13501-1",
            unit: null,
            element_id: "element.unspecified",
            doc,
            page,
            excerpt: m[0].slice(0, 240),
          }),
        );
      }
    }
  }
  return out;
}

export function extractR3(docs: IngestDoc[]): Array<[Observation, Evidence]> {
  const out: Array<[Observation, Evidence]> = [];
  for (const doc of docs) {
    let found: [Observation, Evidence] | null = null;
    for (const page of doc.pages) {
      if (findAll(FACADE_A1, page.text).length > 0) {
        found = obsPair({
          slot: "facade_insulation_material",
          value: "A1",
          unit: "reaction_to_fire",
          element_id: "facade.insulation",
          doc,
          page,
          excerpt: "A1",
        });
        break;
      }
      const wool = findAll(FACADE_WOOL, page.text)[0];
      if (wool) {
        found = obsPair({
          slot: "facade_insulation_material",
          value: "mineral_wool",
          unit: "material",
          element_id: "facade.insulation",
          doc,
          page,
          excerpt: wool[0],
        });
        break;
      }
      const finish = findAll(FACADE_FINISH, page.text)[0];
      if (finish) {
        found = obsPair({
          slot: "facade_insulation_material",
          value: "decorative_render",
          unit: "material",
          element_id: "facade.insulation",
          doc,
          page,
          excerpt: finish[0],
        });
        break;
      }
    }
    if (found) out.push(found);
  }
  return out;
}

export function extractR4(
  gpzop: IngestDoc | undefined,
  predmer: IngestDoc | undefined,
  queries: readonly string[],
): { hits: Array<[Observation, Evidence]>; absences: Observation[] } {
  const hits: Array<[Observation, Evidence]> = [];
  const absences: Observation[] = [];
  if (!gpzop || !predmer) {
    const docs = [gpzop, predmer].filter((d): d is IngestDoc => Boolean(d));
    if (docs.length > 0) {
      absences.push(missing("gpzop_element_in_predmer", docs, queries, "element.gpzop"));
    }
    return { hits, absences };
  }
  const predmerText = predmer.pages.map((p) => p.text).join("\n");
  const seen = new Set<string>();
  for (const page of gpzop.pages) {
    for (const m of findAll(GPZOP_ELEMENT, page.text)) {
      const token = m[0].replace(/\s+/g, " ").trim();
      const key = token.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const start = Math.max(0, m.index - 20);
      hits.push(
        obsPair({
          slot: "gpzop_element_in_predmer",
          value: token,
          unit: null,
          element_id: "element.gpzop",
          doc: gpzop,
          page,
          excerpt: page.text.slice(start, m.index + m[0].length + 20),
        }),
      );
      if (!new RegExp(escapeRe(token), "i").test(predmerText)) {
        absences.push(
          missing("gpzop_element_in_predmer", [predmer], [...queries, token], "element.gpzop"),
        );
      }
    }
  }
  if (hits.length === 0) {
    absences.push(missing("gpzop_element_in_predmer", [gpzop, predmer], queries, "element.gpzop"));
  }
  return { hits, absences };
}

export function extractR5(docs: IngestDoc[]): Array<[Observation, Evidence]> {
  const out: Array<[Observation, Evidence]> = [];
  for (const doc of docs) {
    for (const page of doc.pages) {
      if (findAll(PHOTO, page.text).length > 0) {
        out.push(
          obsPair({
            slot: "emergency_lighting_photometry",
            value: "present",
            unit: null,
            element_id: "emergency_lighting",
            doc,
            page,
            excerpt: page.text.slice(0, 200),
          }),
        );
      }
    }
  }
  return out;
}

export function extractR6(docs: IngestDoc[]): Array<[Observation, Evidence]> {
  const out: Array<[Observation, Evidence]> = [];
  for (const doc of docs) {
    for (const page of doc.pages) {
      const area = findAll(AREA_M2, page.text)[0];
      if (!area) continue;
      const people = findAll(PEOPLE, page.text)[0];
      const peopleN = people?.[1] ?? "?";
      out.push(
        obsPair({
          slot: "occupant_load_vs_area",
          value: `${area[1]} m2 / ${peopleN} lica`,
          unit: "m2",
          element_id: "space.unspecified",
          doc,
          page,
          excerpt: page.text.slice(Math.max(0, area.index - 20), area.index + area[0].length + 40),
        }),
      );
    }
  }
  return out;
}

function unzip(pairs: Array<[Observation, Evidence]>): {
  observations: Observation[];
  evidence: Evidence[];
} {
  return {
    observations: pairs.map(([o]) => o),
    evidence: pairs.map(([, e]) => e),
  };
}

export function runExtract(docsByRole: Record<string, IngestDoc>): {
  schema_version: typeof SCHEMA;
  observations: Observation[];
  evidence: Evidence[];
} {
  const allDocs = Object.values(docsByRole);
  const observations: Observation[] = [];
  const evidence: Evidence[] = [];

  const r1 = unzip(extractR1(allDocs));
  if (r1.observations.length > 0) {
    observations.push(...r1.observations);
    evidence.push(...r1.evidence);
  } else {
    observations.push(missing("fire_resistance_mark", allDocs, SLOT_QUERIES.R1));
  }

  const r2 = unzip(extractR2(allDocs));
  if (r2.observations.length > 0) {
    observations.push(...r2.observations);
    evidence.push(...r2.evidence);
  } else {
    observations.push(missing("fire_resistance_standard", allDocs, SLOT_QUERIES.R2));
  }

  const r3Roles = ["gpzop", "arh"]
    .map((k) => docsByRole[k])
    .filter((d): d is IngestDoc => Boolean(d));
  const r3Docs = r3Roles.length > 0 ? r3Roles : allDocs;
  const r3 = unzip(extractR3(r3Docs));
  observations.push(...r3.observations);
  evidence.push(...r3.evidence);
  const hitDocIds = new Set(r3.evidence.map((e) => e.document_id));
  for (const doc of r3Docs) {
    if (!hitDocIds.has(doc.document_id)) {
      observations.push(
        missing("facade_insulation_material", [doc], SLOT_QUERIES.R3, "facade.insulation"),
      );
    }
  }

  const r4 = extractR4(docsByRole.gpzop, docsByRole.predmer, SLOT_QUERIES.R4);
  const r4h = unzip(r4.hits);
  observations.push(...r4h.observations);
  evidence.push(...r4h.evidence);
  observations.push(...r4.absences);

  const r5Docs = ["elektro", "gpzop"]
    .map((k) => docsByRole[k])
    .filter((d): d is IngestDoc => Boolean(d));
  const r5Source = r5Docs.length > 0 ? r5Docs : allDocs;
  const r5 = unzip(extractR5(r5Source));
  if (r5.observations.length > 0) {
    observations.push(...r5.observations);
    evidence.push(...r5.evidence);
  } else {
    observations.push(
      missing("emergency_lighting_photometry", r5Source, SLOT_QUERIES.R5, "emergency_lighting"),
    );
  }

  const r6 = unzip(extractR6(allDocs));
  if (r6.observations.length > 0) {
    observations.push(...r6.observations);
    evidence.push(...r6.evidence);
  } else {
    observations.push(missing("occupant_load_vs_area", allDocs, SLOT_QUERIES.R6));
  }

  return { schema_version: SCHEMA, observations, evidence };
}
