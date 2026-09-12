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
  busy,
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

  return (
    <>
      <div className="task-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={busy || !applyGate.ok}
          onClick={() => {
            if (!applyGate.ok || !lifecycleApi.markApplied) return;
            void convex.mutation(lifecycleApi.markApplied, {
              changeSetId: changeSet._id as Id<"changeSets">,
              revisionId: applyGate.revisionId as Id<"revisions">,
            });
          }}
        >
          Označi primenjeno
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={busy || !verifyGate.ok}
          onClick={() => {
            if (!verifyGate.ok || !lifecycleApi.markVerified) return;
            void convex.mutation(lifecycleApi.markVerified, {
              changeSetId: changeSet._id as Id<"changeSets">,
              revisionId: verifyGate.revisionId as Id<"revisions">,
            });
          }}
        >
          Proveri novu reviziju
        </button>
      </div>
      {!applyGate.ok && <p className="dossier-hint">{applyGate.reason}</p>}
      {!verifyGate.ok && <p className="dossier-hint">{verifyGate.reason}</p>}
    </>
  );
}
