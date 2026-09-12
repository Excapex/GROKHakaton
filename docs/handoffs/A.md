# Handoff — Builder A (Agent 2 / wt2)

ISSUE: #56 S25 UI + pozivi (ne engine)
BRANCH: `feat/A/56-ui-reread-wire` u `/home/mihajlo/GROKHakaton-wt2`
PR: https://github.com/Excapex/GROKHakaton/pull/69

DONE:
- Ingest #66 je na `main`; wt2 je merge-ovan sa `origin/main`.
- UI: Prihvati ≠ primenjeno ≠ provereno. CAD bez patch dugmeta.
- `markApplied({ changeSetId, revisionId })` / `markVerified({ changeSetId, revisionId })` — klijent ne šalje boolean. Zatvaranje nalaza prati `findingClosedOnReread` (ne zahteva PASS).

CONTRACT: unknown ostaje unknown u prikazu. Original se ne prepisuje. Ne izmišljati finding ID / page_no / patch.

VALIDATION: `npm test` + `npx tsc -b` u wt2.

NEEDS: B Approve #69 na tačan HEAD. Ne merge-ujem B PR-ove.

NEXT: codegen u wt2; uskladiti apply gate sa serverom (isti hash ≠ primena); squash posle B Approve `--match-head-commit`.
