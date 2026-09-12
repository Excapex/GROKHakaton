import { SCHEMA_VERSION } from '../../../contracts/schema_version.ts'
import type { Project } from '../../../contracts/types.ts'

/**
 * RAZVOJNI FIXTURE — nije stvaran predmet i nije rezultat ijednog pregleda.
 * Anonimizovan prema docs/LOCAL-DATA.md §3. Zamenjuje se stvarnim predmetom iz
 * Convex-a. Ostaje samo kao fallback kada `VITE_CONVEX_URL` nije podešen.
 */
export const DEMO_PROJECT: Project = {
  schema_version: SCHEMA_VERSION,
  id: 'prj_demo_01',
  name: 'Objekat A, Lamela 3',
  discipline: 'architecture',
  phase: 'PZI',
  active_revision_id: 'rev_2',
}

export const DEMO_PROJECT_CODE = 'PZI-DEMO-01-2026'

export const DEMO_ACTIVE_REVISION_LABEL = 'Provera 2'

export const FIXTURE_LABEL = 'demo fixture'
