"use node";

import { Daytona } from "@daytonaio/sdk";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { daytonaConfig } from "../lib/daytona/client";
import {
  EXTRACT_TEXT_PY,
  ingestGate,
  pagesFromExtractJson,
  remoteIngestName,
  skipCadResult,
  unavailableResult,
  type IngestPagesResult,
} from "../lib/daytona/ingestResult";

const MAX_BYTES = 15 * 1024 * 1024;
const MISSING_BLOB = "Fajl nije u storage. Nema izmišljenih strana.";
const TOO_LARGE = "Fajl je veći od 15 MB za ovaj ingest; strane se ne izmišljaju.";
const UNSUPPORTED = "Ovaj format se ne parsira. Nema izmišljenih strana.";

/**
 * Storage → fizičke strane, zatim internal write u `pageTexts`.
 * Bez Daytona ključa ili za CAD: prazan pages, nikad lažan page_no.
 */
export const fromStorage = action({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    parsePolicy: v.union(v.literal("ingest"), v.literal("store_only")),
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    documentId: v.id("documents"),
  },
  handler: async (ctx, args): Promise<IngestPagesResult> => {
    const gate = ingestGate({
      parsePolicy: args.parsePolicy,
      daytonaConfigured: Boolean(daytonaConfig()),
    });
    if (gate.action === "skip_cad") return skipCadResult();
    if (gate.action === "unavailable") {
      await ctx.runMutation(internal.pageTexts.recordEvent, {
        projectId: args.projectId,
        documentId: args.documentId,
        revisionId: args.revisionId,
        type: "ingest_skipped",
        message: gate.reason,
      });
      return unavailableResult(gate.reason);
    }

    const remoteName = remoteIngestName(args.filename);
    if (!remoteName) return unavailableResult(UNSUPPORTED);

    const blob = await ctx.storage.get(args.storageId);
    if (!blob) return unavailableResult(MISSING_BLOB);

    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) return unavailableResult(TOO_LARGE);

    const extracted = await extractOnDaytona(bytes, remoteName);
    if (extracted.ok) {
      await ctx.runMutation(internal.pageTexts.replaceForDocument, {
        projectId: args.projectId,
        revisionId: args.revisionId,
        documentId: args.documentId,
        pages: extracted.pages.map((page) => ({
          page_no: page.page_no,
          text: page.text,
        })),
      });
      await ctx.runMutation(internal.pageTexts.recordEvent, {
        projectId: args.projectId,
        documentId: args.documentId,
        revisionId: args.revisionId,
        type: "ingest_done",
        message: `Ingest ${args.filename}: ${extracted.pages.length} strana.`,
      });
    } else {
      await ctx.runMutation(internal.pageTexts.recordEvent, {
        projectId: args.projectId,
        documentId: args.documentId,
        revisionId: args.revisionId,
        type: "ingest_failed",
        message: extracted.reason,
      });
    }
    return extracted;
  },
});

async function extractOnDaytona(
  bytes: Uint8Array,
  remoteName: string,
): Promise<IngestPagesResult> {
  const cfg = daytonaConfig();
  if (!cfg) return unavailableResult("Daytona konfiguracija nestala tokom poziva.");

  const daytona = new Daytona({ apiKey: cfg.apiKey });
  const sandbox = await daytona.create({
    snapshot: cfg.snapshot,
    language: "python",
    autoStopInterval: 15,
  });
  try {
    await sandbox.fs.uploadFileStream(bytes, remoteName);
    await sandbox.fs.uploadFileStream(
      new TextEncoder().encode(EXTRACT_TEXT_PY),
      "tmp/extract_text.py",
    );
    const ran = await sandbox.process.executeCommand(
      `python3 tmp/extract_text.py ${remoteName}`,
      undefined,
      undefined,
      120,
    );
    if (ran.exitCode !== 0) {
      return unavailableResult(
        `Ingest sandbox exit ${ran.exitCode}. Nema izmišljenih strana.`,
      );
    }
    const stdout = ran.result ?? ran.artifacts?.stdout ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return unavailableResult("Ingest JSON nije parsiran. Nema izmišljenih strana.");
    }
    const pages = pagesFromExtractJson(parsed);
    return { ok: true, pages, skipped: "none", reason: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daytona ingest nije uspeo.";
    return unavailableResult(`${message} Nema izmišljenih strana.`);
  } finally {
    await daytona.delete(sandbox);
  }
}
