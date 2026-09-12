import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { anonExtractRoles } from "./lib/perception/anonFixture";
import { assembleFromRoles } from "./lib/perception/assemble";
import {
  chooseDossierSource,
  EMPTY_DOSSIER_REASON,
} from "./lib/perception/dossierSource";
import { rolesFromPageTexts, type PageTextRow } from "./lib/perception/pageTexts";
import type { IngestDoc } from "./lib/perception/types";
import { hasPageText } from "./pageRoles";

const ANON_NOTE =
  "Nalazi su izračunati nad javnim anon fixture tekstom, ne nad vašim dokumentima. Ingest vaših originala još nije povezan.";

function empty(reason = EMPTY_DOSSIER_REASON) {
  return {
    pipelineReady: false as const,
    dossier: null as null,
    source: "none" as const,
    sourceNote: null,
    reason,
  };
}

/**
 * Active dossier for a subject. Findings come from real page text run through
 * the R1–R6 engine. Uploaded originals never fall back to the demo fixture.
 * An empty newer check still reads ingest from the latest revision that has text.
 */
export const getActive = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;

    const revisions = await ctx.db
      .query("revisions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    revisions.sort((a, b) => b.index - a.index);

    const uploaded = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();

    const textByRevision = new Map<string, Record<string, IngestDoc>>();
    const load = async (revisionId: Id<"revisions">) => {
      const key = String(revisionId);
      const cached = textByRevision.get(key);
      if (cached) return cached;
      const loaded = await loadTextByRole(ctx, projectId, revisionId);
      textByRevision.set(key, loaded);
      return loaded;
    };

    const activeId = project.activeRevisionId;
    let revisionId = activeId;
    let ingested: Record<string, IngestDoc> = activeId ? await load(activeId) : {};
    if (!hasPageText(ingested)) {
      for (const row of revisions) {
        const candidate = await load(row._id);
        if (hasPageText(candidate)) {
          revisionId = row._id;
          ingested = candidate;
          break;
        }
      }
    }

    const usesIngest = hasPageText(ingested);
    const ingestEvents = await ctx.db
      .query("events")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    ingestEvents.sort((a, b) => b.createdAt - a.createdAt);
    const ingestEvent = ingestEvents.find(
      (row) =>
        row.type === "ingest_failed" ||
        row.type === "ingest_skipped" ||
        row.type === "ingest_done",
    );

    const source = chooseDossierSource({
      hasIngestText: usesIngest,
      hasUploadedDocuments: Boolean(uploaded),
      demoKey: project.demoKey,
      ingestEventType: ingestEvent?.type,
      ingestEventMessage: ingestEvent?.message,
    });

    if (source.kind === "none") return empty(source.reason);

    const docsByRole: Record<string, IngestDoc> =
      source.kind === "ingest"
        ? ingested
        : anonExtractRoles(revisionId ? String(revisionId) : "rev_extract");

    if (!hasPageText(docsByRole)) return empty();

    const assembled = assembleFromRoles(docsByRole, {
      projectId: String(project._id),
      revisionId: revisionId ? String(revisionId) : "rev_extract",
    });
    if (!assembled.pipelineReady) return empty();

    return {
      ...assembled,
      source: source.kind,
      sourceNote: source.kind === "ingest" ? null : ANON_NOTE,
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
