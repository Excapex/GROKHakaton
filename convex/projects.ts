import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

const DEMO_KEY = "pzi-demo-01";

/**
 * Predmet se bira eksplicitno. `demoKey` je i dalje podrazumevani predmet na
 * praznom deploymentu, ali više nije jedini — `.unique()` nad jednim redom je
 * bio razlog zašto izbor projekata nije mogao da radi.
 */
async function resolveProject(
  ctx: QueryCtx,
  projectId?: Id<"projects">,
): Promise<Doc<"projects"> | null> {
  if (projectId) return await ctx.db.get(projectId);
  const demo = await ctx.db
    .query("projects")
    .withIndex("by_demo_key", (q) => q.eq("demoKey", DEMO_KEY))
    .unique();
  if (demo) return demo;
  // Bez demo ključa uzmi najstariji predmet, da prazan izbor ne sruši prikaz.
  const all = await ctx.db.query("projects").collect();
  return all[0] ?? null;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const rows = await Promise.all(
      projects.map(async (project) => {
        const revisions = await ctx.db
          .query("revisions")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        const lastAt = revisions.reduce(
          (latest, row) => Math.max(latest, row.createdAt),
          0,
        );
        return {
          _id: project._id,
          name: project.name,
          discipline: project.discipline,
          phase: project.phase,
          isDemo: project.demoKey === DEMO_KEY,
          revisionCount: revisions.length,
          lastRevisionAt: lastAt > 0 ? lastAt : null,
        };
      }),
    );
    // Demo predmet prvi, ostali od najskorijeg rada.
    rows.sort((a, b) => {
      if (a.isDemo !== b.isDemo) return a.isDemo ? -1 : 1;
      return (b.lastRevisionAt ?? 0) - (a.lastRevisionAt ?? 0);
    });
    return rows;
  },
});

export const getWorkspace = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, { projectId }) => {
    const project = await resolveProject(ctx, projectId);
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

export const create = mutation({
  args: {
    name: v.string(),
    discipline: v.string(),
    phase: v.string(),
  },
  handler: async (ctx, { name, discipline, phase }) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Naziv predmeta ne može biti prazan.");
    return await ctx.db.insert("projects", {
      name: trimmed,
      discipline,
      phase,
      activeRevisionId: null,
    });
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
