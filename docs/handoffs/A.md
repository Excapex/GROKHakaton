# Handoff — Builder A

ISSUE: #9 S08 gate
DONE: `engine/judge` — R1–R6 nalazi, integrity gate, `ReviewRun` (pack/model/prompt/input_hashes), dosije vezan za `revision_id`. Negativan test: skinut dokaz → `unknown`.
CONTRACT: Finding conflict ≥2 opažanja; null value ⇒ search_scope; gate.ok false ako fali dokaz.
VALIDATION: `python3 evals/test_judge.py`
NEEDS: Review B. Stacked na #27. Ne mergovati bez review-a.
NEXT: S11 ChangeSet (#12) — A može sam; S13 čeka B S12 za stvarni patch fajla.
