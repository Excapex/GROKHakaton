import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { applyAcceptance } from "./approval";
import { designTaskForDocument } from "./changeSetPolicy";

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const rows = await ctx.db
      .query("changeSets")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  },
});

export const proposeFromQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Pitanje ne postoji.");
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("questionId", questionId))
      .collect();
    if (answers.length === 0) {
      throw new Error("ChangeSet se predlaže tek posle odgovora projektanta.");
    }
    const existing = await ctx.db
      .query("changeSets")
      .withIndex("by_question", (q) => q.eq("questionId", questionId))
      .unique();
    if (existing) return existing._id;
    const document = await ctx.db.get(question.documentId);
    if (!document) throw new Error("Dokaz više nije dostupan.");
    const designTask = designTaskForDocument(document.kind, document.filename);
    const changeSetId = await ctx.db.insert("changeSets", {
      projectId: question.projectId,
      questionId,
      documentId: question.documentId,
      lifecycle: "proposed",
      approvalState: "proposed",
      baseHashes: { [document._id]: document.sha256 },
      ...(designTask ? { designTask } : {}),
      createdAt: Date.now(),
    });
    await ctx.db.insert("events", {
      projectId: question.projectId,
      type: "changeset_proposed",
      message: `Predložen ChangeSet za nalaz ${question.findingId}. Prihvatanje nije saglasnost.`,
      documentId: question.documentId,
      createdAt: Date.now(),
    });
    return changeSetId;
  },
});

export const accept = mutation({
  args: {
    changeSetId: v.id("changeSets"),
    actor: v.string(),
  },
  handler: async (ctx, { changeSetId, actor }) => {
    const changeSet = await ctx.db.get(changeSetId);
    if (!changeSet) throw new Error("ChangeSet ne postoji.");
    const result = applyAcceptance(
      {
        approvalState: changeSet.approvalState,
        lifecycle: changeSet.lifecycle,
        approvedBy: changeSet.approvedBy,
        approvedAt: changeSet.approvedAt,
      },
      actor.trim() || "nepoznat",
      Date.now(),
    );
    if (result.duplicated) {
      return { changeSetId, duplicated: true as const };
    }
    await ctx.db.patch(changeSetId, {
      approvalState: result.snapshot.approvalState,
      lifecycle: result.snapshot.lifecycle,
      approvedBy: result.snapshot.approvedBy,
      approvedAt: result.snapshot.approvedAt,
    });
    await ctx.db.insert("events", {
      projectId: changeSet.projectId,
      type: "changeset_accepted",
      message: `Prihvaćena projektantska odluka. To nije saglasnost i nije provereno.`,
      documentId: changeSet.documentId,
      createdAt: Date.now(),
    });
    return { changeSetId, duplicated: false as const };
  },
});
