import { mutation, query } from "./_generated/server";

const DEMO_KEY = "pzi-demo-01";

export const getWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_demo_key", (q) => q.eq("demoKey", DEMO_KEY))
      .unique();
    if (!project) return null;
    const revisions = await ctx.db
      .query("revisions")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    revisions.sort((a, b) => a.index - b.index);
    const documentRows = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    const documents = await Promise.all(
      documentRows.map(async (row) => ({
        ...row,
        downloadUrl: await ctx.storage.getUrl(row.storageId),
      })),
    );
    const events = await ctx.db
      .query("events")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    events.sort((a, b) => b.createdAt - a.createdAt);
    return { project, revisions, documents, events: events.slice(0, 40) };
  },
});

export const ensureDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_demo_key", (q) => q.eq("demoKey", DEMO_KEY))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("projects", {
      name: "Objekat A, Lamela 3",
      discipline: "architecture",
      phase: "PZI",
      activeRevisionId: null,
      demoKey: DEMO_KEY,
    });
  },
});
