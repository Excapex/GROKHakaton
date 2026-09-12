# Handoff — Builder B

CURRENT PR: [#41](https://github.com/Excapex/GROKHakaton/pull/41) `feat/B/s14-diff-revizija` → `main` (#15 S14)
DEPS: `origin/main` je `bb65239` (#39 apply + #40 dosije). [#43](https://github.com/Excapex/GROKHakaton/pull/43) je S12b Preuzmi.
BLOCKER: nema. #41 je bio `CONFLICTING`; `origin/main` je umergovan bez rebase-a.
NEXT: #41 i #43 u `main` → #17 Render deploy + Convex prod → #18 README (A-ova izmerena R1–R6 tabela) i video.

ISSUE: #15 S14 — razlike revizija i javni tok
DONE:
- `revisions.diff`: poređenje po nazivu + sha256 (`added` / `replaced` / `unchanged` / `carried_over`), bez izmišljene izmene.
- Vezani ChangeSet-ovi sa `lifecycle`, `findingId` i stranom iz dokaza; bez dokaza piše da strana nije zabeležena.
- Prazna revizija i prva revizija daju `partialReason`, ne pad.
- `render.yaml`: rewrite `/*` → `/index.html`, `CONVEX_DEPLOY_KEY` bez `VITE_` prefiksa, PR preview isključen.

ISSUE: #11 S10 — pitanja, odluke, prihvatanje ChangeSet-a
DONE: squash-merge [#37](https://github.com/Excapex/GROKHakaton/pull/37) na `b57cd248` (A Approve + zeleni `web`). `UNLOCK convex/schema.ts`.
- Pitanje zahteva `findingId` i `documentId` originala. Odgovor čuva autora i vreme.
- Prihvatanje je `proposed` → `accepted`, nikad `verified`. Ponovljen klik vraća `duplicated: true`.
- CAD predlog ide u `designTask`, bez lažnog patch-a. Nalaznik ne izdaje saglasnost.
CONTRACT: nema izmene `contracts/`.
NEXT: zatvoreno.

ISSUE: #13 S12 — ACK split
DONE: na issue #13: `ACK S12a A / S12b B`. B ne dira `sandbox/compute/` ni `engine/`. S12b (Preuzmi + screenshot) kreće kad S12a da putanju.
NEXT: čekam A artifact/path.

ISSUE: #10 S09 — dosije i dokazi
DONE:
- Pregled je trokolonski radni prostor: nalazi · original · akcije. Zoom +/- i tastatura.
- Konflikt layout (dva izvora) i četiri odvojena stanja izmene su u UI-ju.
- `dossiers.getActive` namerno vraća `pipelineReady: false` i `dossier: null` — nema lažnog nalaza
  dok engine (#9) ne upiše dosije.
CONTRACT: nema izmene `contracts/`. Konzumira `Dossier`, `Finding`, `Observation`, `ChangeLifecycle`.
VALIDATION: `npm run verify` 18 testova. Browser `#pregled` pokazuje prazan dosije i lifecycle.
NEEDS: A da upiše stvarni dosije (R3 dva izvora). Tada klik na nalaz otvara stranu+region.
NEXT: Review na SHA posle sync sa `main`, zatim squash-merge od B.

ISSUE: #4 S03 — upload, dokumenti, revizije
DONE:
- `LOCK convex/schema.ts`: tabele `projects`, `documents`, `revisions`, `artifacts`, `events`.
- Original ide u Convex storage i nikad se ne prepisuje. SHA-256 se računa u pregledaču i
  prikazuje uz fajl. Nova revizija se **dodaje**; stari original ostaje na starom indeksu.
- PDF/DOCX/XLSX: `parsePolicy: ingest`. DWG/DWFX: `store_only` + događaj `design_task`, bez parsiranja.
- UI `#dokumenti` i `#revizije` čitaju `projects.getWorkspace`. Demo fixture ostaje samo ako nema
  `VITE_CONVEX_URL`. Predmet: Objekat A, Lamela 3 / `PZI-DEMO-01-2026`.
CONTRACT: nema izmene `contracts/`. Mapira `Project` iz 1.0.0. `convex/lib/` nije diran (A).
VALIDATION:
- `npm run verify` zeleno (oxlint, tsc, vite build, 16 vitest testova).
- `npx convex dev --once` na `gallant-dolphin-326` kreirao indekse i funkcije.
- `projects:ensureDemo` + `getWorkspace` vraćaju živi predmet. Browser: `#dokumenti` dropzona i
  `#revizije` lanac + „Nova revizija“, deep-link ostaje posle navigacije.
NEEDS: zatvoreno u `#33` / `main`.
NEXT: `#34` dosije, zatim `#11` S10.

## S02 · shell i katalog (#3)

ISSUE: #3 S02 — zajednički shell i katalog stručnih modula
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
NEXT: zatvoreno u #4 na ovoj grani.

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
