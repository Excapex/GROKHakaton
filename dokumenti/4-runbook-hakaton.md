# Nalaznik Runbook

**Pre-flight review glavnog projekta zaštite od požara. Proizvod je dosije, ne dashboard.**

*v2 · prepisan od nule pod winner-research selekcijom · 11.09.2026 → 12.09.2026 20:00*

MODEL VADI → KOD SUDI → DOKAZ JE KLIKABILAN. Ova verzija je prepisana posle analize stvarnog CrossBeam repoa (362 fajla) i tvrde provere Managed Agents docs-a. Dve stvari su se promenile u odnosu na v1: **arhitektura ekstrakcije** i **šta je finalni proizvod**.


**Sat dana:** `10:30` check-in  ·  `11:00` start  ·  `11:20` contracts frozen  ·  `12:30` kill gate 1  ·  `14:00` dosije živ  ·  `16:30` public URL  ·  `17:00` feature freeze  ·  `17:50` submission v1  ·  `18:00` showcase  ·  `19:45` ruke dalje


---


## Sadržaj


- **0 — Product gate** — Osam pitanja na koja se odgovara pre nego što se pomene ijedna platforma
- **1 — Professional artifact** — Dosije pre-pregleda: šta tačno sadrži i kako se razlikuje od liste nalaza
- **2 — Winning loop** — Devet koraka. Svaki feature mora da opravda mesto u njima
- **3 — Architecture decision** — A vs B vs C, ocenjeno po proizvodnoj vrednosti — pobeđuje C
- **4 — Runtime architecture P0** — Od upload-a do dosijea, sa artefaktom na svakom koraku
- **5 — Domain knowledge** — Dva sloja: ono što model čita i ono što kod izvršava
- **6 — Execution model** — Pet uloga, nijedna nije agent runtime
- **7 — Fact contract** — Apsolutna granica sistema. Zamrznuto u 11:20, ne menja se nikad
- **8 — Engine + Dossier Gate** — Kod presuđuje, pa zatim proverava sam sebe — deterministički
- **9 — Evidence model** — Svaki nalaz odgovara na pitanje „zašto je sistem ovo rekao", u jednom kliku
- **10 — Evaluation** — Sedam brojeva nad 24 označene činjenice. Eval je deo MVP-a, ne polish
- **11 — Human review** — Čovek ulazi posle dosijea, ne usred pipeline-a
- **12 — Failure architecture** — Četiri fallbacka, poređana po tome šta gube — i šta čuvaju
- **13 — Repo, contracts, podela rada** — Disjunktno vlasništvo, zamrznuti ugovori, osam artefakata
- **14 — Timeline** — 10:30 → 20:00 · normal track
- **15 — Demo** — 2:50 · problem, pa rezultat, pa kako — u tom redu
- **16 — MUST / SHOULD / CUT** — Prioritet kad se dva taska sudare
- **17 — Winner scorecard** — Samoocena predloženog MVP-a · 0 = ne postoji, 1 = delimično, 2 = jasno demonstrirano
- **18 — Pre-hackathon** — Večeras: nalozi, instalacije, spike-ovi, domen. Do 23:00, pa spavanje
- **19 — Commands** — Sve što ćemo sutra kucati


---


## 0 — Product gate — Osam pitanja na koja se odgovara pre nego što se pomene ijedna platforma

**1. Šta je profesionalni artefakt koji Nalaznik proizvodi?**

  **DOSIJE PRE-PREGLEDA** — verzionisan, trajan objekat koji predstavlja stanje jednog projekta pre predaje. Dva nivoa: *rukovodilački* (spremnost, blokirajući nalazi, pokrivenost, nerazrešeno, verzija rule pack-a, stanje stručnog pregleda, sledeće radnje) i *inženjerski* (svaki nalaz sa računom, propisom, dokazom A/B, dokumentom, stranom, citatom, pouzdanošću, rezultatom verifikatora). Nije chat odgovor, nije PDF, nije izveštaj koji se generiše pa zaboravi.

**2. Ko ga koristi odmah posle generisanja?**

  Projektant zaštite od požara ili inženjer u kancelariji, *petnaest minuta pre nego što pošalje projekat na saglasnost.* On je i jedini koji sme da odluči šta je stvarno primedba — Nalaznik mu daje spisak mesta koja treba da pogleda, sa stranom i citatom.

**3. Koju radnju mu omogućava?**

  Da **otvori tačnu stranu tačnog dokumenta** i ili ispravi, ili odbaci nalaz kao neosnovan. Svaki nalaz nosi determinističku `next_action` iz zatvorene liste (`RECONCILE_DOCUMENTS`, `UPDATE_DRAWING`, `ADD_MISSING_SECTION`, `VERIFY_SOURCE`…), pa on zna i *kome* ovo prosleđuje.

**4. Šta Nalaznik vidi, a generički PDF/RAG chatbot ne vidi?**

  **Kontradikciju između dva dokumenta.** Tehnički opis kaže stepen otpornosti II, grafički prilog kaže III. Pojedinačno su oba dokumenta validna; nijedan prag nije prekršen; RAG nad njima vraća tačan odgovor na oba pitanja posebno. Konflikt postoji samo kao *relacija*, i može ga videti samo sistem koji dve nezavisno utemeljene činjenice poredi kodom.

**5. Koji konkretan broj merimo?**

  Sedam brojeva nad ručno označenim setom od **24 činjenice iz 4 dokumenta**: exact match, tačan dokument, tačna strana, *seeded* konflikti detektovani, neutemeljene činjenice (mora biti 0), UNKNOWN obrađeni ispravno, deterministički testovi pravila. Zapisani u `evals/RESULTS.md` commitovanom u javni repo.

**6. Koje ekspertno znanje ga čini teško kopirljivim?**

  Spisak *tipskih primedbi sa učestalošću iz prakse* licenciranog inženjera ZOP — koja primedba stvarno vraća projekat, kako glasi u dopisu, i gde se u dokumentaciji rađa. To je ono što nijedan scrape propisa ne daje. Svako pravilo koje koristimo u demou nosi njegov potpis.

**7. Koji je 10-sekundni wow?**

  Split-screen: levo isečak strane 7 tehničkog opisa sa „II", desno isečak grafičkog priloga sa „III", u sredini `C01 · CONFLICT`. Rečenica: *„Nijedan prag nije prekršen. Ovo je vraćen projekat."*

**8. Koja je najmanja kompletna petlja do 16:30?**

  Upload 4 PDF-a → mapa dokumenata → ciljana ekstrakcija u zatvorenu shemu → nezavisna verifikacija dve kritične činjenice → deterministička presuda u Daytoni → **Dossier Gate** → dosije sa dokazom i sledećom radnjom → izmerena tačnost. Sve ostalo je dodatak.

> ⛔ **Šta se NE gradi — provereno prema anti-pattern listi**
>
> Nije chatbot sa propisima. Nije „upload PDF and ask questions". Nije generički RAG demo. Nije agent swarm čija je vrednost to što je swarm. Nije dashboard bez actionable izlaza. Nema accuracy tvrdnje bez gold set-a. Nema 200 nepotvrđenih pravila. Nema sponsor zoo-a. Nema auto-approval-a ni AI presude. Nema druge discipline dok ZOP petlja ne radi cela.

## 1 — Professional artifact — Dosije pre-pregleda: šta tačno sadrži i kako se razlikuje od liste nalaza

Ovo je najvažnija promena u odnosu na v1. U v1 je proizvod bio *registar nalaza*. Registar je ekran. Dosije je **objekat** — ima identitet, verziju, vreme, stanje pregleda, i preživi zatvaranje taba. UI je interfejs ka dosijeu, ne obrnuto.

```
review_dossier.json — jedan red u Convexu, verzionisan po runu
{
  "dossier_id": "dos_01...",
  "project": { "label": "Sinteticki poslovni objekat 01",
                 "doc_count": 4, "page_count": 12,
                 // nikad ime investitora, adresa, parcela, broj predmeta
                 "anonymized": true },
  "generated_at": "2026-09-12T15:42:11Z",
  "pack": { "id": "fire_protection", "version": "0.3.1",
             "regulations": ["zakon-zop@111/2009+20/2015+87/2018",
                             "pravilnik@22/2019"] },
  "readiness": "NALAZI_ZA_OTKLANJANJE",
       // SPREMNO_ZA_STRUCNI_PREGLED | NALAZI_ZA_OTKLANJANJE | NEDOVOLJNO_PODATAKA // NIKADA "uskladjeno", "odobreno", "saglasno" "coverage": { "executed": 13, "in_pack": 13, "expert_approved": 11,
                 "weighted_by_frequency": 0.71,
                 "not_covered_note": "graficki prilozi samo za 3 slota" },
  "summary": { "conflict": 2, "fail": 2, "missing": 2, "pass": 7,
                "unknown_slots": 3, "blocking": 4 },
  "findings": [ … Finding[] , sekcija 7 … ],
  "open_questions": [
     { "slot": "duzina_evak_puta_etaza_m", "why": "nije nadjeno ni u jednom dokumentu",
       "next_action": "PROVIDE_MISSING_INPUT" } ],
  "human_review": { "state": "NOT_REVIEWED",
       // NOT_REVIEWED | IN_REVIEW | REVIEWED
       "accepted": [], "rejected": [], "reviewer_note": null },
  "integrity": { … Dossier Gate izlaz, sekcija 8 … },
  "provenance": { "sandbox_id": "sbx_…", "engine_ms": 0.6,
                   "e2e_ms": 68400, "artifacts": [ 8 imena, sekcija 4 ] }
}
```

#### Dva nivoa, jedan objekat

**Ko čita koji nivo**

| Nivo | Čitalac | Sadržaj | Gde je u UI-u |
|---|---|---|---|
| Rukovodilački | šef kancelarije, investitor | `readiness`, broj blokirajućih, `coverage`, `open_questions`, verzija pack-a, stanje pregleda, sledeće radnje grupisane po vrsti | vrh strane, bez skrolovanja |
| Inženjerski / audit | projektant ZOP | svaki `Finding`: račun, pravilo, propis, dokaz A i B, dokument, strana, citat, pouzdanost ekstrakcije, rezultat verifikatora, `rule_status` | drawer po nalazu |

> ⚠ **Naučeno iz CrossBeama — njegov deliverable nikad nije stigao**
>
> CrossBeam ima kompletno napisan `adu-corrections-pdf` skill sa letterhead-om, AI disclaimer bannerom i confidence badge-ovima — i **isključen je iz sva tri flow-a** komentarom „PDF generation happens post-sandbox on Cloud Run". Ta post-sandbox konverzija *nije implementirana*. U `progress.md` stoji: „Removed PDF generation from sandbox… not worth the debugging time."
>
> Pouka nije „nemoj PDF". Pouka je: **deliverable mora biti ono što već postoji u sistemu, a ne korak koji tek treba dodati.** Zato je naš dosije *red u bazi koji UI renderuje*, a ne fajl koji neko mora da generiše. PDF export je **[CUT]** i ostaje CUT.

#### Zatvorena lista sledećih radnji — izvedena kodom, ne modelom

**next_action se dobija determinističkim mapiranjem iz (klasa pravila × status × izvorni dokument)**

| next_action | Kada se dodeljuje | Kome ide |
|---|---|---|
| RECONCILE_DOCUMENTS | C pravilo → CONFLICT | projektant koji vodi projekat |
| UPDATE_TEXT | B → FAIL, a sporna činjenica potiče iz tekstualnog dokumenta | projektant |
| UPDATE_DRAWING | B → FAIL, a sporna činjenica potiče iz grafičkog priloga | projektant / crtač |
| ADD_MISSING_SECTION | A → MISSING (nedostaje poglavlje po čl. 31) | projektant |
| PROVIDE_MISSING_INPUT | B → MISSING jer je slot `unknown` | projektant / investitor |
| VERIFY_SOURCE | činjenica prošla verifikator sa `DISPUTED`, ili confidence < prag na blokirajućem pravilu | projektant — otvori stranu |
| SPECIALIST_REVIEW | pravilo je `rule_status: draft` (nije ga potpisao ekspert) | inženjer ZOP |
| PROJECTANT_REVIEW | fallback za svaki non-PASS koji ne pada ni u jednu kategoriju gore | projektant |
| NO_ACTION | PASS | — |

Nijedna od ovih vrednosti ne dolazi iz modela. Sve se izvode u `engine/next_action.py` iz podataka koje pravilo već ima. Model koji bi predložio radnju prekršio bi Fact contract (sekcija 7).

## 2 — Winning loop — Devet koraka. Svaki feature mora da opravda mesto u njima

```
1. KORISNIK DAJE NEŠTO STVARNO      4 PDF-a jednog projekta
        ↓
2. SISTEM PRVO PRAVI MAPU           document_map.json
   ne čita sve — čita naslovnu i zaglavlja, i zaključuje KOJI dokument je koji i GDE bi koji slot mogao da bude
        ↓
3. CILJANA PERCEPCIJA               facts.json
   po slotu se šalju SAMO strane koje ga mogu sadržati
        ↓
4. UGOVOR OGRANIČAVA MODEL          zatvorena shema, verdict je nemoguć
        ↓
5. NEZAVISNA VERIFIKACIJA           verification_log.json
   verifikator ne vidi odgovor ekstraktora — dobija slot, stranu i kriterijum
        ↓
6. KOD ARBITRIRA OGRANIČENJA        findings.json   ← jedini izvor statusa A kompletnost · B pragovi · C međudokumentna konzistentnost
        ↓
7. INTEGRITET SE PROVERAVA          integrity.json  ← DOSSIER GATE deterministički: nema nalaza bez dokaza, nema konflikta sa jednim izvorom, nema strane koja nije u mapi, nema pretvorenog UNKNOWN-a
        ↓
8. PROFESIONALAC DOBIJA ARTEFAKT    review_dossier.json + ekran
   spremnost · pokrivenost · dokaz · sledeća radnja
        ↓
9. REZULTAT SE MERI                 eval_results.json → RESULTS.md
```

> ✅ **Test za svaki feature, doslovno**
>
> Pre nego što bilo šta uđe u plan: *u kom koraku ove petlje stoji?* Ako ne stoji ni u jednom, i ne poboljšava accuracy, demonstrabilnost ili sponzorski kriterijum — **CUT**, bez diskusije. Ovaj test je razlog zašto su iz v1 ispali Outcomes grader, Convex RAG, Exa, round diff i multiagent roster.

#### Tvrdo ograničenje koje ova petlja mora da ispuni

> ⛔ **T(end-to-end) ≤ 90 sekundi na demo projektu**
>
> Ovo nije želja nego **constraint izveden iz CrossBeamovog neuspeha.** Njegov run traje 11–17 minuta, pa je morao da napiše 469 linija `dev-tools.tsx` sa skriptiranom vremenskom linijom da bi uopšte mogao da demonstrira — i u `progress.md` u ponedeljak ujutru piše: *„the demo skips all of it. It looks like I faked the output."*
>
> Ako naš pipeline traje duže od 90 s, live demo je nemoguć i mi ćemo napraviti istu grešku. Zato je korak 2 (mapa pre ekstrakcije) obavezan, zato je ekstrakcija ciljana, i zato se svaka ekstrakcija **kešira po hash-u fajla** od prvog poziva — u demou se isti projekat uploaduje desetak puta.

## 3 — Architecture decision — A vs B vs C, ocenjeno po proizvodnoj vrednosti — pobeđuje C

Ocena 0–5 po dimenziji, maksimum 65. Kriterijum nije jednostavnost nego **očekivana proizvodna vrednost pod ograničenjima hakatona**.

**A = direktni pipeline (v1) · B = Managed Agents + self-hosted Daytona · C = specijalizovani stateless pipeline + Dossier Gate**

| Dimenzija | A | B | C | Obrazloženje razlike |
|---|---|---|---|---|
| End-to-end product completeness | 4 | 2 | 5 | B troši 40–75 min na environment key + always-on worker pre prvog reda proizvodnog koda |
| Extraction accuracy potential | 3 | 4 | 5 | A šalje cele dokumente. C prvo pravi mapu pa šalje *samo strane koje slot mogu da sadrže* — to je CrossBeamov jedini accuracy pivot |
| Verifier independence | 2 | 3 | 5 | **Ključno:** u B koordinator prosleđuje rezultat kao *prozu na thread-u*, pa curenje prvog odgovora u verifikator zavisi od discipline koordinatora. U C ulaz verifikatora sastavljam ja, bajt po bajt |
| Cross-document reasoning | 4 | 4 | 5 | `document_map.json` eksplicitno uparuje dokumente za svako C pravilo pre ekstrakcije |
| Human-in-loop quality | 2 | 5 | 4 | **B pobeđuje ovde** — sesija pauzira i zadržava kontekst. Ali naš HITL nije pauza usred pipeline-a nego pregled *gotovog dosijea*, što je product state, ne session state |
| Auditability | 3 | 2 | 5 | B čuva istoriju sesije server-side i **nije ZDR eligible**. C ima 8 imenovanih artefakata koje mi posedujemo |
| Evidence traceability | 3 | 3 | 5 | C odbija činjenicu čija strana nije u `document_map` — determinističko gušenje halucinirane strane |
| Professional artifact quality | 3 | 3 | 5 | Dosije sa integritetom i sledećom radnjom postoji samo u C |
| Sponsor integration depth | 4 | 5 | 4 | **B pobeđuje ovde** — self-hosted sandbox je najdublja moguća Daytona priča. C ostaje jak: dva stvarna posla u Daytoni |
| Deployment reliability | 4 | 2 | 4 | B traži always-on `ant beta:worker poll` na Daytona sandboxu koji se po difoltu gasi |
| Implementation risk (5 = najniži) | 5 | 1 | 4 | B ima jedan Console-only korak koji se ne može skriptovati i tihi otkaz `workers_polling: 0` |
| Recoverability / fallback | 4 | 2 | 5 | U C svaki korak piše imenovani artefakat, pa se pipeline nastavlja od bilo koje tačke |
| Long-term architecture | 2 | 4 | 5 | C ima domain packs, artefakte i gate; B ostaje kao *upgrade* put, ne kao potreba |
| **UKUPNO / 65** | **43** | **41** | **61** | **Preporuka: C** |

### Zašto Managed Agents ne dodaju proizvodnu vrednost — pet konkretnih razloga

Argument „više je posla" nije dovoljan, pa evo pet koji jesu. Sva četiri prva su iz aktuelnih zvaničnih docs-a, provereno 11.09.2026.

**1. Structured outputs ne postoje u Managed Agents sesiji**

  `output_config` nije polje agenta, nije polje sesije, i nije u listi koju `agent_with_overrides` sme da menja (override-abilni su samo `model`, `system`, `tools`, `mcp_servers`, `skills`). Structured outputs stranica je u celini skopirana na Messages API. To znači da bi **Fact contract — apsolutna granica ovog sistema — morao da se zatvara izvan agent sloja, posebnim `/v1/messages` pozivom.** Ako se ugovor ionako zatvara tamo, agent sloj ne doprinosi garanciji koja je srž proizvoda.

**2. Izolacija konteksta je u stateless pipeline-u *bolja*, ne gora**

  Managed Agents daju izolovan kontekst po agentu *u odnosu na jednu dugu sesiju*. Ali nezavisan `/v1/messages` poziv je izolovan po konstrukciji: nema roditeljskog konteksta koji bi curio, a ulaz je tačno ono što sam ja stavio. CrossBeam je morao da napiše *„If you read ANY PNG or large JSON file in your main context, you WILL run out of context and fail"* zato što je imao jednu dugu sesiju sa subagentima unutra. Mi tu sesiju nemamo, pa nemamo ni problem koji roster rešava.

**3. Nezavisnost verifikatora je jača kad je ja sastavljam**

  Docs kažu da koordinator dobija rezultat kao `agent.thread_message_received` sa tekstualnim `content` — dakle kao prozu. Da bi verifikator bio stvarno nezavisan, moram garantovati da *ne vidi* odgovor ekstraktora; u rosteru to zavisi od toga kako koordinator formuliše delegaciju. U stateless pozivu verifikator dobija tačno tri stvari — slot, sliku strane, kriterijum validnog dokaza — i ništa drugo, jer ja sastavljam payload. To je zahtev iz naše sopstvene specifikacije, i C ga ispunjava doslovno.

**4. Jedinstvena prednost B-a rešava problem koji naša petlja nema**

  B stvarno pobeđuje na human-in-the-loop: *„The session keeps running and maintains all context during pauses."* To je lek za CrossBeamov hladni start — ali on je hladni start imao zato što je njegov čovek ulazio *usred* pipeline-a i odgovarao na pitanja. Naš čovek ulazi **posle**, da pregleda gotov dosije. Tu nema šta da se pauzira; stanje pregleda je polje u Convexu i preživljava sve.

**5. Server-side zadržavanje tuđe projektne dokumentacije je proizvodna mana, ne samo compliance stavka**

  Docs: *„Claude Managed Agents is stateful by design: sessions are long-running and store conversation history, sandbox state, and outputs server-side"*, uz eksplicitno **nije eligible za ZDR ni HIPAA BAA**. Nalaznik po definiciji obrađuje poverljivu dokumentaciju tuđih investitora. Arhitektura u kojoj se ta dokumentacija zadržava van naše kontrole je nešto što ćemo morati da razgradimo pre prvog stvarnog korisnika. Efemerni Daytona sandbox koji se posle runa briše je *ispravan* odgovor za ovaj domen — i to je rečenica koju vredi izgovoriti sudiji.

> ✅ **Šta od B ipak preuzimamo — strukturnu specijalizaciju bez agent runtime-a**
>
> Odbacujemo mehanizam, ne ideju. C ima **isti roster uloga** kao B (kartograf, tekstualni ekstraktor, inspektor crteža, verifikator dokaza, engine), samo je svaka uloga nezavisan poziv sa kontekstom koji sastavljam ja, umesto agent thread-a. Dobijamo specijalizaciju, paralelizam i izolaciju; ne dobijamo beta zavisnost, Console korak i always-on worker.
>
> **Managed Agents ostaju zabeleženi kao P2 upgrade put** u `docs/ARCHITECTURE.md`, sa cenom migracije u jednoj rečenici: zameniti pet poziva u `convex/lib/perception.ts` rosterom, zadržati identične `contracts/`, `engine/` i artefakte. To je tačno ono što znači „Managed Agents smeju da padnu, Nalaznik ne sme da padne sa njima" — u našoj verziji oni nikad nisu ni nosili proizvod.

## 4 — Runtime architecture P0 — Od upload-a do dosijea, sa artefaktom na svakom koraku

**[A]** Builder A **[B]** Builder B. Osam imenovanih artefakata — **conversation state nikad nije jedini izvor istine.**

```
BROWSER React + TS + Vite · Netlify                                      [B]
  │ drag&drop 4 PDF-a → generateUploadUrl() → POST → documents.register()
  ▼
CONVEX WORKFLOW convex/workflows/review.ts   durable; kroz korake samo ID-jevi [A]
  │
  ├─1 · INGEST (Daytona, bez mreže)                      → project_manifest.json
  │    PyMuPDF: tekst po strani + pNNN.png @150 DPI, ≤2000 px
  │    izlaz: {doc, pages[], text_len, png_storage_ids[]}
  │
  ├─2 · KARTOGRAF 1 poziv, opus-5, medium               → document_map.json
  │    ULAZ: prva strana svakog dokumenta + prvih 400 znakova teksta svake strane
  │    NE čita sve strane. Ovo je ceo smisao koraka.
  │    IZLAZ po dokumentu: kind (tekst|racun|grafika|specifikacija),
  │            title, pages[], candidate_slots[] ← koji slot gde može biti
  │    + page_index: dozvoljeni (doc,page) parovi — kasnije anti-halucinacija
  │
  ├─3 · CILJANA EKSTRAKCIJA paralelno po dokumentu       → facts.json
  │    za svaki dokument: pošalji SAMO strane iz candidate_slots
  │    tekst    → x.ai grok-4.6, response_format json_schema
  │    grafika  → claude-opus-5 vision, output_config.format json_schema
  │    + extraction_hints iz domain pack-a po slotu (sekcija 5)
  │    NIJEDAN tool. NIJEDAN programmatic tool calling.
  │    → facts.insertMany() ← UI ih vidi ODMAH, pre presude
  │
  ├─4 · NEZAVISNA VERIFIKACIJA opus-5 xhigh, paralelno   → verification_log.json
  │    ULAZ u verifikator: slot + slika strane + kriterijum validnog dokaza
  │    NE ulazi: vrednost koju je ekstraktor našao.
  │    IZLAZ: VERIFIED | DISPUTED | UNKNOWN + nezavisan evidence
  │    Rutiranje (sekcija 5): samo činjenice koje hrane blokirajuće pravilo
  │    ILI C pravilo ILI imaju confidence < prag → tipično 4–6 poziva, ne 24
  │
  ├─5 · PRESUDA (Daytona, bez mreže, stdlib Python)       → findings.json
  │    a) jsonschema validacija facts protiv contracts/extraction.schema.json
  │    b) page provenance check: (doc,page) mora biti u page_index
  │    c) engine.evaluate(pack, facts) → Finding[] + coverage
  │    d) next_action mapiranje (sekcija 1)
  │
  ├─6 · DOSSIER GATE (isti sandbox, isti run)             → integrity.json
  │    6 determinističkih provera — sekcija 8. Pad = dosije se ne objavljuje.
  │
  ├─7 · DOSIJE                                            → review_dossier.json
  │    findings + coverage + readiness + open_questions + provenance
  │
  └─8 · EVAL (ručno, po potrebi)                          → eval_results.json
       gold.yaml × facts.json × findings.json → 7 metrika → RESULTS.md

UI useQuery(api.dossier.byProject)  reaktivno, bez poll-a [B]
  ├─ ReadinessHeader   spremnost · blokirajući · pokrivenost · verzija pack-a
  ├─ PipelineStatus    8 koraka, svaki sa ms i imenom artefakta
  ├─ FindingList       CONFLICT → FAIL → MISSING → PASS, severity stripe
  ├─ EvidenceDrawer    dokaz A | dokaz B side-by-side, isečak strane, račun
  ├─ NextActions       grupisano po next_action, ne po pravilu
  └─ IntegrityBadge    „6/6 integritetnih provera prošlo"
```

> ▸ **Zašto je korak 2 najvažniji dodatak u odnosu na v1**
>
> CrossBeamov autor je proveo dan pokušavajući da digne exhaustive vision ekstrakciju sa 85% na 95% i uspeo — ali je cena bila **10–15 min → 35 min** po 26-stranom projektu. Njegov zaključak je doslovno: *„Don't extract everything perfectly and then figure out what matters. Figure out what matters first, then go look for it."*
>
> Kartograf je to „figure out what matters first". Košta jedan jeftin poziv, a menja i tačnost (model gleda 2 strane umesto 12 za dati slot), i latenciju (zato je 90 s izvodljivo), i cenu. Dodatno, `page_index` iz njega postaje **deterministički filter protiv izmišljene strane** — CrossBeamovo pravilo *„Sheet references are sacred. Never guess"* kod nas nije prompt nego provera u kodu.

#### Podela odgovornosti — bez dva orkestratora

| Sloj | Radi | Ne radi |
|---|---|---|
| Convex | lifecycle projekta, upload metadata, durable artefakti, workflow koraci, findings, dosije, realtime UI, retry | ne zove modele direktno iz mutation-a; ne izvršava pravila |
| Daytona | obrada tuđeg PDF-a, rasterizacija, filesystem po projektu, rule engine, Dossier Gate | nema mrežu; ne zna za Convex; ne zove modele |
| Claude / Grok | percepcija: mapa, ciljana ekstrakcija, nezavisna verifikacija | **nikad ne presuđuje**; ne vidi pravila; ne zna za `status` |
| engine/ | jedini proizvodi PASS / FAIL / MISSING / CONFLICT i `next_action` | ne zove nijedan model; ne zna za domen — domen je u `domains/` |

## 5 — Domain knowledge — Dva sloja: ono što model čita i ono što kod izvršava

CrossBeamova najjača strana je struktura domena: `california-adu/SKILL.md` je *router*, ne dump — decision tree u četiri koraka sa uputstvom *„Load only what you need — most questions require 3-5 reference files, not all 28."* Njegova najslabija strana je što tu nema determinističkog sloja: pragovi kao što su „4 ft", „16 ft", „850 sq ft" postoje **samo kao markdown koji model čita**. Nema validatora, nema rule engine-a, nema evala. Mi uzimamo strukturu i dodajemo drugi sloj.

```
domains/fire_protection/
├── pack.yaml              verzija, propisi, expert approval state
│
│   ── SLOJ 1: SEMANTIČKO ZNANJE (model ga čita) ──
├── slots.yaml             26 slotova: tip, jedinica, gde se očekuje
├── extraction_hints/      po slotu — ovo ide u prompt, ciljano
│   ├── stepen_otpornosti.md
│   ├── otpornost_nosecih_h.md
│   └── …
├── documents.yaml         tipovi dokumenata + kako se prepoznaju
│
│   ── SLOJ 2: DETERMINISTIČKO ZNANJE (kod ga izvršava) ──
├── rules.yaml             A i B pravila, deklarativno
├── cross_rules.yaml       C pravila: par slotova + tolerancija
├── rules_custom.py        samo B04, B06, B07 — logika koja ne staje u YAML
├── regulations.yaml       član → naslov → citat → URL
│
│   ── MERENJE ──
├── evals/gold.yaml        24 označene činjenice + očekivani nalazi
├── evals/engine_cases.yaml
└── fixtures/              4 sintetička PDF-a + .md izvori

extraction_hints/stepen_otpornosti.md — ceo fajl, ovo je realna dužina
---
slot: stepen_otpornosti
expect_in: [tehnicki opis, graficki prilog pozarnih sektora]
expect_near: ["stepen otpornosti", "otpornost objekta prema pozaru", "SO"]
extraction_difficulty: low        # low | medium | high
---
Vrednost je rimski broj I, II, III, IV ili V. U tekstu obicno
stoji u uvodnom delu tehnickog opisa, u recenici tipa
„objekat je svrstan u II stepen otpornosti prema pozaru".
Na grafickom prilogu stoji u legendi ili u zaglavlju lista,
cesto skraceno kao „SO II" ili samo „II".

NE mesati sa: stepenom sigurnosti, kategorijom ugrozenosti,
klasom pozarnog opterecenja — to su druge velicine.

AKO NIJE NAVEDENO: vrati value: null, confidence: 0.
Odsustvo je nalaz. Izmisljena vrednost nije.
```

> ▸ **Preuzeto doslovno iz CrossBeama — „FLAG IF ABSENT"**
>
> U njegovom `adu-extraction-priorities.md` stoji: *„If an expected item for this content type is not on the sheet, add to key_content: 'NOT SHOWN: [item]' — this is as valuable as what IS shown, because missing items often appear in corrections letters."*
>
> To je ista intuicija koju naša shema već nameće mehanički kroz `value: null` + `confidence: 0`. Razlika je što je kod njega to *prompt molba*, a kod nas **jedini legalan način da model kaže „ne znam"** — svaka druga formulacija pada na validaciji. Svaki hint fajl se završava tom rečenicom.

#### Dvodimenzionalna pouzdanost — zašto verifikator nije prosto „confidence < 0,70"

Iz `checklist-cover.md`: *„A check can be HIGH code confidence but LOW visual confidence (e.g. 'structural calcs must bear engineer's stamp' — the law is clear, but reading a stamp in a 200 DPI PNG is hard)."* Dve nezavisne ose. Mi ih vodimo eksplicitno i iz njih izvodimo **rutiranje verifikatora**:

**Verifikator se zove samo kad se isplati — tipično 4–6 od 24 činjenice**

| Signal | Odakle | Efekat |
|---|---|---|
| Činjenica hrani `severity: blocking` pravilo | rules.yaml | verifikuj uvek |
| Činjenica ulazi u C pravilo | cross_rules.yaml | verifikuj uvek — konflikt mora imati dva nezavisna dokaza |
| `extraction_difficulty: high` | extraction_hints | verifikuj ako confidence < 0,85 |
| confidence < 0,70 | izlaz ekstraktora | verifikuj |
| Sve ostalo | — | ne verifikuj — troši 8 s i ne menja nijedan nalaz |

#### Kako očev materijal puni oba sloja

**Jedna intake tabela → dva različita izlaza**

| Kolona u očevoj tabeli | Sloj | Gde završi |
|---|---|---|
| sta_se_meri, u_kom_dokumentu | semantički | extraction_hints/<slot>.md — `expect_in`, `expect_near` |
| operator, granicna_vrednost, tabela_vrednosti, zavisi_od | deterministički | rules.yaml |
| pravni_izvor, clan_glava | deterministički | regulations.yaml + `article` na pravilu |
| tezina | deterministički | severity — *i rutiranje verifikatora* |
| formulacija_primedbe | semantički | `complaint_text` — prikazuje se u dosijeu kao „kako ovo obično stigne" |
| ucestalost_1_5 | deterministički | `frequency` → **weighted_coverage** u dosijeu |
| primer_prolazi, primer_pada | oba | hint fajl *i* `engine_cases.yaml` kao test |
| edge_case | deterministički | izuzeće u `rules_custom.py`, ili `status: draft` ako ne staje |
| potvrdjujem = DA | deterministički | `status: approved` — **bez ovoga pravilo ne proizvodi nalaz** |

**Weighted coverage** je broj koji se izgovara umesto broja pravila: `Σ frequency(approved rules) / Σ frequency(all known complaints)`. Rečenica pred sudijom je „25 pravila pokriva 70% čestih stvarnih primedbi", a ne „implementirali smo 200 pravila".

## 6 — Execution model — Pet uloga, nijedna nije agent runtime

Uloga postoji samo ako se razlikuje po *ulazu*, *modelu/effortu*, *domenskom znanju* i *izlazu*. Ako se ne razlikuje ni po čemu od toga, to nije uloga nego drugi poziv iste funkcije.

**Roster · svaka uloga je nezavisan HTTP poziv sa kontekstom koji sastavlja pozivalac**

| Uloga | Model / effort | Ulaz (tačno) | Izlaz | Poziva |
|---|---|---|---|---|
| Kartograf | opus-5 · medium | 1. strana svakog dokumenta (PNG) + prvih 400 znakova teksta po strani + `documents.yaml` | document_map.json | 1 |
| Tekstualni ekstraktor | grok-4.6 | tekst samo ciljanih strana + hint fajlovi samo za slotove koje taj dokument može da nosi + zatvorena shema | Fact[] | 2–3 |
| Inspektor crteža | opus-5 · high · vision | PNG ciljanih strana (≤2000 px) + hint fajlovi za grafičke slotove + zatvorena shema | Fact[] | 1–2 |
| Verifikator dokaza | opus-5 · xhigh | **slot + jedna strana + kriterijum validnog dokaza. NIŠTA VIŠE.** | VERIFIED\|DISPUTED\|UNKNOWN + nezavisan evidence | 4–6 |
| Rule engine | NIJE MODEL · Python u Daytoni | facts.json + pack + page_index | findings.json + integrity.json | 1 |

> ⛔ **Kako se sprovodi nezavisnost verifikatora — u kodu, ne u promptu**
>
> `convex/lib/verify.ts` sastavlja payload iz tačno tri polja i **nema pristup `fact.value`** — funkcija prima `{slot, doc, page, criterion}`, ne `Fact`. Poređenje se dešava posle, u `engine/`:
>
> extractor → „1,0 h" · verifier (nezavisno) → „1,0 h" ⇒ VERIFIED, confidence ↑  extractor → „1,0 h" · verifier (nezavisno) → „1,5 h" ⇒ DISPUTED ⇒ `next_action: VERIFY_SOURCE`, nalaz se prikazuje ali **ne kao FAIL**  extractor → „II" · verifier (nezavisno) → null ⇒ UNKNOWN ⇒ slot pada u `open_questions`
>
> Isto važi za hero konflikt: `C01` nastaje iz *dve nezavisno utemeljene činjenice koje kod poredi* — nikad iz jednog modela koji je pročitao oba dokumenta i rekao „vidim kontradikciju". Ta razlika je cela inovacija i mora se izgovoriti u demou.

## 7 — Fact contract — Apsolutna granica sistema. Zamrznuto u 11:20, ne menja se nikad

```
contracts/extraction.schema.json — ide modelu kao json_schema
{ "type":"object", "additionalProperties": false, "required":["facts"],
  "properties": { "facts": { "type":"array", "minItems":0, "maxItems":200, "items":{
    "type":"object", "additionalProperties": false,
    "required":["key","value","doc","page","confidence","source_quote"],
    "properties":{
      "key":          {"enum":[ 26 slotova, generisano iz slots.yaml ]},
      "value":        {"type":["number","string","boolean","null"]},   ← null legalan
      "unit":         {"enum":["m","m2","h","kom","min",""]},
      "doc":          {"type":"string","minLength":1,"maxLength":120},
      "page":         {"type":["integer","null"],"minimum":1},
      "confidence":   {"type":"number","minimum":0,"maximum":1},
      "source_quote": {"type":"string","maxLength":400}
  }}}}}

DOZVOLJENO NEDOZVOLJENO — shema odbija
key, value, unit                     verdict, status, compliance
doc, page, source_quote              severity, recommendation
confidence                           „ovo krsi zakon", „nije uskladjeno"
value: null + confidence: 0          bilo koji slot van 26 iz enum-a

Tri odbijanja koja pokazujemo u demou u 1:40:
  {"verdict":"NIJE USKLADJENO"}  → 'verdict' was unexpected
  {"key":"procena_rizika"}       → not one of [...]
  izostavljen "page"             → 'page' is a required property A ovo prolazi:
  {"value":null,"confidence":0}  → PRIHVACENO — „ne znam" je legalan odgovor
```

#### API oblik — ispravljeno prema docs-ima od 11.09.2026

| Servis | Parametar | Napomena |
|---|---|---|
| Anthropic | output_config.format = {type:"json_schema", schema:{…}} | `output_format` je deprecated; beta header nije potreban; `strict` je polje na *toolu*, a mi tool ne koristimo |
| x.ai | response_format = {type:"json_schema", json_schema:{name, schema}} | `additionalProperties` je već `false` po difoltu — naša shema prolazi skoro doslovno |
| Managed Agents | — ne postoji — | `output_config` nije polje agenta ni sesije. Razlog #1 zašto arhitektura B otpada |

> ⚠ **Dvostruka odbrana**
>
> Shema se sprovodi **dva puta**: jednom na API nivou (grammar-constrained dekodiranje) i drugi put u `judge.py` unutar Daytone, kroz `jsonschema.Draft202012Validator`. Druga provera nije suvišna — ona je jedina koja radi u fallback režimu kada `json_schema` nije dostupan, i ona je ono što se pokazuje na ekranu. Nevalidna činjenica se **odbija i ne ulazi u presudu**; broj odbijenih je polje u `integrity.json`.

## 8 — Engine + Dossier Gate — Kod presuđuje, pa zatim proverava sam sebe — deterministički

Engine je domain-agnostic i **stdlib-only**, što znači da radi u bilo kom Daytona image-u sa `python3`. To nije estetika nego naš najtvrđi fallback (sekcija 12).

```
engine/ — u ovom folderu se ne sme pojaviti rec „pozar"
├── models.py        Fact, Finding — preslikano iz contracts/
├── pack.py          load_pack() → slots, rules, cross_rules, custom, regs
├── operators.py     gte lte eq ne between lookup
├── evaluate.py      evaluate(pack, facts, page_index) → (findings, coverage)
├── next_action.py   (klasa × status × izvorni dokument) → next_action
├── gate.py          DOSSIER GATE — 6 provera
└── cli.py           facts.json + map → findings.json + integrity.json
```

### Dossier Gate — runtime quality kao kod, ne kao grader

Specifikacija traži runtime quality gate. Anthropicov Outcomes grader bi to radio LLM-om u izolovanom kontekstu — ali svih šest kriterijuma koje bismo mu zadali su **mehanički proverljivi**. Deterministička provera je brža, reproducibilna iz javnog repoa, i ne može da halucinira ocenu o sebi. Zato Outcomes ostaje **[CUT]**, a gate ulazi u engine.

```
integrity.json
{ "passed": true, "checks": [
  {"id":"G1","name":"Svaki non-PASS nalaz ima neprazan evidence",
   "result":"pass","offenders":[]},
  {"id":"G2","name":"Svaki CONFLICT ima najmanje dva razlicita (doc,page) izvora",
   "result":"pass","offenders":[]},
  {"id":"G3","name":"Svaki evidence ima doc i page iz document_map.page_index",
   "result":"pass","offenders":[], "rejected_facts":0},
  {"id":"G4","name":"Nijedan fact ne sadrzi polje van sheme",
   "result":"pass","rejected_by_schema":0},
  {"id":"G5","name":"Nijedan slot sa value:null nije zavrsio kao PASS ili FAIL",
   "result":"pass","offenders":[]},
  {"id":"G6","name":"Svaki izvrsen rule ima pack_version i status",
   "result":"pass","offenders":[]}
]}

AKO GATE PADNE: dosije dobija readiness = "NEDOVOLJNO_PODATAKA",
sporni nalazi se ne prikazuju kao nalazi nego u sekciji „integritet",
i UI pokazuje koja provera je pala i na cemu.
Sistem koji odbija da objavi sopstveni nalaz je jaci demo od sistema koji uvek ima sta da pokaze.
```

> ✅ **G5 je provera koju CrossBeam nije imao, a koštala ga je**
>
> Njegov centralni princip je *„No false positives. A city tool that generates incorrect corrections destroys trust."* Jedina odbrana bila je prompt pravilo *„DROP IT"*, i **nijedno merenje false-positive stope ne postoji u celom repou** — test ladder L0–L4 meri da li fajlovi postoje i koliko košta run, ne kvalitet nalaza.
>
> G5 mehanički sprečava najgori mogući lažni nalaz: slot koji model nije našao ne sme da završi kao `FAIL`. Nepoznata vrednost daje `MISSING` sa `next_action: PROVIDE_MISSING_INPUT` — što je istina — a ne „prekršen prag", što bi bila laž pred organom.

#### Tri klase ograničenja

| Klasa | Šta proverava | Primeri | Status koji može da proizvede |
|---|---|---|---|
| A | kompletnost i formalnosti (čl. 31, 32 Zakona) | obavezna poglavlja, licenca projektanta, ovlašćenje MUP | MISSING · PASS |
| B | numerički i logički pragovi (Pravilnik 22/2019) | koridor ≥ 1,20 m · evak. put ≤ 30 m · otpornost po stepenu · broj izlaza po broju lica | PASS · FAIL · MISSING |
| C | **međudokumentna konzistentnost** | stepen otpornosti tekst↔grafika · broj hidranata tekst↔specifikacija · površina sektora račun↔grafika · visina objekta opis↔arhitektura | PASS · CONFLICT |

Pravilo prioriteta iz winner research-a, doslovno primenjeno: **jedno vrlo dobro C pravilo sa jasnim dokazom vredi više od deset običnih threshold pravila.** Ako u 15:00 biramo između dodavanja pravila i poliranja evidence prikaza za C01 — poliramo C01.

## 9 — Evidence model — Svaki nalaz odgovara na pitanje „zašto je sistem ovo rekao", u jednom kliku

```
contracts/finding.schema.json
{ "rule_id":"C01", "status":"CONFLICT",        ← samo engine ovo postavlja
  "article":"cl. 31 Zakona o ZOP",
  "title":"Stepen otpornosti: tehnicki opis vs. graficki prilog",
  "detail":"'II' u Tehnicki opis str.7  vs.  'III' u PS-01 str.1",
  "severity":"blocking",
  "rule_status":"approved",                    ← draft se ne prikazuje kao nalaz
  "next_action":"RECONCILE_DOCUMENTS",         ← izveden kodom
  "complaint_text":"Podaci o stepenu otpornosti u tehnickom opisu i
                    grafickoj dokumentaciji nisu uskladjeni.",
  "evidence":[
    { "key":"stepen_otpornosti", "value":"II", "unit":"",
      "doc":"Tehnicki opis", "page":7,
      "source_quote":"objekat je svrstan u II stepen otpornosti prema pozaru",
      "confidence":0.94, "verified":"VERIFIED",
      "page_image":"kg2h…", "bbox":null },
    { "key":"stepen_otpornosti_grafika", "value":"III", "unit":"",
      "doc":"PS-01", "page":1,
      "source_quote":"legenda: SO III",
      "confidence":0.81, "verified":"VERIFIED",
      "page_image":"kg7p…", "bbox":null } ],
  "calculation":null }                         // C pravila nemaju racun Za B pravilo umesto toga:
  "calculation":"stepen II zahteva 1,5 h;  nadjeno 1,0 h;  1,0 < 1,5 ⇒ FAIL"
```

#### Šta EvidenceDrawer prikazuje, odozgo nadole

1. **Naslov nalaza i status chip** — sa bojom po severity, ne po statusu
2. **Račun** ako postoji — jedan red, čitljiv naglas
3. **Dokaz A i dokaz B jedan pored drugog** — za CONFLICT obavezno side-by-side, isečak strane iznad citata
4. **Dokument · strana · citat** — citat doslovno iz izvora, nikad parafraza
5. **Pouzdanost i rezultat verifikatora** — „0,94 · nezavisno potvrđeno" ili „0,52 · sporno, proveriti izvor"
6. **Propis i član** sa linkom na `regulations.yaml` citat
7. **Kako ova primedba obično stigne** — `complaint_text` iz očevog spiska. Ovo je red koji projektant prepozna
8. **Sledeća radnja** — dugme sa `next_action`, ne slobodna preporuka

> ▸ **Pravilo provenijencije strane — deterministički, ne prompt**
>
> CrossBeam ovo ima kao pravilo ponovljeno u četiri fajla: *„Sheet references are sacred. Every sheet reference must come from sheet-manifest.json. Never guess."* Kod nas je to **provera G3 u gate-u**: ako `(doc, page)` nije u `document_map.page_index`, činjenica se odbija pre presude i broji u `rejected_facts`.
>
> Isto tako, iz njegovog iskustva: *„vision at 1568px resolution can hallucinate specific numeric values — '65.0 sq ft' becomes '856'"*, i jedna pogrešno pročitana adresa propagirala mu se kroz ceo manifest. Zato slike crteža idu na ≤2000 px po dimenziji, a numeričke činjenice sa grafike koje hrane blokirajuće pravilo **uvek** idu kroz verifikator.

## 10 — Evaluation — Sedam brojeva nad 24 označene činjenice. Eval je deo MVP-a, ne polish

**Gold set · pravi se u 14:30, meri u 16:00, commituje u 16:45**

| Sadržaj | Broj | Napomena |
|---|---|---|
| Dokumenti | 4 | tehnički opis (6 str.) · račun evakuacije (2) · specifikacija opreme (2) · grafički prilog PS-01 (2) |
| Označene činjenice | 24 | vrednost + jedinica + **očekivani dokument** + **očekivana strana** |
| Namerni UNKNOWN | 3 | slot koji u dokumentaciji *ne postoji* — test da model ne izmišlja |
| Činjenice samo sa crteža | 3 | stepen otpornosti, broj hidranata, površina sektora — svi hrane C pravila |
| Seeded konflikti | 2 | C01 tekst↔grafika · **C02 tekst↔tekst** (fallback ako vision padne) |
| Seeded numerički FAIL | 2 | B06 otpornost 1,0 h pri stepenu II · B07 jedan izlaz pri 120 lica |
| Seeded MISSING | 2 | A01 nema poglavlja o evakuaciji · B03 slot koji nigde ne postoji |
| Engine test slučajevi | 12–14 | bez LLM-a, milisekunde, pokreću se lokalno i u CI |

#### Sedam metrika — i nijedna ciljna vrednost unapred

| Metrika | Definicija | Zašto je u dosijeu, a ne samo u README-u |
|---|---|---|
| fact_exact_match | tačna vrednost + jedinica / 24 | osnovno pitanje: da li sistem čita projekat |
| correct_source_doc | tačan dokument / 24 | pogrešan dokument znači da dokaz vodi na pogrešno mesto |
| correct_source_page | tačna strana / 24 | **nalaz bez tačne strane je beskoristan** — projektant mora da ode i pogleda |
| seeded_conflicts_detected | detektovano / 2 | hero klasa proizvoda. Mora biti 2/2 |
| unsupported_facts | činjenice sa vrednošću koje u dokumentu ne postoje | **mora biti 0.** Ovo je broj koji CrossBeam nikad nije izmerio |
| unknown_handled | od 3 namerna unknown, koliko je ostalo unknown / 3 | jedina odbrana od halucinirane brojke u dokumentu koji ide organu |
| engine_tests_passing | prošlih / ukupno | determinističko, pa 100% po konstrukciji — i tako se formuliše |

> ⛔ **Rečenica za sudije — šablon, popunjava se tek kad brojevi postoje**
>
> „Na označenom setu od **24 činjenice iz 4 dokumenta** sistem je tačno izvukao **X/24**, sa tačnim dokumentom i stranom u **Y/24**. Sva **3** slota kojih u dokumentaciji nema ostala su `unknown` — **0** izmišljenih vrednosti. Detektovana su **2/2** međudokumentna konflikta. Deterministički engine prolazi **Z/Z** testova. Pokrivenost: **N provera, K potvrdio licencirani inženjer ZOP**, što je **W%** ponderisano učestalošću stvarnih primedbi."
>
> **Ako bilo koji od X, Y, Z, N, K, W ne postoji u `evals/RESULTS.md`, ta rečenica se ne izgovara.** Ni „oko", ni „otprilike". Među sudijama su ljudi koji su gradili ML sisteme i pitaće kako je mereno.

> ⚠ **Runtime quality ≠ empirijski accuracy — ne mešati u pitchu**
>
> `integrity.json` (Dossier Gate) govori o *kvalitetu ovog konkretnog pregleda*: ima li svaki nalaz dokaz, ima li konflikt dva izvora. `RESULTS.md` govori o *tačnosti sistema* na ručno označenom setu. Prvo nije dokaz drugog. U demou: gate se pominje kao „sistem odbija da objavi nalaz bez dokaza", accuracy kao „na našem setu X/24". Nikad obrnuto.

## 11 — Human review — Čovek ulazi posle dosijea, ne usred pipeline-a

Ovo je mesto gde svesno odstupamo od CrossBeama — i gde se vidi zašto nam Managed Agents pauza ne treba. Kod njega čovek ulazi *usred* toka: prvi skill stane, postavi pitanja izvođaču, drugi skill kreće **hladno, bez ijedne poruke iz prethodnog razgovora**. Autor to i priznaje: *„The quality of its output depends entirely on the quality of those files."* Kod nas čovek ulazi na kraju, nad gotovim objektom, pa hladnog starta nema jer nema ni toplog.

**Stanje pregleda je polje u dosijeu, ne stanje sesije**

| human_review.state | Kada | Šta korisnik radi | Šta se menja u dosijeu |
|---|---|---|---|
| NOT_REVIEWED | odmah po generisanju | — | readiness je izveden samo iz nalaza |
| IN_REVIEW | projektant otvorio dosije | prolazi nalaz po nalaz | po nalazu: *prihvaćen* ili *odbačen kao neosnovan* + razlog |
| REVIEWED | prošao sve non-PASS nalaze | potpisuje pregled | readiness se preračunava **samo nad prihvaćenim nalazima**; odbačeni ostaju vidljivi sa razlogom |

**Odbačeni nalaz je najvredniji podatak koji sistem može da dobije.** Svaki „ovo nije primedba, i evo zašto" je *labeled negative* koji ide pravo u `evals/gold.yaml` i u prior sledeće verzije pack-a. To je mehanizam kojim se Nalaznik popravlja korišćenjem, i jedina rečenica o budućnosti koju smemo da izgovorimo kao postojeću.

> ▸ **Granica, izgovorena u demou a ne u fine printu**
>
> Nalaznik **nije saglasnost** i ne zamenjuje licenciranog projektanta ni pregled nadležnog organa — odlučuje licencirano lice po čl. 32. Zato `readiness` nikad ne kaže „usklađeno" nego `SPREMNO_ZA_STRUCNI_PREGLED`, i uz njega uvek stoji pokrivenost. Isto tako, nema auto-approval-a: čovek prihvata ili odbacuje, sistem samo preračunava.

## 12 — Failure architecture — Četiri fallbacka, poređana po tome šta gube — i šta čuvaju

Svaki fallback koristi **identične** `contracts/`, `engine/`, `domains/` i artefakte. Menja se samo sloj percepcije ili izvršavanja. To je smisao ugovora: proizvod ne zna koji je fallback aktivan.

**Lestvica se spušta tek kad gornji nivo padne, i odluka se donosi u navedeno vreme**

| Nivo | Okidač | Odluka | Šta gubimo | Šta i dalje radi |
|---|---|---|---|---|
| F0 | sve radi | — | — | cela petlja iz sekcije 2 |
| F1 | Daytona snapshot ne builduje (Tier 1/2 bez mreže pri buildu) | 23:00 sinoć | PyMuPDF u sandboxu | rasterizacija prelazi u Convex Node action (pdfjs); **engine i gate ostaju u Daytoni** jer su stdlib-only — Daytona kategorija se čuva |
| F2 | `@daytona/sdk` se ne bundluje u Convex action | 12:30 | SDK udobnost | Daytona REST preko `fetch` iz istog action-a; sve ostalo nepromenjeno |
| F3 | vision nepouzdan na crtežima (P6 spike padne ili confidence uvek < 0,5) | 13:00 | inspektor crteža, C01, 3 grafička slota | **hero postaje C02 tekst↔tekst** (broj hidranata: tehnički opis ↔ specifikacija opreme); pokrivenost se izgovara pošteno kao „grafički prilozi za sada nisu pokriveni" |
| F4 | `json_schema` vraća 400 i posle skidanja `minItems`/`maxLength` | 13:00 | API-nivo garancija | običan JSON u promptu + `jsonschema` validacija u `judge.py` kao jedini filter. **Ugovor ostaje** — nevalidna činjenica se i dalje odbija, i dalje je demo trenutak |
| F5 | Daytona potpuno nedostupna | 13:30 | **Daytona kategoriju — svesno** | engine u Convex `"use node"` action-u; ceo proizvod radi; kaže se naglas šta se desilo |

> ⛔ **Dva kill gate-a, doslovno**
>
> **12:30 — ako u Convexu ne postoji nijedan `Fact` izvučen iz pravog PDF-a**, spušta se lestvica F1→F2 i SHOULD lista se otpisuje *odmah*, ne u 16:00. Ne produžava se na 13:00.
>
> **16:30 — ako javni URL ne radi end-to-end iz incognito prozora**, svaki razvoj prestaje. Oba buildera rade isključivo na tome do 17:00. Nijedan feature, nijedan bug van happy path-a. Proizvod koji niko ne može da otvori nije proizvod.

#### Ostali rizici sa presekom

| Rizik | Ver. | Detection | Cutoff | Postupak |
|---|---|---|---|---|
| Kartograf pogrešno mapira dokument → ciljana ekstrakcija gleda pogrešne strane | srednja | gold set: `correct_source_page` pada ispod 50% | 14:00 | fallback na „pošalji ceo dokument" po dokumentu — gubi se brzina, čuva tačnost. Prekidač je jedna env varijabla `TARGETED_EXTRACTION=0` |
| E2E prelazi 90 s → live demo nemoguć | srednja | meri se pri svakom runu, piše u `provenance.e2e_ms` | 16:00 | keš po hash-u fajla (postoji od početka); smanji broj verifikator poziva na samo C-rule činjenice |
| Grok/Claude kredit potrošen | srednja | 429 ili saldo u konzoli | 15:00 | demo radi iz keša — legitimno, pipeline je već izvršen. Drugi nalog kao poslednja mera |
| Convex Workflow 0.2.x determinism violation | srednja | workflow visi u `running` | 14:30 | zameni lancem `internalAction` koji sam upisuje u `runs`. **Strukturu workflowa ne menjaj posle 14:00** — to je uzrok |
| Deployment puca | srednja | bela strana iz incognita | 16:00 | (1) `netlify.toml` SPA rewrite + `CONVEX_DEPLOY_KEY`; (2) `netlify deploy --dir=dist --prod` bez CI; (3) Vercel. Nikad >20 min na jednom provideru |
| Klijentski podatak u javnom repou | niska | `secrets-scan.sh` pre commita; `git log -p` grep u 19:30 | svaki commit | **Prevencija je jedini lek:** čisto sintetički projekat, karantin folder u `.gitignore`, hook na oba laptopa. Ako se desi — repo se briše i pravi nov |
| Pogrešan prag u engine-u | srednja | otac kaže „to nije tako" | 15:00 | pravilo → `status: draft`, **ne prikazuje se kao nalaz** nego kao `SPECIALIST_REVIEW`. Dizajnirano kao feature, ne kao izvinjenje |
| Nema vremena za video | srednja | 17:20 prošao, snimanje nije počelo | 17:20 | **Snimanje počinje u 17:20 bez izuzetka**, i ako je UI ružan. Take 1 odmah ide u submission |
| Jedan builder ćuti i zaglavljen je >45 min | visoka | task duži od 45 min | 45 min | Kažeš naglas „zaglavio sam na X". Drugi gleda 5 minuta. Ako ni tada — `cut` labela. **Zaglavljivanje u tišini nema tehnički fallback** |

## 13 — Repo, contracts, podela rada — Disjunktno vlasništvo, zamrznuti ugovori, osam artefakata

```
nalaznik/ javan od 11:02 · MIT
├── README.md  LICENSE  .gitignore  .env.example  netlify.toml
├── docs/{ARCHITECTURE.md, DOMAIN_PACK.md, STATUS.md}
├── scripts/{secrets-scan.sh, pack_from_csv.py, make_fixtures.py}
│
├── contracts/ ZAMRZNUTO 11:20 · menja se samo u integration window-u
│   ├── fact.schema.json          finding.schema.json
│   ├── extraction.schema.json    document_map.schema.json
│   ├── dossier.schema.json       integrity.schema.json
│   ├── api.md                    CHANGELOG.md
│
├── fixtures/ Builder B radi PROTIV OVOGA do 14:00
│   ├── dossier.sample.json   ← jedan pun dosije, svi slučajevi
│   ├── document_map.sample.json   facts.sample.json
│   └── pages/p*.png
│
├── domains/ jedino mesto gde postoji rec „pozar"
│   ├── _shared/slots.yaml
│   └── fire_protection/     sekcija 5
│
├── engine/ [A] stdlib-only: models, pack, operators, evaluate,
│                      next_action, gate, cli, tests
├── sandbox/ [A]  Dockerfile · ingest.py · judge.py   (judge zove engine + gate)
│
├── convex/
│   ├── convex.config.ts  schema.ts  projects.ts  documents.ts
│   ├── facts.ts  findings.ts  dossier.ts              [B]
│   ├── workflows/review.ts                            [A]
│   └── lib/{anthropic.ts, xai.ts, daytona.ts,
│            cartograph.ts, extract.ts, verify.ts}     [A]
│
├── src/ [B]  App · lib/dataSource.ts · components/
│                   {UploadDrop, ReadinessHeader, PipelineStatus,
│                    FindingList, FindingRow, EvidenceDrawer,
│                    NextActions, IntegrityBadge, CoverageBar, Disclaimer}
└── evals/ [A]  run_eval.py · RESULTS.md
```

**Osam artefakata · svaki je red u Convexu I fajl u sandboxu**

| Artefakt | Piše ga | Zašto postoji odvojeno |
|---|---|---|
| project_manifest.json | ingest | koje strane postoje, koliko teksta — ulaz za kartografa |
| document_map.json | kartograf | **page_index je anti-halucinacija filter**; candidate_slots usmeravaju ekstrakciju |
| facts.json | ekstraktori | UI ga vidi pre presude — pokazuje da model samo vadi |
| verification_log.json | verifikator | audit: šta je nezavisno provereno i sa kojim ishodom |
| findings.json | engine | jedini izvor statusa |
| integrity.json | gate | runtime quality, odvojeno od accuracy |
| review_dossier.json | workflow | proizvod |
| eval_results.json | run_eval | empirijska tačnost, odvojeno od integriteta |

> ▸ **Zašto artefakti, kad Convex ionako čuva stanje**
>
> CrossBeamova pouka je da **conversation state nikad ne sme biti jedini izvor istine** — kod njega je to bilo prisilno (hladan start), kod nas je izbor. Artefakti daju četiri stvari koje reaktivna baza sama ne daje: pipeline se nastavlja od bilo kog koraka posle pada; debugging je čitanje jednog fajla umesto praćenja toka; fallback nivoi menjaju samo *proizvođača* artefakta a ne potrošača; i dosije je auditable — možeš da pokažeš tačno šta je sistem video u svakom koraku.
>
> Razlika u odnosu na njega: **naši artefakti se validiraju.** Njegov ceo kvalitet visi na `corrections_categorized.json` koji niko ne proverava; naš `facts.json` prolazi jsonschema, a `findings.json` prolazi gate.

#### Podela rada i pravila saradnje

| Builder | Vlasništvo | Ne dira |
|---|---|---|
| **[A]** percepcija i presuda | `engine/`, `sandbox/`, `domains/`, `evals/`, `convex/lib/*`, `convex/workflows/*` | `src/`, `convex/schema.ts`, CRUD fajlove |
| **[B]** proizvod i isporuka | `src/`, `convex/schema.ts`, `projects\|documents\|facts\|findings\|dossier.ts`, `netlify.toml`, README | `engine/`, `sandbox/`, `domains/`, `convex/lib/*` |

**Topologija A** ostaje: GitHub je jedini source of truth, ljudi razgovaraju naglas, nema Slacka i nema bot-to-bot automatizacije. Dva čoveka za istim stolom — Slack dodaje latenciju i servis koji može da padne, a botovi koji pišu jedan drugom troše kredite na razgovor umesto na commit. GitHub Issues koristimo i zbog drugog razloga: **issue + commit timeline je dokaz da je rad napravljen tog dana.**

- **Grane:** `main` uvek deployabilan · A na `pipeline` · B na `ui` · merge kroz `gh pr merge --squash`, max na 45 min
- **Maksimalna veličina taska: 45 minuta.** Veće se cepa pre kucanja — tako `main` nikad nije više od 45 min zastareo
- **Integration windows:** 11:20 freeze · 13:30 (30 min) · 15:30 (30 min) · 17:00 total freeze. Van njih se `contracts/` ne dira
- **Blokada se rešava mockom, ne čekanjem.** Ako sediš i čekaš — mockuj, nastavi, i reci naglas šta si mockovao
- **Merge konflikt:** vlasnik fajla pobeđuje bez diskusije. 10 min rasprave je skuplje od 3 min ponovnog pisanja
- **Agent-to-agent kanal** je šestolinijski HANDOFF blok na kraj `docs/STATUS.md`; drugi agent čita *poslednjih 20 linija*, nikad tuđu conversation istoriju

```
HANDOFF pipeline @ 13:42
DONE:      kartograf radi, document_map ima page_index za 12 strana
CONTRACT:  unchanged
ARTIFACT:  fixtures/document_map.sample.json osvezen pravim izlazom
NEEDS:     nista
BROKEN:    PS-01 str.2 nije klasifikovan — pada u unindexed_pages
```

## 14 — Timeline — 10:30 → 20:00 · normal track

**Žuto = gate · crveno = kill gate**

| Vreme | Builder A · percepcija i presuda | Builder B · proizvod i isporuka | Artefakt | Gate |
|---|---|---|---|---|
| 10:30 | tri pitanja organizatoru (sekcija 18), Daytona kategorija | tabovi, dashboardi, WiFi izmeren, hotspot testiran | odgovori zapisani | — |
| 11:00 | `gh repo create --public`, .gitignore, hook, labele, 8 issue-a | Vite + Convex, `npx convex dev` živ | javan repo | — |
| 11:20 | piše svih 6 shema u `contracts/` + `fixtures/dossier.sample.json` | piše `convex/schema.ts` + indekse, čita contracts naglas | **CONTRACT FREEZE** | ako u 11:35 nije commitovano, B radi na fixtures kakvi jesu |
| 11:35 | `engine/` jezgro + `slots.yaml` (26 slotova) | `dataSource.ts` mock grana; `FindingList` renderuje dosije | registar na ekranu | — |
| 12:00 | `rules.yaml` + `cross_rules.yaml` + `gate.py`; engine testovi prolaze | `ReadinessHeader` + `CoverageBar` + `UploadDrop` → pravi PDF u storage | engine sudi lokalno | — |
| 12:30 | `sandbox/ingest.py` + `judge.py` + `daytona.ts`; **prvi Fact iz pravog PDF-a** | `EvidenceDrawer` skelet na mocku | **PDF → Fact** | **KILL GATE 1** — F1→F2 lestvica, SHOULD se otpisuje odmah |
| 13:00 | **kartograf** → `document_map.json`; ciljana ekstrakcija po candidate_slots | evidence side-by-side za CONFLICT; isečak strane | mapa + ciljani facts | — |
| 13:30 | **INTEGRATION WINDOW 1 · 30 min.** Pravi dosije zamenjuje fixtures. Sve `area:contract` promene sada i samo sada. | — | prvi pravi nalaz | posle ovoga samo castovi |
| 14:00 | `workflows/review.ts`: ingest → map → extract → judge → gate → dossier | `VITE_DATA_SOURCE=convex`; live `useQuery`; `PipelineStatus` po koraku | **dosije živ** | ako u 14:30 UI ne čita Convex → nazad na mock, integracija u 15:30 |
| 14:30 | `make_fixtures.py` → 4 PDF-a sa **2 planirana konflikta**; `gold.yaml` 24 činjenice | `NextActions` grupisano; `IntegrityBadge`; `Disclaimer` vidljiv | demo projekat + gold set | — |
| 15:00 | **verifikator** sa rutiranjem iz sekcije 5; očeva pravila → `approved: true` | `netlify init`, `CONVEX_DEPLOY_KEY`, SPA rewrite | verification_log | — |
| 15:30 | **INTEGRATION WINDOW 2 · 30 min.** Prvi javni deploy sa pravim podacima. Oba gledaju javni URL, ne localhost. | — | **javni URL** | ako deploy ne prođe za 20 min → Vercel odmah |
| 16:00 | `run_eval.py` → 7 metrika; meri `e2e_ms` | mobilni prikaz, empty/loading state, „model ne merenje" oznaka | prvi brojevi | e2e > 90 s → seci verifikator na samo C-rule činjenice |
| 16:30 | **HARD GATE: upload 4 PDF-a → dosije → klik na dokaz, iz incognita, bez logina, na telefonu.** | — | **dokaziv proizvod** | **KILL GATE 2** — razvoj staje, oba na tome do 17:00 |
| 16:45 | `evals/RESULTS.md` commitovan sa današnjim brojevima | coverage panel sa RESULTS brojevima; README dijagram | brojevi koje smemo da kažemo | — |
| 17:00 | **FEATURE FREEZE.** Samo bugfix u svojim fajlovima. Nijedan nov fajl, nijedna nova zavisnost, nijedna contract promena. | — | main = deployovano | **GATE** |
| 17:00 | dva puna prolaza happy path-a sa štopericom | scenografija: prozori, zoom, font, bookmarks sakriveni | happy path izmeren | — |
| 17:20 | čita skript sekcije 15, meri vreme | **snima take 1** | take 1 na disku | — |
| 17:35 | gleda take 1, max 3 ispravke | **take 2**, ffmpeg trim, YouTube unlisted | **video link** | 17:50 nema uploada → ide take 1 |
| 17:50 | repo javan, secrets-scan čist, RESULTS.md tu | **submission forma**, sva tri linka iz incognita | **SUBMISSION v1** | od sad imamo validnu prijavu šta god bude |
| 18:00 | **SHOWCASE 18:00–19:00 · besplatna generalka.** A vodi priču, B drži miša. Zapisujete svako pitanje. | — | pitanja zapisana | — |
| 19:00 | Ispravlja se **samo** ono što je showcase pokazao kao slomljeno. Ako je pitanje otkrilo rupu u priči — menja se *priča*, ne kod. | — | — | nijedan deploy posle 19:30 |
| 19:30 | `git log -p \| grep` nad celom istorijom | re-deploy ako treba; tri linka **sa telefona na mobilnim podacima** | **finalno verifikovano** | — |
| 19:45 | **RUKE DALJE OD TASTATURE.** | — | — | **HARD STOP** |

### Prvih šezdeset minuta · 11:00–12:00

**`11:00` ◆ — Oba · start na glas**

  Štoperica na telefonu uz ekran. Arhitektura se ne diskutuje — zaključana je u sekciji 3.

**`11:01` — A · repo postoji i javan je**

  `gh repo create nalaznik --public --clone`. Prvi commit: `.gitignore`, `LICENSE` (MIT), `.env.example`. Push. **Timestamp prvog commita je dokaz — zato minut 1.**

**`11:03` — A · secrets hook**

  `scripts/secrets-scan.sh` → `.git/hooks/pre-commit`, `chmod +x`. Push.

**`11:04` — A · labele i 8 issue-a**

  Jedna komanda, sekcija 19. Issue-i: contracts, engine, pack, ingest, judge+gate, kartograf, extract, eval.

**`11:05` — B · Vite + Convex skelet**

  `npm create vite@latest . -- --template react-ts`, `npm i convex @convex-dev/workflow`, `npx convex dev`. **Ostaje da radi ceo dan u zasebnom terminalu.**

**`11:08` — A · ključevi u Convex, ne u fajlove**

  `npx convex env set` × 4. Provera `npx convex env list`. **Nikad `VITE_` prefiks na tajni** — sve sa `VITE_` završi u browser bundle-u.

**`11:10` — A · `firstText()` helper, pre svega ostalog**

  Deset linija: `m.content.find(b => b.type === "text")?.text ?? ""`. Opus 5 vraća thinking blok prvi; `content[0].text` puca. Pola sata izgubljenog u 13:10 je najgluplji gubitak dana.

**`11:12` — B · `dataSource.ts` kao jedina integraciona tačka**

  Dve grane, identičan tip: `mock` → `fixtures/dossier.sample.json`, inače `useQuery(api.dossier.byProject)`. Od ovog minuta B nikad ne čeka A.

**`11:15` ◆ — A piše 6 shema · B piše schema.ts · paralelno**

  A: fact, extraction, finding, document_map, dossier, integrity + `api.md`. B: 6 tabela (`projects, documents, facts, findings, dossiers, runs`) + **obavezni indeksi** `by_project` i `by_document` — bez njih UI puca na 200 činjenica.

**`11:20` ◆ — Oba · CONTRACT FREEZE, naglas**

  A čita imena polja `Fact`, `Finding`, `Dossier`. B prati po svom `schema.ts` i potvrđuje svako. Neslaganja se ispravljaju *sada*. Commit, push, prvi red u `CHANGELOG.md`. **Do 13:30 niko ne dira contracts.**

**`11:23` — A · `fixtures/dossier.sample.json` — pun dosije**

  Mora sadržati sve što UI treba da ume: 2 CONFLICT (tekst↔grafika i tekst↔tekst), 2 FAIL, 2 MISSING, 7 PASS, jedan `rule_status:"draft"`, jedan evidence sa `value:null` i `confidence:0`, jedan `verified:"DISPUTED"`, pun `integrity` blok sa 6 provera, `coverage` sa weighted, i sve vrste `next_action`. Push, pa naglas: **„fixtures su na mainu."**

**`11:26` — Oba · grane**

  `git checkout -b pipeline` / `-b ui`. Posle ovoga nema direktnog push-a na `main`.

**`11:28` — B · dosije na ekranu**

  `ReadinessHeader` + `FindingList` + `FindingRow`. Sortiranje CONFLICT → FAIL → MISSING → PASS. Bez stilizovanja. Cilj: **u 11:45 vidi ceo dosije na localhostu.**

**`11:30` — A · `engine/models.py` + `slots.yaml`**

  `Fact`/`Finding` preslikane iz `contracts/`, ne izmišljene. 26 slotova sa `type`, `unit`, `expect_in`, `extraction_difficulty`. **Enum u shemi se generiše iz ovog fajla** — jedan izvor.

**`11:40` — A · `evaluate.py` + `next_action.py` + `gate.py`**

  Operatori, pa prolaz kroz `rules.yaml` → `cross_rules.yaml` → `rules_custom.py`. Gate sa 6 provera. **Nijedan LLM se ovde ne pominje.**

**`11:45` — Oba · sinhronizacija, 60 sekundi**

  Po jedna rečenica svaki. Ako neko kaže nešto treće od očekivanog — gate u 12:30 je u opasnosti i *sada* se preraspoređuje, ne u 12:25.

**`11:47` — A · 13 pravila deklarativno**

  A01–A02, B01–B07, C01–C04. **`status: approved` samo na onima koje je otac potvrdio sinoć**, ostalo `draft`. B04, B06, B07 → `custom: true`.

**`11:52` — B · upload radi**

  `generateUploadUrl()` → `fetch(postUrl)` → `documents.register`. Cilj: **u 12:00 pravi PDF je u Convex storage.** To je B-ov doprinos gate-u u 12:30.

**`11:55` — A · engine testovi prolaze**

  `engine_cases.yaml`, 12–14 slučajeva. **Ovo je broj koji sutra izgovaramo** — piše se sad dok je mirno, ne u 16:40.

**`12:00` ◆ — Provera track-a**

  Na mainu: javan repo sa 10+ commitova, zamrznuti contracts, pun `dossier.sample.json`, engine sa gate-om koji prolazi testove, dosije renderovan u browseru, pravi PDF u storage. **Ako nešto od ovoga fali u 12:05 — to je normal track i SHOULD se otpisuje odmah.**

## 15 — Demo — 2:50 · problem, pa rezultat, pa kako — u tom redu

A govori, B drži miša. Jedan jedini kadar sa kodom. Arhitektura se ne objašnjava pre 1:40.

**`0:00` — Novac, ne propis**

  **Ekran:** jedan naslov. **Kaže se:** „Kada glavni projekat zaštite od požara dobije primedbu, investitor ne plaća primedbu — plaća krug. Mesec dana, ponovo na pregled. Projektant je to znao da izbegne, ali nije imao čime da proveri pre nego što pošalje."

**`0:20` — Upload, pa mapa**

  **Ekran:** 4 PDF-a, `PipelineStatus` pali korake. **Kaže se:** „Sistem prvo napravi mapu — koji dokument je koji i gde bi koji podatak mogao biti. Tek onda gleda strane. Ne čita sve." *To je jedna rečenica koja objašnjava zašto ovo traje sekunde a ne minute.*

**`0:40` — Dosije se puni**

  **Ekran:** `ReadinessHeader` se menja iz „obrada" u „4 blokirajuća nalaza", registar se puni. **Kaže se:** „Ovo nije izveštaj koji treba čitati. Ovo je dosije projekta pre predaje."

**`1:00` ◆ — HERO · konflikt, split-screen**

  **Ekran:** klik na C01 → drawer, levo isečak str. 7 sa „II", desno isečak PS-01 sa „III". **Kaže se:** „Tehnički opis kaže stepen otpornosti II. Grafički prilog kaže III. *Nijedan prag nije prekršen* — svaki broj u projektu je u granicama. Ali dokumentacija sama sa sobom nije usklađena, i ovo je vraćen projekat. Ovu klasu ne vidi nijedan alat, jer to nije stavka u dokumentu nego relacija između dva dokumenta." Ako je vision pao: isto, ali C02 — 4 hidranta u opisu, 3 u specifikaciji.

**`1:25` — Račun i nezavisna provera**

  **Ekran:** B06 → citat, strana 8, „stepen II zahteva 1,5 h; nađeno 1,0 h". Pa `verified: VERIFIED`. **Kaže se:** „Model nije rekao da ovo nije u redu. Model je našao 1,0 h na strani 8. Drugi model je *nezavisno* pogledao istu stranu — nije video prvi odgovor — i našao isto. A da li to prolazi, odlučio je kod, i pokazuje račun."

**`1:45` ◆ — Jedini kadar sa kodom · zatvorena shema**

  **Ekran:** terminal: `model probao da PRESUDI → ODBIJENO: 'verdict' was unexpected`, pa `model ne zna vrednost → PRIHVACENO`. **Kaže se:** „Model fizički ne može da presudi — shema koju dobija nema polje za presudu. A „ne znam" je legalan odgovor, i to je jedina odbrana od izmišljene brojke u dokumentu koji ide organu." **Ovo je jedna tehnička stvar koju kažemo.**

**`2:05` — Integritet i poštena pokrivenost**

  **Ekran:** `IntegrityBadge` „6/6" + `CoverageBar`. **Kaže se:** „Sistem pre objavljivanja proverava sam sebe: nema nalaza bez dokaza, nema konflikta sa jednim izvorom, nema strane koja nije u mapi. I nikad ne piše „projekat je usklađen" — piše koliko je provera izvršeno i koliko ih je potpisao licencirani inženjer."

**`2:20` — Brojevi · samo ako postoje**

  **Ekran:** coverage panel. **Kaže se:** rečenica iz sekcije 10 sa stvarnim X/Y/Z. Ako brojeva nema — *kadar se preskače* i 15 s ide u hero.

**`2:35` — Jedna poslovna stvar**

  **Kaže se:** „Proizvod nije izveštaj. Proizvod je krug koji se ne ponavlja. A svaki nalaz koji projektant odbaci kao neosnovan sistem pamti — tako se popravlja korišćenjem."

**`2:45` — Proširenje i granica u istoj rečenici**

  **Kaže se:** „Pravila su podaci koje potpisuje struka, ne kod koji pišemo mi. Zaštita od požara je prvi pack jer u njoj imamo inženjera koji je potpisao pragove; za elektro treba elektro inženjer. **I ovo nije saglasnost — odlučuje licencirano lice.**"


**SNIMANJE · 17:20, BEZ IZUZETKA**

- [ ] `B` Snimaj **javni URL u incognito prozoru**, nikad localhost — to je i dokaz da deploy radi
- [ ] `B` 1080p, 30 fps, mikrofon testiran sinoć. Zvuk puca → snimi bez zvuka i dodaj kartice, ne gubi 10 min na audio
- [ ] `A` Čita skript sa telefona, ne improvizuje. Prekoračenje 3:00 → seče se kadar 2:20, nikad hero
- [ ] `B` Take 1 **odmah** na YouTube unlisted i u submission. Take 2 je zamena samo ako je bolji

**SUBMISSION · 17:50**

- [ ] `A` Repo javan, MIT, README sa dijagramom i rečenicom da je kod napisan tog dana
- [ ] `A` `secrets-scan.sh` čist + `git log -p | grep` prazan; nula podataka koji identifikuju stvarnog klijenta
- [ ] `A` `evals/RESULTS.md` commitovan sa današnjim brojevima
- [ ] `B` Javni URL iz incognita bez logina, radi na telefonu na mobilnim podacima, refresh na podstrani ne daje 404
- [ ] `B` Demo projekat je na sajtu spreman za upload — **sudija mora moći sam da proba**
- [ ] `B` Sva tri linka otvorena iz incognita *pre* nego što se klikne Submit
- [ ] `A` Daytona kategorija označena, sa jednom rečenicom gde se Daytona koristi

## 16 — MUST / SHOULD / CUT — Prioritet kad se dva taska sudare

Redosled iz winner research-a, doslovno: **1** kompletnost petlje · **2** deterministička ispravnost · **3** dokaz i sledivost · **4** međudokumentna detekcija · **5** izmerena tačnost · **6** jasnoća demoa · **7** polish · **8** dubina sponzora · **9** još pravila · **10** sofisticiranost arhitekture.

| Klasa | Stavka | Ko | Cutoff | Zašto tu gde je |
|---|---|---|---|---|
| **[MUST]** | Upload → Convex storage | **[B]** | 12:00 | prva trećina petlje |
| **[MUST]** | Ingest u Daytoni (tekst + rasterizacija) | **[A]** | 12:30 | izolacija tuđeg dokumenta + Daytona nagrada |
| **[MUST]** | Kartograf → `document_map.json` sa `page_index` | **[A]** | 13:00 | jedini accuracy pivot iz winner analize; i anti-halucinacija filter |
| **[MUST]** | Ciljana ekstrakcija u zatvorenu shemu | **[A]** | 13:00 | **ovo JE inovacija** — bez zatvorene sheme Nalaznik je chatbot |
| **[MUST]** | Engine + Dossier Gate u Daytoni | **[A]** | 13:30 | „kod sudi" mora imati vidljivo mesto izvršavanja |
| **[MUST]** | ≥1 CONFLICT iz dve nezavisno utemeljene činjenice | **[A]** | 14:00 | hero. Klasa koju nijedan drugi alat ne vidi |
| **[MUST]** | Dosije: readiness + coverage + findings + next_action | **[B]** | 14:00 | profesionalni artefakt, ne dashboard |
| **[MUST]** | EvidenceDrawer: dokaz A/B, strana, citat, račun | **[B]** | 13:30 | odgovor na „zašto je sistem ovo rekao" |
| **[MUST]** | Vidljivo UNKNOWN i poštena pokrivenost | **[B]** | 14:30 | trust je feature; jedina odbrana od halucinirane brojke |
| **[MUST]** | 8–12 pravila potpisanih od inženjera ZOP | **[A]** | 15:00 | gusto domensko znanje je moat; potvrđenost je ono što se izgovara |
| **[MUST]** | Live updates bez refresh dugmeta | **[B]** | 14:00 | Convex kriterijum traži suštinske live updates |
| **[MUST]** | Vidljiv disclaimer u UI-u, ne u footeru | **[B]** | 15:00 | domenska granica |
| **[MUST]** | Javni URL + javni repo + video ≤3 min | **[B]** | 16:30 / 17:50 | bez jednog nema prijave |
| **[MUST]** | `RESULTS.md` sa 7 metrika iz *današnjeg* builda | **[A]** | 16:45 | projekti koji su stavili broj na sopstvenu tačnost pobedili su tehničke sudije |
| **[SHOULD]** | Verifikator sa rutiranjem po severity × difficulty | **[A]** | 15:00 | diže tačnost i daje jaku rečenicu u demou — ali pipeline radi i bez njega |
| **[SHOULD]** | Human review state (prihvati/odbaci nalaz) | **[B]** | 16:00 | zatvara petlju ka „popravlja se korišćenjem" |
| **[SHOULD]** | Weighted coverage po učestalosti | **[A]** | 16:00 | bolji broj od broja pravila — ali traži da otac popuni `ucestalost` |
| **[SHOULD]** | 25+ pravila umesto 13 | **[A]** | 16:00 | **jedno dobro C pravilo > deset threshold pravila** — zato je nisko |
| **[SHOULD]** | Round diff: drugi upload zatvara nalaze | **[B]** | 16:30 | jak framing, ali demo ima smisla bez njega |
| **[CUT]** | Managed Agents roster + self-hosted sandbox | — | — | sekcija 3, pet razloga. Ostaje kao P2 upgrade put u `ARCHITECTURE.md` |
| **[CUT]** | Outcomes grader | — | — | svih 6 kriterijuma je mehanički proverljivo → Dossier Gate u kodu je brži i reproducibilan |
| **[CUT]** | Convex RAG, Exa, Firecrawl u runtime-u | — | — | P0 citira član direktno iz `regulations.yaml`; za 12 glava je brže i tačnije |
| **[CUT]** | PDF export dosijea | — | — | **CrossBeamova greška:** skill napisan, isključen, obećana konverzija nikad implementirana |
| **[CUT]** | Auth, login, multi-tenant, billing | — | — | CrossBeam je zbog permission problema dobio 403 pred sudijama |
| **[CUT]** | Chat panel bilo gde u UI-u | — | — | poništio bi celu poentu proizvoda |
| **[CUT]** | Automatsko popravljanje dokumentacije | — | — | prekoračenje domenske granice; odlučuje licencirano lice po čl. 32 |
| **[CUT]** | Druge discipline, Fal, Wispr, prior po kancelariji | — | — | nisu na happy path-u |

## 17 — Winner scorecard — Samoocena predloženog MVP-a · 0 = ne postoji, 1 = delimično, 2 = jasno demonstrirano

| | Dimenzija | Ocena |
|---|---|---|
| A | **Professional artifact**<br>Dosije kao verzionisan objekat sa dva nivoa, readiness, integritetom i sledećom radnjom. Nije ekran nego red u bazi koji UI renderuje. | **2** |
| B | **Measured accuracy**<br>7 metrika nad 24 označene činjenice, `RESULTS.md` u javnom repou. Set je mali i to se kaže naglas — ali je stvaran, a *unsupported_facts* je broj koji pobednik iz februara nikad nije izmerio. | **2** |
| C | **Constraint arbitration**<br>Tri klase (A/B/C), engine je jedini proizvođač statusa, shema modelu mehanički zabranjuje presudu, `next_action` izveden kodom. | **2** |
| D | **Dense expert knowledge**<br>Dva sloja (hints + rules), potpis po pravilu, weighted coverage. **Jedina stavka sa spoljnom zavisnošću:** ako otac večeras ne potvrdi bar 8 pravila, ovo pada na 1. | **2*** |
| E | **Cross-document reasoning**<br>C pravila iz dve *nezavisno utemeljene* činjenice; dva planirana konflikta, jedan bez zavisnosti od vision-a; `document_map` uparuje dokumente pre ekstrakcije. | **2** |
| F | **Visible evidence**<br>Dokument, strana, doslovan citat, isečak strane, račun, pouzdanost, ishod verifikatora — i side-by-side za konflikt. Provenijencija strane se proverava kodom (G3). | **2** |
| G | **Honest uncertainty**<br>`value: null` je legalan odgovor; G5 sprečava da nepoznat slot postane FAIL; draft pravila se ne prikazuju kao nalazi; pokrivenost je vidljiva; procena troška označena kao model. | **2** |
| H | **One obvious wow**<br>Split-screen C01 u 1:00 — dva isečka strane i jedan status. Razumljivo bez ijedne reči o arhitekturi. | **2** |
| I | **Complete end-to-end loop**<br>Svih 9 koraka iz sekcije 2, sa imenovanim artefaktom na svakom. Hard gate u 16:30 je baš na kompletnosti petlje. | **2** |
| J | **Structural sponsor usage**<br>Daytona: dva posla bez kojih proizvod nema gde da radi. Convex: lifecycle + dosije + realtime. Claude/Grok: percepcija podeljena po tome ko šta bolje radi. Nijedan partner bez uloge u petlji. | **2** |
| K | **Demo understandable < 60 s**<br>Problem u 0:00, rezultat u 0:40, hero u 1:00. Arhitektura tek u 1:45, i to jedna rečenica. | **2** |
| L | **Expandability bez zagađenja MVP-a**<br>Reč „požar" ne postoji u `engine/`, `convex/` ni `src/`. `_shared/slots.yaml` omogućava buduća međudisciplinarna pravila. Managed Agents zabeleženi kao P2 sa cenom migracije u jednoj rečenici. | **2** |
| Σ | **UKUPNO**<br>Prag je 20/24. Nijedna obavezna dimenzija (A, B, C, F, I, H) nije na 0. | **24 / 24** |

> ⚠ **Poštenje o ovoj oceni — gde je stvarno najtanja**
>
> **D je uslovna.** Ceo skor visi na tome da večeras dobijemo bar 8 potpisanih pravila. Ako otac ne stigne, D pada na 1, ukupno 23 — još uvek iznad praga, ali *moat nestaje* i ostajemo sistem sa dobrom arhitekturom i tuđim pragovima. To je najvredniji sat večerašnjeg rada.
>
> **B je realno „2 sa malim n".** 24 činjenice nisu benchmark nego uzorak. Zato se u pitchu kaže *„na označenom setu od 24 činjenice"*, nikad „tačnost sistema je X%". Mali stvarni broj je jači od velikog izmišljenog — ali samo ako se predstavi kao ono što jeste.
>
> **Jedini scenario koji obara skor ispod 20** je kombinacija: ekstrakcija ne radi do 13:00 *i* nema domenskog materijala. Tada padaju B, D, E i F odjednom. Oba uzroka se rešavaju večeras — spike-ovima i razgovorom sa ocem — i to je razlog zašto je sekcija 18 raspoređena tim redom.

## 18 — Pre-hackathon — Večeras: nalozi, instalacije, spike-ovi, domen. Do 23:00, pa spavanje

> ⛔ **Granica koju sami postavljamo, konzervativno**
>
> Pravilo kaže „ocenjuje se rad napravljen tog dana", ali ne precizira portovanje sopstvenog ranijeg prototipa. **Do odgovora organizatora ponašamo se najstrože:** repo se kreira u 11:00, prvi commit koda posle 11:20, prototip `rules.py`/`schema_test.py` je *specifikacija* a ne izvor — `engine/` se piše iznova i u drugom obliku (pack-driven, sa gate-om i next_action-om, čega u prototipu nema). U README-u: *„Prethodni lični prototip u zasebnom repou poslužio je kao specifikacija; sav kod u ovom repou je napisan 12.09.2026. između 11:00 i 20:00."*

#### Tri pitanja organizatoru na check-inu u 10:35 — odgovore zapisati

1. Sme li se portovati sopstveni raniji open-source prototip, ili sav kod mora nastati posle 11:00? *Do odgovora: mora.*
2. Smeta li setup infrastrukture pre 11:00 — nalozi, ključevi, Daytona snapshot, prazan Convex projekat? *Do odgovora: setup da, kod ne.*
3. Može li isti projekat da konkuriše i za glavnu i za Daytona kategoriju? *Ako ne — biramo Daytonu, nagrada je četiri puta veća.*

#### Laptop A — percepcija, Daytona, engine, evals

| Alat | Install | Auth | Smoke test |
|---|---|---|---|
| git ≥ 2.40 · gh | `apt install git gh` / `brew install git gh` | `gh auth login` | `gh auth status` |
| Node 22 LTS | `curl -fsSL https://fnm.vercel.app/install \| bash` → `fnm install 22 && fnm default 22` | — | `node -v` → v22.x |
| Python 3.12 + venv | `apt install python3.12 python3.12-venv` / `brew install python@3.12` | — | `python3 -V` |
| jsonschema, pyyaml | `pip install jsonschema pyyaml` u venv | — | `python3 -c "import jsonschema,yaml"` |
| Daytona CLI + Python SDK | `brew install daytonaio/cli/daytona` · `pip install daytona` | `daytona login` | `daytona list` (prazno = uspeh) |
| Daytona TS SDK | `npm i @daytona/sdk` (NE @daytonaio/sdk) | env u Convexu | spike P2 |
| curl + jq | `apt install curl jq` | — | `echo '{"a":1}' \| jq .a` |
| Claude Code CLI | `npm i -g @anthropic-ai/claude-code` | `claude` → login | `claude -p "reci ok"` |
| Cursor / Grok Bot | instalater | nalog + hakaton kredit | jedan completion |

> ⚠ **Ako je Windows — odluka se donosi večeras, ne sutra u 11:15**
>
> Sve unutar **WSL2 Ubuntu**, repo u WSL filesystemu (`~/nalaznik`), *nikad* na `/mnt/d` — I/O preko `/mnt/` je višestruko sporiji i `node_modules` tamo ume da zakuca watcher. Postavljanje: `wsl --install -d Ubuntu` u PowerShellu kao admin, restart. Materijal jednom: `cp -r /mnt/d/"Faks sav materijal"/Hakaton ~/hakaton-materijal`. **Ako WSL večeras pravi problem, macOS/Linux kolega preuzima ulogu Buildera A i menjate uloge.**

#### Laptop B — Convex, frontend, deploy, video

| Alat | Install | Auth | Smoke test |
|---|---|---|---|
| git · gh · Node 22 | isto kao A | `gh auth login` | `node -v` — **mora biti isti major kao kod A** |
| Convex CLI | dolazi sa `npm i convex` | `npx convex dev` → GitHub | scratch projekat piše i čita jedan red |
| @convex-dev/workflow | `npm i @convex-dev/workflow` | — | dvokoračni workflow prolazi (spike P5b) |
| Netlify CLI | `npm i -g netlify-cli` | `netlify login` | `netlify status` |
| Claude Code CLI · Cursor | isto kao A | login + kredit | jedan completion |
| OBS / macOS `Cmd+Shift+5` | `brew install --cask obs` / ugrađeno | — | **snimi 20 s večeras i pusti ih** — mikrofon se ne podešava u 17:20 |
| ffmpeg | `apt install ffmpeg` / `brew install ffmpeg` | — | `ffmpeg -version` |
| Chrome + Claude in Chrome | ekstenzija | — | otvori stranu, pročitaj konzolu |

#### Nalozi, env varijable, vlasništvo

| Servis | Env var | Vlasnik | Gde živi |
|---|---|---|---|
| Anthropic | ANTHROPIC_API_KEY | A | `npx convex env set` + A-ov `.env.local` |
| x.ai | XAI_API_KEY | A | isto |
| Daytona | DAYTONA_API_KEY · DAYTONA_SNAPSHOT | A | isto · snapshot `saglasnik-ingest-0.1` |
| Convex | CONVEX_DEPLOYMENT · VITE_CONVEX_URL | B | upisuje ih `npx convex dev` |
| Convex → Netlify | CONVEX_DEPLOY_KEY | B | **samo** u Netlify env, nikad lokalno |
| Frontend prekidač | VITE_DATA_SOURCE | B | `mock` do 14:00, pa `convex` |
| Ekstrakcija prekidač | TARGETED_EXTRACTION | A | `1` difolt; `0` je fallback iz sekcije 12 |

**Pravilo:** svaki ključ ima jednog vlasnika i postoji na tačno dva mesta — vlasnikov `.env.local` i Convex env. Builder B nikad ne dobija `ANTHROPIC_API_KEY`, jer njegov kod ne zove model. **Nikad `VITE_` prefiks na tajni.** Za ono što se stvarno mora podeliti: Bitwarden Send (jedan pregled, ističe) ili otkucaj ručno — nikad Slack, GitHub, commit ili chat sa agentom.

#### MCP / alati — tri USEFUL, ostalo CLI ili SKIP

| Kandidat | Odluka | Obrazloženje |
|---|---|---|
| Built-in file/shell + WebSearch/WebFetch | **[REQUIRED]** | Convex Workflow je 0.2.x i Daytona SDK se menja — docs se čitaju *tokom* builda |
| `gh` CLI | **[REQUIRED]** | repo, issues, PR, merge iz terminala; agent ga zove kao običnu komandu |
| Netlify CLI | **[REQUIRED]** | jedini deploy put; jedna komanda bez dashboarda |
| Convex MCP | **[USEFUL]** **[B]** | u 14:00, kad UI prvi put vidi prave podatke i nešto je `undefined`. `claude mcp add convex -- npx -y convex@latest mcp start` |
| Claude in Chrome | **[USEFUL]** **[B]** | posle deploya: javni URL, konzola, nema 403 — tačno ono na čemu je CrossBeam izgubio poene |
| Wonder | **[USEFUL]** **[B]** | build-time layout u 11:30, nula runtime zavisnosti |
| GitHub MCP · Daytona MCP | **[SKIP]** | `gh` i `daytona` CLI rade isto sa manje pokretnih delova i bez tokena u headeru |
| Slack (bilo kako) | **[SKIP]** | sedite za istim stolom; bot-to-bot je najbrži put u petlju koja troši kredite bez commita |
| Firecrawl | **[USEFUL]** samo večeras | jednokratno `/extract` nad javnim tekstom Pravilnika → `regulations.yaml`. Nije runtime zavisnost |
| Exa · Fal · Wispr · Convex RAG | **[SKIP]** | nisu na happy path-u. Ako sudija pita — kaže se naglas; disciplina je poen |

#### Večeras, redom


**19:00–20:00 · NALOZI**

- [ ] `A` Anthropic Console · x.ai (hakaton kredit ~$35) · **Daytona — zabeleži koji si tier**, od toga zavisi mreža u sandboxu
- [ ] `B` Convex (prazan projekat `nalaznik`) · Netlify (tim, oba buildera) · Cursor/Grok krediti
- [ ] `A` GitHub org odabran — **repo se NE kreira večeras** · Firecrawl 20.000 kredita

**20:00–21:00 · INSTALACIJE**

- [ ] `OBA` Tabele Laptop A i B iznad, uključujući WSL2 ako je Windows
- [ ] `OBA` `node -v` na oba, izgovoriti naglas — isti major (22), inače `package-lock.json` pravi konflikt u 14:00
- [ ] `B` **Snimi 20 s ekrana sa zvukom i pusti ih.** Mikrofon i rezolucija se rešavaju večeras

**21:00–22:15 · SPIKE-OVI · repo `nalaznik-spikes`, PRIVATAN, nikad se ne merguje**

- [ ] `A` **P1** xAI `response_format.json_schema` sa skraćenom shemom → vrati li validan JSON
- [ ] `A` **P1b** Anthropic `output_config.format` + provera da `content[0]` NIJE text
- [ ] `A` **P3** `daytona snapshot create` sa PyMuPDF → prolazi li build (ovo testira tier mrežu)
- [ ] `A` **P3b** iz snapshota: upload PDF-a, `code_run` PyMuPDF, download PNG
- [ ] `A` **P6** jedna PNG strana crteža → Opus 5 vision → čita li legendu. **Ovaj odlučuje da li hero ide C01 ili C02**
- [ ] `B` **P4** `generateUploadUrl` → upload PDF-a iz browsera → storageId u tabeli
- [ ] `B` **P2** `"use node"` action koji importuje `@daytona/sdk` i vrati `codeRun("print(1)")`
- [ ] `B` **P5** `netlify deploy --prod` scratch projekta → javni URL se otvara · **P5b** workflow prolazi
- [ ] `OBA` Rezultat svakog: **jedna linija** — radi / ne radi / tačan oblik poziva. Max 20 min po spike-u. **Ne poliraj spike.**

**22:15–23:00 · DOMEN — najvredniji sat večeri**

- [ ] `A` **Razgovor sa ocem, 30 min**, po xlsx templateu. Cilj: **8–12 pravila sa „DA"** + 3 najčešće primedbe sa doslovnom formulacijom + učestalost gde je zna
- [ ] `A` Izričita dozvola za anonimizovan materijal, **ili odluka da idemo čisto sintetički** (preporučeno)
- [ ] `A` Firecrawl `/extract` nad javnim tekstom Zakona i Pravilnika → sirovi članovi u lokalni JSON
- [ ] `A` **Skica sintetičkog projekta** u 4 `.md` fajla sa **dva planirana konflikta** i zapisanim gold vrednostima. PDF-ovi se generišu sutra

**ŠTA SE VEČERAS NE RADI**

- [ ] ⛔ **Ne kreira se takmičarski repo.** Nastaje sutra u 11:01
- [ ] ⛔ **Ne piše se nijedna linija `engine/`, `contracts/`, `convex/` ni `src/`**
- [ ] ⛔ **Ne kopira se `rules.py` nigde.** Sutra se piše iznova, pack-driven, sa gate-om
- [ ] ⛔ **Ne polira se nijedan spike.** Spike koji radi je odgovor, ne kod
- [ ] ⛔ **Posle 23:00 se ne kuca.** Sat sna sutra vredi tri sata debug-a

## 19 — Commands — Sve što ćemo sutra kucati

#### 11:00 · repo, labele, issue-i

```
gh repo create nalaznik --public --clone \
  --description "Pre-flight review dosije za glavni projekat zastite od pozara"
cd nalaznik

for L in "area:pipeline:0E8A16" "area:ui:1D76DB" "area:contract:D93F0B" \
         "gate:FBCA04" "needs-owner:5319E7" "cut:BFBFBF"; do
  gh label create "${L%:*}" --color "${L##*:}" --force
done

gh issue create -t "[11:20] contracts freeze: 6 shema + fixtures/dossier.sample.json" -l area:contract,gate
gh issue create -t "engine: models, pack, operators, evaluate, next_action, gate"     -l area:pipeline
gh issue create -t "pack fire_protection: slots, hints, rules, cross_rules"           -l area:pipeline
gh issue create -t "sandbox/ingest.py: PDF -> project_manifest + PNG"                 -l area:pipeline
gh issue create -t "[12:30] sandbox/judge.py + gate + prvi Fact iz pravog PDF-a"      -l area:pipeline,gate
gh issue create -t "kartograf -> document_map.json sa page_index"                     -l area:pipeline
gh issue create -t "ciljana ekstrakcija + verifikator sa rutiranjem"                  -l area:pipeline
gh issue create -t "evals: gold.yaml (24) + run_eval.py -> RESULTS.md"                -l area:pipeline

git checkout -b pipeline     # A
git checkout -b ui           # B
```

#### Convex i frontend · B

```
npm create vite@latest . -- --template react-ts
npm i convex @convex-dev/workflow
npx convex dev                       # ostavi da radi CEO DAN
npx convex env set ANTHROPIC_API_KEY 'sk-ant-…'
npx convex env set XAI_API_KEY 'xai-…'
npx convex env set DAYTONA_API_KEY '…'
npx convex env set DAYTONA_SNAPSHOT 'saglasnik-ingest-0.1'
npx convex env list                  # cetiri imena, bez vrednosti
npx convex logs                      # kad action tiho pukne
npx convex dashboard
VITE_DATA_SOURCE=mock npm run dev    # do 14:00
```

#### Daytona · A

```
daytona login
daytona snapshot create saglasnik-ingest-0.1 --dockerfile sandbox/Dockerfile
daytona snapshot list ; daytona list ; daytona delete <id>

# smoke test
python3 - <<'PY'
from daytona import Daytona
d = Daytona(); s = d.create()
print(s.process.code_run('print("Hello from Daytona")').result)
PY

# rucno pokretanje judge+gate u sandboxu
python3 - <<'PY'
from daytona import Daytona
d = Daytona(); s = d.create(snapshot="saglasnik-ingest-0.1")
s.fs.upload_file(open("fixtures/facts.sample.json","rb").read(), "/in/facts.json")
s.fs.upload_file(open("fixtures/document_map.sample.json","rb").read(), "/in/map.json")
print(s.process.code_run(
  'import subprocess;print(subprocess.run(["python3","/app/judge.py",'
  '"/in/facts.json","/in/map.json","/out/f.json","/out/i.json"],'
  'capture_output=True).stdout)').result)
print(s.fs.download_file("/out/i.json")[:400])
PY
```

#### Engine i evals · A, lokalno

```
python3 -m venv .venv && . .venv/bin/activate && pip install jsonschema pyyaml
python3 -m engine.cli fixtures/facts.sample.json fixtures/document_map.sample.json \
        /tmp/findings.json /tmp/integrity.json
python3 -m engine.tests.test_engine                  # mora biti sve zeleno
python3 evals/run_eval.py --pack domains/fire_protection \
        --gold domains/fire_protection/evals/gold.yaml --out evals/RESULTS.md
python3 scripts/pack_from_csv.py otac.csv domains/fire_protection/
python3 scripts/make_fixtures.py                     # .md -> 4 sinteticka PDF-a
```

#### API smoke testovi · kad ne znaš da li je API ili tvoj kod

```
# Anthropic — tekst se cita po TYPE, ne po indeksu
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" -d '{
    "model":"claude-opus-5","max_tokens":256,
    "output_config":{"format":{"type":"json_schema","schema":{
      "type":"object","additionalProperties":false,"required":["facts"],
      "properties":{"facts":{"type":"array","items":{
        "type":"object","additionalProperties":false,"required":["key","value"],
        "properties":{"key":{"enum":["visina_objekta_m"]},
                      "value":{"type":["number","null"]}}}}}}}},
    "messages":[{"role":"user","content":"Visina objekta je 14,5 m."}]
  }' | jq '.content[] | select(.type=="text") | .text'

# x.ai — additionalProperties je vec false po difoltu
curl -s https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $XAI_API_KEY" -H "content-type: application/json" -d '{
    "model":"grok-4.6",
    "response_format":{"type":"json_schema","json_schema":{"name":"extraction","schema":{
      "type":"object","required":["facts"],
      "properties":{"facts":{"type":"array","items":{
        "type":"object","required":["key","value"],
        "properties":{"key":{"enum":["visina_objekta_m"]},
                      "value":{"type":["number","null"]}}}}}}}},
    "messages":[{"role":"user","content":"Visina objekta je 14,5 m."}]
  }' | jq -r '.choices[0].message.content'
```

#### Deploy · B

```
netlify login ; netlify init
cat > netlify.toml <<'TOML'
[build]
  command = "npx convex deploy --cmd 'npm run build'"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
TOML
netlify env:set CONVEX_DEPLOY_KEY '…'    # Production deploy key iz Convex dashboarda
netlify deploy --prod
netlify deploy --dir=dist --prod         # FALLBACK: lokalni build, bez CI
netlify open:site
```

#### Git, secrets, status

```
bash scripts/secrets-scan.sh                      # pre svakog push-a
cp scripts/secrets-scan.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

git add -A && git commit -m "engine: dossier gate G1-G6" && git push -u origin pipeline
gh pr create --fill && gh pr merge --squash
git fetch origin && git merge origin/main         # obojica, cesto
git checkout origin/main -- package-lock.json && npm install   # lock konflikt

tail -20 docs/STATUS.md                           # agent cita SAMO ovo od drugog
git log -p | grep -nE 'sk-ant-|xai-|dtn_|fc-|PRIVATE KEY' || echo "cisto"

ffmpeg -i take2.mkv -ss 00:00:02 -t 00:02:55 -c:v libx264 -crf 23 -c:a aac demo.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 demo.mp4   # < 180
```

#### Definition of DONE · ako je svih deset zeleno, prestajemo da dodajemo

- [ ] `1` Javan repo, MIT, README sa dijagramom i poštenom pokrivenošću
- [ ] `2` Javni URL iz incognita bez logina, radi na telefonu na mobilnim podacima
- [ ] `3` Upload 4 PDF-a → **dosije** bez ijednog ručnog koraka, ispod 90 sekundi
- [ ] `4` U dosijeu vidljivi ≥1 CONFLICT, ≥1 FAIL, ≥1 MISSING, ≥1 PASS, ≥1 UNKNOWN
- [ ] `5` Klik na nalaz → dokument, strana, citat, račun i **sledeća radnja**
- [ ] `6` Engine i gate izvršeni u Daytoni; `sandboxId` i trajanje vidljivi u UI-u
- [ ] `7` `integrity.json` pokazuje 6/6 i to se vidi na ekranu
- [ ] `8` `evals/RESULTS.md` commitovan sa 7 brojeva izmerenih danas
- [ ] `9` Secrets scan čist; nula podataka o stvarnom klijentu u celoj git istoriji
- [ ] `10` Video ≤3 min playable iz incognita; submission predat u 17:50, ne u 19:55


---


### Izvori i granice


Nalaznik Runbook v2 · 11.09.2026 · zamenjuje v1 u celosti. Sintetizovano iz: spec v2, `istrazivanje-hakaton.md`, `2-sta-stvarno-pobedjuje.html`, prototipa `rules.py`/`schema_test.py`, i **analize stvarnog repoa [cc-crossbeam](https://github.com/mikeOnBreeze/cc-crossbeam)** (362 fajla: `progress.md`, 9 skillova, `server/src`, `frontend/`, `docs/learnings-agents-sdk.md`). Platformske činjenice provereno 11.09.2026 nad zvaničnim docs-ima: [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) · [multiagent orchestration](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration) · [permission policies](https://platform.claude.com/docs/en/managed-agents/permission-policies) · [outcomes](https://platform.claude.com/docs/en/managed-agents/define-outcomes) · [self-hosted sandboxes](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes) · [Opus 5](https://platform.claude.com/docs/en/models/opus-5/migration-guide) · [PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support) · [Convex Workflow](https://www.convex.dev/components/workflow) · [Convex + Netlify](https://docs.convex.dev/production/hosting/netlify) · [Daytona network limits](https://www.daytona.io/docs/en/network-limits) · [xAI structured outputs](https://docs.x.ai/docs/guides/structured-outputs). Pragovi u `domains/fire_protection/rules.yaml` nisu autoritativni dok ih licencirani inženjer zaštite od požara ne potpiše po pravilu. Procena krugova i troška je model, ne merenje. **Nalaznik nije saglasnost** i ne zamenjuje licenciranog projektanta ni pregled nadležnog organa — odlučuje licencirano lice po čl. 32 Zakona o zaštiti od požara.
