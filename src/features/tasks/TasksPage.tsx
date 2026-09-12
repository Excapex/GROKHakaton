import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Icon } from "../../components/generated/Icon.tsx";
import { StatePanel } from "../../components/generated/StatePanel.tsx";
import { ChangeSetLifecycleActions } from "./ChangeSetLifecycleActions.tsx";
import { downloadChangeSet } from "./changeSetExport.ts";
import { LIFECYCLE_LABELS, LIFECYCLE_ORDER } from "../dossier/dossierView.ts";
import {
  patchButtonVisible,
  type FindingSnapshot,
} from "./changeSetLifecycle.ts";

const ACTOR = "M. Jovanović";

const APPROVAL_LABELS = {
  proposed: "Predloženo",
  accepted: "Prihvaćeno",
  rejected: "Odbijeno",
} as const;

type WorkspaceDocument = {
  _id: Id<"documents">;
  revisionId?: Id<"revisions">;
  filename: string;
  kind: string;
  sha256: string;
};

export function TasksPage({
  projectId,
  documents,
}: {
  projectId: Id<"projects">;
  documents: WorkspaceDocument[];
}) {
  const threads = useQuery(api.questions.listForProject, { projectId });
  const changeSets = useQuery(api.changeSets.listForProject, { projectId });
  const review = useQuery(api.dossiers.getActive, { projectId });
  const workspace = useQuery(api.projects.getWorkspace);
  const ask = useMutation(api.questions.ask);
  const answer = useMutation(api.questions.answer);
  const propose = useMutation(api.changeSets.proposeFromQuestion);
  const accept = useMutation(api.changeSets.accept);

  const [findingId, setFindingId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const selectedDocumentId = documentId || documents[0]?._id || "";
  const findings =
    review && review.pipelineReady === true ? review.dossier.findings : [];
  const selectedFindingId = findingId || findings[0]?.id || "";

  async function submitQuestion() {
    if (!selectedFindingId) {
      setNotice({
        tone: "error",
        text: "Izaberi nalaz sa Pregleda — ID se ne upisuje ručno.",
      });
      return;
    }
    if (!selectedDocumentId) {
      setNotice({
        tone: "error",
        text: "Izaberi dokaz — original iz predmeta.",
      });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await ask({
        projectId,
        findingId: selectedFindingId,
        documentId: selectedDocumentId as Id<"documents">,
        prompt,
        createdBy: ACTOR,
      });
      setPrompt("");
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Pitanje nije poslato.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(questionId: Id<"questions">) {
    const body = answerDraft[questionId] ?? "";
    setBusy(true);
    setNotice(null);
    try {
      await answer({ questionId, body, author: ACTOR });
      setAnswerDraft((current) => ({ ...current, [questionId]: "" }));
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Odgovor nije sačuvan.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function proposeSet(questionId: Id<"questions">) {
    setBusy(true);
    setNotice(null);
    try {
      await propose({ questionId });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error ? error.message : "ChangeSet nije predložen.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function acceptSet(changeSetId: Id<"changeSets">) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await accept({ changeSetId, actor: ACTOR });
      setNotice({
        tone: "ok",
        text: result.duplicated
          ? "Ponovljeni klik nije duplirao odobrenje. Prihvatanje i dalje nije saglasnost niti provera."
          : "Prihvaćena je projektantska odluka. To nije saglasnost, nije primenjeno i nije provereno.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Prihvatanje nije uspelo.",
      });
    } finally {
      setBusy(false);
    }
  }

  const allDocuments = workspace?.documents ?? documents;
  const revisions = workspace?.revisions ?? [];
  const findingByQuestion = new Map(
    (threads ?? []).map(({ question }) => [String(question._id), question.findingId]),
  );
  const reviewRecord = review as
    | {
        pipelineReady?: boolean;
        source?: string;
        dossier?: { findings?: FindingSnapshot[] } | null;
        review_run?: { revision_id?: string };
      }
    | null
    | undefined;

  if (
    threads === undefined ||
    changeSets === undefined ||
    review === undefined ||
    workspace === undefined
  ) {
    return (
      <div className="state-wrap state-page">
        <StatePanel
          tone="progress"
          label="Učitavanje"
          title="Zadaci se učitavaju"
          message="Pitanja, odgovori i ChangeSet-ovi stižu sa servera."
        />
      </div>
    );
  }

  return (
    <section className="page-content" aria-label="Zadaci">
      <div className="page-heading">
        <h2>Zadaci</h2>
        <p>
          Pitanje ide uz nalaz i original. Odgovor čuva autora i vreme.
          Prihvatanje je eksplicitna odluka projektanta — Saglasnik ne izdaje
          saglasnost.
        </p>
      </div>

      <ol className="lifecycle-rail" aria-label="Životni ciklus izmene">
        {LIFECYCLE_ORDER.map((state) => (
          <li key={state}>
            <span className="kind-chip">{LIFECYCLE_LABELS[state]}</span>
          </li>
        ))}
      </ol>

      {notice && (
        <p
          className={notice.tone === "error" ? "inline-error" : "inline-status"}
          role="status"
        >
          {notice.text}
        </p>
      )}

      <div className="tasks-grid">
        <form
          className="task-card"
          onSubmit={(event) => {
            event.preventDefault();
            void submitQuestion();
          }}
        >
          <h3>Novo pitanje</h3>
          <label>
            Nalaz sa Pregleda
            <select
              value={selectedFindingId}
              onChange={(event) => setFindingId(event.target.value)}
              required
              disabled={findings.length === 0}
            >
              {findings.length === 0 ? (
                <option value="">Nema nalaza — otvori Pregled</option>
              ) : (
                findings.map((finding) => (
                  <option key={finding.id} value={finding.id}>
                    {finding.id} · {finding.rule_id} · {finding.status}
                  </option>
                ))
              )}
            </select>
          </label>
          <label>
            Dokaz (original)
            <select
              value={selectedDocumentId}
              onChange={(event) => setDocumentId(event.target.value)}
              required
            >
              <option value="">—</option>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.filename} · {doc.sha256.slice(0, 12)}…
                </option>
              ))}
            </select>
          </label>
          <label>
            Pitanje projektantu
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              required
            />
          </label>
          <button className="button button-primary" type="submit" disabled={busy}>
            Pošalji pitanje
            <Icon name="arrow-up-right" size={18} />
          </button>
          {findings.length === 0 && (
            <p className="dossier-hint">
              Nalaz se bira sa Pregleda. Sistem ne izmišlja ID.{" "}
              <a href="#pregled">Otvori Pregled</a>
            </p>
          )}
          {documents.length === 0 && (
            <p className="dossier-hint">
              Prvo sačuvaj original na Dokumentima — pitanje mora da ima dokaz.
            </p>
          )}
        </form>

        <div className="task-card">
          <h3>Tok pitanja</h3>
          {threads.length === 0 ? (
            <StatePanel
              tone="neutral"
              label="Prazno"
              title="Nema otvorenih pitanja"
              message="Sistem ne izmišlja primedbu. Pitanje se veže za nalaz i sačuvani original."
            />
          ) : (
            <ul className="thread-list">
              {threads.map(({ question, answers, document }) => (
                <li key={question._id}>
                  <p>
                    <span className="kind-chip">{question.findingId}</span>
                    {document?.filename}
                  </p>
                  <strong>{question.prompt}</strong>
                  <ul className="answer-list">
                    {answers.map((row) => (
                      <li key={row._id}>
                        <span>
                          {row.author} ·{" "}
                          {new Date(row.createdAt).toLocaleString("sr-Latn")}
                        </span>
                        <p>{row.body}</p>
                      </li>
                    ))}
                  </ul>
                  <textarea
                    value={answerDraft[question._id] ?? ""}
                    onChange={(event) =>
                      setAnswerDraft((current) => ({
                        ...current,
                        [question._id]: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Odgovor projektanta"
                  />
                  <div className="task-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => void submitAnswer(question._id)}
                    >
                      Sačuvaj odgovor
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={busy || answers.length === 0}
                      onClick={() => void proposeSet(question._id)}
                    >
                      Predloži ChangeSet
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="task-card">
          <h3>ChangeSet</h3>
          <p className="dossier-hint">
            Prihvaćeno nije primenjeno i nije provereno. Ponovljeni klik ne
            dodaje drugo odobrenje. CAD nema patch — samo zadatak projektanta.
          </p>
          {changeSets.length === 0 ? (
            <p className="dossier-empty">Još nema predloženog paketa izmena.</p>
          ) : (
            <ul className="changeset-list">
              {changeSets.map((row) => (
                <li key={row._id}>
                  <p>
                    <span className="kind-chip">
                      {LIFECYCLE_LABELS[row.lifecycle]}
                    </span>
                    <span className="kind-chip">
                      {APPROVAL_LABELS[row.approvalState]}
                    </span>
                  </p>
                  {Object.values(row.baseHashes).map((hash) => (
                    <code key={hash} className="hash-value">
                      {hash}
                    </code>
                  ))}
                  {row.designTask && <p>{row.designTask}</p>}
                  {row.approvedBy && (
                    <p>
                      {row.approvedBy} ·{" "}
                      {row.approvedAt
                        ? new Date(row.approvedAt).toLocaleString("sr-Latn")
                        : ""}
                    </p>
                  )}
                  <div className="task-actions">
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={busy}
                      onClick={() => void acceptSet(row._id)}
                    >
                      Prihvati odluku
                    </button>
                    {patchButtonVisible(row, allDocuments) && (
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={row.approvalState !== "accepted"}
                        onClick={() => downloadChangeSet(row, allDocuments)}
                      >
                        Preuzmi paket izmena
                      </button>
                    )}
                  </div>
                  <ChangeSetLifecycleActions
                    changeSet={row}
                    documents={allDocuments}
                    revisions={revisions}
                    findingId={findingByQuestion.get(String(row.questionId)) ?? null}
                    review={reviewRecord}
                    busy={busy}
                  />
                  {!patchButtonVisible(row, allDocuments) && (
                    <p className="dossier-hint">
                      CAD nema patch. DWG/DWFX ostaje zadatak projektanta, bez
                      lažnog dugmeta za izmenu crteža.
                    </p>
                  )}
                  {row.approvalState !== "accepted" &&
                    patchButtonVisible(row, allDocuments) && (
                    <p className="dossier-hint">
                      Preuzimanje se otvara tek posle prihvatanja. Predlog nije
                      paket za primenu.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
