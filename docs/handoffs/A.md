# Handoff — Builder A

ISSUE: #2 S01
DONE: Contracts 1.0.0 + fixture. `Rule.osnov.sources` je 1..n (365/652 pravila citira više propisa). Validacija preko `evals/validate_fixture.py` (`Draft202012Validator`), ne uklonjenog `python -m jsonschema` CLI. `requirements.txt` za jsonschema. Grana `feat/A/2-contracts-v2` cherry-pick sa `origin/main` — bez merge-a stare grane koja vraća pack.
CONTRACT: `osnov.sources[]` + `standards?`. Ostalo kao u `docs/CONTRACTS.md`.
VALIDATION: `bash evals/validate-fixture.sh` OK.
NEEDS: B review novog PR-a (stari #21 zatvoren — pogrešan merge-base).
NEXT: Posle merge S01 — #20 pack uskladiti sa `sources[]`, ili S04 ingest.
