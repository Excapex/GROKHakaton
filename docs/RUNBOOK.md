# RUNBOOK — ko radi šta, u kom alatu, kojim redom

**Rok:** predaja **18:30**, javni rok **19:00** (12.09.2026).
**A** = `misomor130-glitch` · **B** = `Excapex`

Kako se čita: svaki zadatak ima **vlasnika**, **alat**, **ulaz**, **korake** i
**dokaz**. Alat je preporuka — zamenljiv je, ali ugovor i dokaz nisu.

Legenda: 🅰️ radi A · 🅱️ radi B · ⛔ blokira ostale · 🎬 potrebno za demo

---

## FAZA 0 — Odblokiranje (oba, ~20 min) ⛔

| # | Ko | Alat | Radnja |
|---|---|---|---|
| 0.1 | 🅱️ | terminal | `claude mcp login wonder` (traži pravi TTY) |
| 0.2 | 🅱️ | gh | Repo → **public** (uslov hakatona) |
| 0.3 | 🅱️ | gh | `gh auth refresh -s workflow`, pa merge CI PR-a |
| 0.4 | 🅰️ | dashboard | Prihvati Convex poziv; `npx convex dev` → **svoj** dev deployment |
| 0.5 | 🅰️ | terminal | `cp .env.example .env.local`, upiši `XAI_API_KEY`, `XAI_MODEL=grok-4.6`, `DAYTONA_API_KEY`, `DAYTONA_SNAPSHOT=saglasnik-docs-v1` |
| 0.6 | oba | terminal | `gh repo clone` / `git pull --ff-only`, `npm ci`, `npm run build` |

**Dokaz:** oba člana imaju zelen `npm run build` i **različit** Convex dev URL.

---

## FAZA 1 — Temelj (12:30–14:00)

### #2 · S01 · 🅰️ · 2 SP — Contracts + fixture ⛔🎬
**Alat:** Claude Code (vidi ceo repo) → fallback Codex
**Ulaz:** `docs/CONTRACTS.md`, spec odeljak 19

1. `git switch -c feat/A/2-contracts`
2. Komentar na #2: `LOCK contracts/` (hot fajl)
3. Napiši tipove iz `docs/CONTRACTS.md` u `contracts/`
4. `evals/fixtures/dossier.valid.json` + `jsonschema` validacija
5. PR → review B → merge → `UNLOCK contracts/`

**Dokaz:** `python3.12 -m jsonschema` prolazi; B potvrdio da UI može da konzumira tipove.

### #6 · S05 · 🅰️ · 2 SP — ZOP pack iz 652 primedbe 🎬
**Alat:** **Codex** (izolovan parser, jedan fajl) → fallback Claude Code
**Ulaz:** `~/Hakaton/za sergeja/primedbe na dokumentaciju/Katalog_primedbi_ZOP_2026 NAJBOLJI CLAUDE.docx` (**lokalno**, ne u Git)

1. Parser `engine/pack/parse_katalog.py`: `.docx` → `domains/fire_protection/pack.v1.json`
2. Svaki zapis: `id` (`I-1`…`VIII-92`), `primedba`, `osnov`, `korekcija`, `snaga`
3. `source_registry`: 36 propisa iz registra kataloga (naziv + „Sl. glasnik")
4. `standards_registry`: SRPS EN 13501-*, 12101-*, 54, 12845, 1838, 62305, IEC 60079
5. `status`: `approved` samo za `JAK`; `USLOVNO JAK`/`DOPUNITI` → `draft`
6. **Izlazni JSON ide u Git** (katalog je anonimizovan), `.docx` original ne

**Dokaz:** `652/652` parsirano, sva 4 polja; izveštaj `approved` vs `draft`.

### #3 · S02 · 🅱️ · 3 SP — Shell + modul registry 🎬
**Alat:** **v0** (generisanje) → **Cursor** (dorada) → Claude Code (integracija)

1. `git switch -c feat/B/3-shell`
2. v0: prompt iz `docs/TOOLSTACK.md` §5 → `src/components/generated/`
3. Očisti mock fetch/state; komponente samo props + callbacks
4. `src/features/shell/` — navigacija Pregled/Dokumenti/Zadaci/Revizije/Moduli
5. `project.discipline` ≠ `review.domain_pack_id` (odvojena polja!)
6. Moduli: ZOP `Aktivno`; ostalo `Planirano`, disabled, **bez rezultata**
7. Backend odbija nepodržan `domain_pack_id`

**Dokaz:** screenshot desktop + telefon; odbijen zahtev sa lažnim `domain_pack_id`.

---

## FAZA 2 — Percepcija (14:00–15:30)

### #5 · S04 · 🅰️ · 3 SP — Daytona ingest ⛔🎬
**Alat:** Claude Code + `daytona` MCP
**Ulaz:** snapshot `saglasnik-docs-v1`; demo PDF-ovi (lokalno)

1. `node --env-file=.env.local scripts/setup/daytona-smoke.mjs` → PASS
2. `sandbox/ingest/manifest.py`: PDF → `{page_no, width, height, has_text, is_scanned}`
3. Render strane → `sandbox/artifacts/` (PyMuPDF/Poppler)
4. Testiraj na 3 stvarne sveske: GPZOP, Arhitektura, Elektro
5. Nečitljiva strana → `partial`, **nikad prazno**

**Dokaz:** manifest sa tačnim brojem strana za 3 sveske, ručno provereno.

### #4 · S03 · 🅱️ · 3 SP — Upload, dokumenti, revizije 🎬
**Alat:** Claude Code + `convex` MCP

1. `LOCK convex/schema.ts` → tabele `projects documents revisions artifacts events`
2. Storage: original **nepromenjen**; hash svakog fajla
3. Nova revizija se **dodaje**, ne prepisuje
4. DWG/DWFX: prihvati, evidentiraj, **ne parsiraj** → `design_task`

**Dokaz:** upload → refresh → revizija 2 → oba originala otvorljiva.

### #7 · S06 · 🅰️ · 3 SP — Ciljana ekstrakcija (R1–R6) 🎬
**Alat:** Claude Code (server action) + `grok-4.6`
**Zavisi od:** #5, #6

Šest pravila, sva iz **stvarnih** primedbi (detalji u issue #7):

| R | Šta traži |
|---|---|
| R1 | `F30/F60/F90` umesto klase `EI/REI` (SRPS EN 13501-2) |
| R2 | Pogrešan standard: `EI60 prema 13501-1` (13501-1 = reakcija, ne otpornost) |
| R3 | Kontradikcija GPZOP ↔ arhitektura (materijal fasade) |
| R4 | Element iz GPZOP nedostaje u predmeru i predračunu |
| R5 | Nedostaje obavezan proračun (fotometrijski EN 1838, snaga DEA, hidraulički) |
| R6 | Površina prostora ↔ deklarisan broj lica → evakuacija |

- Svaki podatak: vrednost, jedinica, identitet elementa, **broj strane**, region
- Za R3/R4 vraća **po jedno opažanje iz svakog dokumenta** (dva izvora!)
- Nema podatka → dokumentovan **obuhvat pretrage**, ne prazan string

**Dokaz:** dokazi za R1–R5 sa tačnim brojem strane, ručno provereno.

---

## FAZA 3 — Presuda i dosije (15:30–16:45)

### #9 · S08 · 🅰️ · 2 SP — Engine + integrity gate 🎬
**Alat:** Codex (čista logika) → Claude Code (integracija)

- Gate: veze, tipovi, primenljivost, obuhvat, otisci revizije
- Konflikt zahteva **dva** suprotna opažanja
- Nepoznat preduslov → `unknown` (**nikad** `PASS`/`FAIL`)
- `ReviewRun`: `pack_version`, `model_config_hash`, `prompt_version`, `input_hashes`

**Dokaz:** negativan test — uklonjen dokaz daje `unknown`, ne `PASS`.

### #10 · S09 · 🅱️ · 3 SP — Dosije + dokazi 🎬🎬
**Alat:** **v0** za layout → **Cursor** za interakciju
**Ovo je ekran koji se vidi na demou.**

- Nalazi levo · citiran original centar · akcije desno
- Klik na nalaz → **tačna strana** sa označenim regionom
- Konflikt → **oba** izvora jedan uz drugi (GPZOP ↔ arhitektura)
- Vidljivo: `predloženo → prihvaćeno → primenjeno → provereno`

**Dokaz:** snimak nalaz → dokaz → konflikt sa dva izvora.

### #8 · S07 · 🅰️ · 2 SP — Odvojena verifikacija
**Alat:** Claude Code. Drugi prolaz **ne vidi** vrednost prvog.
**Dokaz:** tabela dokaz | prolaz 1 | prolaz 2 | slaganje | odluka.

---

## FAZA 4 — Petlja ispravke (16:45–17:45) 🎬 DIFERENCIJATOR

### #11 · S10 · 🅱️ · 2 SP — Pitanje, odluka, prihvatanje
**Alat:** Cursor. Prihvatanje ≠ rešeno. Ponovljen klik ne duplira.

### #12 · S11 · 🅰️ · 3 SP — Plan povezanih ispravki
**Alat:** Claude Code. `base_hashes` — patch se odbija ako se izvor promenio.
DWG izmena → `design_task`, **nikad lažni patch**.

### #13 · S12 · 🅱️ · 3 SP — Stvarna izmena fajla + izvoz 🎬
**Alat:** Claude Code + Daytona (LibreOffice)

1. Patch na **podržan** izvor: DOCX (`python-docx`), XLSX (`openpyxl`)
2. Original ostaje; izmena ide u **novu** reviziju
3. `openpyxl` **ne** preračunava formule → render kroz LibreOffice
4. Preuzmi i **otvori** izlaz; proveri srpske znakove i prelom strana

**Dokaz:** otvoren fajl sa vidljivom izmenom, screenshot pre/posle.

---

## FAZA 5 — Ponovna provera (17:45–18:15) 🎬

### #14 · S13 · 🅰️ · 3 SP — Ponovno čitanje revizije
Nova revizija ide kroz #5 ingest **od nule**, ne keširano.
`verified` samo kad novo čitanje to pokaže.
Promena broja u dokumentu ≠ promena fizičkog rešenja.

### #15 · S14 · 🅱️ · 2 SP — Diff revizija + ceo tok
Deep-link refresh (Render rewrite `/*` → `/index.html`), desktop + telefon.

---

## FAZA 6 — Predaja (18:15–19:00) ⛔

| # | Ko | Radnja |
|---|---|---|
| #17 · S16 | 🅱️ | Render deploy iz pregledanog `main`; `CONVEX_DEPLOY_KEY` samo u Render env |
| #16 · S15 | 🅰️ | `docs/MODEL-EVAL.md` — **izmereni** rezultati R1–R6, ne pretpostavljeni |
| #18 · S17 | 🅱️ | Video ≤3 min (stvarna aplikacija!), README sa izmerenim stanjem, predaja **pre 19:00** |

---

## Ako vreme istekne — šta se žrtvuje

Redom, od prvog koji se odbacuje:

1. #8 (S07) odvojena verifikacija — jedan prolaz je dovoljan za demo
2. #16 (S15) formalna evaluacija — zadrži par izmerenih brojeva u README
3. #15 (S14) diff revizija — dovoljno je pokazati da je nova revizija pročitana
4. R6 i R2 iz #7 — R1, R3, R4, R5 nose demo

**Nikad se ne žrtvuje:** #5 ingest sa brojem strane, #7 R3/R4 (konflikt sa dva
izvora), #10 dosije, #13 stvarna izmena fajla, #17 javni URL, #18 video.
To je cela priča demoa.

---

## Demo scenario (3 min)

1. **Problem** (20 s) — revizija ZOP dokumentacije je ručna; primedbe se pišu iz glave.
2. **Upload** (20 s) — anonimizovan PZI set.
3. **Nalaz sa dokazom** (40 s) — R3: GPZOP traži `A1` oblogu, arhitektura navodi
   mineralnu vunu → **oba izvora jedan uz drugi**, sa brojem strane.
4. **Odluka** (20 s) — pitanje projektantu, odgovor, prihvatanje.
5. **Stvarna izmena** (40 s) — patch na tehnički opis + predmer, preuzmi, **otvori fajl**.
6. **Ponovna provera** (30 s) — nova revizija pročitana, nalaz `verified`, jedan
   ostaje otvoren kao `design_task` (DWG).
7. **Iskreni kraj** (10 s) — šta je izmereno, šta je planirano.

## Handoff

Na kraju svakog zadatka upiši u `docs/handoffs/A.md` ili `B.md`:
`ISSUE · DONE · CONTRACT · VALIDATION · NEEDS · NEXT`. Ne prepisuj partnerov handoff.
Ako si blokiran 15 min bez novog saznanja — prijavi razlog i predloži konkretan korak.
