/** Rute i navigacija su generičke — nijedan stručni modul nije deo identiteta ekrana. */

export const NAV_ITEMS = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'dokumenti', label: 'Dokumenti' },
  { id: 'zadaci', label: 'Zadaci' },
  { id: 'revizije', label: 'Revizije' },
  { id: 'moduli', label: 'Moduli' },
] as const

export type NavId = (typeof NAV_ITEMS)[number]['id']

export const DEFAULT_NAV_ID: NavId = 'moduli'

export function isNavId(value: string): value is NavId {
  return NAV_ITEMS.some((item) => item.id === value)
}
