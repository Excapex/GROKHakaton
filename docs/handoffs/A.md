# Handoff — Builder A

ISSUE: #48 tracking; S18–S25 (#49–#56)
BRANCH: `feat/A/49-ingest-action`

DONE (lokalno, mereno):
- Upload PDF/DOCX/XLSX → Daytona ingest (`workflows/ingest.fromStorage`) → `pageTexts.replaceForDocument`
- CAD ostaje `store_only` / design_task
- `requestReviewRun.pipeline_ready` samo uz ingestovani tekst
- ChangeSet `patches` iz `planFromUploadedDocs`; export JSON nosi patches
- `markApplied` / `markVerified({ changeSetId, revisionId })` — server meri hash + novo čitanje; klijentski boolean se ne prima
- Hash poređenje prihvata sirovi hex i `sha256:`

CONTRACT: unknown ostaje unknown. Original se ne prepisuje. UI klikovi (`TasksPage` / `RevisionsPage`) su Agent 2 — ne dirati ovu granu.

VALIDATION: Vitest `rereadMeasure` + `hashes`; `evals/test_office_ingest.py`; `evals/test_reread.py`

NEEDS: B Approve #66 na novi HEAD. Agent 2: `markVerified` args su `revisionId`, ne boolean (već tako zovete). Ne zahtevati `status === pass` u UI — engine retko emituje PASS; zatvaranje je „nije više fail/conflict“.

NEXT: squash posle B Approve `--match-head-commit`.
