# Handoff — Builder A

ISSUE: #12 S11 changeset
PR: https://github.com/Excapex/GROKHakaton/pull/29 (`feat/A/12-changeset`)
DONE: plan R1 (docx+xlsx, stale hash, DWG=`design_task`); `sandbox/compute/apply.py` na kopijama; `engine/pipeline.py`.
CONTRACT: original se ne prepisuje; CAD nije patch.
VALIDATION: `python3 evals/test_changeset_plan.py`; `.venv/bin/python evals/test_apply_patch.py`
DEPENDENCIES: #28 S08 **merged** (`996808d`). #27 S07 **merged**.
BLOCKERS: #29 čeka B re-review na HEAD posle `merge origin/main` (stari review je na `df78393`). #30/#31 čekaju #29. B merdžuje #33/#34 (A Approve).
NEXT: push usklađene #29 na `main`; ne squash-merge dok B ne Approve novi SHA.
