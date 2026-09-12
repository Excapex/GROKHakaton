import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Active dossier for a subject. Engine (#9) will persist a real Dossier here.
 * Until that write exists this query returns no findings — never a fabricated pack.
 */
export const getActive = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;
    return {
      pipelineReady: false as const,
      dossier: null as null,
      reason:
        "Pregled je prihvaćen samo kao zahtev. Engine još nije upisao dosije, pa nema nalaza ni citiranih strana.",
    };
  },
});
