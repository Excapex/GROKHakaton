import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * OWNERSHIP EXCEPTION (issue #48 / #51): A writes this CRUD so ingest can
 * persist page text while B works on `src/`. Schema shape is unchanged.
 */
export const replaceForDocument = internalMutation({
  args: {
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    documentId: v.id("documents"),
    pages: v.array(
      v.object({
        page_no: v.number(),
        text: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pageTexts")
      .withIndex("by_document_page", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    let written = 0;
    for (const page of args.pages) {
      if (!Number.isInteger(page.page_no) || page.page_no < 1) continue;
      await ctx.db.insert("pageTexts", {
        projectId: args.projectId,
        revisionId: args.revisionId,
        documentId: args.documentId,
        pageNo: page.page_no,
        text: page.text,
      });
      written += 1;
    }
    return { written };
  },
});

export const recordEvent = internalMutation({
  args: {
    projectId: v.id("projects"),
    documentId: v.optional(v.id("documents")),
    revisionId: v.optional(v.id("revisions")),
    type: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("events", {
      projectId: args.projectId,
      type: args.type,
      message: args.message,
      documentId: args.documentId,
      revisionId: args.revisionId,
      createdAt: Date.now(),
    });
  },
});
