# Handoff — Builder B

ISSUE: #3 S02 — zajednički shell i katalog modula
DONE:
- Shell `Pregled / Dokumenti / Zadaci / Revizije / Moduli` (`src/features/shell/`), generisan kroz
  Wonder pa prepakovan; generisane komponente u `src/components/generated/` primaju samo typed
  props i callback-ove (bez convex importa, bez `import.meta.env`, bez dohvatanja podataka).
- `project.discipline` i `ReviewRun.domain_pack_id` su ODVOJENA polja i odvojeno prikazana u
  zaglavlju predmeta (`polje predmeta` vs `polje pregleda`). Disciplina se nikad ne prevodi u modul.
- Katalog modula stiže sa servera (`convex/domainPacks.listModules`): ZOP `Aktivno`; arhitektura,
  konstrukcija, elektro, mašinstvo, hidrotehnika `Planirano`, pokretanje neaktivno, bez polja za
  rezultat, ocenu i procenat.
- Backend kapija `convex/domainPackRegistry.buildReviewRequest` odbija nepodržan `domain_pack_id`,
  uključujući vrednosti koje liče na disciplinu predmeta. Prihvaćen zahtev vraća `pipeline_ready: false`
  jer ingest (#5) i ekstrakcija (#7) nisu povezani — nikad lažan nalaz.
- Stanja prazno / učitavanje / greška / delimično postoje kao jedna generička `StatePanel` komponenta.
CONTRACT: nema izmene `contracts/`. Konzumira `Project`, `Discipline`, `Phase` i `SCHEMA_VERSION` iz 1.0.0.
Novi serverski tip `ModuleCatalogEntry` živi u `convex/domainPackRegistry.ts` (UI ga uvozi kao tip).
VALIDATION:
- `npm run verify` zeleno (oxlint, `tsc -b`, vite build, 10 vitest testova).
- Stvarno odbijanje na dev deployment-u:
  `npx convex run domainPacks:requestReviewRun '{"...","domain_pack_id":"structural"}'`
  → `ConvexError {"code":"unsupported_domain_pack","supported":["fire_protection"]}`.
  Isto za `architecture`, `nuclear_safety`, `Fire_Protection` i prazan string.
  `fire_protection` prolazi uz `pipeline_ready: false`.
- Screenshot iz stvarne aplikacije: `docs/evidence/s02-desktop.png` (1440×900) i
  `docs/evidence/s02-mobile.png` (telefon).
- Provereno u browseru: posle prihvaćenog zahteva zaglavlje prikazuje `architecture`
  kao disciplinu predmeta i `fire_protection v1` kao postupak pregleda — dva različita polja.
NEEDS: A-ov review na aktuelnom SHA. Kad #20 (ZOP pack) prođe, `pack_version` u katalogu vezati za
stvarnu verziju packa umesto konstante `v1`.
NEXT: #4 (S03) — `LOCK convex/schema.ts`, tabele `projects documents revisions artifacts events`,
upload i revizije. Tada demo fixture predmeta iz `src/features/shell/demoProject.ts` ide napolje.
