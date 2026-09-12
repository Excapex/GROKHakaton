# Saglasnik — zajednički protokol

## Proizvod i autoritet
Saglasnik je kopilot za tehničke projekte različitih disciplina.
Zajednički UI i model: predmet, dokumenti, revizije, dosije, dokazi, zadaci i izmene.
Za hakaton implementiramo samo stručni modul fire_protection (ZOP).
Ostali moduli imaju oznaku Planirano i ne proizvode rezultate ni ocene.
Obavezna petlja: upload -> pregled -> dokaz -> pitanje -> predlog -> prihvatanje
-> stvarna izmena podržanog izvora -> izvoz -> ponovna provera nove revizije.
Korisnik prihvata projektantsku odluku; sistem ne izdaje saglasnost.
Prati najnovije odluke korisnika, docs/PRODUCT.md, docs/CONTRACTS.md i issue.
Stariji runbook je kontekst, a ne autoritet nad novim dogovorom.
Predaja se planira do 18:30, prema javnom roku 19:00, osim potvrđene izmene organizatora.

## Početak svake sesije
1. Pročitaj CLAUDE.local.md i potvrdi svoju ulogu A ili B. Ako nedostaje, pitaj samo za ulogu.
2. Proveri cwd, git status --short, trenutnu granu i git remote -v.
3. Proveri gh auth status, zatim git fetch origin. Ne ispisuj tokene ili env vrednosti.
4. Pročitaj dodeljeni issue, njegove zavisnosti i docs/handoffs/ drugog člana.
5. Saopšti šta preuzimaš, koje fajlove menjaš i čime ćeš dokazati završetak.
6. Ako postoje nepovezane lokalne izmene, sačuvaj ih; ne resetuj, ne briši i ne stashuj automatski.

## Uloge i ownership
A: contracts/, engine/, domains/, evals/, sandbox/ingest/, sandbox/compute/,
   convex/workflows/, convex/lib/perception/, convex/lib/providers/, convex/lib/daytona/.
B: src/, public/, sandbox/artifacts/, convex/schema.ts, convex CRUD fajlovi,
   hosting, .github/, package.json, package-lock.json, video i release.
A je integrator za Python dependencies i sandbox image; B za npm dependencies.
Shared contracts se menjaju uz dogovor oba člana i usklađen fixture/consumer u istom PR-u.
Generated fajlove ne uređuj ručno. Bilo koji izuzetak ownership-a zapiši u issue pre rada.
Podela je mehanizam saradnje, ne pravilo da se tuđa namera odbaci pri konfliktu.

## Issues i story points
GitHub je izvor istine za status. Svaki zadatak ima jednog vlasnika, SP, prioritet,
zavisnosti, prihvatne kriterijume i dokaz završetka.
Story points su relativna složenost/rizik (1,2,3,5), ne sati ili ocena programera.
5 SP rastavi pre početka. Ne uzimaj novi issue dok trenutni nije u review ili blokiran.
Status: ready -> in-progress -> review -> done; blocked navodi razlog i sledeću akciju.
Done znači: implementirano, provereno, pregledano i mergovano. Mock nije završena integracija.
Ne proglašavaj rezultat proverenim zato što je cilj napisan u specifikaciji.

## Git: početak zadatka
Radi u svom klonu. Nakon čistog statusa:
git switch main
git pull --ff-only origin main
git switch -c feat/<A-ili-B>/<issue-broj>-kratak-opis
Koristi novu kratkotrajnu granu za svaki issue. Ne koristi trajnu pipeline/ui granu
posle squash merge-a. Ne radi direktan push na main posle početnog scaffolda.
Fetch radi na početku zadatka, pre PR-a, posle partnerovog merge-a i pri promeni ugovora.
Na feature grani uskladi sa git merge origin/main; ne radi git pull naslepo.
Ne radi force push, reset --hard, git clean niti destruktivno rešavanje konflikata.

## Commit, push i PR
1. Proveri git diff i relevantne testove. git diff --check mora proći.
2. Dodaj samo namenske putanje (git add -- ...), pa pregledaj staged diff.
3. Pokreni dostupnu proveru tajni sa redigovanim izlazom; ne štampaj pronađene vrednosti.
4. Napravi smislen commit sa referencom issue-a, npr. feat(evidence): show source pair (#12).
5. git push -u origin <trenutna-feature-grana>.
6. PR prema main: konkretan problem i ponašanje, Closes #N, validacija,
   promena contracts/env/dependencies i slika/video kada je UI menjan.
7. Za višelinijski opis koristi UTF-8 fajl i gh pr create --body-file <putanja>.
8. Zatraži pregled od drugog člana. Svaki novi commit zahteva pregled aktuelnog diff-a.
9. Merge radi autor tek posle partnerovog pregleda i uspešnih relevantnih provera.
   Koristi squash i --match-head-commit sa upravo pregledanim SHA.
10. Posle merge-a: čist status, switch main, pull --ff-only, osveži dependencies/codegen
    kada je potrebno i otvori novu granu za sledeći issue.
Ako nema dostupnog partnera za review, označi blokadu; ne izmišljaj odobrenje.

## Konflikti i ugovori
Ako merge konflikt postoji, pročitaj obe namere, uključi vlasnika fajla i sačuvaj oba
potrebna ponašanja. --ours/--theirs nije standardno rešenje.
package-lock se usklađuje iz usaglašenog package.json, npm install, zatim npm ci i build.
Ne menjaj ugovor castovima any/as unknown da bi sakrio neslaganje.
Contracts su stabilni, ali popravljivi kroz mali koordinisani PR sa verzijom i fixture-om.
Ne odlaži ispravku očiglednog ugovornog buga do proizvoljnog vremenskog prozora.

## Razvoj i deployment
Svaki član koristi svoj Convex dev deployment. Ne pokreći dva convex dev watcher-a
iz različitih grana prema istom deployment-u.
B vodi produkcioni deploy iz main. Feature grane ne dobijaju production deploy key.
Cloud akcije/SDK pozive proveri u aktuelnoj zvaničnoj dokumentaciji i instaliranim tipovima.
Postojeće testove pokreni prema promeni; dodaj smislene testove za pravila, dokaze,
revizije, promene datoteka i oporavak. Ne testiraj samo kopiju implementacije.
Spoljni API pozivi idu iz server action-a; Python obrada u Daytona sandbox/kontejner.
Privatni izvorni projekti ostaju van javnog repoa. Samo odobreni anonimizovani demo ulazi.

## Kvalitet proizvoda
Činjenice imaju tip, jedinicu, identitet elementa, reviziju i proverljiv izvor.
Nepoznat preduslov ne postaje PASS/FAIL; konflikt mora imati dokaz za obe tvrdnje.
Dokaz odsustva je obuhvat pretrage, ne izmišljen citat nepostojećeg podatka.
Predlog, prihvatanje, primena i potvrđeno rešenje su odvojena stanja.
Izlazni fajl se ponovo čita i proveravaju se zavisna pravila.
Šema i integrity gate nisu dokaz semantičke tačnosti. Rezultati se mere, ne pretpostavljaju.

## Handoff i autonomija
Piši kratak docs/handoffs/A.md ili B.md: ISSUE, DONE, CONTRACT, VALIDATION, NEEDS, NEXT.
Ne prepisuj partnerov handoff. Preuzimanje posla potvrdi kroz assignee/issue komentar.
Ako si blokiran 15 minuta bez novog saznanja, prijavi razlog i predloži konkretan korak.
Nastavi autorizovani rad bez ponovnog traženja potvrde za rutinske lokalne izmene.
Ne kontaktiraj klijente niti šalji njihove dokumente bez odgovarajuće dozvole.
Ne kreiraj druge discipline, nove servise ili dodatne agente samo radi složenosti.
Na kraju napiši šta je urađeno, šta je stvarno provereno, PR/commit i šta ostaje.
