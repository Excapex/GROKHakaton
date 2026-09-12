import { SCHEMA } from "./types";
import type { Evidence, Observation } from "./slots";

const F_MARKS = new Set(["F30", "F60", "F90"]);

export type Finding = {
  schema_version: typeof SCHEMA;
  id: string;
  rule_id: string;
  status: "pass" | "fail" | "conflict" | "unknown";
  observation_ids: string[];
  severity: "low" | "medium" | "high";
  rationale: string;
};

export type IntegrityReport = {
  ok: boolean;
  broken_links: string[];
  unknown_without_scope: string[];
  positive_without_evidence: string[];
  conflicts_with_single_source: string[];
};

function find(
  fid: string,
  rule_id: string,
  status: Finding["status"],
  oids: string[],
  severity: Finding["severity"],
  rationale: string,
): Finding {
  return {
    schema_version: SCHEMA,
    id: fid,
    rule_id,
    status,
    observation_ids: oids,
    severity,
    rationale,
  };
}

function hasEvidence(obs: Observation, evIds: Set<string>): boolean {
  if (obs.value === null) return Boolean(obs.search_scope);
  return Boolean(obs.evidence_id && evIds.has(obs.evidence_id));
}

export function gate(
  observations: Observation[],
  evidence: Evidence[],
  findings: Finding[],
): IntegrityReport {
  const evIds = new Set(evidence.map((e) => e.id));
  const obsById = new Map(observations.map((o) => [o.id, o]));
  const broken: string[] = [];
  const unknownWithoutScope: string[] = [];
  const positiveWithoutEvidence: string[] = [];
  const conflictsSingle: string[] = [];

  for (const o of observations) {
    if (o.value === null) {
      if (!o.search_scope) unknownWithoutScope.push(o.id);
    } else {
      if (!o.evidence_id || !evIds.has(o.evidence_id)) {
        positiveWithoutEvidence.push(o.id);
      } else {
        const ev = evidence.find((e) => e.id === o.evidence_id);
        if (ev && ev.page_no < 1) broken.push(`${o.id}:page_no`);
      }
    }
  }

  for (const f of findings) {
    for (const oid of f.observation_ids) {
      if (!obsById.has(oid)) broken.push(`${f.id}->${oid}`);
    }
    if (f.status === "conflict" && f.observation_ids.length < 2) {
      conflictsSingle.push(f.id);
    }
    if (f.status === "unknown") {
      for (const oid of f.observation_ids) {
        const o = obsById.get(oid);
        if (o && o.value === null && !o.search_scope) unknownWithoutScope.push(oid);
      }
    }
  }

  const unknown = [...new Set(unknownWithoutScope)].sort();
  return {
    ok:
      broken.length === 0 &&
      unknown.length === 0 &&
      positiveWithoutEvidence.length === 0 &&
      conflictsSingle.length === 0,
    broken_links: broken,
    unknown_without_scope: unknown,
    positive_without_evidence: positiveWithoutEvidence,
    conflicts_with_single_source: conflictsSingle,
  };
}

export function judge(observations: Observation[], evidence: Evidence[]): Finding[] {
  const evIds = new Set(evidence.map((e) => e.id));
  const bySlot = new Map<string, Observation[]>();
  for (const o of observations) {
    const list = bySlot.get(o.slot) ?? [];
    list.push(o);
    bySlot.set(o.slot, list);
  }
  const findings: Finding[] = [];

  const r1 = bySlot.get("fire_resistance_mark") ?? [];
  const r1Pos = r1.filter((o) => typeof o.value === "string" && F_MARKS.has(o.value));
  if (r1Pos.length > 0) {
    findings.push(
      r1Pos.every((o) => hasEvidence(o, evIds))
        ? find(
            "find_r1",
            "I-35",
            "fail",
            r1Pos.map((o) => o.id),
            "high",
            "Navedena je povučena oznaka F30/F60/F90 umesto EI/REI prema SRPS EN 13501-2.",
          )
        : find(
            "find_r1",
            "I-35",
            "unknown",
            r1Pos.map((o) => o.id),
            "high",
            "Oznaka F* je navedena, ali nema dokaza u dokumentaciji. To nije potvrda usaglašenosti.",
          ),
    );
  } else if (r1.some((o) => o.value === null)) {
    const miss = r1.find((o) => o.value === null);
    if (miss) {
      findings.push(
        find(
            "find_r1",
            "I-35",
            "unknown",
            [miss.id],
            "high",
            "Oznaka otpornosti nije nađena u dokumentaciji.",
          ),
      );
    }
  }

  const r2 = (bySlot.get("fire_resistance_standard") ?? []).filter((o) => o.value);
  if (r2.length > 0) {
    findings.push(
      r2.every((o) => hasEvidence(o, evIds))
        ? find(
            "find_r2",
            "I-35",
            "fail",
            r2.map((o) => o.id),
            "high",
            "EI/REI je vezan za SRPS EN 13501-1 (reakcija), ne za otpornost 13501-2.",
          )
        : find("find_r2", "I-35", "unknown", r2.map((o) => o.id), "high", "Nedostaje dokaz za R2; unknown."),
    );
  }

  const r3 = (bySlot.get("facade_insulation_material") ?? []).filter((o) => o.value);
  const values = new Set(r3.map((o) => String(o.value)));
  if (values.size >= 2 && r3.length >= 2) {
    findings.push(
      r3.every((o) => hasEvidence(o, evIds))
        ? find(
            "find_r3",
            "I-87",
            "conflict",
            r3.map((o) => o.id),
            "high",
            "Dva suprotna navoda materijala fasade. To nije ni potvrda ni odbijanje.",
          )
        : find("find_r3", "I-87", "unknown", r3.map((o) => o.id), "high", "Konflikt bez oba dokaza; unknown."),
    );
  }

  const r4Pos = (bySlot.get("gpzop_element_in_predmer") ?? []).filter((o) => o.value);
  const r4Miss = (bySlot.get("gpzop_element_in_predmer") ?? []).filter((o) => o.value === null);
  if (r4Pos.length > 0 && r4Miss.length > 0) {
    const oids = [r4Pos[0].id, r4Miss[0].id];
    findings.push(
      hasEvidence(r4Pos[0], evIds) && r4Miss[0].search_scope
        ? find(
            "find_r4",
            "VII-31",
            "fail",
            oids,
            "high",
            "Element iz GPZOP nije nađen u predmeru (dokumentovan obuhvat).",
          )
        : find("find_r4", "VII-31", "unknown", oids, "high", "R4 bez kompletnog dokaza/obuhvata."),
    );
  } else if (r4Miss.length > 0 && r4Pos.length === 0) {
    findings.push(
      find("find_r4", "VII-31", "unknown", [r4Miss[0].id], "medium", "Element nije potvrđen ni u GPZOP."),
    );
  }

  const r5Miss = (bySlot.get("emergency_lighting_photometry") ?? []).filter((o) => o.value === null);
  const r5Pos = (bySlot.get("emergency_lighting_photometry") ?? []).filter((o) => o.value);
  if (r5Miss.length > 0 && r5Pos.length === 0) {
    findings.push(
      find(
        "find_r5",
        "II-34",
        "unknown",
        [r5Miss[0].id],
        "medium",
        "Fotometrijski proračun nije nađen; nije FAIL iz odsustva citata.",
      ),
    );
  }

  const r6Ok = (bySlot.get("occupant_load_vs_area") ?? []).filter(
    (o) => o.value && String(o.value).includes(" / ") && !String(o.value).includes("?"),
  );
  if (r6Ok.length > 0) {
    const oids = r6Ok.map((o) => o.id);
    findings.push(
      r6Ok.every((o) => hasEvidence(o, evIds))
        ? find(
            "find_r6",
            "I-61",
            "unknown",
            oids,
            "high",
            "Površina i broj lica su izvučeni; odnos se ne ocenjuje automatski.",
          )
        : find("find_r6", "I-61", "unknown", oids, "high", "R6 bez dokaza; unknown."),
    );
  }

  return findings;
}
