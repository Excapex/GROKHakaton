import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    questions.sort((a, b) => b.createdAt - a.createdAt);
    const rows = await Promise.all(
      questions.map(async (question) => {
        const answers = await ctx.db
          .query("answers")
          .withIndex("by_question", (q) => q.eq("questionId", question._id))
          .collect();
        answers.sort((a, b) => a.createdAt - b.createdAt);
        const document = await ctx.db.get(question.documentId);
        return { question, answers, document };
      }),
    );
    return rows;
  },
});

export const ask = mutation({
  args: {
    projectId: v.id("projects"),
    findingId: v.string(),
    documentId: v.id("documents"),
    prompt: v.string(),
    createdBy: v.string(),
    blocking: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const findingId = args.findingId.trim();
    const prompt = args.prompt.trim();
    if (!findingId) throw new Error("Pitanje mora da referiše konkretan nalaz.");
    if (!prompt) throw new Error("Tekst pitanja je prazan.");
    const project = await ctx.db.get(args.projectId);
    const document = await ctx.db.get(args.documentId);
    if (!project || !document || document.projectId !== args.projectId) {
      throw new Error("Dokaz mora biti original iz ovog predmeta.");
    }
    const questionId = await ctx.db.insert("questions", {
      projectId: args.projectId,
      findingId,
      documentId: args.documentId,
      prompt,
      blocking: args.blocking ?? true,
      createdAt: Date.now(),
      createdBy: args.createdBy.trim() || "nepoznat",
    });
    await ctx.db.insert("events", {
      projectId: args.projectId,
      type: "question_asked",
      message: `Pitanje o nalazu ${findingId} uz dokaz ${document.filename}.`,
      documentId: args.documentId,
      createdAt: Date.now(),
    });
    return questionId;
  },
});

export const answer = mutation({
  args: {
    questionId: v.id("questions"),
    body: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Pitanje ne postoji.");
    const body = args.body.trim();
    if (!body) throw new Error("Odgovor je prazan.");
    const answerId = await ctx.db.insert("answers", {
      questionId: args.questionId,
      body,
      author: args.author.trim() || "nepoznat",
      createdAt: Date.now(),
    });
    await ctx.db.insert("events", {
      projectId: question.projectId,
      type: "question_answered",
      message: `Odgovor (${args.author}) na pitanje o nalazu ${question.findingId}.`,
      documentId: question.documentId,
      createdAt: Date.now(),
    });
    return answerId;
  },
});
