import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** S03: originals live in Convex storage; rows never overwrite a previous file. */
export default defineSchema({
  projects: defineTable({
    name: v.string(),
    discipline: v.string(),
    phase: v.string(),
    activeRevisionId: v.union(v.id("revisions"), v.null()),
    demoKey: v.optional(v.string()),
  }).index("by_demo_key", ["demoKey"]),

  revisions: defineTable({
    projectId: v.id("projects"),
    index: v.number(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  documents: defineTable({
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    filename: v.string(),
    mime: v.string(),
    kind: v.string(),
    sha256: v.string(),
    storageId: v.id("_storage"),
    parsePolicy: v.union(v.literal("ingest"), v.literal("store_only")),
    byteSize: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_revision", ["revisionId"])
    .index("by_sha_revision", ["revisionId", "sha256"]),

  artifacts: defineTable({
    documentId: v.id("documents"),
    revisionId: v.id("revisions"),
    kind: v.union(
      v.literal("original"),
      v.literal("page_render"),
      v.literal("text"),
    ),
    storageId: v.id("_storage"),
    pageNo: v.optional(v.number()),
  })
    .index("by_document", ["documentId"])
    .index("by_revision", ["revisionId"]),

  events: defineTable({
    projectId: v.id("projects"),
    type: v.string(),
    message: v.string(),
    documentId: v.optional(v.id("documents")),
    revisionId: v.optional(v.id("revisions")),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
});
