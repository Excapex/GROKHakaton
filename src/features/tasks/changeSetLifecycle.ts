import { api } from "../../../convex/_generated/api";
import type { DefaultFunctionArgs, FunctionReference } from "convex/server";
import { findingClosedOnReread } from "../../../convex/lib/perception/rereadMeasure.ts";

export type LifecycleDoc = {
  _id: string;
  revisionId?: string;
  filename: string;
  kind: string;
  sha256: string;
};

export type LifecycleRevision = {
  _id: string;
  index: number;
};

export type LifecycleChangeSet = {
  _id: string;
  documentId: string;
  questionId?: string;
  lifecycle: "proposed" | "accepted" | "applied" | "verified" | string;
  approvalState: "proposed" | "accepted" | "rejected" | string;
  baseHashes: Record<string, string>;
  designTask?: string | null;
};

export type FindingSnapshot = {
  id: string;
  status: "pass" | "fail" | "conflict" | "unknown";
};

export type ApplyGate =
  | { ok: true; revisionId: string }
  | { ok: false; reason: string };

export type VerifyGate =
  | { ok: true; revisionId: string }
  | { ok: false; reason: string };

export type MarkAppliedArgs = {
  changeSetId: string;
  revisionId: string;
};

export type MarkVerifiedArgs = {
  changeSetId: string;
  revisionId: string;
};

type PublicMutation<Args extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "public",
  Args
>;

export function readChangeSetLifecycleApi(module?: object) {
  if (module) {
    const rec = module as Record<string, unknown>;
    return {
      hasMarkApplied: rec.markApplied != null,
      hasMarkVerified: rec.markVerified != null,
      markApplied: asPublicMutation<MarkAppliedArgs>(rec.markApplied),
      markVerified: asPublicMutation<MarkVerifiedArgs>(rec.markVerified),
    };
  }
  return {
    hasMarkApplied: true,
    hasMarkVerified: true,
    markApplied: api.changeSets.markApplied,
    markVerified: api.changeSets.markVerified,
  };
}

export function asPublicMutation<Args extends DefaultFunctionArgs>(
  value: unknown,
): PublicMutation<Args> | null {
  return value == null ? null : (value as PublicMutation<Args>);
}

export function isCadChangeSet(changeSet: LifecycleChangeSet, documents: LifecycleDoc[]) {
  if (changeSet.designTask) return true;
  const original = documents.find((doc) => doc._id === changeSet.documentId);
  return original?.kind === "dwg" || original?.kind === "dwfx";
}

/** CAD never gets a patch control. Office apply is CLI + upload, not a fake in-browser patch. */
export function patchButtonVisible(changeSet: LifecycleChangeSet, documents: LifecycleDoc[]) {
  return !isCadChangeSet(changeSet, documents);
}

export function copiesOnNewerRevision(
  changeSet: LifecycleChangeSet,
  documents: LifecycleDoc[],
  revisions: LifecycleRevision[],
): ApplyGate {
  const original = documents.find((doc) => doc._id === changeSet.documentId);
  if (!original) {
    return {
      ok: false,
      reason:
        "Original iz ChangeSet-a nije u listi dokumenata. Kopija se ne pretpostavlja.",
    };
  }
  if (!original.revisionId) {
    return {
      ok: false,
      reason: "Revizija originala nije poznata. Nova revizija se ne izmišlja.",
    };
  }
  const originRevision = revisions.find((row) => row._id === original.revisionId);
  if (!originRevision) {
    return {
      ok: false,
      reason: "Revizija originala nije poznata. Nova revizija se ne izmišlja.",
    };
  }
  const copies = documents.filter(
    (doc) =>
      doc.filename === original.filename &&
      !!doc.revisionId &&
      doc.revisionId !== original.revisionId,
  );
  const newer = copies
    .map((doc) => {
      const revision = revisions.find((row) => row._id === doc.revisionId);
      return revision && revision.index > originRevision.index
        ? { doc, revision }
        : null;
    })
    .filter((row): row is { doc: LifecycleDoc; revision: LifecycleRevision } => row !== null)
    .sort((a, b) => b.revision.index - a.revision.index);
  if (newer.length === 0) {
    return {
      ok: false,
      reason:
        "Kopije još nisu otpremljene na novu reviziju. Prihvatanje nije primena.",
    };
  }
  return { ok: true, revisionId: newer[0].revision._id };
}

export function hashMovedOffBase(
  changeSet: LifecycleChangeSet,
  documents: LifecycleDoc[],
  revisionId: string,
): { known: boolean; changed: boolean } {
  const original = documents.find((doc) => doc._id === changeSet.documentId);
  const base =
    changeSet.baseHashes[changeSet.documentId] ??
    (original ? changeSet.baseHashes[original._id] : undefined);
  if (!original || !base) {
    return { known: false, changed: false };
  }
  const copy = documents.find(
    (doc) => doc.revisionId === revisionId && doc.filename === original.filename,
  );
  if (!copy) return { known: false, changed: false };
  return { known: true, changed: copy.sha256 !== base };
}

export function evaluateMarkApplied(input: {
  hasApi: boolean;
  changeSet: LifecycleChangeSet;
  documents: LifecycleDoc[];
  revisions: LifecycleRevision[];
}): ApplyGate {
  if (!input.hasApi) {
    return {
      ok: false,
      reason:
        "Označi primenjeno čeka serverski korak na glavnoj grani. Prihvatanje ga ne zamenjuje.",
    };
  }
  if (input.changeSet.approvalState !== "accepted") {
    return {
      ok: false,
      reason: "Prvo prihvati odluku. Predlog nije primenjen.",
    };
  }
  if (input.changeSet.lifecycle === "proposed") {
    return {
      ok: false,
      reason: "Prihvatanje još nije upisano. Predloženo nije primenjeno.",
    };
  }
  if (input.changeSet.lifecycle === "verified") {
    return { ok: false, reason: "Već je provereno — primena se ne preskače unazad." };
  }
  if (input.changeSet.lifecycle === "applied") {
    return { ok: false, reason: "Već je označeno kao primenjeno." };
  }
  if (input.changeSet.lifecycle !== "accepted") {
    return {
      ok: false,
      reason: "Ovo stanje nije korak za primenu.",
    };
  }
  const copies = copiesOnNewerRevision(
    input.changeSet,
    input.documents,
    input.revisions,
  );
  if (!copies.ok) return copies;
  const hash = hashMovedOffBase(
    input.changeSet,
    input.documents,
    copies.revisionId,
  );
  if (!hash.known) {
    return {
      ok: false,
      reason:
        "Hash kopije nije uporediv sa osnovom. Isti ili nepoznat hash nije primena.",
    };
  }
  if (!hash.changed) {
    return {
      ok: false,
      reason: "Isti hash nije primena. Kopija mora da se razlikuje od osnove.",
    };
  }
  return copies;
}

export function evaluateMarkVerified(input: {
  hasApi: boolean;
  changeSet: LifecycleChangeSet;
  documents: LifecycleDoc[];
  revisions: LifecycleRevision[];
  findingId: string | null;
  pipelineReady: boolean;
  dossierSource: "ingest" | "anon_fixture" | "none" | string | null;
  findings: FindingSnapshot[];
  reviewRevisionId: string | null;
}): VerifyGate {
  if (!input.hasApi) {
    return {
      ok: false,
      reason:
        "Proveri novu reviziju čeka serverski korak na glavnoj grani. Prihvatanje i primena to nisu.",
    };
  }
  if (input.changeSet.lifecycle === "accepted" || input.changeSet.lifecycle === "proposed") {
    return {
      ok: false,
      reason:
        "Provereno se ne upisuje iz Prihvati. Prvo kopije na novoj reviziji, zatim merenje nalaza.",
    };
  }
  if (input.changeSet.lifecycle === "verified") {
    return { ok: false, reason: "Već je provereno." };
  }
  if (input.changeSet.lifecycle !== "applied") {
    return {
      ok: false,
      reason: "Provera ide samo posle primenjeno, nikad preskokom.",
    };
  }
  const copies = copiesOnNewerRevision(
    input.changeSet,
    input.documents,
    input.revisions,
  );
  if (!copies.ok) return copies;
  const hash = hashMovedOffBase(input.changeSet, input.documents, copies.revisionId);
  if (!hash.known) {
    return {
      ok: false,
      reason:
        "Hash kopije nije uporediv sa base hash-om. Nepoznato ostaje neprovereno.",
    };
  }
  if (!hash.changed) {
    return {
      ok: false,
      reason:
        "Isti hash kao osnova nije nova provera. Promena broja revizije nije fizičko rešenje.",
    };
  }
  if (input.dossierSource !== "ingest" || !input.pipelineReady) {
    return {
      ok: false,
      reason:
        "Nema novog čitanja ingestovanog teksta. Anon fixture i prazan dosije nisu provera.",
    };
  }
  if (!input.reviewRevisionId || input.reviewRevisionId !== copies.revisionId) {
    return {
      ok: false,
      reason:
        "Dosije nije sa revizije kopija. Provera se ne veže za staro čitanje.",
    };
  }
  if (!input.findingId) {
    return {
      ok: false,
      reason: "Nalaz nije vezan za ovaj ChangeSet. ID se ne izmišlja.",
    };
  }
  if (!findingClosedOnReread(input.findingId, input.findings)) {
    return {
      ok: false,
      reason: "Novo čitanje nije zatvorilo nalaz. Provera se ne upisuje.",
    };
  }
  return { ok: true, revisionId: copies.revisionId };
}

/**
 * Diff on main links ChangeSet by original documentId, which stays on the
 * previous revision after copies are uploaded. Match by filename instead so
 * apply/verify remain visible on the new revision.
 */
export function changeSetsVisibleOnRevision<T extends LifecycleChangeSet>(
  changeSets: T[],
  documents: LifecycleDoc[],
  revisionId: string,
): T[] {
  const names = new Set(
    documents
      .filter((doc) => doc.revisionId === revisionId)
      .map((doc) => doc.filename),
  );
  return changeSets.filter((changeSet) => {
    const original = documents.find((doc) => doc._id === changeSet.documentId);
    if (!original) return false;
    return original.revisionId === revisionId || names.has(original.filename);
  });
}
