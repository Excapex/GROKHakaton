# Model eval (A / S15) — mereno, ne pretpostavljeno

Datum: 2026-09-12
Model: grok-4.6 (smoke PASS); R1–R6 na anon fixture + lokalni ingest (van Gita)
Ulaz: `evals/fixtures/extract/` (anon) i `artifacts-local/ingest/` (nije u Gitu)

| Pravilo | Anon fixture | Lokalni ingest (case_a) | Promašaj |
|---|---|---|---|
| R1 F-oznaka | hit F60 str. 1 | hit F90 str. 42 | 0 |
| R2 EI+13501-1 | hit | hit str. 16 i 8 | 0 |
| R3 fasada konflikt | A1 vs mineral_wool | oba A1 — nije konflikt | 0 lažnih FAIL |
| R4 element vs predmer | hit + search_scope | vrata str. 16, nema u SS | 0 |
| R5 fotometrija | unknown + scope | unknown (nema fotometrijsk) | 0 lažnih PASS |
| R6 površina/lica | 180 m2 / 90 | 2000/107 i 1200/200 | 0 PASS iz nepoznatog |

Negativno: uklonjen dokaz → `unknown` (`evals/test_judge.py`).
Uredan anon R3-isti-A1 ne proizvodi conflict.
Recall/precision na 6 pravila: izmereno na gore navedenim hitovima, bez klijentskih naziva.
