# Lokalni podaci — šta NIKAD ne ide u Git

Repo je **javan** (uslov hakatona). Stručni korpus je privatan i licenciran.

## 1. Ostaje lokalno, izvan repoa

Živi u `~/Hakaton/`, pored repoa — **nikad unutar njega**:

| Folder | Sadržaj | Zašto ne u Git |
|---|---|---|
| `../za sergeja/porojekti sa nedostatacima/` | 4 stvarna predmeta: PZI sveske, GPZOP, DWG/DWFX | Podaci klijenata: nazivi firmi, adrese, brojevi projekata |
| `../za sergeja/primedbe na dokumentaciju/sirove/` | 3.284 linije stvarnih službenih primedbi | Imena firmi i brojevi predmeta |
| `../za sergeja/popisi koji su bitni/` | 107 propisa | Delom licencirano |
| `../izgradnja zakoni i pravlinici/` | 182 fajla, zakoni i pravilnici | Delom licencirano |
| `../neki bitni standardi/` | SRPS EN 12845, CEN/TS 12101-11, prCEN/TR 12101-5, Em Lighting Guide | **Autorski zaštićeni standardi** — ne redistribuiraju se |

Oba člana ih imaju lokalno. **Ne dele se kroz repo, PR, issue ni chat.**

## 2. Smе u repo

| Šta | Zašto |
|---|---|
| `Katalog_primedbi_ZOP_2026` → `domains/fire_protection/` | Katalog je po sopstvenom uvodu **generalizovan i oslobođen podataka o konkretnim predmetima**. 652 primedbe, 8 poglavlja, polja Primedba/Osnov/Korekcija/Snaga. |
| Registar propisa (36) i registar standarda | Nazivi propisa i brojevi „Sl. glasnika" su javni podaci |
| **Anonimizovan** demo fixture | Vidi §3 |

⚠️ Citiranje standarda: navodi se **oznaka i izdanje** (npr. `SRPS EN 12845:2012`),
nikad prepisan tekst standarda.

## 3. Anonimizacija demo fixture-a (obavezno pre javnog URL-a)

Demo koristi **Prezident** set. Pre nego što bilo šta ode u repo ili na javni URL:

- naziv objekta → `Objekat A, Lamela 3`
- adresa → izbrisati
- naziv investitora i projektanta → `Investitor`, `Projektant`
- broj projekta (`PZI 120-…`) → `PZI-DEMO-01-…`
- pečati, potpisi, licence, JMBG/PIB → maskirati na renderu strane
- ime fajla bez naziva predmeta

Anonimizovani izlaz ide u `evals/fixtures/` i **tek tada** u Git.
Originali ostaju lokalno.

## 4. Zaštita u repou

`.gitignore` blokira: `local-corpus/ private-data/ standardi/ propisi/`,
`**/za sergeja/`, `**/neki bitni standardi/`, `**/izgradnja zakoni i pravlinici/`,
`*.dwg`, `*.dwfx`, `*.DWG`.

Guard pre svakog commita:

```bash
bash scripts/setup/check-no-private-data.sh
```

Blokira: CAD fajlove, putanje privatnog korpusa, licencirane standarde, i
nazive stvarnih predmeta (Prezident, Čerevićka, Kordun, Zlatarićeva, Gložan,
Petrovac) — i u **imenu fajla** i u **sadržaju diff-a**.

## 5. Ako podatak procuri

1. Ne brisati repo — to ništa ne opoziva.
2. Ukloniti sadržaj i odmah javiti drugom članu.
3. Ako je procurio ključ: **prvo rotirati/opozvati**, pa čistiti istoriju.
4. Ako su procurili podaci klijenta: obavestiti oca pre bilo kakve javne objave.
