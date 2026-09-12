import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
