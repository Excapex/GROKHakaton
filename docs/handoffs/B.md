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

## Frontend redesign · 2026-09-12

ISSUE: #3 / existing local shell branch; user requested a complete frontend-only visual replacement.
DONE:
- Reimagined all five current screens with an ink-green project rail, self-hosted Manrope, emerald actions and an architectural concept image.
- Active module featured separately from planned disciplines; added local search, availability filters, native expandable scope details, empty-search recovery and immediate request feedback.
- Navigation supports browser back/forward and refresh via the existing Serbian screen identifiers as hash links. Mobile disclosure navigation and tablet icon rail retain accessible names.
- Existing planned screens now explain their intended workflow without inventing findings, files, uploads or history. Review acceptance still explicitly reports that processing is not connected.
- Visual system in DESIGN.md. Hero image generated with Fal (`fal-ai/flux-2/klein/9b`); prompt in `public/images/architectural-model.prompt.txt`. Official Tabler icons self-hosted.
CONTRACT: No changes to backend, contracts, environment configuration, npm dependencies or lockfile. Existing unrelated .github/workflows/ and docs/handoffs/B-ops.md left intact.
VALIDATION:
- npm run verify: lint/build pass; 10 existing backend Vitest tests pass. The standard staged-only privacy guard had no staged files; separate scan checked 38 frontend source/asset files against key patterns and local case names, no matches.
- Browser checks: all five pages, deep-link reload, search/filter/reset, planned disclosure and disabled action, responsive nav/collapse/help, live module catalog and live accepted review request with pipeline_ready:false. No horizontal overflow at 390, 900 and 1440px.
- Impeccable detector: no findings. Independent finish review: ship after fixing icon-navigation accessible labels and two small-text contrast pairs (now 4.99:1 and 5.10:1).
- Screenshots in .impeccable/review/: desktop.png, desktop-request.png, tablet.png, mobile.png, mobile-lower.png, mobile-documents.png.
NEEDS: Existing backend work for documents, dossier, tasks and revisions remains separate; redesign does not implement those pipelines. No new remote PR/commit/deployment made in this task.
NEXT: Review local preview at http://127.0.0.1:5173/#moduli, then integrate actual data into the existing feature adapters as backend work lands.
