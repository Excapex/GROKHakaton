import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  MODULE_CATALOG,
  buildReviewRequest,
  type ModuleCatalogEntry,
  type ReviewRequestAccepted,
} from "./domainPackRegistry";

/** Katalog stručnih modula. Server je izvor istine o tome šta je aktivno. */
export const listModules = query({
  args: {},
  handler: async (): Promise<readonly ModuleCatalogEntry[]> => MODULE_CATALOG,
});

/**
 * Pokretanje pregleda. `domain_pack_id` stiže kao slobodan string baš zato da
 * bi provera bila na serveru: nepodržan modul se odbija bez obzira na to šta
 * UI prikazuje ili skriva.
 */
export const requestReviewRun = mutation({
  args: {
    project_id: v.string(),
    revision_id: v.string(),
    domain_pack_id: v.string(),
  },
  handler: async (_ctx, args): Promise<ReviewRequestAccepted> =>
    buildReviewRequest(args),
});
