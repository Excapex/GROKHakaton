# Handoff — Builder A

ISSUE: #57 S26 mapped rule copy
PR: (ovaj branch `feat/A/57-mapped-rules`)
DONE: 8 pravila iz `MAPPED_RULES` u `convex/lib/perception/mappedRuleCopy.ts` (generisano iz packa). Nepoznat id → `null`.
CONTRACT: pack (568 KB) ne ide u frontend; B importuje `mappedRuleCopy` / `mappedRuleCopies`.
VALIDATION: `python3 evals/test_mapped_rule_copy.py`; vitest `mappedRuleCopy.test.ts`
NEEDS: B Approve pa A squash-merge. B da veže UI nalaze na `mappedRuleCopy(ruleId)` (#59/#60).
NEXT: #66 i #68 čekaju B review; ne mešati sa ingest granom.
