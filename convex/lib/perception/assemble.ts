import { SCHEMA, MAPPED_RULES, type IngestDoc } from "./types";
import { mappedRuleCopy } from "./mappedRuleCopy.ts";
import { runExtract } from "./slots";
import { gate, judge, type Finding } from "./judge";

function withPackPrimedba(finding: Finding): Finding {
  const copy = mappedRuleCopy(finding.rule_id);
  if (!copy) return finding;
  if (finding.rationale.includes(copy.primedba)) return finding;
  return { ...finding, rationale: `${copy.primedba} ${finding.rationale}` };
}

const PROMPT_VERSION = "s08-judge-v1";

function shaShort(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(h, 33) + text.charCodeAt(i)) | 0;
  }
  return `sha256:local-${(h >>> 0).toString(16)}`;
}

type NextAction =
  | { kind: "ask"; question_id: string }
  | { kind: "propose_patch"; change_set_id: string }
  | { kind: "design_task"; description: string; reason: "unsupported_format" | "physical_change" }
  | { kind: "verify_revision"; revision_id: string };

type Question = {
  schema_version: typeof SCHEMA;
  id: string;
  prompt: string;
  finding_ids: string[];
  blocking: boolean;
};

type ReviewRun = {
  schema_version: typeof SCHEMA;
  id: string;
  project_id: string;
  revision_id: string;
  domain_pack_id: "fire_protection";
  pack_version: string;
  model_config_hash: string;
  prompt_version: string;
  input_hashes: string[];
  status: "queued" | "running" | "done" | "failed" | "partial";
};

type Dossier = {
  schema_version: typeof SCHEMA;
  review_run_id: string;
  summary: string;
  coverage: { checked_rules: string[]; skipped_rules: string[]; unknown_slots: string[] };
  observations: ReturnType<typeof runExtract>["observations"];
  findings: Finding[];
  questions: Question[];
  next_actions: NextAction[];
  integrity_report: ReturnType<typeof gate>;
  change_set_ids: string[];
};

export type ReviewResult = {
  pipelineReady: true;
  review_run: ReviewRun;
  dossier: Dossier;
  evidence: ReturnType<typeof runExtract>["evidence"];
};

export type ReviewEmpty = {
  pipelineReady: false;
  dossier: null;
  reason: string;
};

export function assembleFromRoles(
  docsByRole: Record<string, IngestDoc>,
  args: { projectId: string; revisionId: string },
): ReviewResult | ReviewEmpty {
  const docs = Object.values(docsByRole);
  const hasText = docs.some((d) => d.pages.some((p) => p.text.trim().length > 0));
  if (!hasText) {
    return {
      pipelineReady: false,
      dossier: null,
      reason:
        "Nema ingestovanog teksta strana. Engine ne izmišlja nalaze ni broj strane.",
    };
  }

  const extracted = runExtract(docsByRole);
  let findings: Finding[] = judge(extracted.observations, extracted.evidence).map(
    withPackPrimedba,
  );
  if (findings.length === 0 && extracted.observations[0]) {
    findings = [
      {
        schema_version: SCHEMA,
        id: "find_none",
        rule_id: "I-35",
        status: "unknown",
        observation_ids: [extracted.observations[0].id],
        severity: "low",
        rationale: "Nema izvršivog nalaza u dokumentaciji. To nije potvrda usaglašenosti.",
      } satisfies Finding,
    ].map(withPackPrimedba);
  }
  const report = gate(extracted.observations, extracted.evidence, findings);
  const checked = findings.map((f) => f.rule_id);
  const skipped = MAPPED_RULES.filter((r) => !checked.includes(r));
  const unknownSlots = [
    ...new Set(extracted.observations.filter((o) => o.value === null).map((o) => o.slot)),
  ].sort();

  const questions: Question[] = [];
  const next_actions: NextAction[] = [];
  for (const f of findings) {
    if (f.status === "conflict") {
      const qid = `q_${f.id}`;
      questions.push({
        schema_version: SCHEMA,
        id: qid,
        prompt: `Dokumenti se ne slažu (pravilo ${f.rule_id}). Koji podatak je važeći?`,
        finding_ids: [f.id],
        blocking: true,
      });
      next_actions.push({ kind: "ask", question_id: qid });
    } else if (f.status === "fail") {
      next_actions.push({ kind: "propose_patch", change_set_id: `cs_${f.id}` });
    } else if (f.status === "unknown") {
      next_actions.push({
        kind: "design_task",
        description: `Podatak nije pronađen u dokumentaciji; potrebna je ručna provera (pravilo ${f.rule_id}).`,
        reason: "physical_change",
      });
    }
  }
  next_actions.push({ kind: "verify_revision", revision_id: args.revisionId });

  const run: ReviewRun = {
    schema_version: SCHEMA,
    id: `rr_${shaShort(args.revisionId).slice(-10)}`,
    project_id: args.projectId,
    revision_id: args.revisionId,
    domain_pack_id: "fire_protection",
    pack_version: "v1",
    model_config_hash: shaShort(`grok-4.6|${PROMPT_VERSION}`),
    prompt_version: PROMPT_VERSION,
    input_hashes: [...new Set(docs.map((d) => d.input_hash).filter(Boolean))].sort(),
    status: "done",
  };

  const dossier: Dossier = {
    schema_version: SCHEMA,
    review_run_id: run.id,
    summary:
      "Pregled ZOP pack v1 nad izvučenim slotovima R1–R6. Ako podatak nije nađen, to nije potvrda usaglašenosti.",
    coverage: {
      checked_rules: checked,
      skipped_rules: [...skipped],
      unknown_slots: unknownSlots,
    },
    observations: extracted.observations,
    findings,
    questions,
    next_actions,
    integrity_report: report,
    change_set_ids: next_actions
      .filter((a): a is { kind: "propose_patch"; change_set_id: string } => a.kind === "propose_patch")
      .map((a) => a.change_set_id),
  };

  return {
    pipelineReady: true,
    review_run: run,
    dossier,
    evidence: extracted.evidence,
  };
}
