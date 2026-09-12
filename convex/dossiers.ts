import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { assembleFromRoles } from "./lib/perception/assemble";
import type { IngestDoc } from "./lib/perception/types";
import { anonDocsByRole, hasPageText, roleFromFilename } from "./pageRoles";

const EMPTY_REASON =
  "Nema ingestovanog teksta strana za ovaj predmet. Engine ne izmišlja nalaze ni broj strane.";

const ANON_NOTE =
  "Nalazi su izračunati nad javnim anon fixture tekstom, ne nad vašim dokumentima. Ingest vaših originala još nije povezan.";

function empty() {
  return {
    pipelineReady: false as const,
    dossier: null as null,
    source: "none" as const,
    sourceNote: null,
    reason: EMPTY_REASON,
  };
}

/**
 * Active dossier for a subject. Findings come from real page text run through
 * the R1–R6 engine; without text the answer stays empty instead of invented.
 */
export const getActive = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;

    const revisionId = project.activeRevisionId;
    const ingested = revisionId
      ? await loadTextByRole(ctx, projectId, revisionId)
      : {};
    const usesIngest = hasPageText(ingested);
    const docsByRole: Record<string, IngestDoc> = usesIngest
      ? ingested
      : project.demoKey
        ? anonDocsByRole(revisionId ? String(revisionId) : "rev_extract")
        : {};

    if (!hasPageText(docsByRole)) return empty();

    const assembled = assembleFromRoles(docsByRole, {
      projectId: String(project._id),
      revisionId: revisionId ? String(revisionId) : "rev_extract",
    });
    if (!assembled.pipelineReady) return empty();

    return {
      ...assembled,
      source: usesIngest ? ("ingest" as const) : ("anon_fixture" as const),
      sourceNote: usesIngest ? null : ANON_NOTE,
    };
  },
});

/** Page text comes from ingest rows in `pageTexts`; nothing is guessed here. */
async function loadTextByRole(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  revisionId: Id<"revisions">,
): Promise<Record<string, IngestDoc>> {
  const rows = await ctx.db
    .query("pageTexts")
    .withIndex("by_revision", (q) => q.eq("revisionId", revisionId))
    .collect();
  if (rows.length === 0) return {};

  const pagesByDocument = new Map<Id<"documents">, { page_no: number; text: string }[]>();
  for (const row of rows) {
    if (row.projectId !== projectId) continue;
    const pages = pagesByDocument.get(row.documentId) ?? [];
    pages.push({ page_no: row.pageNo, text: row.text });
    pagesByDocument.set(row.documentId, pages);
  }

  const docsByRole: Record<string, IngestDoc> = {};
  for (const [documentId, pages] of pagesByDocument) {
    const document = await ctx.db.get(documentId);
    if (!document) continue;
    const role = roleFromFilename(document.filename);
    if (!role) continue;

    pages.sort((a, b) => a.page_no - b.page_no);
    docsByRole[role] = {
      document_id: String(document._id),
      revision_id: String(revisionId),
      input_hash: document.sha256,
      pages,
    };
  }
  return docsByRole;
}
