# Handoff — Builder A

ISSUE: #7 S06 extract
DONE: `engine/extract` R1–R6 (regex + ingest `page_no`); `slot_map.json` → pack `requires_slots`; Convex `workflows/extract` + `lib/providers/xai` (`grok-4.6`, server). Anon fixture eval.
CONTRACT: Observation `value` null ⇒ `search_scope`; evidence `page_no` samo iz manifesta.
VALIDATION: `python3 evals/test_extract.py` (i `evals/validate_fixture.py`).
NEEDS: Reviewer Excapex. Pravi PDF-ovi van Gita → ingest pa extract; dok se to ne uradi issue se ne zatvara dokazom strana.
NEXT: S07 verify / S08 gate.
