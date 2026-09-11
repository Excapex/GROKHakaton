# Saglasnik · GROKHakaton

**Kopilot za tehničke projekte svih disciplina.** Jedan radni prostor za projekte, dokumente, zadatke, stručne preglede i revizije.

Za hakaton 12.09.2026. implementiramo **Zaštitu od požara (ZOP)** kao prvi aktivni stručni modul. Ostali moduli biće jasno označeni kao **Planirano** i razvijaće se posle hakatona.

> **Trenutni status:** repo sadrži specifikaciju, istraživanje i operativni setup paket. Aplikacija još nije implementirana u ovom repou. API ključevi, cloud deployment-i i stručna pokrivenost nisu potvrđeni samim postojanjem plana.

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
