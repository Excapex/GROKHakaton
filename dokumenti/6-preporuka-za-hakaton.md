# Nalaznik: preporuka za hakaton 12.09.2026.

Nezavisna preporuka, 11.09.2026. Zasnovana na reviziji foldera i potvrdi korisnika da postoje očevi stvarni propisi, primedbe i projekti pre i posle ispravki. Korisnik je potvrdio da ima kompletan materijal sa izvornim formatima i da ga dodaje večeras. Sadržaj i tehnička urednost izvora još nisu pregledani.

## Odluka

Graditi Nalaznik kao radni prostor za pregled i koordinisano otklanjanje primedbi u dokumentaciji zaštite od požara.

**Obećanje korisniku:** Predaj projektnu dokumentaciju, razumi gde i zašto postoji problem, pripremi potrebne ispravke i proveri da li ih nova revizija zaista rešava.

Kompletnost znači da korisnik završava posao unutar podržanog obuhvata. Sutra to podrazumeva ceo tok od ulaza do paketa ispravki i ponovne provere, uz jasno prikazane delove koji zahtevaju stručnu odluku. Ne podrazumeva sve vrste objekata, sve propise, automatsko projektovanje zgrade i uređivanje proizvoljnog DWG-a.

Najvažniji proizvodni princip: **smanjivati broj podržanih slučajeva pre nego što se ukloni završetak posla.** Izvoz, dokazi i ponovna provera su deo jezgra.

## Zašto ovaj pravac

| Pravac | Prednost koju stvarno imamo | Najteža zavisnost | Odluka |
|---|---|---|---|
| Nalaznik sa ispravkama i revizijama | Stručnjak, stvarni projekti i poznate ispravke | Ekstrakcija, primenljivost pravila, veza između dokumenata | Prvi izbor |
| ForgeFix / Prompt-to-Part | Postojeći uspešni CAD generator i opipljivi fajlovi | Stvarna ograničenja radionice i korisna razlika od postojećih CAD alata | Najbolja rezerva ako domenski materijal izostane |
| HomeTwin | Snažan vizuelni doživljaj | Verna semantika prostora, editabilna scena i korisna završna akcija još nisu dokazane | Ne bih ga birao sutra |
| Sabine / Testpoint | Brzi lokalni eksperimenti | Nezavisna fizička validacija i stvaran ulaz iz sveta | Nedovoljno potvrđena osnova za glavni proizvod |

Ovo je izbor na osnovu prednosti ovog tima, bez numeričke prognoze plasmana. Nalaznik može biti zahtevan i snažan proizvod zato što raspolažete proverljivim stručnim procesom koji većina timova tek treba da upozna.

## Jedan korisnik i jedan posao

Početni korisnik je projektant ili odgovorno lice u projektnom birou koje koordinira tehnički opis, grafičke priloge i druge delove dokumentacije. Prvi potencijalni kupac je biro; investitor je korisnik posledične uštede. To je hipoteza koju otac treba da proveri, ne već potvrđen model prodaje.

Za demonstraciju izabrati jedan tip objekta iz stvarnog materijala i tri grupe čestih primedbi:

1. Međudokumentna neslaganja istog elementa/podatka.
2. Proverljivi zahtevi sa eksplicitnim preduslovima i pragom.
3. Nedostajući dokaz, prilog ili podatak potreban za odluku.

Broj pravila određuje potvrđeni materijal. Razumna početna meta je 8–15 proverenih pravila u ove tri grupe; više dodati kada osnovni tok radi. Svako pravilo mora imati bar primer primene i primer kada se ne sme primeniti. Desetine nepotvrđenih pravila ne predstavljaju veću pokrivenost.

## Korisnički tok koji mora biti završen

### 1. Prijem i mapa projekta

Korisnik otvara predmet i dodaje dokumente. Sistem pravi manifest: naziv dokumenta, revizija, fizička strana, oznaka lista, tip sadržaja. Prikazuje šta je pročitano, šta se još obrađuje i šta nije pouzdano čitljivo.

Ceo paket može biti učitan i indeksiran, dok se detaljno proveravaju relevantne strane za podržana pravila. Obuhvat mora biti vidljiv; indeksiranje stranice ne znači da je stručno proverena.

### 2. Pregled sa dokazima

Nalaz otvara originalnu stranu i označeni izvor. Kod konflikta prikazuju se oba dokumenta. Korisnik vidi isti element, obe vrednosti, relevantno pravilo i razlog primenljivosti.

Model treba da povezuje iste elemente kroz različite oznake i zapise. Ne sme da pretpostavi da su dve različite vrednosti konflikt pre provere sprata, sektora, jedinice, značenja i revizije.

### 3. Razjašnjenje

Ako nedostaje odlučujući podatak, sistem traži precizan odgovor: na primer koja revizija ili koji dokument je merodavan. Odgovor se čuva sa poreklom „potvrdio korisnik“. Pitanja treba birati po tome koliko provera razjašnjavaju.

Ne prikazivati PASS kada nema dovoljno podataka. Ne koristiti samoprijavljeni confidence modela kao jedini kriterijum.

### 4. Plan ispravke i prihvatanje

Agent predlaže konkretne izmene, povezuje sve dokumente na koje utiču i pokazuje šta ostaje stručni zadatak.

Tri vrste akcija:

- Dokumentarna korekcija sa već potvrđenom merodavnom vrednošću: pripremi izmenu u podržanom tekstu/tabeli.
- Projektantska promena: napravi precizan zadatak i označi mesto; projektant bira rešenje.
- Nedostatak podataka: zatraži informaciju ili prilog.

Promena oznake u tabeli ne rešava stvarno neodgovarajuću širinu hodnika ili geometriju objekta. Takav problem ostaje otvoren dok se ne dobije odgovarajuća nova dokumentacija.

### 5. Stvaran izlaz

Obavezan je paket koji se može preuzeti: izveštaj sa dokazima i pravnim referencama, označeni prilozi, precizni predlozi zamene teksta, lista projektantskih zadataka i istorija prihvaćenih odluka.

Pošto je korisnik potvrdio izvorne fajlove, u glavni obuhvat uključiti jednu stvarnu vrstu izmene u kopiji Word/Excel dokumenta, sa pregledom razlika i ponovnim generisanjem izlaza. Tačan format i vrstu izmene odabrati nakon pregleda materijala. Ne zamenjivati original bez očuvane verzije.

Za crteže ili delove koje implementacija još ne ume pouzdano da menja, isporučiti anotirani PDF i precizan zadatak; za proveru projektantske izmene učitava se nova revizija. Dostupnost DWG-a sama po sebi ne dokazuje da ćemo sutra pouzdano automatizovati njegovo uređivanje. Ta granica mora biti vidljiva po pojedinoj akciji, uz stvarne automatske izmene podržanih tekstualnih delova.

### 6. Ponovna provera

Promenjena datoteka ponovo prolazi ekstrakciju i odgovarajuće provere. Status nalaza ne postaje „rešeno“ zato što je korisnik prihvatio predlog, nego kada nova verzija pruža dokaz.

Prikazati: rešeno, i dalje otvoreno, novonastalo, potrebno dodatno pojašnjenje. Ponovo proveriti i zavisne zahteve. Čuvati identitet nalaza kroz verzije.

## Trenutak koji demonstracija treba da zapamti

**Jedna potvrđena projektantska odluka pokaže sva mesta koja treba usaglasiti; sistem pripremi paket izmena i zatim proveri novu dokumentaciju.**

Ilustrativan slučaj, koji mora biti zamenjen očevim stvarnim primerom: isti označeni element ima različitu specifikaciju u opisu i tabeli. Sistem otvara oba izvora, nalazi merodavan zahtev, traži potvrdu izbora, priprema korekciju i zadatak za grafički prilog. Posle nove revizije deo nalaza nestaje, a jedan nerešen zahtev ostaje vidljiv.

Ako nova revizija ukloni oznaku umesto da ispravi sadržaj, sistem treba da registruje nedostajući dokaz, a ne uspešnu popravku. Ovo je ubedljiviji dokaz kvaliteta od animiranog broja pronađenih grešaka.

## Arhitektura koja opravdava složenost

Tok: **dokument → dokaz → činjenica o elementu → primenljivo pravilo → nalaz → predlog → ljudska odluka → novi artefakt → provera revizije.**

Convex čuva predmet, verzije, događaje i rezultate. Daytona izvršava obradu dokumenata, proračune i stvaranje/verifikaciju artefakata. Modeli rade ciljanu ekstrakciju i zaključivanje. Frontend prikazuje dokument i odluku, sa statusom rada u realnom vremenu.

Tri jasne agentske odgovornosti dovoljne su za prvo kompletno izdanje:

1. **Pregled i povezivanje dokaza:** traži relevantne strane, čita oznake i povezuje elemente.
2. **Predlog ispravke:** koristi proverene činjenice i stručne obrasce da predloži dosledne promene.
3. **Provera:** ponovo čita relevantne izvore/novi artefakt i proverava tvrdnje i zavisnosti.

Koordinator može biti eksplicitan programski workflow. Nije potrebno da svaka faza bude još jedan slobodno razmišljajući agent. Paralelno čitanje nezavisnih dokumenata ima smisla uz ograničen broj istovremenih poziva. Završni proveravač treba prvo da napravi sopstveno čitanje izvora; samo slaganje dva modela nije potvrda istine.

Domenski sadržaj čuvati odvojeno: pravilo, važeća verzija izvora, precizan član/tabela, preduslovi, izuzeci, potrebne činjenice, očekivana akcija, primer i kontraprimer. Skills daju agentima postupak rada nad tim sadržajem.

Minimalna činjenica treba da ima: dokument i reviziju, stranu, region/citat, identitet elementa, svojstvo, tipizovanu vrednost, jedinicu i stanje verifikacije. Sačuvati sva opažanja; ne prepisivati ih jednim globalnim ključem.

Za jutarnji početak napraviti uzan, eksplicitan tok sa strukturisanim pozivima alatima. Claude Agent SDK je opravdan ako najteži slučaj zahteva adaptivno čitanje, kod i izvršavanje, i ako autentifikacija/host rade. Novi Managed Agents servis ili Mozaik dodavati kada rešavaju već viđenu prepreku, uz potvrđen pristup; sama novina servisa nije razlog za migraciju.

## Kako koristiti ponuđeni stack

| Alat | Vredan posao u ovom projektu | Dokaz dobre upotrebe |
|---|---|---|
| Grok Bot / Cursor | Razvoj, projektna pravila i partnerski MCP pristupi | Ubrzava stvarne implementacione zadatke |
| ChatGPT/Codex i Claude Code pretplate | Pisanje, pregled koda, analiza primera | Odvojeni kratki zadaci; ne pretpostavljati neograničen budžet |
| x.ai | API za ciljano čitanje teksta/slika i strukturisane činjenice | Tačnost nad stvarnim stranama, izmeren trošak i trajanje |
| Daytona | Izolovana obrada PDF-a, izvršenje provera, anotacije, export i ponovno čitanje | Run ID povezan sa ulaznim i izlaznim artefaktima; retry ne duplira rezultat |
| Convex | Predmeti, revizije, pitanja, prihvatanje izmena i događaji uživo | Osvežavanje stranice ili drugi prozor ne gubi pregled i odluke |
| Wonder | Dizajn i React/Tailwind izvođenje radnog prostora za dokumente | Dva izvora i odluka razumljivi bez objašnjenja autora |
| Exa | Pronalaženje tačnog autoritativnog izvora kada nije u korpusu | Rezultat završava kao citiran dokument, ne kao zaključak iz snippeta |
| Firecrawl | Unošenje izabranih javnih tekstova propisa u strukturisanu zbirku | Izvor, datum preuzimanja i verzija su sačuvani |
| Render | Javni frontend i po potrebi koordinator/worker | Javna putanja radi van računara autora |
| Wispr Flow | Diktiranje očevih objašnjenja i razvojnih zadataka | Brže beleženje stručnog razloga; alat za razvoj, ne pretpostavljeni TTS API |
| Fal.ai | Opcioni materijal za video ili korisno glasovno objašnjenje uz provereni endpoint | Poboljšava prezentaciju bez generisanja navodnog dokaza iz projekta |

Ova raspodela koristi skoro ceo stack smisleno, uključujući alate za izradu. Fal ne treba siliti u put od dokumenta do stručnog nalaza. Generisanje novih slika tehničkog crteža nije pouzdan način popravke originala.

Exa/Firecrawl imaju mesto u pripremi i dopuni znanja. Svaki pregled ne treba iznova da istražuje internet ako već ima potvrđen korpus. Verzija propisa ne sme se neprimetno promeniti između dva pokretanja.

### Pristup i budžet

Za svaki servis zabeležiti tri stanja: najavljena ponuda, aktiviran pristup, uspešan mali test. Editor pretplate se ne tretiraju kao standardni API krediti za javnu aplikaciju. Tačan model birati posle kratkog poređenja na stvarnom materijalu, ne prema imenu u starom planu.

Primarni javni modelni tok planirati preko potvrđenog x.ai API pristupa. Anthropic API uključiti ako najteži primer pokaže bitnu prednost i postoji odgovarajući budžet. Neophodan je jednostavan adapter za zamenu modela, ne puna platforma za deset provajdera.

Meriti trošak celog pregleda i rezerve za više ponavljanja. Keširati po sadržaju dokumenta i verziji modela/prompta/pravila. API ključevi ostaju serverski. Javni demo dobija reset i ograničenje učestalosti, jer će biti dostupan i posle prezentacije.

## Kako koristiti očev materijal

Najvrednija jedinica je povezan slučaj: **ulazni projekat + primedba + pravni osnov + konkretna promena + prihvaćena revizija**.

Večeras prioritetno izdvojiti 2–3 takva slučaja, uz sačuvane nazive/identitete koji povezuju listove. Anonimizacija ne treba da uništi tu vezu. Javni repo sadrži samo odobrene ili jasno označene sintetičke primere.

Za svaku tipsku primedbu otac treba da potvrdi:

- Kada se primenjuje i kada postoji izuzetak.
- Gde se proverava podatak i koji izvor je merodavan.
- Da li je problem dokumentaran ili zahteva projektantsku odluku.
- Kako izgleda prihvatljiva korekcija.
- Koji sličan slučaj ne sme biti označen kao greška.

Jedan projekat koristiti za razvoj i prikaz, drugi držati po strani za evaluaciju. Verzije istog projekta ne raspoređivati između primera za model i navodno nezavisnog testa. Pri proveri verzije „pre“, ispravljena verzija ne sme biti dostupna agentu kao skriveni odgovor.

Ako stigne samo jedan projekat, koristiti ga za demonstraciju i testove ponašanja, ali ne tvrditi generalizaciju na nove projekte. Očeva lista možda nije iscrpan spisak svih grešaka; dodatne nalaze procenjuje stručnjak, ne automatsko brojanje kao lažno pozitivne.

## Provere koje potvrđuju kvalitet

- Za svaku prijavljenu primedbu: stručnjak potvrđuje i problem i primenljivost navedenog osnova.
- Prikazati broj pronađenih poznatih primedbi, broj pregledanih dodatnih nalaza i broj nerešenih slučajeva. Uvek navesti veličinu i poreklo skupa.
- Meriti tačnost povezivanja istog elementa kroz dokumente.
- Proveriti novi izlaz stvarnim ponovnim čitanjem, uz proveru zavisnih pravila.
- Promeniti naziv fajla, dodati naslovnu stranu i promeniti redosled PDF-ova: dokaz treba i dalje da pokazuje pravi sadržaj.
- Ukloniti odlučujući podatak: očekivati zahtev za pojašnjenje.
- Učiniti da dve različite revizije imaju različite vrednosti: ne prijavljivati automatski konflikt iste revizije.
- Testirati prekid/ponovni pokušaj, prazni i nečitljivi ulaz, osvežavanje stranice i javni URL iz drugog browsera.

Ne koristiti broj 40.000 projekata/s, „100% tačno po konstrukciji“ ili izmišljene novčane uštede u prezentaciji. Koristiti stvarno vreme celog toka i stvaran rezultat malog stručnog testa.

## Plan izvođenja

Javni vodič trenutno daje rok 19:00; interni cilj je gotova predaja do 18:30. [Vodič](https://hackathon.cursorserbia.com/hackathon/guide).

**Večeras:** potvrditi primer i pravila, popraviti pogrešne pretpostavke, proveriti dostupnost naloga i biblioteka, izabrati izgled i ulaz/izlaz, sačuvati početno stanje repozitorijuma. Dopuštenu postojeću osnovu jasno odvojiti od rada napravljenog sutra; nema razloga veštački prepisivati isti kod.

| Vreme | Rezultat koji mora postojati |
|---|---|
| 11:00–11:30 | Potvrđeni krediti i mali modelni poziv; deploy; zajednički ugovor podataka |
| 11:30–13:00 | Prvi stvarni PDF daje nalaz sa tačnom stranom i dokazom kroz javnu aplikaciju |
| 13:00–14:30 | Povezani dokumenti, stručna pravila i pitanje korisniku; osnovni export radi |
| 14:30–16:00 | Prihvaćen predlog, konkretan paket ispravki i proverena nova revizija |
| 16:00–17:00 | Provera izdvojenog slučaja, ispravke pogrešnih nalaza i korisničkog toka |
| 17:00–18:00 | Video, proba javnog demoa, reset i stabilnost; dodatne funkcije samo ako jezgro već radi |
| 18:00–18:30 | Predaja repo + URL + video, proverena iz tuđeg/pročišćenog browsera |
| 18:30–19:00 | Rezerva za problem sa predajom ili deployem |

Ovo je ambiciozan plan sa merljivim presecima, ne obećanje da će svaki deo uspeti. Dva člana treba da rade na odvojenim celinama iza zajedničkog ugovora: obrada/model/provera i radni prostor/stanje/izvoz. Najiskusniji preuzima najneizvesniju zavisnost. Integracija počinje odmah.

Ako u 13:00 ne radi prvi stvarni nalaz, usmeriti rad na tip ulaza i pravila koja mogu da daju pouzdan rezultat. Ne praviti dodatne panele. Ako u 16:00 nema završenog ciklusa, smanjiti broj primedbi podržanih u demou i završiti paket/reviziju. Ako ostane vremena, širiti pokrivenost, dodati drugi slučaj i poboljšati stručni pregled novih pravila.

## Demo od tri minuta

1. **0:00–0:20:** Ko koristi proizvod i koji posao završava. Pokaži stvarni/odobreni anonimizovani primer.
2. **0:20–0:55:** Pokreni pregled ili otvori jasno označen već izvršen pregled. Izaberi jednu primedbu i pokaži oba izvora.
3. **0:55–1:25:** Sistem traži presudni podatak ili potvrdu. Odgovor otkriva sve zavisne izmene.
4. **1:25–2:05:** Prihvati predlog, pokaži konkretnu razliku i preuzmi paket.
5. **2:05–2:35:** Proveri novu reviziju. Pokaži rešeni i jedan namerno još otvoreni slučaj.
6. **2:35–3:00:** Stvaran rezultat stručne provere, kratko šta rade Daytona/Convex/model i šta je novo izgrađeno tog dana.

Ubrzani ili unapred izvršeni delovi videa moraju biti označeni. Javni URL treba da ima i pregled primera i pravo novo pokretanje. Trajanje koje model zaista postiže određuje montažu; tri minuta videa ne znače da ceo pregled mora biti sakriven kao trenutna operacija.

## Sudije: profesionalni signali, bez izmišljene psihologije

Javne biografije daju osnovu za izbor dokaza u prezentaciji, ne za pouzdanu procenu ličnosti ili obećane ocene. [Biografije](https://hackathon.cursorserbia.com/hackathon/mentors).

| Sudija | Razumno pitanje koje demo treba da odgovori |
|---|---|
| Ben Kim | Ko ovo koristi, šta dobija i kako dolazite do prvih korisnika? |
| Milan Lazarević | Kako znate da je nalaz tačan, šta radite sa neizvesnošću i da li promena ulaza menja rezultat smisleno? |
| Agrim Singh | Koju stvarnu radnju je AI omogućio i da li rezultat radi kada se pokrene? |
| Marija Mladenović | Da li korisnik vidi dokaz, razume sledeći korak i kontroliše prihvatanje izmene? |

Kroz sve četiri perspektive provlači se isti kvalitet: konkretan stručni posao, vidljivi dokazi, završen rezultat i kontrola nad izmenama. Zato najbolji trenutak nije prikaz deset agenata, nego proverena promena dokumentacije.

## Konačni sud

Zadržati domen, povećati dubinu izvršenja i proverljivost, a odustati od neutemeljenih garancija. Nalaznik koji pronalazi, objašnjava, priprema koordinisane ispravke i proverava novu reviziju ima najbolji odnos ambicije, vaše stvarne prednosti i mogućnosti da sutra bude ubedljiv proizvod.

Prvi sledeći ulaz je jedan povezan očev primer iz najavljenog večerašnjeg materijala. On određuje tačan slučaj za demonstraciju, početna pravila i konkretan Word/Excel deo koji sistem stvarno menja, uz anotirani paket za preostale projektantske zahvate.
