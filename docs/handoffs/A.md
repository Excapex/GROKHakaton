# Handoff — Builder A

ISSUE: #5 S04 ingest
DONE: `DocumentManifest` + jsonschema. `sandbox/ingest/manifest.py` (fizicki page_no, full|partial, render PNG). Anon 2-page fixture u `evals/fixtures/ingest/`. Daytona runner `scripts/ingest-daytona.mjs` (PDF ostaje lokalno).
CONTRACT: page_no samo iz PDF indeksa; nečitljivo = partial.
VALIDATION: `evals/build_ingest_fixture.py` + `bash evals/validate-fixture.sh` OK (2 strane: full + partial/scanned). Daytona smoke nije pokrenut ovde — `.env.local` nema DAYTONA_*.
NEEDS: B review. Stvarni Prezident set + Daytona ključ kod A za dokaz 3 sveske (nije u Gitu).
NEXT: Kad #20 pack uđe i ingest mergovan — S06.
