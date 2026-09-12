import type { SchemaVersion } from './schema_version.ts'

export type Discipline =
  | 'architecture'
  | 'structural'
  | 'electrical'
  | 'mechanical'
  | 'hydrotechnical'
  | 'other'

export type Phase = 'PZI' | 'PGD' | 'IDR' | 'other'

export type Project = {
  schema_version: SchemaVersion
  id: string
  name: string
  discipline: Discipline
  phase: Phase
  active_revision_id: string | null
}

export type SourceRef = {
  schema_version: SchemaVersion
  key: string
  title: string
  gazette: string
  articles?: string[]
}

export type StandardRef = {
  schema_version: SchemaVersion
  code: string
  edition?: string
  scope: string
}

export type RuleChapter = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII'

export type RuleStrength = 'JAK' | 'USLOVNO_JAK' | 'DOPUNITI'

export type LegalSource = {
  source_key: string
  articles?: string[]
}

export type RuleOsnov = {
  sources: LegalSource[]
  standards?: string[]
}

export type Rule = {
  schema_version: SchemaVersion
  id: string
  chapter: RuleChapter
  primedba: string
  osnov: RuleOsnov
  korekcija: string
  snaga: RuleStrength
  requires_slots: string[]
  applicability_note?: string
}

export type SemanticHint = {
  schema_version: SchemaVersion
  slot: string
  document_kinds: string[]
  notes?: string
}

export type ActionTemplate = {
  schema_version: SchemaVersion
  id: string
  kind: NextAction['kind']
  body: string
}

export type EvalCase = {
  schema_version: SchemaVersion
  id: string
  rule_id: string
  expected_status: FindingStatus
  notes?: string
}

export type DomainPack = {
  schema_version: SchemaVersion
  id: 'fire_protection'
  version: string
  status: 'draft' | 'approved'
  applicability: { building_use: string[]; permit_regime_from?: string }
  source_registry: SourceRef[]
  standards_registry: StandardRef[]
  semantic_hints: SemanticHint[]
  executable_rules: Rule[]
  action_templates: ActionTemplate[]
  evaluation_cases: EvalCase[]
}

export type EvidenceRegion = { x: number; y: number; w: number; h: number }

export type Evidence = {
  schema_version: SchemaVersion
  id: string
  document_id: string
  revision_id: string
  page_no: number
  region?: EvidenceRegion
  excerpt?: string
  artifact_id?: string
  input_hash: string
}

export type SearchScope = {
  documents: string[]
  pages: number[]
  queries: string[]
}

export type Observation = {
  schema_version: SchemaVersion
  id: string
  slot: string
  value: string | number | null
  unit?: string
  element_id?: string
  evidence_id: string
  search_scope?: SearchScope
  confidence_note?: string
  verified_by_second_pass?: boolean
}

export type FindingStatus = 'pass' | 'fail' | 'conflict' | 'unknown'

export type Finding = {
  schema_version: SchemaVersion
  id: string
  rule_id: string
  status: FindingStatus
  observation_ids: string[]
  severity: 'low' | 'medium' | 'high'
  rationale: string
}

export type Question = {
  schema_version: SchemaVersion
  id: string
  prompt: string
  finding_ids: string[]
  blocking: boolean
}

export type NextAction =
  | { kind: 'ask'; question_id: string }
  | { kind: 'propose_patch'; change_set_id: string }
  | { kind: 'design_task'; description: string; reason: 'unsupported_format' | 'physical_change' }
  | { kind: 'verify_revision'; revision_id: string }

export type IntegrityReport = {
  ok: boolean
  broken_links: string[]
  unknown_without_scope: string[]
  positive_without_evidence: string[]
  conflicts_with_single_source: string[]
}

export type Dossier = {
  schema_version: SchemaVersion
  review_run_id: string
  summary: string
  coverage: {
    checked_rules: string[]
    skipped_rules: string[]
    unknown_slots: string[]
  }
  observations: Observation[]
  findings: Finding[]
  questions: Question[]
  next_actions: NextAction[]
  integrity_report: IntegrityReport
  change_set_ids: string[]
}

export type ReviewRun = {
  schema_version: SchemaVersion
  id: string
  project_id: string
  revision_id: string
  domain_pack_id: 'fire_protection'
  pack_version: string
  model_config_hash: string
  prompt_version: string
  input_hashes: string[]
  status: 'queued' | 'running' | 'done' | 'failed' | 'partial'
}

export type ChangeLifecycle = 'proposed' | 'accepted' | 'applied' | 'verified'

export type Patch = {
  document_id: string
  format: 'docx' | 'xlsx'
  op: 'replace_text' | 'set_cell' | 'insert_row'
  locator: string
  from: string
  to: string
}

export type DesignTask = {
  id: string
  description: string
  reason: 'unsupported_format' | 'physical_change'
  document_id?: string
}

export type ChangeSet = {
  schema_version: SchemaVersion
  id: string
  lifecycle: ChangeLifecycle
  base_hashes: Record<string, string>
  patches: Patch[]
  design_tasks: DesignTask[]
  dependencies: string[]
  approval: { state: 'proposed' | 'accepted' | 'rejected'; by?: string; at?: number }
  artifact_ids: string[]
  verification_run_id?: string
}

export type Revision = {
  schema_version: SchemaVersion
  id: string
  project_id: string
  index: number
  document_ids: string[]
  created_at: number
  derived_from?: { revision_id: string; change_set_id: string }
}
