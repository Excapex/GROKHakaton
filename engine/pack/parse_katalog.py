#!/usr/bin/env python3
"""Katalog primedbi ZOP (.docx)  ->  domains/fire_protection/pack.v1.json

Katalog je generalizovan i oslobođen podataka o konkretnim predmetima, pa
IZLAZNI JSON sme u Git. .docx original NE SME — živi u lokalnom korpusu.

    export SAGLASNIK_KATALOG="/put/do/Katalog_primedbi_ZOP_2026 ... .docx"
    python3.12 engine/pack/parse_katalog.py

Izlaz je determinističan: isti ulaz -> isti JSON (stabilan redosled, sortirani
registri), da diff u PR-u bude čitljiv.
"""
from __future__ import annotations

import hashlib
import html
import json
import os
import re
import sys
import zipfile
from pathlib import Path

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
EXPECTED_TOTAL = 652
EXPECTED_PER_CHAPTER = {"I": 124, "II": 75, "III": 64, "IV": 72,
                        "V": 65, "VI": 71, "VII": 89, "VIII": 92}

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "domains" / "fire_protection" / "pack.v1.json"
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))
from engine.extract.apply_pack_slots import apply, slots_by_rule


def docx_text(path: Path) -> str:
    """Plain text iz .docx, bez spoljnih zavisnosti."""
    with zipfile.ZipFile(path) as z:
        parts = [n for n in z.namelist()
                 if re.fullmatch(r"word/(document|footnotes|endnotes)\d*\.xml", n)]
        chunks = []
        for name in sorted(parts):
            xml = z.read(name).decode("utf-8", "replace")
            xml = re.sub(r"</w:p>", "\n", xml)
            xml = re.sub(r"<w:tab[^>]*/>", "\t", xml)
            xml = re.sub(r"<w:br[^>]*/>", "\n", xml)
            xml = re.sub(r"<[^>]+>", "", xml)
            chunks.append(html.unescape(xml))
    text = "\n".join(chunks)
    text = re.sub(r"[ \t]+\n", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def normalise_snaga(raw: str) -> str:
    """'JAK uz tačnu primenljivost' -> USLOVNO_JAK. Sirov tekst se čuva."""
    r = raw.strip()
    upper = r.upper()
    if upper.startswith("USLOVNO"):
        return "USLOVNO_JAK"
    if "DOPUNITI" in upper:
        return "DOPUNITI"
    if upper.startswith("JAK"):
        # 'JAK uz proveru prelaznih odredaba' nije bezuslovan zahtev
        return "JAK" if upper == "JAK" else "USLOVNO_JAK"
    return "DOPUNITI"


STD_CODE = re.compile(
    r"\bSRPS(?:\s+(?:EN|CEN|HD|ISO|IEC))*(?:\s+[A-Z]{2,})*\s*"
    r"(?:TS|TR)?\s*\d{2,5}(?:[-–]\d+)*(?::\d{4})?", re.U)


ART_HEAD = re.compile(r"\bčl(?:\.|an(?:ovima|ova|u|om)?)\s*", re.U | re.I)
ART_TOKEN = re.compile(r"\d{1,3}[a-zč]?", re.U)


def parse_articles(osnov: str) -> list[str]:
    """'čl. 30 i 31', 'čl. 64 do 66', 'čl. 12, 17 i 23' -> svi članovi.

    Nepotpun spisak članova je netačan pravni osnov, a katalog na to izričito
    upozorava — zato se lista nastavlja kroz ',', 'i' i širi kroz 'do'.
    """
    found: list[str] = []
    for head in ART_HEAD.finditer(osnov):
        tail = osnov[head.end():]
        # Segment staje na nazivu propisa ili zagradi — dalje više nisu članovi.
        stop = re.search(r"\b(Zakona|Pravilnika|Uredbe|Statuta|Odluke)\b|[(„]", tail)
        seg = tail[: stop.start()] if stop else tail[:80]
        pos, prev, pending_range = 0, None, False
        while pos < len(seg):
            m = ART_TOKEN.match(seg, pos)
            if m:
                tok = m.group(0)
                if pending_range and prev is not None:
                    try:
                        a, b = int(re.sub(r"\D", "", prev)), int(re.sub(r"\D", "", tok))
                        if 0 < b - a <= 40:
                            found.extend(str(n) for n in range(a + 1, b))
                    except ValueError:
                        pass
                    pending_range = False
                found.append(tok)
                prev = tok
                pos = m.end()
                continue
            link = re.match(r"\s*(,|i|do|\u2013|-|stav\s*\d+|st\.\s*\d+|tač(?:ka|.)\s*\d+)\s*",
                            seg[pos:], re.I)
            if not link:
                break
            if link.group(1).lower() in ("do", "\u2013", "-"):
                pending_range = True
            if link.group(1).lower().startswith(("stav", "st.", "tač")):
                pass  # stav/tačka nisu članovi
            pos += link.end()
    seen, out = set(), []
    for a in found:
        if a not in seen:
            seen.add(a); out.append(a)
    return sorted(out, key=lambda x: (int(re.sub(r"\D", "", x) or 0), x))


GENERIC_OSNOV = re.compile(
    r"primenljivi|odgovarajući deo|poseban (tehnički )?propis|"
    r"usvojen[ai]|projektn[ai]|GPZOP|status u registru",
    re.I,
)
HAS_REGULATION = re.compile(r"čl\.|Pravilnik|Zakon|Uredb|Odluk|Statut", re.I)


def match_source_key(segment: str, sources: list[dict]) -> str | None:
    """Veži segment osnova na P01–P36. Standardi nisu source_key."""
    ranked = sorted(
        sources,
        key=lambda s: len(re.sub(r"\s*[\(„].*$", "", s["title"])),
        reverse=True,
    )
    for s in ranked:
        core = re.sub(r"\s*[\(„].*$", "", s["title"]).strip()
        if len(core) >= 20 and core in segment:
            return s["key"]
    hits = [s for s in sources if s.get("gazette") and s["gazette"] in segment]
    if len(hits) == 1:
        return hits[0]["key"]
    if len(hits) > 1:
        hits.sort(key=lambda s: -len(s["title"]))
        return hits[0]["key"]
    if "Zakona o zaštiti od požara" in segment or "Zakon o zaštiti od požara" in segment:
        return "P01"
    return None


def _add_source(order: list[str], buckets: dict[str, list[str]], key: str, arts: list[str]) -> None:
    if key not in buckets:
        buckets[key] = []
        order.append(key)
    for a in arts:
        if a not in buckets[key]:
            buckets[key].append(a)


def structured_osnov(osnov_raw: str, sources: list[dict]) -> dict:
    """RuleOsnov: raw + sources[]. Članovi ostaju u prozoru do sledećeg 'čl.',
    ali 'čl. 13 i čl. 29 Pravilnika X' se spaja jer prvi prozor nema propis."""
    standards = sorted({" ".join(s.split()) for s in STD_CODE.findall(osnov_raw)})
    order: list[str] = []
    buckets: dict[str, list[str]] = {}

    def consume_segment(seg: str) -> None:
        heads = list(ART_HEAD.finditer(seg))
        if not heads:
            if not HAS_REGULATION.search(seg):
                return
            if GENERIC_OSNOV.search(seg) and "Pravilnik" not in seg and "Zakon" not in seg:
                return
            key = match_source_key(seg, sources)
            if key:
                _add_source(order, buckets, key, parse_articles(seg))
            return
        buf = ""
        n = len(heads)
        for i, head in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < n else len(seg)
            buf += seg[head.start():end]
            if i + 1 < n:
                nxt_end = heads[i + 2].start() if i + 2 < n else len(seg)
                nxt = seg[heads[i + 1].start():nxt_end]
                if match_source_key(buf, sources) and match_source_key(nxt, sources):
                    _add_source(order, buckets, match_source_key(buf, sources), parse_articles(buf))
                    buf = ""
        if buf:
            key = match_source_key(buf, sources)
            if key:
                _add_source(order, buckets, key, parse_articles(buf))

    for seg in [s.strip() for s in osnov_raw.split(";") if s.strip()]:
        consume_segment(seg)

    linked = []
    for key in order:
        item: dict = {"source_key": key}
        if buckets[key]:
            item["articles"] = buckets[key]
        linked.append(item)
    return {"raw": osnov_raw, "sources": linked, "standards": standards}


def parse_rules(text: str, sources: list[dict]) -> list[dict]:
    """Svaka primedba: '<ID>  Primedba: …' + Osnov/Korekcija/Snaga."""
    # Telo kataloga počinje kod drugog pojavljivanja naslova poglavlja I.
    heads = [m.start() for m in re.finditer(r"^I\. ARHITEKTONSKO", text, re.M)]
    body = text[heads[-1]:] if heads else text

    pattern = re.compile(
        r"^(?P<id>(?:I|II|III|IV|V|VI|VII|VIII)-\d+)\s+"
        r"Primedba:\s*(?P<primedba>.*?)\n"
        r"Osnov:\s*(?P<osnov>.*?)\n"
        r"Korekcija:\s*(?P<korekcija>.*?)\n"
        r"Snaga:\s*(?P<snaga>.*?)$",
        re.M | re.S)

    section = ""
    rules: list[dict] = []
    seen: set[str] = set()

    # Pod-naslovi ('1. Požarni sektori i segmenti') daju `section`.
    marks = [(m.start(), m.group(1).strip())
             for m in re.finditer(r"^\d{1,2}\.\s+([^\n]{4,90})$", body, re.M)]

    for m in pattern.finditer(body):
        rid = m.group("id")
        if rid in seen:
            continue
        seen.add(rid)
        for pos, title in marks:
            if pos < m.start():
                section = title
            else:
                break
        osnov_raw = " ".join(m.group("osnov").split())
        snaga_raw = " ".join(m.group("snaga").split())
        rules.append({
            "id": rid,
            "chapter": rid.split("-")[0],
            "section": section,
            "primedba": " ".join(m.group("primedba").split()),
            "osnov": structured_osnov(osnov_raw, sources),
            "korekcija": " ".join(m.group("korekcija").split()),
            "snaga": normalise_snaga(snaga_raw),
            "snaga_raw": snaga_raw,
            # A popunjava za pravila koja ulaze u engine (vidi issue #7)
            "requires_slots": [],
            "status": "approved" if normalise_snaga(snaga_raw) == "JAK" else "draft",
        })
    return rules


def parse_sources(text: str) -> list[dict]:
    """Numerisan 'REGISTAR PROPISA KORIŠĆENIH U KATALOGU'."""
    m = re.search(r"REGISTAR PROPISA KORIŠĆENIH U KATALOGU(.*?)REGISTAR STANDARDA",
                  text, re.S)
    if not m:
        return []
    out = []
    for line in m.group(1).splitlines():
        line = line.strip()
        e = re.match(r"^(\d{1,2})\.\s+(.{10,})$", line)
        if not e:
            continue
        title = " ".join(e.group(2).split())
        gaz = re.search(r"[(„\"]([^)]*бр\.[^)]*)\)|\(([^)]*br\.[^)]*)\)", title)
        out.append({
            "key": f"P{int(e.group(1)):02d}",
            "title": title,
            "gazette": (gaz.group(1) or gaz.group(2)).strip() if gaz else "",
        })
    return out


def parse_standards(text: str) -> list[dict]:
    """'REGISTAR STANDARDA I NORMATIVNIH VEZA' -> tema + kodovi standarda."""
    m = re.search(r"REGISTAR STANDARDA I NORMATIVNIH VEZA(.*?)(?=^I\. ARHITEKTONSKO)",
                  text, re.S | re.M)
    if not m:
        return []
    block = m.group(1)
    topics = list(re.finditer(r"^(\d{1,2})\.\s+([^\n]{6,120})$", block, re.M))
    out = []
    for i, t in enumerate(topics):
        seg = block[t.end(): topics[i + 1].start() if i + 1 < len(topics) else len(block)]
        codes = sorted({" ".join(c.split()) for c in STD_CODE.findall(seg)})
        if not codes:
            continue
        out.append({
            "topic": " ".join(t.group(2).split()),
            "codes": codes,
            "binding": "direct" if "Neposredno" in seg else "indirect",
        })
    return out


def main() -> int:
    raw = os.environ.get("SAGLASNIK_KATALOG") or (sys.argv[1] if len(sys.argv) > 1 else "")
    if not raw:
        print("Postavi SAGLASNIK_KATALOG na .docx katalog (lokalni korpus, ne Git).",
              file=sys.stderr)
        return 2
    src = Path(raw).expanduser()
    if not src.is_file():
        print(f"Nema fajla: {src}", file=sys.stderr)
        return 2

    text = docx_text(src)
    sources = parse_sources(text)
    rules = parse_rules(text, sources)
    apply({"rules": rules}, slots_by_rule())
    standards = parse_standards(text)

    problems: list[str] = []
    if len(rules) != EXPECTED_TOTAL:
        problems.append(f"ukupno {len(rules)}, očekivano {EXPECTED_TOTAL}")
    per: dict[str, int] = {}
    for r in rules:
        per[r["chapter"]] = per.get(r["chapter"], 0) + 1
    for ch, n in EXPECTED_PER_CHAPTER.items():
        if per.get(ch, 0) != n:
            problems.append(f"poglavlje {ch}: {per.get(ch, 0)}, očekivano {n}")
    for r in rules:
        for f in ("primedba", "osnov", "korekcija", "snaga"):
            v = r["osnov"]["raw"] if f == "osnov" else r[f]
            if not str(v).strip():
                problems.append(f"{r['id']}: prazno polje {f}")

    pack = {
        "schema_version": "1",
        "id": "fire_protection",
        "version": "v1",
        "status": "draft",           # 'approved' tek posle stručne potvrde (otac)
        "title": "Zaštita od požara — katalog primedbi, izdanje 2026",
        "provenance": {
            "source_document": src.name,
            "source_sha256": hashlib.sha256(src.read_bytes()).hexdigest(),
            "note": ("Katalog je generalizovan i oslobođen podataka o konkretnim "
                     "predmetima. Original nije u Gitu."),
        },
        "applicability": {
            "note": ("Za svaki predmet prvo utvrditi datum i pravni režim građevinske "
                     "dozvole, namenu i kategoriju objekta, obim radova i merodavne "
                     "propise. Tek onda birati primedbu."),
        },
        "counts": {
            "total": len(rules),
            "per_chapter": {k: per.get(k, 0) for k in ROMAN},
            "per_snaga": {s: sum(1 for r in rules if r["snaga"] == s)
                          for s in ("JAK", "USLOVNO_JAK", "DOPUNITI")},
            "approved": sum(1 for r in rules if r["status"] == "approved"),
            "draft": sum(1 for r in rules if r["status"] == "draft"),
        },
        "source_registry": sources,
        "standards_registry": standards,
        "rules": rules,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(pack, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
                   encoding="utf-8")

    print(f"pack        -> {OUT.relative_to(REPO)}")
    print(f"primedbe    -> {len(rules)}/{EXPECTED_TOTAL}")
    print(f"po snazi    -> {pack['counts']['per_snaga']}")
    print(f"approved    -> {pack['counts']['approved']}  draft -> {pack['counts']['draft']}")
    print(f"propisi     -> {len(sources)}")
    print(f"standardi   -> {len(standards)} tema")
    if problems:
        print("\nPROBLEMI:", file=sys.stderr)
        for p in problems[:15]:
            print(f"  - {p}", file=sys.stderr)
        return 1
    print("\nvalidacija  -> OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
