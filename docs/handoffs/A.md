# Handoff — Builder A

ISSUE: #57 S26 mapped rule copy
PR: https://github.com/Excapex/GROKHakaton/pull/70

DONE:
- #66 i #68 su na `main` (`93c6f26`, `fb0fef0`): ingest → pageTexts, patches, `markApplied`/`markVerified` mereni na serveru, engine copy bez PASS/opažanje.
- Na ovoj grani: 8 pravila iz `MAPPED_RULES` u `convex/lib/perception/mappedRuleCopy.ts` (generisano iz packa). Nepoznat id → `null`.

CONTRACT: pack (568 KB) ne ide u frontend; B importuje `mappedRuleCopy` / `mappedRuleCopies`. Original se ne prepisuje. UI klikovi ostaju Agent 2 (`TasksPage` / `RevisionsPage`).

VALIDATION: `python3 evals/test_mapped_rule_copy.py`; vitest `mappedRuleCopy.test.ts`

NEEDS: squash-merge #70. B da veže nalaze na `mappedRuleCopy(ruleId)` (#59/#60). Agent 2: ne zahtevati `status === pass` za verified.

NEXT: #70 na main, zatim B #67 i Agent 2 #69 posle `git merge origin/main`.
