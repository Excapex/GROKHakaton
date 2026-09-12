# Handoff — Builder A

ISSUE: #48 tracking; S18–S25 (#49–#56)
BRANCH: `feat/A/49-ingest-action`

DONE (lokalno, mereno):
- Upload PDF/DOCX/XLSX → Daytona ingest (`workflows/ingest.fromStorage`) → `pageTexts.replaceForDocument`
- CAD ostaje `store_only` / design_task
- `requestReviewRun.pipeline_ready` samo uz ingestovani tekst
- ChangeSet `patches` iz `planFromUploadedDocs`; export JSON nosi patches
- `markApplied` / `markVerified` (isti hash ≠ applied; verified samo posle novog čitanja)

CONTRACT: unknown ostaje unknown. Original se ne prepisuje. UI klikovi (`TasksPage` / `RevisionsPage`) su Agent 2 — ne dirati ovu granu.

VALIDATION: Vitest 55; `evals/test_office_ingest.py`; `evals/test_reread.py`; `tsc -b`

NEEDS: B/Agent 2 wire `markApplied`/`markVerified` u `src/` (ne `changeSetExport.ts`). Convex env: `DAYTONA_API_KEY` na deploymentu.

NEXT: squash PR → main; Agent 2 `git merge origin/main` u wt2.
