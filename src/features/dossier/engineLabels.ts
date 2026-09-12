/**
 * Rečnik prikaza: interni identifikatori engine-a → jezik projektanta.
 *
 * Engine radi sa kodnim nazivima (`fire_resistance_mark`, `element.gpzop`,
 * `store_only`) jer su stabilni i jer ih evals mere. Na ekranu oni ne smeju da
 * se pojave. Svaka mapa ovde ima fallback koji vrati čitljiv tekst i za
 * vrednost koju ne poznaje, da novi slot nikada ne ostavi prazno polje.
 */

/** Slotovi koje popunjava `convex/lib/perception/slots.ts`. */
const SLOT_LABELS: Record<string, string> = {
  fire_resistance_mark: "Oznaka otpornosti na požar",
  fire_resistance_standard: "Standard na koji se poziva",
  facade_insulation_material: "Materijal fasadnog sistema",
  gpzop_element_in_predmer: "Mera iz GPZOP u predmeru",
  emergency_lighting_photometry: "Fotometrijski proračun sigurnosne rasvete",
  occupant_load_vs_area: "Broj lica u odnosu na površinu",
};

export function slotLabel(slot: string): string {
  return SLOT_LABELS[slot] ?? humanize(slot);
}

/** Vrednosti koje engine upisuje kao kod, a ne kao tekst iz dokumenta. */
const VALUE_LABELS: Record<string, string> = {
  present: "priloženo",
  mineral_wool: "mineralna vuna",
  decorative_render: "dekorativni malter",
  "EI cited against SRPS EN 13501-1":
    "EI oznaka pozvana na SRPS EN 13501-1",
};

/** Jedinice iz slotova; `class` i `material` su tipovi, ne merne jedinice. */
const UNIT_SUFFIXES: Record<string, string> = {
  class: "",
  material: "",
  reaction_to_fire: " (reakcija na požar)",
  m2: "",
};

/**
 * Spaja `value` i `unit` u jednu čitljivu frazu.
 * `null` vrednost znači da podatak nije pronađen — to nije prazno polje.
 */
export function observationValue(
  value: string | number | null,
  unit?: string | null,
): string {
  if (value === null || value === "") return "nije pronađeno u dokumentaciji";

  const raw = String(value);
  const mapped = VALUE_LABELS[raw];
  if (mapped) return mapped;

  const suffix = unit ? (UNIT_SUFFIXES[unit] ?? ` ${unit}`) : "";

  // `class` uz F60 ili EI 60 je oznaka otpornosti, ne apstraktna klasa.
  if (unit === "class") return `oznaka ${raw}`;
  if (unit === "reaction_to_fire") return `klasa ${raw}${suffix}`;

  return `${raw.replace(/\bm2\b/g, "m²")}${suffix}`;
}

/** `element_id` iz opažanja. */
const ELEMENT_LABELS: Record<string, string> = {
  "element.unspecified": "element nije bliže određen",
  "element.gpzop": "element iz GPZOP",
  "facade.insulation": "fasadna izolacija",
  emergency_lighting: "sigurnosna rasveta",
  "space.unspecified": "prostor nije bliže određen",
};

export function elementLabel(elementId: string | null | undefined): string | null {
  if (!elementId) return null;
  return ELEMENT_LABELS[elementId] ?? humanize(elementId);
}

/** Tipovi događaja koje upisuju Convex mutacije. */
const EVENT_LABELS: Record<string, string> = {
  document_uploaded: "Dodat dokument",
  design_task: "Zadatak za projektanta",
  revision_created: "Pokrenuta nova provera",
  question_asked: "Postavljeno pitanje",
  question_answered: "Odgovoreno na pitanje",
  changeset_proposed: "Predložena ispravka",
  changeset_accepted: "Projektant prihvatio ispravku",
};

export function eventLabel(type: string): string {
  return EVENT_LABELS[type] ?? humanize(type);
}

/** `parsePolicy` na dokumentu. CAD se čuva, ali se ne čita. */
export function parsePolicyLabel(policy: string): string | null {
  if (policy === "store_only") return "Samo pohranjeno, bez čitanja sadržaja";
  return null;
}

/**
 * Interni `finding.id` (`find_r3`) ne izlazi na ekran. Nalaz se broji redom
 * kojim stoji u dosijeu, kao primedba u dopisu.
 */
export function findingOrdinal(
  findingId: string,
  allFindingIds: readonly string[],
): number {
  const index = allFindingIds.indexOf(findingId);
  return index >= 0 ? index + 1 : 1;
}

export function findingTitle(
  findingId: string,
  allFindingIds: readonly string[],
): string {
  return `Primedba ${findingOrdinal(findingId, allFindingIds)}`;
}

/**
 * Poslednja odbrana: `snake_case` ili `dotted.id` u rečenicu, da nepoznat kod
 * bude bar čitljiv umesto da ostane kao identifikator.
 */
function humanize(code: string): string {
  const words = code.replace(/[._]+/g, " ").trim();
  if (!words) return code;
  return words.charAt(0).toUpperCase() + words.slice(1);
}
