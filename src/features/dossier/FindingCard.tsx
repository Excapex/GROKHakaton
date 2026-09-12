import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { mappedRuleCopy } from "../../../convex/lib/perception/mappedRuleCopy.ts";
import type {
  Dossier,
  Evidence,
  Finding,
  Observation,
} from "../../../contracts/types.ts";
import { ChangeSetLifecycleActions } from "../tasks/ChangeSetLifecycleActions.tsx";
import { downloadChangeSet } from "../tasks/changeSetExport.ts";
import {
  FINDING_STATUS_LABELS,
  LIFECYCLE_LABELS,
  LIFECYCLE_ORDER,
  observationsForFinding,
} from "./dossierView.ts";
import {
  documentSourceLabel,
  elementLabel,
  extraFindingDetail,
  findingTitle,
  isVagueElement,
  observationValue,
  slotLabel,
} from "./engineLabels.ts";

const ACTOR = "M. Jovanović";

export type FindingDocument = {
  _id: Id<"documents">;
  filename: string;
  kind: string;
  sha256: string;
  revisionId?: Id<"revisions">;
};

type Thread = {
  question: {
    _id: Id<"questions">;
    findingId: string;
    prompt: string;
    documentId: Id<"documents">;
  };
  answers: Array<{
    _id: string;
    author: string;
    body: string;
    createdAt: number;
  }>;
  document?: { filename?: string } | null;
};

type ChangeSetRow = {
  _id: Id<"changeSets">;
  questionId: Id<"questions">;
  documentId: Id<"documents">;
  lifecycle: "proposed" | "accepted" | "applied" | "verified";
  approvalState: "proposed" | "accepted" | "rejected";
  baseHashes: Record<string, string>;
  designTask?: string;
  approvedBy?: string;
  approvedAt?: number;
};

export function FindingCard({
  projectId,
  finding,
  findingIds,
  dossier,
  evidence,
  documents,
  threads,
  changeSets,
  revisions,
  review,
}: {
  projectId: Id<"projects">;
  finding: Finding;
  findingIds: readonly string[];
  dossier: Dossier;
  evidence: Evidence[];
  documents: FindingDocument[];
  threads: Thread[];
  changeSets: ChangeSetRow[];
  revisions: Array<{ _id: Id<"revisions">; index: number; createdAt: number }>;
  review: {
    pipelineReady?: boolean;
    source?: string | null;
    dossier?: Dossier | null;
    review_run?: { revision_id?: string };
  } | null;
}) {
  const rule = mappedRuleCopy(finding.rule_id);
  const observations = observationsForFinding(dossier, finding);
  const relatedThreads = threads.filter(
    (row) => row.question.findingId === finding.id,
  );
  const relatedIds = new Set(
    relatedThreads.map((row) => String(row.question._id)),
  );
  const relatedSets = changeSets.filter((row) =>
    relatedIds.has(String(row.questionId)),
  );
  const distinctRationale =
    rule && finding.rationale
      ? extraFindingDetail(rule.primedba, finding.rationale)
      : null;
  const next = dossier.next_actions.find((action) => {
    if (action.kind === "ask") {
      return dossier.questions.some(
        (question) =>
          question.id === action.question_id &&
          question.finding_ids.includes(finding.id),
      );
    }
    if (action.kind === "propose_patch") {
      return action.change_set_id === `cs_${finding.id}`;
    }
    if (action.kind === "design_task") {
      return action.description.includes(finding.rule_id);
    }
    return false;
  });

  return (
    <article
      className={`finding-card status-${finding.status}`}
      aria-labelledby={`finding-${finding.id}`}
    >
      <header className="finding-card-head">
        <div className="finding-card-meta">
          <span className={`kind-chip status-${finding.status}`}>
            {FINDING_STATUS_LABELS[finding.status]}
          </span>
          <span className="rule-ref">Pravilo {finding.rule_id}</span>
        </div>
        <h3 id={`finding-${finding.id}`}>
          {findingTitle(finding.id, findingIds)}
        </h3>
        <p className="finding-section">
          {rule?.section ?? "Pravilo iz kataloga ZOP"}
        </p>
      </header>

      <section>
        <h4>Šta nije u redu</h4>
        <p>{rule?.primedba ?? finding.rationale}</p>
        {distinctRationale && (
          <p className="finding-detail">{distinctRationale}</p>
        )}
      </section>

      <section>
        <h4>Gde je</h4>
        <WhereBlock
          finding={finding}
          observations={observations}
          evidence={evidence}
          documents={documents}
        />
      </section>

      {rule && (
        <>
          <details className="finding-osnov">
            <summary>Po kom osnovu</summary>
            <p>{rule.osnov_raw}</p>
          </details>
          <section>
            <h4>Šta treba uraditi</h4>
            <p>{rule.korekcija}</p>
          </section>
        </>
      )}

      <section className="finding-next">
        <h4>Sledeći korak</h4>
        {next?.kind === "design_task" && (
          <p>{next.description}</p>
        )}
        {next?.kind === "propose_patch" && relatedSets.length === 0 && (
          <p>
            Ispravka se predlaže na kopiji dokumenta. Original ostaje nedirnut.
            Prihvatanje nije potvrda.
          </p>
        )}
        {next?.kind === "ask" && relatedThreads.length === 0 && (
          <p>
            Dokumenti se ne slažu. Projektant mora da kaže koji podatak važi
            pre nego što se predloži ispravka.
          </p>
        )}
        <FindingActions
          projectId={projectId}
          finding={finding}
          documents={documents}
          threads={relatedThreads}
          changeSets={relatedSets}
          revisions={revisions}
          review={review}
          actionKind={next?.kind ?? null}
          suggestedPrompt={
            rule?.korekcija ??
            dossier.questions.find((row) => row.finding_ids.includes(finding.id))
              ?.prompt ??
            finding.rationale
          }
        />
      </section>

      <ol className="lifecycle-rail" aria-label="Stanja ispravke">
        {LIFECYCLE_ORDER.map((state) => (
          <li key={state}>
            <span
              className="kind-chip"
              aria-current={
                state === relatedSets[0]?.lifecycle ? "step" : undefined
              }
            >
              {LIFECYCLE_LABELS[state]}
            </span>
          </li>
        ))}
      </ol>
      <p className="dossier-hint">
        Prihvatanje nije potvrda — potvrđuje se tek novom proverom.
      </p>
    </article>
  );
}

function WhereBlock({
  finding,
  observations,
  evidence,
  documents,
}: {
  finding: Finding;
  observations: Observation[];
  evidence: Evidence[];
  documents: FindingDocument[];
}) {
  if (finding.status === "unknown") {
    const scope = observations.find((row) => row.search_scope)?.search_scope;
    if (!scope) {
      return (
        <p>
          Podatak nije pronađen u dokumentaciji. Odsustvo se ne tvrdi ako nije
          zabeležen opseg pretrage.
        </p>
      );
    }
    return (
      <p>
        Traženo u {scope.documents.join(", ") || "dostupnim dokumentima"}
        {scope.pages.length > 0
          ? `, na stranama ${scope.pages.join(", ")}`
          : ""}
        {scope.queries.length > 0
          ? `, po pojmovima ${scope.queries.join(", ")}`
          : ""}
        . Nije pronađeno.
      </p>
    );
  }

  if (observations.length === 0) {
    return <p>Nema zabeleženog mesta u dokumentaciji za ovu primedbu.</p>;
  }

  return (
    <ul className="finding-where">
      {observations.map((observation) => {
        const row = evidence.find((item) => item.id === observation.evidence_id);
        const filename = documents.find(
          (doc) =>
            String(doc._id) === row?.document_id ||
            doc.sha256 === row?.input_hash.replace(/^sha256:/, ""),
        )?.filename;
        const source = documentSourceLabel(filename, row?.document_id);
        const element = isVagueElement(observation.element_id)
          ? null
          : elementLabel(observation.element_id);
        return (
          <li key={observation.id}>
            <p className="finding-where-line">
              <strong>{slotLabel(observation.slot)}</strong>
              <span>{observationValue(observation.value, observation.unit)}</span>
              {element && <span>{element}</span>}
              {row && (
                <span>
                  {source ? `${source}, ` : ""}
                  strana {row.page_no}
                </span>
              )}
            </p>
            {row?.excerpt && <blockquote>„{row.excerpt.trim()}“</blockquote>}
          </li>
        );
      })}
    </ul>
  );
}

function FindingActions({
  projectId,
  finding,
  documents,
  threads,
  changeSets,
  revisions,
  review,
  actionKind,
  suggestedPrompt,
}: {
  projectId: Id<"projects">;
  finding: Finding;
  documents: FindingDocument[];
  threads: Thread[];
  changeSets: ChangeSetRow[];
  revisions: Array<{ _id: Id<"revisions">; index: number; createdAt: number }>;
  review: {
    pipelineReady?: boolean;
    source?: string | null;
    dossier?: Dossier | null;
    review_run?: { revision_id?: string };
  } | null;
  actionKind: "ask" | "propose_patch" | "design_task" | "verify_revision" | null;
  suggestedPrompt: string;
}) {
  const ask = useMutation(api.questions.ask);
  const answer = useMutation(api.questions.answer);
  const propose = useMutation(api.changeSets.proposeFromQuestion);
  const accept = useMutation(api.changeSets.accept);
  const [prompt, setPrompt] = useState(suggestedPrompt);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const documentId = documents[0]?._id;

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Akcija nije uspela.");
    } finally {
      setBusy(false);
    }
  }

  if (actionKind === "design_task" && changeSets.length === 0) {
    return (
      <p className="availability-note">
        Ovo se ne ispravlja automatski. Potrebna je ručna provera na crtežu ili
        u nedostajućem prilogu.
      </p>
    );
  }

  return (
    <div className="finding-actions">
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}

      {threads.length === 0 &&
        (actionKind === "ask" || actionKind === "propose_patch") && (
          <form
            className="finding-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!documentId) {
                setError("Prvo ubaci dokumentaciju — pitanje mora da ima izvor.");
                return;
              }
              void run(async () => {
                await ask({
                  projectId,
                  findingId: finding.id,
                  documentId,
                  prompt,
                  createdBy: ACTOR,
                });
              });
            }}
          >
            <label htmlFor={`finding-prompt-${finding.id}`}>
              {actionKind === "ask"
                ? "Pitanje projektantu"
                : "Tekst predloga ispravke"}
            </label>
            <textarea
              id={`finding-prompt-${finding.id}`}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              required
            />
            <button
              className="button button-primary"
              type="submit"
              disabled={busy || !documentId}
            >
              {actionKind === "ask" ? "Pitaj projektanta" : "Pripremi ispravku"}
            </button>
          </form>
        )}

      {threads.map((thread) => (
        <div key={thread.question._id} className="finding-thread">
          <p>
            <strong>Pitanje.</strong> {thread.question.prompt}
          </p>
          {thread.answers.map((row) => (
            <p key={row._id}>
              <strong>{row.author}.</strong> {row.body}
            </p>
          ))}
          <div className="finding-form">
            <label htmlFor={`finding-reply-${thread.question._id}`}>
              Odgovor projektanta
            </label>
            <textarea
              id={`finding-reply-${thread.question._id}`}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
            />
          </div>
          <div className="task-actions">
            <button
              className="button button-secondary"
              type="button"
              disabled={busy || !reply.trim()}
              onClick={() =>
                void run(async () => {
                  await answer({
                    questionId: thread.question._id,
                    body: reply,
                    author: ACTOR,
                  });
                  setReply("");
                })
              }
            >
              Sačuvaj odgovor
            </button>
            {actionKind !== "ask" || thread.answers.length > 0 ? (
              <button
                className="button button-secondary"
                type="button"
                disabled={busy || thread.answers.length === 0}
                onClick={() =>
                  void run(async () => {
                    await propose({ questionId: thread.question._id });
                  })
                }
              >
                Predloži ispravku
              </button>
            ) : null}
          </div>
        </div>
      ))}

      {changeSets.map((row) => (
        <div key={row._id} className="finding-changeset">
          <p>
            <span className="kind-chip">{LIFECYCLE_LABELS[row.lifecycle]}</span>
            Predlog ispravke
          </p>
          {row.designTask && <p>{row.designTask}</p>}
          <div className="task-actions">
            {row.approvalState !== "accepted" && (
              <button
                className="button button-primary"
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await accept({ changeSetId: row._id, actor: ACTOR });
                  })
                }
              >
                Projektant prihvata
              </button>
            )}
            {row.approvalState === "accepted" && (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => downloadChangeSet(row, documents)}
              >
                Preuzmi paket izmena
              </button>
            )}
          </div>
          <ChangeSetLifecycleActions
            changeSet={row}
            documents={documents}
            revisions={revisions}
            findingId={finding.id}
            review={review}
            busy={busy}
          />
        </div>
      ))}
    </div>
  );
}
