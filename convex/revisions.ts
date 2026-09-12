import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const rows = await ctx.db
      .query("revisions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return rows.sort((a, b) => a.index - b.index);
  },
});

/**
 * What changed between a revision and the one before it. Comparison is by
 * filename + sha256 of stored originals; a file nobody re-uploaded stays
 * `unchanged` instead of being reported as work.
 */
export const diff = query({
  args: { projectId: v.id("projects"), revisionId: v.id("revisions") },
  handler: async (ctx, { projectId, revisionId }) => {
    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.projectId !== projectId) return null;

    const all = await ctx.db
      .query("revisions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    const previous = all
      .filter((row) => row.index < revision.index)
      .sort((a, b) => b.index - a.index)[0];

    const current = await documentsOf(ctx, revisionId);
    const before = previous ? await documentsOf(ctx, previous._id) : [];
    const beforeByName = new Map(before.map((doc) => [doc.filename, doc]));

    const entries = current.map((doc) => {
      const old = beforeByName.get(doc.filename);
      const state = !old
        ? ("added" as const)
        : old.sha256 === doc.sha256
          ? ("unchanged" as const)
          : ("replaced" as const);
      return {
        documentId: doc._id,
        filename: doc.filename,
        kind: doc.kind,
        state,
        sha256: doc.sha256,
        previousSha256: old?.sha256 ?? null,
      };
    });

    const carriedOver = before
      .filter((doc) => !current.some((row) => row.filename === doc.filename))
      .map((doc) => ({
        documentId: doc._id,
        filename: doc.filename,
        kind: doc.kind,
        state: "carried_over" as const,
        sha256: doc.sha256,
        previousSha256: doc.sha256,
      }));

    const changeSets = await ctx.db
      .query("changeSets")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    const documentIds = new Set(current.map((doc) => String(doc._id)));

    const linked = [];
    for (const changeSet of changeSets) {
      if (!documentIds.has(String(changeSet.documentId))) continue;
      const question = await ctx.db.get(changeSet.questionId);
      const document = await ctx.db.get(changeSet.documentId);
      linked.push({
        changeSetId: changeSet._id,
        lifecycle: changeSet.lifecycle,
        approvalState: changeSet.approvalState,
        findingId: question?.findingId ?? null,
        filename: document?.filename ?? "nepoznat dokument",
        designTask: changeSet.designTask ?? null,
        /** A replaced file is only proof of a rewrite once the hash moves off the base. */
        appliedToThisRevision:
          changeSet.lifecycle === "applied" || changeSet.lifecycle === "verified",
      });
    }

    return {
      revisionIndex: revision.index,
      previousIndex: previous?.index ?? null,
      entries: [...entries, ...carriedOver],
      changeSets: linked,
      partialReason:
        current.length === 0
          ? "Revizija još nema otpremljen original, pa se nema šta porediti."
          : previous
            ? null
            : "Prva revizija nema prethodnu, pa je svaki fajl nov.",
    };
  },
});

async function documentsOf(ctx: QueryCtx, revisionId: Id<"revisions">) {
  return await ctx.db
    .query("documents")
    .withIndex("by_revision", (q) => q.eq("revisionId", revisionId))
    .collect();
}

export const createNext = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Predmet ne postoji.");
    const existing = await ctx.db
      .query("revisions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    const index = existing.reduce((max, row) => Math.max(max, row.index), 0) + 1;
    const revisionId = await ctx.db.insert("revisions", {
      projectId,
      index,
      createdAt: Date.now(),
    });
    await ctx.db.patch(projectId, { activeRevisionId: revisionId });
    await ctx.db.insert("events", {
      projectId,
      type: "revision_created",
      message: `Otvorena revizija ${index}. Prethodni originali ostaju sačuvani.`,
      revisionId,
      createdAt: Date.now(),
    });
    return revisionId;
  },
});
