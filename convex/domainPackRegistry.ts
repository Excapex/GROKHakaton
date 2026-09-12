import { ConvexError } from "convex/values";

/**
 * Registar stručnih modula. Ovo je jedino mesto koje zna koji `domain_pack_id`
 * postoji i koji je zaista aktivan. Rute, statusi i komponente ne smeju da
 * hardkoduju naziv pojedinačnog modula — čitaju ga odavde.
 */

export const SUPPORTED_DOMAIN_PACK_IDS = ["fire_protection"] as const;

export type SupportedDomainPackId = (typeof SUPPORTED_DOMAIN_PACK_IDS)[number];

export type ModuleAvailability = "active" | "planned";

export type ModuleCatalogEntry = {
  /** Identitet stručnog modula; NIJE `project.discipline`. */
  domain_pack_id: string;
  name: string;
  availability: ModuleAvailability;
  /** Verzija packa postoji samo za aktivan modul. */
  pack_version: string | null;
  /** Šta modul pokriva, odnosno šta će pokrivati kad bude aktivan. */
  scope: string;
};

export const MODULE_CATALOG: readonly ModuleCatalogEntry[] = [
  {
    domain_pack_id: "fire_protection",
    name: "Zaštita od požara",
    availability: "active",
    pack_version: "v1",
    scope:
      "Katalog od 652 primedbe u 8 poglavlja, registar od 36 propisa i registar standarda.",
  },
  {
    domain_pack_id: "architecture",
    name: "Arhitektura",
    availability: "planned",
    pack_version: null,
    scope: "Budući obuhvat: usaglašenost osnova, preseka i opisa materijala.",
  },
  {
    domain_pack_id: "structural",
    name: "Konstrukcija",
    availability: "planned",
    pack_version: null,
    scope:
      "Budući obuhvat: statički proračun, materijali i dispozicija nosivih elemenata.",
  },
  {
    domain_pack_id: "electrical",
    name: "Elektroinstalacije",
    availability: "planned",
    pack_version: null,
    scope: "Budući obuhvat: proračun snage, gromobranska instalacija i napajanje.",
  },
  {
    domain_pack_id: "mechanical",
    name: "Mašinske instalacije",
    availability: "planned",
    pack_version: null,
    scope: "Budući obuhvat: termotehnika, ventilacija i mašinske šeme.",
  },
  {
    domain_pack_id: "hydrotechnical",
    name: "Hidrotehničke instalacije",
    availability: "planned",
    pack_version: null,
    scope: "Budući obuhvat: vodovod, kanalizacija i hidraulički proračun.",
  },
];

export const UNSUPPORTED_DOMAIN_PACK = "unsupported_domain_pack";
export const INVALID_REVIEW_REQUEST = "invalid_review_request";

export type ReviewRequestArgs = {
  project_id: string;
  revision_id: string;
  domain_pack_id: string;
};

export type ReviewRequestAccepted = {
  accepted: true;
  project_id: string;
  revision_id: string;
  domain_pack_id: SupportedDomainPackId;
  pack_version: string;
  /**
   * True only when this revision already has ingestovani tekst strana.
   * False nije prolaz — nalazi se ne izmišljaju.
   */
  pipeline_ready: boolean;
  message: string;
};

export function isSupportedDomainPackId(
  value: string,
): value is SupportedDomainPackId {
  return (SUPPORTED_DOMAIN_PACK_IDS as readonly string[]).includes(value);
}

export function findModule(domainPackId: string): ModuleCatalogEntry | undefined {
  return MODULE_CATALOG.find((entry) => entry.domain_pack_id === domainPackId);
}

function rejectUnsupported(raw: string): never {
  throw new ConvexError({
    code: UNSUPPORTED_DOMAIN_PACK,
    domain_pack_id: raw,
    supported: [...SUPPORTED_DOMAIN_PACK_IDS],
    message: `Stručni modul „${raw}“ nije podržan. Podržano: ${SUPPORTED_DOMAIN_PACK_IDS.join(", ")}.`,
  });
}

/**
 * Jedina kapija za pokretanje pregleda. Odbija svaki `domain_pack_id` koji nije
 * aktivan modul — uključujući vrednosti koje liče na `project.discipline`
 * (`architecture`, `structural`, …). Skriveno dugme u UI-ju nije zaštita.
 */
export function buildReviewRequest(
  args: ReviewRequestArgs,
  opts?: { hasIngestText?: boolean },
): ReviewRequestAccepted {
  const projectId = (args.project_id ?? "").trim();
  const revisionId = (args.revision_id ?? "").trim();
  const rawPackId = args.domain_pack_id ?? "";
  const packId = rawPackId.trim();

  if (projectId === "" || revisionId === "") {
    throw new ConvexError({
      code: INVALID_REVIEW_REQUEST,
      message: "Zahtev mora da nosi `project_id` i `revision_id`.",
    });
  }

  if (packId === "" || !isSupportedDomainPackId(packId)) {
    rejectUnsupported(rawPackId);
  }

  const entry = findModule(packId);
  if (entry === undefined || entry.availability !== "active" || entry.pack_version === null) {
    rejectUnsupported(rawPackId);
  }

  const ready = opts?.hasIngestText === true;
  return {
    accepted: true,
    project_id: projectId,
    revision_id: revisionId,
    domain_pack_id: packId,
    pack_version: entry.pack_version,
    pipeline_ready: ready,
    message: ready
      ? "Zahtev je prihvaćen. Nalazi dolaze iz ingestovanog teksta strana."
      : "Zahtev je prihvaćen, ali nema ingestovanog teksta strana — nalazi se ne izmišljaju.",
  };
}
