# Handoff — Builder A

ISSUE: perception Convex action (bez B schema/UI)
PR: (otvara se) `feat/A/perception-convex`
DONE: `convex/lib/perception` = R1–R6 extract+judge+gate; `workflows/review.fromPages` vraća pravi dosije iz teksta strana ili `pipelineReady:false` bez izmišljanja. Python pipeline dodaje ChangeSet uz R1 fail. `evals/fixtures/dossier.engine.json` iz anon fixture-a.
CONTRACT: unknown≠PASS; UI i dalje čita `dossiers.getActive` (B). A ne dira `schema.ts` ni `src/`.
VALIDATION: `npx vitest run convex/lib/perception`; `python3 evals/test_pipeline.py`; `python3 evals/test_judge.py`
DEPENDENCIES: B da poveže `dossiers.getActive` na `workflows/review.fromPages` i da ingest upiše `artifacts.kind=text`.
BLOCKERS: nema tabele dosijea; bez B UI ostaje prazan.
NEXT: PR → B review na HEAD.
