import { useState } from "react";
import { useConvex } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  evaluateMarkApplied,
  evaluateMarkVerified,
  readChangeSetLifecycleApi,
  type FindingSnapshot,
  type LifecycleChangeSet,
  type LifecycleDoc,
  type LifecycleRevision,
} from "./changeSetLifecycle.ts";

export type ReviewSnapshot = {
  pipelineReady?: boolean;
  source?: string | null;
  dossier?: { findings?: FindingSnapshot[] } | null;
  review_run?: { revision_id?: string };
};

export function ChangeSetLifecycleActions({
  changeSet,
  documents,
  revisions,
  findingId,
  review,
  busy: busyFromParent,
}: {
  changeSet: LifecycleChangeSet & { _id: string };
  documents: LifecycleDoc[];
  revisions: LifecycleRevision[];
  findingId: string | null;
  review: ReviewSnapshot | null | undefined;
  busy?: boolean;
}) {
  const convex = useConvex();
  const lifecycleApi = readChangeSetLifecycleApi();
  const [localBusy, setLocalBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(
    null,
  );
  const busy = busyFromParent || localBusy;
  const applyGate = evaluateMarkApplied({
    hasApi: lifecycleApi.hasMarkApplied,
    changeSet,
    documents,
    revisions,
  });
  const verifyGate = evaluateMarkVerified({
    hasApi: lifecycleApi.hasMarkVerified,
    changeSet,
    documents,
    revisions,
    findingId,
    pipelineReady: review?.pipelineReady === true,
    dossierSource: review?.source ?? "none",
    findings: review?.dossier?.findings ?? [],
    reviewRevisionId: review?.review_run?.revision_id ?? null,
  });

  async function runApplied() {
    if (!applyGate.ok || !lifecycleApi.markApplied) return;
    setLocalBusy(true);
    setNotice(null);
    try {
      await convex.mutation(lifecycleApi.markApplied, {
        changeSetId: changeSet._id as Id<"changeSets">,
        revisionId: applyGate.revisionId as Id<"revisions">,
      });
      setNotice({
        tone: "ok",
        text: "Označeno primenjeno na kopijama nove revizije. To još nije provera nalaza.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Primena nije upisana.",
      });
    } finally {
      setLocalBusy(false);
    }
  }

  async function runVerified() {
    if (!verifyGate.ok || !lifecycleApi.markVerified) return;
    setLocalBusy(true);
    setNotice(null);
    try {
      await convex.mutation(lifecycleApi.markVerified, {
        changeSetId: changeSet._id as Id<"changeSets">,
        revisionId: verifyGate.revisionId as Id<"revisions">,
      });
      setNotice({
        tone: "ok",
        text: "Provera upisana: hash je promenjen i nalaz je zatvoren na novom čitanju.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Provera nije upisana.",
      });
    } finally {
      setLocalBusy(false);
    }
  }

  return (
    <>
      <div className="task-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={busy || !applyGate.ok}
          onClick={() => void runApplied()}
        >
          Označi primenjeno
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={busy || !verifyGate.ok}
          onClick={() => void runVerified()}
        >
          Proveri novu reviziju
        </button>
      </div>
      {notice && (
        <p
          className={notice.tone === "error" ? "inline-error" : "inline-status"}
          role="status"
        >
          {notice.text}
        </p>
      )}
      {!applyGate.ok && <p className="dossier-hint">{applyGate.reason}</p>}
      {!verifyGate.ok && <p className="dossier-hint">{verifyGate.reason}</p>}
    </>
  );
}
