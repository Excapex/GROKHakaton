# Nezavisna revizija konteksta

Datum: 11.09.2026. Obuhvat: postojeći folder, CrossBeam arhiva, dodatne javne provere i odgovori korisnika u ovoj sesiji. Ovaj dokument ne prepisuje stare zaključke kao činjenice.

## Zaključak

Saglasnik ostaje najbolji izbor nakon potvrde da porodica poseduje propise, stvarne stručne primedbe sa pravnim osnovom i projekte pre i posle ispravki. Potrebno je promeniti definiciju proizvoda: završiti ciklus pregleda, pripreme ispravki i provere nove revizije. Postojeći plan završava prerano, kod liste nalaza, dok neke njegove tehničke garancije nisu potkrepljene implementacijom.

Korisnik želi maksimalan kvalitet i kompletnost ostvarivu tokom hakatona. Jednostavno korisničko iskustvo ne podrazumeva jednostavan sistem. Složenost je opravdana kada povećava sposobnost, proverljivost ili pouzdanost proizvoda; broj integracija nije samostalna mera uspeha.

## Šta je pregledano

Inventarisana su 42 originalna fajla, sa veličinama i SHA-256 otiscima. Arhiva CrossBeama ima 361 fajl. Pročitani su glavni strateški dokumenti, specifikacija i runbook, tekst PDF razgovora od 58 strana, sadržaj radne sveske, izvorni prototipovi i njihovi rezultati. U arhivi su posebno analizirani README, DEMO, razvojni dnevnik, planovi, ključni serverski tokovi i relevantni skills/checklists.

Kalifornijske referentne dokumente unutar arhive sam indeksirao i ciljano pretraživao; nisam sproveo stručnu proveru svakog njihovog propisa. Browser-save JavaScript/CSS fajlovi su inventarisani kao pomoćni omotači. CAD i audio izlazi su evidentirani uz njihove generatore; nisu nezavisno sertifikovani fizički modeli. To su granice tvrdnje o učitanom kontekstu.

Originalni materijali nisu menjani. Ekstrakcije, inventar i dodatne provere nalaze se u `tmp/context_audit/`.

| Grupa | Stvarni doprinos odluci |
|---|---|
| `00-INDEX.md`, istraživački dosije | Mapa ranijih zaključaka; deo navodno zaključanih činjenica sada se razlikuje od javnog sajta |
| Prvi strateški dokument | ForgeFix: iz opisa do proizvodivog dela, ograničenja radionice i fizički izlaz |
| Odluka Prompt-to-Part / HomeTwin | Tržište, vizuelni demo, rizici 3D integracije, eksperimenti |
| Studija pobednika | Korisni obrasci i izvori, ali heterogen uzorak i previše snažni uzročni zaključci |
| Specifikacija v2 | Domenski pravac, strukturisani dokazi, ambiciozna agentska arhitektura |
| Runbook | Operativni detalji, ali su ispravke i izvoz uklonjeni iz jezgra proizvoda |
| PDF razgovor kolege | Želja za opipljivim i vizuelno ubedljivim proizvodom, posebno HomeTwin |
| Excel | Šablon za unos znanja; nije popunjena stručna baza |
| Python prototip Saglasnika | Sintetičke činjenice, mali engine i demonstracija JSON sheme; nema potvrđenog toka PDF → nalaz |
| CAD, ngspice, akustika | Dokaz da pojedini lokalni proračuni rade; ne dokaz kompletnosti tih proizvoda |
| CrossBeam | Najvredniji primer organizacije znanja, višefaznog rada i završnog profesionalnog paketa |

Istraživački dosije u rootu i u `Claude outputs` je identičan. Sačuvane HTML kopije ponavljaju sadržaj čistih dokumenata; broj fajlova nije broj nezavisnih istraživanja.

## Šta je korisnik dodatno potvrdio

- Otac ima skup propisa, tipske primedbe sa pozivom na zakon, gotove projekte i verzije pre ispravki. Materijal još nije bio dodat folderu tokom ove provere.
- Oba člana imaju osnovne plaćene ChatGPT i Claude/Claude Code planove, približno 20 evra mesečno.
- Tim čine dva člana; korisnik je iskusniji u programiranju.
- Problem Saglasnika nije odbačen. Primedba je da je prethodni plan žrtvovao kompletnost proizvoda radi lakše implementacije.
- Korisnik je dodatno potvrdio da materijal uključuje sve izvorne formate iz pitanja (Word/Excel/DWG uz PDF) i da će kompletan materijal dodati večeras. Sadržaj i urednost tih fajlova tek treba pregledati. Time stvarna izmena podržanog izvornog dokumenta ulazi u glavni plan.

## Činjenice o događaju koje treba ispraviti

Javni vodič proveren 11. septembra navodi početak rada u 11:00 i predaju u **19:00**. Lokalni dokumenti navode 20:00. Plan treba praviti prema ranijem roku dok organizator ne potvrdi drugačije. Innovation je prvi kriterijum, zatim funkcionalnost, jasnoća, izvedba i potencijal. Potrebni su javni repo, javni URL i kratak video. Dozvoljeno je krenuti od postojećeg projekta; ocenjuje se novi rad tokom događaja. [Zvanični vodič](https://hackathon.cursorserbia.com/hackathon/guide).

Daytona nagrade jesu krediti, a glavne nagrade novac. Nominalno veći iznos kredita nije dokaz veće ekonomske koristi za ovaj tim. Nema razloga da kategorija nagrade nadvlada izbor proizvoda. [Nagrade](https://hackathon.cursorserbia.com/hackathon/prizes).

Aktuelni Stack prikazuje Grok Bot/Cursor, Firecrawl, Exa, Wonder, Daytona, Convex, Wispr Flow, Fal.ai, x.ai i Render. Netlify nije prikazan u tekstu aktuelne liste. Navedeni iznosi promocija iz starog dosijea nisu dokaz da su aktivirani na vašim nalozima. [Stack](https://hackathon.cursorserbia.com/hackathon/stack).

## CrossBeam: važna ispravka prethodne interpretacije

Tvrdnja da CrossBeam nije izgradio gradski pre-review i da arhitektura ne vidi međudokumentne konflikte nije održiva na osnovu sopstvene arhive:

- README ima zastarelu roadmap formulaciju.
- `server/src/routes/generate.ts:19` prima `city-review`, `corrections-analysis` i `corrections-response`.
- `server/src/services/sandbox.ts` bira skills i izvršavanje prema toku; izvozi i gradske primedbe i odgovor projektanta.
- `server/skills/adu-plan-review/references/checklist-cover.md:398` izričito traži poređenje podataka između listova.
- `progress.md` opisuje izgradnju gradskog toka i kasnije rad oba korisnička toka u oblaku.

Ovo potvrđuje da postoji implementacija i namera poređenja, a ne dokazuje potpunu tačnost nad proizvoljnim projektima. U kodu postoji i unapred učitan manifest konkretnog demo projekta: demonstraciona pouzdanost nije isto što i opštost proizvoda.

Vrednosti koje treba preuzeti: stručni sadržaj strukturisan kao skills/reference, mapiranje fizičke PDF strane na oznaku lista, ciljano čitanje relevantnih delova, pitanja čoveku, odvojene radne faze i konkretni završni dokumenti. Skills predstavljaju znanje; agenti izvršavaju posao. Jedno ne zamenjuje drugo.

Dnevnik opisuje višednevni razvoj, probleme sa rasterizacijom i memorijom, mrežom i prezentacijom, kao i vremenski skupe agentske tokove. Završni demo razlikuje pregled već dobijenih rezultata od stvarnog novog pokretanja. To je važna pouka za Saglasnik: vidljiv tok rada i ponovljiv rezultat moraju postojati zajedno. Lokalni izvor: raspakovana arhiva u `tmp/context_audit/crossbeam/`. [Javni repozitorijum](https://github.com/mikeOnBreeze/cc-crossbeam).

CrossBeam jeste osvojio prvo mesto na događaju održanom tokom jedne nedelje, sa drugačijim resursima od sutrašnjeg dana. Njegov rezultat podržava vrednost poznavanja korisnika i završenog profesionalnog toka. [Objava organizatora](https://claude.com/blog/meet-the-winners-of-our-built-with-opus-4-6-claude-code-hackathon).

## Prototip: šta dodatne provere stvarno pokazuju

Pokrenut je odvojen audit, bez menjanja prototipa. Reprodukcija: `tmp/context_audit/check_prototype.py`; rezultat: `tmp/context_audit/prototype-checks.json`.

| Provera | Rezultat postojeće implementacije | Posledica |
|---|---|---|
| String `oko 15 metara` u numeričkom slotu | Shema prihvata | Tip podatka nije vezan za ključ činjenice |
| Nenulta vrednost, prazan citat i `page: null` | Shema prihvata | Prisustvo polja nije prisustvo dokaza |
| Nepostojeći dokument, strana 999, izmišljen citat | Shema prihvata | Referenca nije proverena prema stvarnom ulazu |
| Dozvoljeni `value: null` prosleđen B01 | `TypeError` | Legalno „ne znam“ može srušiti račun |
| Širina 1,3 m sa confidence 0,01 | PASS | Confidence nema uticaj na presudu |
| Jedan izlaz, bez broja lica | PASS | Nedostajući preduslov tretira se kao povoljan slučaj |
| Otpornost 1 h, bez stepena otpornosti | PASS | Podrazumevani stepen prikriva nedostatak podatka |
| Nedostaje druga strana poređenja | Nula nalaza | Provera se tiho preskače |

Dalji nalazi čitanjem koda:

- `F={f.key:f ...}` gubi ponovljene činjenice; nedostaje identitet elementa, sprata, požarnog sektora i revizije.
- Poređenje dve vrednosti zahteva isto značenje, jedinice, obuhvat i verziju. Dve različite površine nisu automatski konflikt.
- Broj nalaza nije pouzdan broj izvršenih pravila, jer neka uspešna pravila ne vraćaju nalaz.
- Vreme izvršenja malog rule engine-a ne uključuje učitavanje PDF-a, vizuelnu ekstrakciju, model, mrežu ili ljudsku proveru. To nije brzina obrade stvarnih projekata.
- Procena troškova kašnjenja koristi nevalidirane pretpostavke. Nije izmerena ušteda.

Posebno: B06 koristi redosled I=2 h, II=1,5 h, III=1 h, IV=0,5 h, V=0,25 h. U Tabeli 4 navedenog pravilnika, za noseće zidove unutar požarnog sektora redosled je obrnut. Drugi položaji elemenata imaju svoje zahteve. Ni ograničenje dužine evakuacije iz člana 33 nije univerzalno 30 m. Pragovi moraju imati tačan predmet primene i stručnu potvrdu. [Tekst pravilnika](https://www.paragraf.rs/propisi/pravilnik-tehnickim-normativima-zastitu-pozara-stambenih-poslovnih-objekata-objekata.html).

Zato je ispravan zaključak: deterministički kod čini račun ponovljivim. Ne garantuje istinitost ekstrakcije, izbor primenljivog pravila ili tačnost samog pravila.

Excel ima četiri lista sa uputstvima, zaglavljima i po jednim primerom u tri sadržajna lista. Oznaka DA u primerima nije dokaz očeve potvrde. Primeri se ne smeju automatski uvesti kao odobrena stručna baza.

## Šta istraživanje pobednika podržava, a šta ne

Studija meša različite organizatore, trajanja, resurse, glavne i posebne nagrade i signale sa Hacker Newsa. Nema uporediv skup neuspešnih projekata. Iz toga se ne može dobiti procenat verovatnoće pobede, numerička psihološka ocena pojedine sudije ili pravilo da dashboardi nikada ne pobeđuju.

Primer kuglane se u lokalnom dokumentu nalazi u delu Show HN. Nije dokumentovan kao pobednik hakatona niti kao projekat sa nekoliko linija koda. Pouka je upotrebljiva posledica i razumevanje stvarnog rada.

Medkit, Wrench Board i MaestrIA podržavaju značaj domena i celog korisničkog procesa. MaestrIA je dobitnik posebne nagrade Keep Thinking, a ne prvog mesta. Njeno domensko znanje nije celo korisničko iskustvo. [Objava za Opus 4.7](https://claude.com/blog/meet-the-winners-of-built-with-opus-4-7-claude-code-hackathon).

Tekton pokazuje vrednost sledljivih dokaza i provera. Rezultat Sim Francisco na određenom istorijskom glasanju nije univerzalna tačnost modela. Iz tih primera preuzimamo metod merenja na sopstvenom zadatku, bez preuzimanja njihovih procenata. [Objava za Opus 4.8](https://claude.com/blog/meet-the-winners-of-our-claude-opus-4-8-build-day-hackathon).

## Naučni radovi: upotrebljiva pouka i ograničenje

Provereni su svi navedeni identifikatori i javni sažeci; ovo nije replikacija eksperimenata niti potpuna recenzija svih radova.

| Rad | Šta se može primeniti | Šta se ne može zaključiti |
|---|---|---|
| [Grounded P&ID reasoning](https://arxiv.org/abs/2609.05880) | Trag od tvrdnje do strukturisanog dokaza i upita | Njihova tačnost ne važi automatski za ZOP PDF-ove |
| [AnalogAgent](https://arxiv.org/abs/2603.23910) | Generisanje → izvršenje → dijagnostika → korekcija | Zakon nema simulator koji sam rešava svako tumačenje |
| [LDTL](https://arxiv.org/abs/2604.05116) | Tražiti sledeći podatak koji najviše razjašnjava odluku | Klinički benchmark nije potvrda građevinskog agenta |
| [Masala-CHAI](https://arxiv.org/abs/2411.14299) | Upareni primeri i verifikacija strukturisanog izlaza | Dataset analognih kola nije gotov korpus ZOP znanja |
| [P&ID → process graphs](https://arxiv.org/abs/2607.19568) | Razdvojiti ekstrakciju od zaključivanja o vezama | Dva slučaja nisu dokaz univerzalne ekstrakcije crteža |
| [Troubleshooting guides](https://arxiv.org/abs/2601.22754) | Ne pretpostavljati da vizuelni model pouzdano obnavlja odnose | Rezultati određenih modela ne dokazuju da nijedan novi model može/ne može zadatak |

## Konkurencija i tvrdnja o inovaciji

Bluebeam dokumentuje AI provere neslaganja među listovima, oznakama i tabelama. CodeComply oglašava provere usklađenosti i projektne dokumentacije. To nije nezavisna evaluacija njihove tačnosti, ali jeste dovoljno da se odbaci tvrdnja „niko ovo ne radi“. [Bluebeam Smart Review](https://support.bluebeam.com/revu/how-to/use-smart-review.html), [CodeComply](https://codecomply.ai/ai-compliance-design/).

Saglasnik treba razlikovati dokazanim lokalnim stručnim znanjem, radom kroz revizije i pripremom koordinisanih ispravki. Zbir postojećih funkcija ili tvrdnja da je JSON shema inovacija neće biti dovoljan.

## Tehnički resursi i neproverene pretpostavke

Daytona niži nivoi imaju ograničen mrežni pristup, ali to nije isto što i potpuna zabrana mreže; postoje dozvoljeni servisi. Stvarni nivo naloga i potrebne endpoint-e treba proveriti malim izvršenjem. [Daytona mrežna ograničenja](https://www.daytona.io/docs/en/network-limits/).

Convex dokumentuje JS/TS runtime i Node actions. To samo po sebi ne potvrđuje da postoji Python interpreter za rezervni `child_process` tok iz runbooka. Python obradu planirati u Daytona sandboxu ili proverenom kontejneru. [Convex runtimes](https://docs.convex.dev/functions/runtimes).

Claude Pro ne uključuje standardni Console API budžet. Posebna stranica o Agent SDK-u ima važnu ispravku na vrhu: ranije najavljena promena i mesečni SDK kredit su pauzirani. Ne računati na dodatnih 20 dolara po osobi na osnovu zastarelog dela te stranice. SDK/subscription pristup nije isto što i potvrđena javna serverska integracija. [Claude Pro](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan), [aktuelna SDK napomena](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan).

Ne postoji dokaz u folderu da su API krediti, prava na konkretne modele, promocije, brzina javnog deploya i svi MCP pristupi već aktivirani. Za plan je bitno razlikovati: najavljeno, dostupno nalogu i uspešno provereno.

## Konačna procena

Najveći rizik Saglasnika nije frontend niti broj agenata. To je ispravno povezivanje činjenica, primenljivost pravila i dokaz da izmena rešava stvarni problem. Upravo tome treba posvetiti ambiciju. Predlog proizvoda i izvođenja nalazi se u `6-preporuka-za-hakaton.md`.
