"""Deterministic slot extractors. page_no always comes from the ingest manifest."""
from __future__ import annotations

import hashlib
import re
from typing import Any

SCHEMA = "1.0.0"

F_MARK = re.compile(r"\bF\s*(30|60|90)\b", re.I)
EI_ON_13501_1 = re.compile(
    r"\b(?:EI|REI)\s*[-/]?\s*\d{2,3}\b.{0,80}13501-1",
    re.I | re.S,
)
FACADE_A1 = re.compile(r"\bA1\b.{0,40}(fasad|oblog|izolac)|(fasad|oblog|izolac).{0,40}\bA1\b", re.I | re.S)
FACADE_WOOL = re.compile(r"mineraln\w*\s+vun", re.I)
PHOTO = re.compile(r"fotometrijsk", re.I)
EN1838 = re.compile(r"\b(?:SRPS\s+)?EN\s*1838\b|\b1838\b", re.I)
AREA_M2 = re.compile(r"(\d{2,4})\s*(?:m2|m²)", re.I)
PEOPLE = re.compile(r"(\d{2,4})\s*(?:ljudi|lica|osoba)", re.I)
GPZOP_ELEMENT = re.compile(
    r"protivpožarn\w*\s+vrat\w*(?:\s+[A-Za-z]-?\d+)?|\bD-\d+\b",
    re.I,
)


def _sid(*parts: Any) -> str:
    h = hashlib.sha256("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()[:10]
    return h


def _obs(
    *,
    slot: str,
    value: str | int | None,
    unit: str | None,
    element_id: str,
    doc: dict,
    page: dict,
    excerpt: str,
) -> tuple[dict, dict]:
    hid = _sid(slot, doc["document_id"], page["page_no"], value)
    evidence_id = f"ev_{hid}"
    evidence = {
        "schema_version": SCHEMA,
        "id": evidence_id,
        "document_id": doc["document_id"],
        "revision_id": doc["revision_id"],
        "page_no": page["page_no"],
        "excerpt": excerpt.strip()[:240],
        "artifact_id": page.get("render_artifact"),
        "input_hash": doc["input_hash"],
    }
    if page.get("region"):
        evidence["region"] = page["region"]
    observation = {
        "schema_version": SCHEMA,
        "id": f"obs_{hid}",
        "slot": slot,
        "value": value,
        "element_id": element_id,
        "evidence_id": evidence_id,
    }
    if unit is not None:
        observation["unit"] = unit
    return observation, evidence


def missing(slot: str, docs: list[dict], queries: list[str], element_id: str | None = None) -> dict:
    """Absence: documented search_scope, value null, no invented quote."""
    hid = _sid("missing", slot, *(d["document_id"] for d in docs))
    pages = sorted({p["page_no"] for d in docs for p in d["pages"]})
    obs: dict[str, Any] = {
        "schema_version": SCHEMA,
        "id": f"obs_{hid}",
        "slot": slot,
        "value": None,
        "evidence_id": f"ev_{hid}",
        "search_scope": {
            "documents": [d["document_id"] for d in docs],
            "pages": pages,
            "queries": queries,
        },
        "confidence_note": "Nije nađeno u obuhvatu pretrage; nije izmišljen citat.",
    }
    if element_id:
        obs["element_id"] = element_id
    return obs


def extract_r1(docs: list[dict]) -> list[tuple[dict, dict]]:
    out: list[tuple[dict, dict]] = []
    for doc in docs:
        for page in doc["pages"]:
            for m in F_MARK.finditer(page["text"]):
                mark = "F" + m.group(1)
                start = max(0, m.start() - 40)
                out.append(
                    _obs(
                        slot="fire_resistance_mark",
                        value=mark,
                        unit="class",
                        element_id="element.unspecified",
                        doc=doc,
                        page=page,
                        excerpt=page["text"][start : m.end() + 40],
                    )
                )
    return out


def extract_r2(docs: list[dict]) -> list[tuple[dict, dict]]:
    out: list[tuple[dict, dict]] = []
    for doc in docs:
        for page in doc["pages"]:
            for m in EI_ON_13501_1.finditer(page["text"]):
                out.append(
                    _obs(
                        slot="fire_resistance_standard",
                        value="EI cited against SRPS EN 13501-1",
                        unit=None,
                        element_id="element.unspecified",
                        doc=doc,
                        page=page,
                        excerpt=m.group(0)[:240],
                    )
                )
    return out


def extract_r3(docs: list[dict]) -> list[tuple[dict, dict]]:
    """At most one observation per document when that document states a facade material."""
    out: list[tuple[dict, dict]] = []
    for doc in docs:
        found = None
        for page in doc["pages"]:
            if FACADE_A1.search(page["text"]):
                found = _obs(
                    slot="facade_insulation_material",
                    value="A1",
                    unit="reaction_to_fire",
                    element_id="facade.insulation",
                    doc=doc,
                    page=page,
                    excerpt="A1",
                )
                break
            wool = FACADE_WOOL.search(page["text"])
            if wool:
                found = _obs(
                    slot="facade_insulation_material",
                    value="mineral_wool",
                    unit="material",
                    element_id="facade.insulation",
                    doc=doc,
                    page=page,
                    excerpt=wool.group(0),
                )
                break
        if found:
            out.append(found)
    return out


def extract_r4(gpzop: dict | None, predmer: dict | None, queries: list[str]) -> tuple[list[tuple[dict, dict]], list[dict]]:
    hits: list[tuple[dict, dict]] = []
    absences: list[dict] = []
    if not gpzop or not predmer:
        docs = [d for d in (gpzop, predmer) if d]
        if docs:
            absences.append(missing("gpzop_element_in_predmer", docs, queries, "element.gpzop"))
        return hits, absences

    predmer_text = "\n".join(p["text"] for p in predmer["pages"])
    seen: set[str] = set()
    for page in gpzop["pages"]:
        for m in GPZOP_ELEMENT.finditer(page["text"]):
            token = re.sub(r"\s+", " ", m.group(0)).strip()
            key = token.lower()
            if key in seen:
                continue
            seen.add(key)
            start = max(0, m.start() - 20)
            hits.append(
                _obs(
                    slot="gpzop_element_in_predmer",
                    value=token,
                    unit=None,
                    element_id="element.gpzop",
                    doc=gpzop,
                    page=page,
                    excerpt=page["text"][start : m.end() + 20],
                )
            )
            if not re.search(re.escape(token), predmer_text, re.I):
                absences.append(
                    missing(
                        "gpzop_element_in_predmer",
                        [predmer],
                        [*queries, token],
                        "element.gpzop",
                    )
                )
    if not hits:
        absences.append(missing("gpzop_element_in_predmer", [gpzop, predmer], queries, "element.gpzop"))
    return hits, absences


def extract_r5(docs: list[dict]) -> list[tuple[dict, dict]]:
    out: list[tuple[dict, dict]] = []
    for doc in docs:
        for page in doc["pages"]:
            if PHOTO.search(page["text"]) or EN1838.search(page["text"]):
                out.append(
                    _obs(
                        slot="emergency_lighting_photometry",
                        value="present",
                        unit=None,
                        element_id="emergency_lighting",
                        doc=doc,
                        page=page,
                        excerpt=page["text"][:200],
                    )
                )
    return out


def extract_r6(docs: list[dict]) -> list[tuple[dict, dict]]:
    out: list[tuple[dict, dict]] = []
    for doc in docs:
        for page in doc["pages"]:
            area = AREA_M2.search(page["text"])
            people = PEOPLE.search(page["text"])
            if not area:
                continue
            people_n = people.group(1) if people else "?"
            out.append(
                _obs(
                    slot="occupant_load_vs_area",
                    value=f"{area.group(1)} m2 / {people_n} lica",
                    unit="m2",
                    element_id="space.unspecified",
                    doc=doc,
                    page=page,
                    excerpt=page["text"][max(0, area.start() - 20) : area.end() + 40],
                )
            )
    return out
