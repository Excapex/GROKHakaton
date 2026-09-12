import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { anonExtractRoles } from "./lib/perception/anonFixture";
import { assembleFromRoles } from "./lib/perception/assemble";
import { rolesFromPageTexts, type PageTextRow } from "./lib/perception/pageTexts";
import type { IngestDoc } from "./lib/perception/types";
import { hasPageText } from "./pageRoles";

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
        ? anonExtractRoles(revisionId ? String(revisionId) : "rev_extract")
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

/** Page text comes from ingest rows in `pageTexts`; A's mapper groups them by role. */
async function loadTextByRole(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  revisionId: Id<"revisions">,
): Promise<Record<string, IngestDoc>> {
  const stored = await ctx.db
    .query("pageTexts")
    .withIndex("by_revision", (q) => q.eq("revisionId", revisionId))
    .collect();
  if (stored.length === 0) return {};

  const rows: PageTextRow[] = [];
  const documents = new Map<string, { filename: string; sha256: string } | null>();
  for (const row of stored) {
    if (row.projectId !== projectId) continue;
    const key = String(row.documentId);
    if (!documents.has(key)) {
      const document = await ctx.db.get(row.documentId);
      documents.set(
        key,
        document ? { filename: document.filename, sha256: document.sha256 } : null,
      );
    }
    const document = documents.get(key);
    if (!document) continue;
    rows.push({
      documentId: key,
      revisionId: String(revisionId),
      pageNo: row.pageNo,
      text: row.text,
      inputHash: document.sha256,
      filename: document.filename,
    });
  }
  return rolesFromPageTexts(rows, {});
}
