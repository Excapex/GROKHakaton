# Handoff — Builder A (Agent 2 / wt2)

ISSUE: #56 S25 UI + pozivi (ne engine)
BRANCH: `feat/A/56-ui-reread-wire` u `/home/mihajlo/GROKHakaton-wt2`
DONE: Zadaci/Revizije/Pregled — četiri čipa odvojena; `Označi primenjeno` / `Proveri novu reviziju` disabled + hint dok `markApplied`/`markVerified` nisu na `api.changeSets`. Gate: apply tek posle kopija na novoj reviziji; verify samo hash≠base AND nalaz `pass` na ingest čitanju te revizije. CAD bez patch dugmeta. Prihvati ne skače na verified.
CONTRACT: UI ne izmišlja finding ID / page_no / patch from-to. Nepoznato ostaje unknown.
VALIDATION: `npm test` + `npx tsc -b` u wt2 (12 fajlova, uključujući `changeSetLifecycle.test.ts`).
NEEDS: Agent 1 merge ingest (`markApplied`/`markVerified` na main) → `git merge origin/main` u wt2, po potrebi `npx convex codegen` u wt2.
NEXT: B review UI PR; ne merge-ujem B PR-ove.
