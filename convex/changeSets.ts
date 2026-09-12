import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { applyAcceptance, applyApplied, applyVerified } from "./approval";
import { designTaskForDocument } from "./changeSetPolicy";
import { assembleFromRoles } from "./lib/perception/assemble";
import { hashesDiffer } from "./lib/perception/hashes";
import { rolesFromPageTexts, type PageTextRow } from "./lib/perception/pageTexts";
import { planFromUploadedDocs } from "./lib/perception/planFromDocuments";
import { measureVerifiedGate } from "./lib/perception/rereadMeasure";
import { hasPageText } from "./pageRoles";

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
    const siblings = await ctx.db
      .query("documents")
      .withIndex("by_revision", (q) => q.eq("revisionId", document.revisionId))
      .collect();
    const plan = planFromUploadedDocs(
      siblings.map((row) => ({
        id: String(row._id),
        filename: row.filename,
        kind: row.kind,
        sha256: row.sha256,
      })),
    );
    const designTask =
      plan?.design_tasks[0]?.description ??
      designTaskForDocument(document.kind, document.filename);
    const changeSetId = await ctx.db.insert("changeSets", {
      projectId: question.projectId,
      questionId,
      documentId: question.documentId,
      lifecycle: "proposed",
      approvalState: "proposed",
      baseHashes: plan?.base_hashes ?? { [document._id]: document.sha256 },
      patches: plan?.patches ?? [],
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

export const markApplied = mutation({
  args: {
    changeSetId: v.id("changeSets"),
    revisionId: v.id("revisions"),
  },
  handler: async (ctx, { changeSetId, revisionId }) => {
    const changeSet = await ctx.db.get(changeSetId);
    if (!changeSet) throw new Error("ChangeSet ne postoji.");
    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.projectId !== changeSet.projectId) {
      throw new Error("Revizija ne pripada ovom predmetu.");
    }
    const replaced = await revisionHashMoved(ctx, changeSet.baseHashes, revisionId);
    if (!replaced) {
      throw new Error(
        "Nema zamenjenog originala na ovoj reviziji. Isti hash nije primena.",
      );
    }
    const result = applyApplied({
      approvalState: changeSet.approvalState,
      lifecycle: changeSet.lifecycle,
      approvedBy: changeSet.approvedBy,
      approvedAt: changeSet.approvedAt,
    });
    if (result.error) throw new Error(result.error);
    if (result.duplicated) return { changeSetId, duplicated: true as const };
    await ctx.db.patch(changeSetId, { lifecycle: result.snapshot.lifecycle });
    await ctx.db.patch(revisionId, { derivedFromChangeSetId: changeSetId });
    await ctx.db.insert("events", {
      projectId: changeSet.projectId,
      type: "changeset_applied",
      message: "Kopije su na novoj reviziji. To još nije provereno.",
      documentId: changeSet.documentId,
      revisionId,
      createdAt: Date.now(),
    });
    return { changeSetId, duplicated: false as const };
  },
});

export const markVerified = mutation({
  args: {
    changeSetId: v.id("changeSets"),
    revisionId: v.id("revisions"),
  },
  handler: async (ctx, { changeSetId, revisionId }) => {
    const changeSet = await ctx.db.get(changeSetId);
    if (!changeSet) throw new Error("ChangeSet ne postoji.");
    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.projectId !== changeSet.projectId) {
      throw new Error("Revizija ne pripada ovom predmetu.");
    }
    const question = await ctx.db.get(changeSet.questionId);
    const findingId = question?.findingId?.trim() ?? "";
    const inputHashChanged = await revisionHashMoved(
      ctx,
      changeSet.baseHashes,
      revisionId,
    );
    const docsByRole = await loadRolesForRevision(
      ctx,
      changeSet.projectId,
      revisionId,
    );
    const assembled = hasPageText(docsByRole)
      ? assembleFromRoles(docsByRole, {
          projectId: String(changeSet.projectId),
          revisionId: String(revisionId),
        })
      : null;
    const gate = measureVerifiedGate({
      hasIngestText: assembled?.pipelineReady === true,
      inputHashChanged,
      findingId,
      findings: assembled?.pipelineReady ? assembled.dossier.findings : [],
    });
    if (!gate.ok) throw new Error(gate.reason);
    const result = applyVerified(
      {
        approvalState: changeSet.approvalState,
        lifecycle: changeSet.lifecycle,
        approvedBy: changeSet.approvedBy,
        approvedAt: changeSet.approvedAt,
      },
      {
        inputHashChanged: true,
        findingClosedOnReread: true,
      },
    );
    if (result.error) throw new Error(result.error);
    if (result.duplicated) {
      return { changeSetId, duplicated: true as const };
    }
    await ctx.db.patch(changeSetId, { lifecycle: "verified" });
    await ctx.db.insert("events", {
      projectId: changeSet.projectId,
      type: "changeset_verified",
      message: "Novo čitanje je zatvorilo nalaz. To nije saglasnost.",
      documentId: changeSet.documentId,
      revisionId,
      createdAt: Date.now(),
    });
    return { changeSetId, duplicated: false as const };
  },
});

async function revisionHashMoved(
  ctx: MutationCtx,
  baseHashes: Record<string, string>,
  revisionId: Id<"revisions">,
): Promise<boolean> {
  const currentDocs = await ctx.db
    .query("documents")
    .withIndex("by_revision", (q) => q.eq("revisionId", revisionId))
    .collect();
  for (const [documentId, hash] of Object.entries(baseHashes)) {
    const original = await ctx.db.get(documentId as Id<"documents">);
    if (!original) continue;
    const next = currentDocs.find((row) => row.filename === original.filename);
    if (next && hashesDiffer(next.sha256, hash)) return true;
  }
  return false;
}

async function loadRolesForRevision(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  revisionId: Id<"revisions">,
) {
  const stored = await ctx.db
    .query("pageTexts")
    .withIndex("by_revision", (q) => q.eq("revisionId", revisionId))
    .collect();
  const rows: PageTextRow[] = [];
  const documents = new Map<string, { filename: string; sha256: string } | null>();
  for (const row of stored) {
    if (row.projectId !== projectId) continue;
    const key = String(row.documentId);
    if (!documents.has(key)) {
      const document = await ctx.db.get(row.documentId);
      documents.set(
        key,
        document ? { filename: document.filename, sha256: document.sha256 } : null,
      );
    }
    const document = documents.get(key);
    if (!document) continue;
    rows.push({
      documentId: key,
      revisionId: String(revisionId),
      pageNo: row.pageNo,
      text: row.text,
      inputHash: document.sha256,
      filename: document.filename,
    });
  }
  return rolesFromPageTexts(rows, {});
}
