# CONTRACTS — tipovi između A i B

🔥 `contracts/` je **hot**. Izmena ide kroz lock (vidi `docs/GIT-PROTOCOL.md` §5),
u **jednom** PR-u sa usklađenim fixture-om i konzumentom.

Svaki tip nosi `schema_version`. Nekompatibilna izmena = nova verzija + migracija.

## Project
```ts
type Project = {
  id: string
  name: string
  discipline: 'architecture' | 'structural' | 'electrical' | 'mechanical' | 'hydrotechnical' | 'other'
  phase: 'PZI' | 'PGD' | 'IDR' | 'other'
  active_revision_id: string | null
}
```
`discipline` opisuje **projekat**. Postupak pregleda bira `ReviewRun.domain_pack_id`.

## DomainPack
```ts
type DomainPack = {
  id: 'fire_protection'          // jedini aktivan
  version: string                // 'v1'
  status: 'draft' | 'approved'
  applicability: { building_use: string[]; permit_regime_from?: string }
  source_registry: SourceRef[]   // 36 propisa
  standards_registry: StandardRef[]
  semantic_hints: SemanticHint[] // gde tražiti podatak
  executable_rules: Rule[]
  action_templates: ActionTemplate[]
  evaluation_cases: EvalCase[]
}

type SourceRef  = { key: string; title: string; gazette: string; articles?: string[] }
type StandardRef= { code: string; edition?: string; scope: string }

type Rule = {
  id: string                     // 'I-23', 'VI-8' — ID iz kataloga
  chapter: 'I'|'II'|'III'|'IV'|'V'|'VI'|'VII'|'VIII'
  primedba: string               // generička formulacija nedostatka
  osnov: {
    sources: Array<{ source_key: string; articles?: string[] }>  // 1..n propisa
    standards?: string[]
  }
  korekcija: string              // zahtev projektantu
  snaga: 'JAK' | 'USLOVNO_JAK' | 'DOPUNITI'
  requires_slots: string[]
  applicability_note?: string
}
```
**`snaga !== 'JAK'` ne sme automatski dati `FAIL`** — traži potvrdu primenljivosti.

## Evidence i Observation
```ts
type Evidence = {
  id: string
  document_id: string
  revision_id: string
  page_no: number                // FIZIČKI broj strane iz ingest manifesta
  region?: { x: number; y: number; w: number; h: number }
  excerpt?: string
  artifact_id?: string           // render strane
  input_hash: string
}

type Observation = {
  id: string
  slot: string                   // 'fire_door_class', 'facade_insulation_material'
  value: string | number | null
  unit?: string
  element_id?: string            // identitet elementa u projektu
  evidence_id: string            // POZITIVNA tvrdnja MORA imati dokaz
  search_scope?: SearchScope     // tvrdnja o ODSUSTVU mora imati obuhvat
  confidence_note?: string
  verified_by_second_pass?: boolean
}

type SearchScope = { documents: string[]; pages: number[]; queries: string[] }
```
`value: null` je legitiman **samo** uz `search_scope`. Nikad izmišljen citat.

## Dossier
```ts
type Dossier = {
  schema_version: string
  review_run_id: string
  summary: string                       // za odluku
  coverage: { checked_rules: string[]; skipped_rules: string[]; unknown_slots: string[] }
  observations: Observation[]
  findings: Finding[]
  questions: Question[]
  next_actions: NextAction[]
  integrity_report: IntegrityReport
  change_set_ids: string[]
}

type Finding = {
  id: string
  rule_id: string                       // veza na Rule iz packa
  status: 'pass' | 'fail' | 'conflict' | 'unknown'
  observation_ids: string[]             // 'conflict' => MINIMUM DVA suprotna
  severity: 'low' | 'medium' | 'high'
  rationale: string
}

type NextAction =
  | { kind: 'ask';             question_id: string }
  | { kind: 'propose_patch';   change_set_id: string }
  | { kind: 'design_task';     description: string; reason: 'unsupported_format' | 'physical_change' }
  | { kind: 'verify_revision'; revision_id: string }

type IntegrityReport = {
  ok: boolean
  broken_links: string[]
  unknown_without_scope: string[]        // mora biti prazno
  positive_without_evidence: string[]    // mora biti prazno
  conflicts_with_single_source: string[] // mora biti prazno
}
```
`integrity_report.ok === true` znači **struktura** je konzistentna — **ne** da je
svaka tvrdnja semantički tačna.

## ReviewRun
```ts
type ReviewRun = {
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
```
Backend **odbija** nepodržan `domain_pack_id`. Skriveno dugme nije zaštita.

## ChangeSet
```ts
type ChangeSet = {
  id: string
  base_hashes: Record<string, string>   // patch se ODBIJA ako se izvor promenio
  patches: Patch[]
  design_tasks: DesignTask[]
  dependencies: string[]
  approval: { state: 'proposed' | 'accepted' | 'rejected'; by?: string; at?: number }
  artifact_ids: string[]
  verification_run_id?: string
}

type Patch = {
  document_id: string
  format: 'docx' | 'xlsx'               // SAMO podržani formati
  op: 'replace_text' | 'set_cell' | 'insert_row'
  locator: string
  from: string
  to: string
}
```
DWG/DWFX **nikad** ne dobija `Patch` — ide u `design_tasks`.

## Revision
```ts
type Revision = {
  id: string
  project_id: string
  index: number                  // 1, 2, 3 — nova se DODAJE
  document_ids: string[]
  created_at: number
  derived_from?: { revision_id: string; change_set_id: string }
}
```
Original se nikad ne menja na mestu.

## Lanac stanja — nikad spajati
```
proposed  →  accepted  →  applied  →  verified
(predlog)    (korisnik)   (fajl je    (novo čitanje
              prihvatio)   izmenjen)   potvrdilo)
```
`accepted` **nije** `verified`. `applied` **nije** `verified`.

## DocumentManifest (ingest)

`page_no` je **fizički indeks** iz PDF-a (1…N). Model ga ne sme izmišljati ni
čitati sa odštampane paginacije. `readability` je samo `full` | `partial` —
nečitljiva strana nije prazna. Render i tekst idu u `sandbox/artifacts/`.

```ts
type PageReadability = 'full' | 'partial'

type PageManifest = {
  page_no: number
  width_pt: number
  height_pt: number
  rotation: number
  has_text: boolean
  is_scanned: boolean
  text_layer_count: number
  char_count: number
  readability: PageReadability
  regions: EvidenceRegion[]
  text_artifact: string
  render_artifact: string
}

type DocumentManifest = {
  schema_version: SchemaVersion
  document_id: string
  source_filename: string
  input_hash: string
  page_count: number
  pages: PageManifest[]
}
```
