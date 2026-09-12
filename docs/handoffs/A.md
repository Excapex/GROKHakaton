# Handoff — Builder A

ISSUE: #38 S12a apply copies
PR: (otvara se) `feat/A/38-apply-copies`
DONE: CLI `sandbox/compute/cli.py apply` na kopijama + `provenance.json`; `workflows/apply.planR1Copies`; stale hash i dalje odbija; CAD=`design_task`.
CONTRACT: original se ne prepisuje; nije saglasnost; B radi download (#13).
VALIDATION: `.venv/bin/python evals/test_apply_patch.py`; `npx vitest run convex/lib/perception/changeset.test.ts`
DEPENDENCIES: #37 u main. #36 perception čeka B re-review posle restack (`dd5e3fe`).
BLOCKERS: B Approve #36 na novi SHA; B S12b UI.
NEXT: PR #38 → B review.
