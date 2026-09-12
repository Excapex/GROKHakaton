import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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
  handler: async (ctx, args): Promise<ReviewRequestAccepted> => {
    let hasIngestText = false;
    const revisionId = args.revision_id.trim();
    if (revisionId.length > 0) {
      const rows = await ctx.db
        .query("pageTexts")
        .withIndex("by_revision", (q) =>
          q.eq("revisionId", revisionId as Id<"revisions">),
        )
        .take(40);
      hasIngestText = rows.some((row) => row.text.trim().length > 0);
    }
    return buildReviewRequest(args, { hasIngestText });
  },
});
