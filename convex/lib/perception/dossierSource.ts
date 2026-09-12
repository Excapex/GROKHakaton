/** Which text backs dossiers.getActive. Never swap uploaded work for the demo fixture. */

export const EMPTY_DOSSIER_REASON =
  "Nema ingestovanog teksta strana za ovaj predmet. Engine ne izmišlja nalaze ni broj strane.";

export const WAITING_INGEST_REASON =
  "Dokumenti su sačuvani, ali tekst strana još nije stigao. Primer nalaza se ne prikazuje umesto vaših dokumenata.";

export type DossierSourceKind = "ingest" | "anon_fixture" | "none";

export type DossierSourceChoice =
  | { kind: "ingest" }
  | { kind: "anon_fixture" }
  | { kind: "none"; reason: string };

export function chooseDossierSource(input: {
  hasIngestText: boolean;
  hasUploadedDocuments: boolean;
  demoKey?: string | null;
  ingestEventType?: string | null;
  ingestEventMessage?: string | null;
}): DossierSourceChoice {
  if (input.hasIngestText) return { kind: "ingest" };
  if (input.hasUploadedDocuments) {
    if (
      (input.ingestEventType === "ingest_failed" ||
        input.ingestEventType === "ingest_skipped") &&
      input.ingestEventMessage
    ) {
      return { kind: "none", reason: input.ingestEventMessage };
    }
    return { kind: "none", reason: WAITING_INGEST_REASON };
  }
  if (input.demoKey) return { kind: "anon_fixture" };
  return { kind: "none", reason: EMPTY_DOSSIER_REASON };
}

/** Active empty check must not hide ingest that already landed on an older check. */
export function pickRevisionWithText<T extends { id: string; index: number }>(
  activeId: string | null,
  revisions: T[],
  hasText: (id: string) => boolean,
): string | null {
  if (activeId && hasText(activeId)) return activeId;
  const sorted = [...revisions].sort((a, b) => b.index - a.index);
  for (const row of sorted) {
    if (hasText(row.id)) return row.id;
  }
  return activeId;
}
