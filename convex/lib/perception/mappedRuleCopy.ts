/** Generated from domains/fire_protection/pack.v1.json — do not paraphrase.
 *  Regeneriši: python3 engine/pack/export_mapped_rules.py
 */
import { MAPPED_RULES } from "./types.ts";

export type MappedRuleCopy = {
  id: string;
  chapter: string;
  section: string;
  primedba: string;
  osnov_raw: string;
  korekcija: string;
};

const RULES: Record<string, MappedRuleCopy> = {
  "I-35": {"id": "I-35", "chapter": "I", "section": "Stepen otpornosti konstrukcije i otpornost elemenata prema požaru", "primedba": "Koristi se povučena ili nepostojeća oznaka otpornosti (F30, F60, F90, oznake starih JUS/SRPS standarda) kao jedini zahtev.", "osnov_raw": "SRPS EN 13501-2; Pravilnika o načinu iskazivanja performansi građevinskih proizvoda i elemenata zgrade u vezi sa reakcijom na požar, otpornošću na požar i ponašanjem pri spoljašnjem požaru („Sl. glasnik RS\", br. 21/2022, 8/2024 i 16/2026); čl. 4 st. 1 tač. 6 i čl. 30 Zakona o zaštiti od požara („Sl. glasnik RS\", br. 111/2009, 20/2015, 87/2018 i 87/2018 – dr. zakoni).", "korekcija": "Zahtev iskazati klasom prema važećem sistemu klasifikacije i kriterijumu koji odgovara funkciji elementa."},
  "VII-75": {"id": "VII-75", "chapter": "VII", "section": "Terminologija i preciznost zahteva", "primedba": "Koristi se oznaka F30, F60 ili F90 kao jedini zahtev otpornosti prema požaru.", "osnov_raw": "SRPS EN 13501-2; Pravilnika o načinu iskazivanja performansi građevinskih proizvoda i elemenata zgrade u vezi sa reakcijom na požar, otpornošću na požar i ponašanjem pri spoljašnjem požaru („Sl. glasnik RS\", br. 21/2022, 8/2024 i 16/2026).", "korekcija": "Zameniti odgovarajućim kriterijumom R, REI, EI ili EW i vremenom, prema funkciji elementa."},
  "I-87": {"id": "I-87", "chapter": "I", "section": "Fasade, ETICS i krovovi", "primedba": "Nisu definisane klase reakcije na požar svih bitnih slojeva fasadnog sistema, uključujući termoizolacioni i završni sloj.", "osnov_raw": "čl. 7, 7a i 7b Pravilnika o tehničkim zahtevima bezbednosti od požara spoljnih zidova zgrada („Sl. glasnik RS\", br. 59/2016, 36/2017 i 6/2019); SRPS EN 13501-1; Pravilnika o načinu iskazivanja performansi građevinskih proizvoda i elemenata zgrade u vezi sa reakcijom na požar, otpornošću na požar i ponašanjem pri spoljašnjem požaru („Sl. glasnik RS\", br. 21/2022, 8/2024 i 16/2026).", "korekcija": "U tehničkom opisu, detaljima i predmeru navesti zahtevane klase sistema i komponenti."},
  "VII-31": {"id": "VII-31", "chapter": "VII", "section": "Međusobna usaglašenost projekata i usaglašenost sa GPZOP", "primedba": "Element ili sistem predviđen GPZOP (agregat, detekcija gasa, kupole, premazi, hidrantska mreža, klapne, lift, rezervoar, paneli) nije obrađen u projektima za izvođenje ni u predmeru.", "osnov_raw": "čl. 18, 65 i 70 Pravilnika o sadržini, načinu i postupku izrade i načinu vršenja kontrole tehničke dokumentacije prema klasi i nameni objekata („Sl. glasnik RS\", br. 96/2023).", "korekcija": "Uneti meru u projekat odgovarajuće struke i u predmer."},
  "VII-82": {"id": "VII-82", "chapter": "VII", "section": "Predmer i predračun", "primedba": "Mera zaštite navedena u tekstu projekta izostavljena je iz predmera i predračuna.", "osnov_raw": "čl. 65 i 70 Pravilnika o sadržini, načinu i postupku izrade i načinu vršenja kontrole tehničke dokumentacije prema klasi i nameni objekata („Sl. glasnik RS\", br. 96/2023); čl. 31 Zakona o zaštiti od požara („Sl. glasnik RS\", br. 111/2009, 20/2015, 87/2018 i 87/2018 – dr. zakoni).", "korekcija": "Uneti stavku sa svim performansama i količinama."},
  "II-34": {"id": "II-34", "chapter": "II", "section": "Osvetljenje puteva evakuacije u hitnim slučajevima", "primedba": "Nije priložen fotometrijski proračun, pa se ne može proveriti ostvarena osvetljenost puteva evakuacije, znakova i otvorenih prostora.", "osnov_raw": "čl. 50 Pravilnika o tehničkim normativima za zaštitu od požara stambenih i poslovnih objekata i objekata javne namene („Sl. glasnik RS\", br. 22/2019); SRPS EN 1838, SRPS EN 50172 i SRPS EN IEC 60598-2-22 (važeća izdanja); čl. 65 Pravilnika o sadržini, načinu i postupku izrade i načinu vršenja kontrole tehničke dokumentacije prema klasi i nameni objekata („Sl. glasnik RS\", br. 96/2023).", "korekcija": "Priložiti proračun na nivou poda za sve trase i prostore obuhvaćene zahtevom."},
  "I-61": {"id": "I-61", "chapter": "I", "section": "Evakuacija, broj lica i evakuacioni putevi", "primedba": "Iz predmera (broj stolica, oprema sale) proizlazi da prostor nema fiksna sedišta, a broj lica je određen kao za prostor sa fiksnim sedištima.", "osnov_raw": "čl. 9 Pravilnika o tehničkim normativima za zaštitu od požara stambenih i poslovnih objekata i objekata javne namene („Sl. glasnik RS\", br. 22/2019); čl. 31 Zakona o zaštiti od požara („Sl. glasnik RS\", br. 111/2009, 20/2015, 87/2018 i 87/2018 – dr. zakoni).", "korekcija": "Uskladiti obračun broja lica sa stvarnom opremom prostora prikazanom u predmeru."},
  "I-62": {"id": "I-62", "chapter": "I", "section": "Evakuacija, broj lica i evakuacioni putevi", "primedba": "Nije izvršen proračun evakuacije, ili nije obuhvaćen ceo objekat (podrum, garaža, tribine, potkrovlje).", "osnov_raw": "čl. 38, 39 i 40 Pravilnika o tehničkim normativima za zaštitu od požara stambenih i poslovnih objekata i objekata javne namene („Sl. glasnik RS\", br. 22/2019); čl. 31 Zakona o zaštiti od požara („Sl. glasnik RS\", br. 111/2009, 20/2015, 87/2018 i 87/2018 – dr. zakoni).", "korekcija": "Sprovesti proračun za sve prostore i sve etape evakuacije."},
};

export function mappedRuleCopy(id: string): MappedRuleCopy | null {
  return RULES[id] ?? null;
}

export function mappedRuleCopies(): MappedRuleCopy[] {
  return MAPPED_RULES.map((id) => RULES[id]).filter(
    (row): row is MappedRuleCopy => row !== undefined,
  );
}
