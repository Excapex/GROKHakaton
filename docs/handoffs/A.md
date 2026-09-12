# Handoff — Builder A

ISSUE: petlja primedbe (upload → pitanje/ispravka → prihvati → primeni → proveri)
BRANCH: `feat/A/loop-findings-gates`

DONE:
- `getActive` ne prikazuje anon fixture ako postoje ubačeni dokumenti.
- Prazna novija provera čita ingest sa poslednje revizije koja ima tekst.
- Kartica primedbe bira original po evidenciji / svim revizijama, ne `documents[0]` tekuće prazne provere.
- `Pripremi ispravku` u jednom koraku pita + predlaže ChangeSet. CAD ostaje ručni zadatak.
- `Označi primenjeno` / `Proveri novu reviziju` vide originale i kopije sa svih provera.

CONTRACT: unknown ostaje unknown. Nema izmišljenog finding ID / page_no / patch. Isti hash nije primena. verified samo posle ingest reread.

VALIDATION: `npx vitest run` za dossierSource + findingLoop + postojeći suite.

NEEDS: B pregled `src/` i `convex/dossiers.ts` (CRUD je B, izmena je potrebna za petlju).

NEXT: PR, ne zatvarati #48.
