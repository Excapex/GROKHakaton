# Handoff — Builder A

ISSUE: #2 S01 — generički contracts i validan fixture dosijea
DONE: Tipovi u `contracts/` (`schema_version` 1.0.0): Project, DomainPack, Evidence, Observation, Dossier, ChangeSet, Revision + ReviewRun. Fixture `evals/fixtures/dossier.valid.json` (i project/revision/evidence/changeset). JSON Schema za dossier i changeset. `.gitkeep` za sandbox ingest/compute/artifacts.
CONTRACT: `docs/CONTRACTS.md` v1.0.0. Stanja izmene `proposed|accepted|applied|verified` na `ChangeSet.lifecycle`. `next_action` discriminated union. Konflikt zahteva ≥2 observation_id. `value: null` zahteva `search_scope`.
VALIDATION: `bash evals/validate-fixture.sh` OK (`python3 -m jsonschema`). Negativni slučajevi (unknown bez scope, conflict sa jednim izvorom) padaju schema. `npm run lint` + `npm run build` zeleni na Node 22 (upozorenje `engines: >=24`). Convex: nema `CONVEX_DEPLOYMENT` — treba `npx convex dev` posle prijave na dashboard.
NEEDS: B review ovog PR-a. Merge S00 (#19) u `main`, zatim rebase/merge `origin/main` na `feat/A/2-contracts`. CI i dalje nije u #19 — #1 ostaje otvoren.
NEXT: Posle merge S01, S05 pack je već na #19 (A ownership); inače S04 ingest kad postoji upload (#4) ili paralelni parser ako pack ostane van S00.
