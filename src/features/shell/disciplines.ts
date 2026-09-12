import type { Discipline, Phase } from '../../../contracts/types.ts'

/**
 * Nazivi disciplina PREDMETA. Ovo nije katalog stručnih modula — `project.discipline`
 * i `ReviewRun.domain_pack_id` su odvojena polja i namerno se ne izvode jedno iz drugog.
 */
export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  architecture: 'Arhitektura',
  structural: 'Konstrukcija',
  electrical: 'Elektroinstalacije',
  mechanical: 'Mašinske instalacije',
  hydrotechnical: 'Hidrotehničke instalacije',
  other: 'Druga disciplina',
}

export const PHASE_LABELS: Record<Phase, string> = {
  PZI: 'PZI',
  PGD: 'PGD',
  IDR: 'IDR',
  other: 'Druga faza',
}
