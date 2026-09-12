# PRODUCT — ProjectLens

## Šta je
Kopilot za tehničke projekte svih disciplina. Jedan radni prostor za projekte,
dokumente, zadatke, stručne preglede i revizije.

Za hakaton je implementiran **jedan** stručni modul: **Zaštita od požara (ZOP)**.
Sve ostalo je `Planirano` i ne proizvodi nikakav rezultat.

## Problem
Revizija projektne dokumentacije sa aspekta zaštite od požara je ručna. Recenzent
čita više svezaka (GPZOP, arhitektura, elektro, mašinstvo, hidrotehnika, predmer) i
traži **neusaglašenosti između njih**. Primedba mora imati tačan pravni osnov,
citiran izvor i konkretan korektivni zahtev. To je ponovljiv, zamoran i
grešci podložan posao.

Iz stvarnog korpusa: dominantna greška **nije** kršenje pravila u jednom dokumentu,
nego **kontradikcija između dokumenata** — GPZOP traži oblogu klase `A1`, a
arhitektura navodi mineralnu vunu; vrata otporna prema požaru postoje na crtežu, a
nema ih u predmeru.

## Obavezna petlja
```
upload → pregled → dokaz → pitanje → predlog → prihvatanje
      → stvarna izmena podržanog izvora → izvoz → ponovna provera nove revizije
```
Korisnik prihvata **projektantsku odluku**. Sistem **ne izdaje saglasnost**.

## Zajednički UI
`Pregled · Dokumenti · Zadaci · Revizije · Moduli`

Vrsta projekta i stručni modul su **odvojeni**: `project.discipline` opisuje
projekat, `review.domain_pack_id` bira postupak pregleda. Arhitektonski projekat
može koristiti ZOP modul.

## Domensko znanje
Izvor: `Katalog primedbi na tehničku dokumentaciju sa aspekta zaštite od požara,
izdanje 2026` — **652 primedbe** u 8 poglavlja, svaka sa poljima
**Primedba / Osnov / Korekcija / Snaga**, plus registar od **36 propisa** i registar
standarda. Katalog je generalizovan i oslobođen podataka o konkretnim predmetima.

Dva sloja: **semantički** (gde i kako tražiti podatak) i **izvršivi** (potvrđeni
preduslovi, račun, odluka). Pravilo bez stručne potvrde ostaje `draft`.

Snaga primedbe: `JAK` (610) = direktan proverljiv zahtev · `USLOVNO JAK` (16) =
zavisi od datuma i režima projekta · `DOPUNITI` = pre upotrebe proveriti osnov.
**`USLOVNO JAK` i `DOPUNITI` ne smeju automatski proizvesti `FAIL`.**

## Šta je u obuhvatu (hakaton)
- Ingest PDF → manifest sa **fizičkim brojem strane** i renderom
- Šest pravila R1–R6 (vidi `docs/RUNBOOK.md` faza 2)
- Dosije: nalaz → dokaz na tačnoj strani → konflikt sa **dva** izvora
- Pitanje → odgovor → ChangeSet → prihvatanje
- **Stvarna izmena** podržanog izvora (DOCX/XLSX) + izvoz koji se otvara
- Ponovno čitanje nove revizije i zavisne provere
- Javni URL i video

## Šta nije u obuhvatu
- DWG/DWFX izmena — izvor se čuva, izmena je `design_task`
- Ostale discipline (arhitektura, statika, elektro, mašinstvo, hidrotehnika) kao
  stručni moduli — `Planirano`, bez rezultata
- Ukupni „procenat usaglašenosti" — ne postoji i ne prikazuje se
- Live internet pretraga pri svakom pregledu — koristi se **verzionisan** pack

## Pravila kvaliteta
- Činjenica ima tip, jedinicu, identitet elementa, reviziju i proverljiv izvor.
- Nepoznat podatak **ne postaje** povoljan `PASS`.
- Dokaz odsustva je **obuhvat pretrage**, ne izmišljen citat.
- Konflikt zahteva dva suprotna opažanja (mogu biti i na istoj strani).
- Šema i integrity gate **nisu** dokaz semantičke tačnosti.
- `predloženo` / `prihvaćeno` / `primenjeno` / `provereno` su **odvojena** stanja.
- Promena broja u dokumentu **ne dokazuje** da je fizičko rešenje objekta promenjeno.
- Planirani moduli ne prikazuju izmišljene rezultate.
