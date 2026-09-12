/** Rute i navigacija su generičke — nijedan stručni modul nije deo identiteta ekrana. */

export const NAV_ITEMS = [
  { id: "projekat", label: "Projekat" },
  { id: "moduli", label: "Moduli" },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];

export const DEFAULT_NAV_ID: NavId = "projekat";

const LEGACY_TO_PROJECT = new Set([
  "pregled",
  "dokumenti",
  "zadaci",
  "revizije",
]);

export function isNavId(value: string): value is NavId {
  return NAV_ITEMS.some((item) => item.id === value);
}

/** Stari hash (`#pregled`, `#zadaci`…) otvara novu stranicu Projekat. */
export function resolveNavId(value: string): NavId {
  if (isNavId(value)) return value;
  if (LEGACY_TO_PROJECT.has(value)) return "projekat";
  return DEFAULT_NAV_ID;
}
