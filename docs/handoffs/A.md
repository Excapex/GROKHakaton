# Handoff — Builder A (Agent 2 / wt2)

ISSUE: #56 S25 UI + pozivi (ne engine)
BRANCH: `feat/A/56-ui-reread-wire` u `/home/mihajlo/GROKHakaton-wt2`
PR: https://github.com/Excapex/GROKHakaton/pull/69

DONE:
- `origin/main` uključuje #66 ingest, #68 engine copy, #70 mapped rules.
- UI: Prihvati ≠ primenjeno ≠ provereno. CAD bez patch dugmeta.
- `markApplied` / `markVerified({ changeSetId, revisionId })` — bez klijentskog boolean-a. Zatvaranje prati `findingClosedOnReread` (ne zahteva PASS). Isti hash nije primena.

CONTRACT: unknown ostaje unknown u prikazu. Original se ne prepisuje. Ne izmišljati finding ID / page_no / patch.

VALIDATION: `npm test` + `npx tsc -b` u wt2.

NEEDS: B Approve #69 na tačan HEAD. Ne merge-ujem B PR-ove (#67).

NEXT: squash posle B Approve `--match-head-commit`.
