import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { isCadKind, policyForFilename } from "./filePolicy";

/** OWNERSHIP EXCEPTION (#48): A schedules ingest after register; B keeps `src/`. */

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const register = mutation({
  args: {
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mime: v.string(),
    sha256: v.string(),
    byteSize: v.number(),
  },
  handler: async (ctx, args) => {
    const policy = policyForFilename(args.filename);
    if (!policy) {
      throw new Error(
        "Podržani formati su PDF, DOCX, XLSX, DWG i DWFX. Ovaj fajl nije primljen.",
      );
    }
    const project = await ctx.db.get(args.projectId);
    const revision = await ctx.db.get(args.revisionId);
    if (!project || !revision || revision.projectId !== args.projectId) {
      throw new Error("Revizija ne pripada ovom predmetu.");
    }
    const duplicate = await ctx.db
      .query("documents")
      .withIndex("by_sha_revision", (q) =>
        q.eq("revisionId", args.revisionId).eq("sha256", args.sha256),
      )
      .unique();
    if (duplicate) {
      if (duplicate.parsePolicy === "ingest") {
        await ctx.scheduler.runAfter(0, api.workflows.ingest.fromStorage, {
          storageId: duplicate.storageId,
          filename: duplicate.filename,
          parsePolicy: duplicate.parsePolicy,
          projectId: args.projectId,
          revisionId: args.revisionId,
          documentId: duplicate._id,
        });
      }
      return duplicate._id;
    }
    const documentId = await ctx.db.insert("documents", {
      projectId: args.projectId,
      revisionId: args.revisionId,
      filename: args.filename,
      mime: args.mime,
      kind: policy.kind,
      sha256: args.sha256,
      storageId: args.storageId,
      parsePolicy: policy.parsePolicy,
      byteSize: args.byteSize,
    });
    await ctx.db.insert("artifacts", {
      documentId,
      revisionId: args.revisionId,
      kind: "original",
      storageId: args.storageId,
    });
    await ctx.db.insert("events", {
      projectId: args.projectId,
      type: "document_uploaded",
      message: `Sačuvan original ${args.filename} (sha256 ${args.sha256.slice(0, 12)}…).`,
      documentId,
      revisionId: args.revisionId,
      createdAt: Date.now(),
    });
    if (isCadKind(policy.kind)) {
      await ctx.db.insert("events", {
        projectId: args.projectId,
        type: "design_task",
        message: `CAD izvor ${args.filename} je evidentiran bez parsiranja. Izmena je projektantski zadatak.`,
        documentId,
        revisionId: args.revisionId,
        createdAt: Date.now(),
      });
    } else {
      await ctx.scheduler.runAfter(0, api.workflows.ingest.fromStorage, {
        storageId: args.storageId,
        filename: args.filename,
        parsePolicy: policy.parsePolicy,
        projectId: args.projectId,
        revisionId: args.revisionId,
        documentId,
      });
    }
    return documentId;
  },
});

export const downloadUrl = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const document = await ctx.db.get(documentId);
    if (!document) return null;
    const url = await ctx.storage.getUrl(document.storageId);
    return { url, filename: document.filename, sha256: document.sha256 };
  },
});
