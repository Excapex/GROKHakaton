import type { IngestDoc } from "./lib/perception/types";

/** Role mapping and fixtures live in `lib/perception`; this only gates empty text. */
export function hasPageText(docsByRole: Record<string, IngestDoc>): boolean {
  return Object.values(docsByRole).some((doc) =>
    doc.pages.some((page) => page.text.trim().length > 0),
  );
}
