"""Run R1–R6 over ingest directories. Regex first; optional grok-4.6 for empty slots."""
from __future__ import annotations

import json
from pathlib import Path

from engine.extract.ingest_io import load_ingest_dir
from engine.extract.slots import (
    extract_r1,
    extract_r2,
    extract_r3,
    extract_r4,
    extract_r5,
    extract_r6,
    missing,
)

SLOT_MAP = json.loads((Path(__file__).with_name("slot_map.json")).read_text(encoding="utf-8"))


def _pairs_to_lists(pairs: list[tuple[dict, dict]]) -> tuple[list[dict], list[dict]]:
    obs, ev = [], []
    for o, e in pairs:
        obs.append(o)
        ev.append(e)
    return obs, ev


def run_extract(docs_by_role: dict[str, dict]) -> dict:
    all_docs = list(docs_by_role.values())
    observations: list[dict] = []
    evidence: list[dict] = []

    r1, e1 = _pairs_to_lists(extract_r1(all_docs))
    if r1:
        observations.extend(r1)
        evidence.extend(e1)
    else:
        observations.append(missing("fire_resistance_mark", all_docs, SLOT_MAP["R1"]["queries"]))

    r2, e2 = _pairs_to_lists(extract_r2(all_docs))
    if r2:
        observations.extend(r2)
        evidence.extend(e2)
    else:
        observations.append(missing("fire_resistance_standard", all_docs, SLOT_MAP["R2"]["queries"]))

    r3_roles = [docs_by_role[k] for k in ("gpzop", "arh") if k in docs_by_role] or all_docs
    r3, e3 = _pairs_to_lists(extract_r3(r3_roles))
    observations.extend(r3)
    evidence.extend(e3)
    hit_doc_ids = {ev["document_id"] for ev in e3}
    for doc in r3_roles:
        if doc["document_id"] not in hit_doc_ids:
            observations.append(
                missing(
                    "facade_insulation_material",
                    [doc],
                    SLOT_MAP["R3"]["queries"],
                    "facade.insulation",
                )
            )

    gpzop = docs_by_role.get("gpzop")
    predmer = docs_by_role.get("predmer")
    r4_hits, r4_miss = extract_r4(gpzop, predmer, SLOT_MAP["R4"]["queries"])
    h4, e4 = _pairs_to_lists(r4_hits)
    observations.extend(h4)
    evidence.extend(e4)
    observations.extend(r4_miss)

    r5_docs = [docs_by_role[k] for k in ("elektro", "gpzop") if k in docs_by_role] or all_docs
    r5, e5 = _pairs_to_lists(extract_r5(r5_docs))
    if r5:
        observations.extend(r5)
        evidence.extend(e5)
    else:
        observations.append(
            missing(
                "emergency_lighting_photometry",
                r5_docs,
                SLOT_MAP["R5"]["queries"],
                "emergency_lighting",
            )
        )

    r6, e6 = _pairs_to_lists(extract_r6(all_docs))
    if r6:
        observations.extend(r6)
        evidence.extend(e6)
    else:
        observations.append(missing("occupant_load_vs_area", all_docs, SLOT_MAP["R6"]["queries"]))

    return {
        "schema_version": "1.0.0",
        "slot_map": SLOT_MAP,
        "observations": observations,
        "evidence": evidence,
    }


def load_roles(role_dirs: dict[str, Path]) -> dict[str, dict]:
    return {role: load_ingest_dir(path) for role, path in role_dirs.items()}
