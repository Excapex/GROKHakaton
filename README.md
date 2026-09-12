# Saglasnik · GROKHakaton

**Kopilot za tehničke projekte svih disciplina.** Jedan radni prostor za projekte, dokumente, zadatke, stručne preglede i revizije.

Za hakaton 12.09.2026. implementiramo **Zaštitu od požara (ZOP)** kao prvi aktivni stručni modul. Ostali moduli biće jasno označeni kao **Planirano** i razvijaće se posle hakatona.

> **Trenutni status (12.09.2026):** aplikacija je implementirana i radi — React + Convex, sa pet ekrana i ZOP modulom nad pravilima R1–R6. Šta je pritom izmereno, šta je demonstracioni primer, a šta ostaje van obuhvata, razdvojeno je u odeljku [Šta je izmereno](#šta-je-izmereno-a-šta-nije).

## Šta je izmereno, a šta nije

### Izmereno

R1–R6 su pokrenuti nad anon fixture-om i nad lokalnim ingestom pravih PDF-ova
(lokalni korpus namerno nije u Gitu). Tabelu je izmerio A; izvor je
[`evals/MODEL-EVAL.md`](evals/MODEL-EVAL.md), model `grok-4.6`.

| Pravilo | Anon fixture | Lokalni ingest (case_a) | Promašaj |
|---|---|---|---|
| R1 F-oznaka | hit F60 str. 1 | hit F90 str. 42 | 0 |
| R2 EI + 13501-1 | hit | hit str. 16 i 8 | 0 |
| R3 fasada konflikt | A1 vs mineral_wool | oba A1 — nije konflikt | 0 lažnih FAIL |
| R4 element vs predmer | hit + `search_scope` | vrata str. 16, nema u predmeru | 0 |
| R5 fotometrija | unknown + scope | unknown (nema fotometrije) | 0 lažnih PASS |
| R6 površina / lica | 180 m2 / 90 | 2000/107 i 1200/200 | 0 PASS iz nepoznatog |

Uz to je izmereno i ponašanje pri lošem ulazu: kad se dokaz ukloni, nalaz pada na
`unknown`, ne na `pass` (`evals/test_judge.py`). Uredan projekat gde oba izvora
kažu A1 **ne** proizvodi konflikt — nema lažnog FAIL-a da bi demo izgledao pametnije.

Stvarna izmena fajla je izmerena, ne opisana: `sandbox/compute/cli.py apply`
patch-uje **kopije** DOCX/XLSX (`F60` → `EI 60 prema SRPS EN 13501-2`,
`Sheet1!C12` → `EI 60`), originali ostaju netaknuti, a `provenance.json` beleži
`originals_untouched: true` i `not_consent: true`. Zastareo hash izvora odbija
apply umesto da prepiše noviju verziju.

### Demonstracioni primer

- Predmet **„Objekat A, Lamela 3"** je demo radni prostor, ne stvaran projekat.
- Kada predmet nema ingestovan tekst strana, Pregled računa nalaze nad **javnim
  anon fixture tekstom** i to piše na vrhu ekrana. Nalazi su stvarno izračunati,
  ali nisu iz korisnikovih dokumenata.
- Vraćanje patch-ovanih kopija u sistem je ručno, kroz novu reviziju na Dokumentima.

### Van obuhvata

- Ostali stručni moduli (konstrukcija, elektro, mašinstvo…) su u katalogu označeni
  kao **Planirano** i ne prikazuju nikakav rezultat.
- Saglasnik **ne izdaje saglasnost**. Prihvatanje izmene je odluka projektanta i
  vodi se odvojeno od `applied` i `verified`.
- DWG/DWFX se nikad ne patch-uje — takva izmena ostaje `design_task` za projektanta.
- Odsustvo podatka se tvrdi samo uz dokumentovan `search_scope`; bez njega nalaz
  ostaje `unknown`.

## Šta pravimo

Projektant dodaje dokumentaciju. Saglasnik povezuje dokaze, pronalazi primedbe, postavlja presudno pitanje, priprema povezane izmene i proverava novu reviziju nakon prihvatanja.

```text
Projekat i dokumenti
  → ZOP pregled sa dokazima i potvrđenim pravilima
  → pitanje / odluka projektanta
  → predlog povezanih izmena i prihvatanje
  → stvarna izmena podržanog izvornog dokumenta
  → izvoz paketa
  → ponovno čitanje i provera nove revizije
```

Zajednički UI: **Pregled · Dokumenti · Zadaci · Revizije · Moduli**. Vrsta projekta i stručni modul pregleda su odvojeni: arhitektonski projekat, na primer, može koristiti ZOP modul kada je odgovarajući paket primenljiv.

Izvoz, stvarni izlazni fajl i provera revizije pripadaju glavnom obuhvatu. Originali ostaju sačuvani. Promene tehničkog rešenja i nepodržane CAD izmene vode se kao precizni projektantski zadaci. Prihvatanje predloga i dokazano rešenje su odvojena stanja.

## Pokretanje

```bash
npm ci
npm run dev            # http://localhost:5173
npm run verify         # check:private + lint + build + test
```

Za živi backend treba `VITE_CONVEX_URL` u `.env.local` i `npx convex dev`. Bez
njega aplikacija radi u demo režimu i Moduli katalog javlja da nije dostupan.
Serverski ključevi (`XAI_API_KEY`, `DAYTONA_API_KEY`, `CONVEX_DEPLOY_KEY`) idu u
Convex production env i Render Environment — **nikad sa `VITE_` prefiksom**, jer
bi tako završili u browser bundle-u.

## Dokumentacija — počnite ovde

| Dokument | Namena |
|---|---|
| **[Saglasnik v3 — specifikacija i runbook](dokumenti/7-saglasnik-spec-v3.html)** | Aktuelni plan: proizvod, arhitektura, kompletan tok, setup, 18 zadataka, Git protokol i Claude promptovi |
| [Setup paket ZIP](dokumenti/saglasnik-v3-setup.zip) | 14 fajlova spremnih za kopiranje |
| [Setup direktorijum](dokumenti/saglasnik-v3-setup/) | Pojedinačni promptovi, skripte, šabloni i backlog |
| [Nezavisna revizija konteksta](dokumenti/5-nezavisna-revizija-konteksta.md) | Provera istraživanja, izvora, prototipa i ranijih pretpostavki |
| [Preporuka za hakaton](dokumenti/6-preporuka-za-hakaton.md) | Obrazloženje kompletnog toka ispravke i verifikacije |
| [Ažurirani prethodni runbook](dokumenti/4-runbook-hakaton.md) | Referenca za dosije, domenske pakete, ciljanu ekstrakciju i integrity gate |
| [Specifikacija v2](dokumenti/3-saglasnik-spec-v2.html) | Prethodni smer i originalni vizuelni format |

**V3 i noviji dogovor tima imaju prednost** u pitanjima scope-a, prioriteta i redosleda rada. Stariji dokumenti su sačuvani radi konteksta; njihove pretpostavke nisu automatski aktuelne. Revizija pominje originalni istraživački folder i lokalne audit ekstrakcije koje nisu deo ovog paketa.

GitHub prikazuje HTML kao izvorni kod. Za pun prikaz klonirajte repo i otvorite `dokumenti/7-saglasnik-spec-v3.html` u browseru. Dokument ima sadržaj sa 30 odeljaka i dugmad za kopiranje promptova. Sačuvajte strukturu foldera da bi lokalne veze i preuzimanja radili.

## Početak rada u ovom repou

Repo **Excapex/GROKHakaton već postoji**. Svako radi iz svog klona:

```powershell
gh auth login
gh repo clone Excapex/GROKHakaton
Set-Location -LiteralPath '.\GROKHakaton'
git status --short
```

Ako je repo već kloniran, otvorite taj direktorijum umesto ponovnog kloniranja. GitHub nalog svakog člana mora imati pristup repou.

1. Pročitajte v3: odeljci **19** (novi scope), **20–26** (stack setup), **27–28** (posao i Git), **29** (Claude promptovi).
2. Dogovorite ko je **A**, a ko **B**. U `dokumenti/saglasnik-v3-setup/team.example.json` vidite potrebna polja. Pri pripremi radnog `scripts/setup/team.json`, postavite `repo` na **`Excapex/GROKHakaton`** i unesite stvarne GitHub naloge za obe uloge. Ne ostavljajte `YOUR_OWNER/saglasnik` iz generičkog primera.
3. **Preskočite pravljenje novog repoa, `git init` i `gh repo create` iz generičkog odeljka 21.** B priprema Vite scaffold u zasebnom privremenom folderu i prenosi aplikacione fajlove u ovaj repo kroz feature granu. Sačuvati postojeći README, dokumentaciju i Git istoriju; `.gitignore` dopuniti, ne zameniti. Nemojte potvrditi opciju koja briše sadržaj postojećeg foldera.
4. Zatim pratite kopiranje setup fajlova iz odeljka 21. U ovom klonu je putanja `$setupSource = (Resolve-Path '.\dokumenti\saglasnik-v3-setup').Path`. Zajednički `CLAUDE.md` ide u root, a izabrani lokalni dodatak u `CLAUDE.local.md`. Lokalna uloga i ključevi su ignorisani u Git-u.
5. Kreirajte `docs/PRODUCT.md` i `docs/CONTRACTS.md` iz prihvaćene specifikacije, kako nalaže setup. Tek nakon prenosa aplikacionog scaffolda postoje `package.json`, `npm install` / `npm ci` i lokalni app build.
6. Svaki član koristi **svoj Convex dev deployment**. B vodi produkcioni deploy iz pregledanog `main`-a.

## Razvojno okruženje — pročitajte pre prvog builda

**Node.** `package.json` ima `engines.node: ">=24"`. Floor je 24 zbog Vite 7 i
`ci.bootstrap.yml` koji koristi Node 24; lokalno je testirano i na Node 26.
**Node 22 neće raditi** — ako si na 22, nadogradi pre `npm ci` da ne gubiš vreme
na nejasne greške iz Vite-a.

**Provere pre commita.** Jedna komanda pokriva sve:

```bash
npm run verify   # check:private + lint + build + test
```

- `npm run check:private` — guard koji blokira privatni korpus, licencirane
  standarde, CAD izvore, API ključeve i nazive stvarnih predmeta. Lista naziva je
  lokalna: `cp scripts/setup/cases.example.txt scripts/setup/cases.local.txt`.
- `npm test` — Vitest, 40 testova: ugovori, R1–R6 percepcija, mapiranje strana u
  uloge, idempotentno prihvatanje i izvoz paketa izmena. Zeleno `npm test` znači
  da ta pravila važe — ne znači da je pokrivenost potpuna.
- Python evali (`.venv/bin/python evals/test_*.py`) pokrivaju extract, verify,
  judge, plan izmena i apply na kopijama.
- `npm run test:e2e` — Playwright, pokriva petlju upload → nalaz → odluka → izlaz
  → revizija. Namerno nije u CI-ju dok testovi ne postoje.

**Kontekst za agente.** Svaki alat čita ista pravila iz `docs/`:
`AGENTS.md` (Codex, Cursor, Grok Bot) · `CLAUDE.md` (Claude Code) ·
`.cursor/rules/` (Cursor). Počni od [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — ko radi
šta, u kom alatu. Podela fajlova i pravila pushovanja su u
[`docs/GIT-PROTOCOL.md`](docs/GIT-PROTOCOL.md). Šta nikad ne ide u Git:
[`docs/LOCAL-DATA.md`](docs/LOCAL-DATA.md).

CI šablon je pripremljen u setup paketu. Aktivira se u `.github/workflows/ci.yml` kada postoje aplikacioni fajlovi i npm komande koje proverava.

## Podela posla i Git protokol

| Uloga | Glavna odgovornost | Početna procena |
|---|---|---|
| **A** | Ugovori, ingest, domensko znanje, ekstrakcija, pravila, integrity gate, predlog promena i ponovna provera | 22 SP |
| **B** | Zajednički UI, stanje predmeta, dokumentni artefakti, izvoz, CI, deploy i prezentacija | 21 SP |

**18 početnih zadataka, ukupno 43 SP.** Story poeni su relativna procena složenosti i rizika, ne sati i ne ocena doprinosa. Svaki issue ima jednog vlasnika, zavisnosti, kriterijum prihvatanja i dokaz završetka. Drugi član radi review. [Backlog sa kriterijumima](dokumenti/saglasnik-v3-setup/backlog.json).

Kada su `scripts/setup/` i stvarni `team.json` pripremljeni, B može prvo pregledati pa napraviti issues:

```powershell
pwsh -File scripts/setup/create-issues.ps1
pwsh -File scripts/setup/create-issues.ps1 -Create
```

Samo komanda sa `-Create` piše na GitHub. Skripta ne pravi aplikaciju i ne radi deploy. Početni issues još nisu kreirani objavljivanjem ove dokumentacije.

Za implementaciju: kratka grana po issue-u → ciljani commit → push → PR → partnerov review → uspešne provere → squash merge. Na čistom `main` koristiti `git pull --ff-only`; feature granu usklađivati preko `git fetch origin` i `git merge origin/main`. Bez force push-a i destruktivnog rešavanja konflikata. Detaljne komande i ownership putanje su u v3 i zajedničkom Claude promptu.

## Claude instrukcije

| Fajl | Kako se koristi |
|---|---|
| [CLAUDE.md](dokumenti/saglasnik-v3-setup/CLAUDE.md) | Zajednički protokol za oba člana; kopirati u root pri bootstrapu |
| [CLAUDE-A.local.md](dokumenti/saglasnik-v3-setup/CLAUDE-A.local.md) | Član A kopira kao `CLAUDE.local.md` |
| [CLAUDE-B.local.md](dokumenti/saglasnik-v3-setup/CLAUDE-B.local.md) | Član B kopira kao `CLAUDE.local.md` |

Obojica dele isti `CLAUDE.md`; svaki računar ima svoju lokalnu ulogu. Zajednički prompt definiše pull/push, issues, review, ownership, handoff i standarde kvaliteta. Konkretni GitHub identiteti dolaze iz popunjenog `scripts/setup/team.json`.

## Planirani stack

| Sloj | Alati i uloga |
|---|---|
| Interfejs | React, TypeScript, Tailwind; Wonder za razvoj radnog prostora |
| Stanje i tok posla | Convex, storage i Workflow |
| Dokumenti | Daytona, Python, PDF parseri, Word/Excel obrada, Poppler i LibreOffice |
| Modeli | x.ai kao početni kandidat; dodatni adapter prema stvarnom testu i potvrđenom API pristupu |
| Zbirka izvora | Exa → Firecrawl → stručna potvrda → verzionisani domenski paket |
| Hosting | Render frontend, Convex backend |
| Razvoj | Grok Bot / Cursor, Claude Code / Codex |
| Pomoć pri izradi | Wispr za diktiranje; Fal opciono za smislen medijski dodatak |

Detaljne komande, env matrica, modelni smoke testovi, Daytona image i hosting koraci nalaze se u **odeljcima 20–26** specifikacije. Razvojne pretplate nisu automatski API budžet. Modeli i ključevi proveravaju se na stvarnim nalozima; ne ugrađuju se u frontend ili repo.

## Kvalitet i status provera

- Činjenica ima tip, jedinicu, identitet elementa, reviziju i proverljiv izvor.
- Nepoznat podatak ne postaje povoljan `PASS`; primenljivost pravila mora biti potvrđena.
- Shema i integrity gate proveravaju strukturu i veze, ali nisu dokaz semantičke tačnosti.
- Izlazni dokument se stvarno pravi, otvara i ponovo čita; zavisne provere određuju šta je rešeno.
- Planirani stručni moduli ne prikazuju izmišljene rezultate.

**Provereno za ovaj dokumentacioni paket:** HTML na desktopu, telefonu i u tamnom režimu; navigacija i kopiranje promptova; sintaksa pomoćnih skripti; generator 18 issues sa simuliranim GitHub-om i ponovnim pokretanjem bez duplikata; API smoke skripta sa simuliranim odgovorima i greškom 429.

**Još treba dokazati u implementaciji:** stvarni nalozi/krediti, cloud snapshot, modelna ekstrakcija nad odobrenim projektima, tačnost pravila, izmena dokumenata i kompletan javni korisnički tok. Stručni materijal i privatni projekti dodaju se kroz dogovoreni postupak, bez nenamernog objavljivanja izvora.

## Rok i demonstracija

Planirana predaja je **12.09.2026. do 18:30**, uz provereni javni rok **19:00**, osim naknadne potvrđene izmene organizatora. Starija tvrdnja o 20:00 je korigovana u v3.

Demo pokazuje univerzalni projektni radni prostor, aktivni ZOP modul, dokaz primedbe, odluku, izmenjeni fajl i proveru nove revizije. Prikazuju se stvarno izmereni rezultati i preostali otvoreni zadaci.

[Zvanični vodič](https://hackathon.cursorserbia.com/hackathon/guide) · [Partner stack](https://hackathon.cursorserbia.com/hackathon/stack)
