#!/usr/bin/env python3
"""S06: R1–R6 over anon ingest fixtures. page_no must come from manifests."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.extract.apply_pack_slots import slots_by_rule  # noqa: E402
from engine.extract.pipeline import load_roles, run_extract  # noqa: E402

FIX = ROOT / "evals/fixtures/extract"


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    docs = load_roles(
        {
            "gpzop": FIX / "gpzop",
            "arh": FIX / "arh",
            "predmer": FIX / "predmer",
            "elektro": FIX / "elektro",
        }
    )
    result = run_extract(docs)
    obs = result["observations"]
    ev_by_id = {e["id"]: e for e in result["evidence"]}

    r1 = [o for o in obs if o["slot"] == "fire_resistance_mark" and o["value"] == "F60"]
    if not r1:
        fail("R1: očekivan F60")
    ev = ev_by_id[r1[0]["evidence_id"]]
    if ev["page_no"] != 1 or ev["document_id"] != "doc_anon_gpzop":
        fail("R1: page_no mora biti iz manifesta")

    r2 = [o for o in obs if o["slot"] == "fire_resistance_standard" and o["value"]]
    if not r2:
        fail("R2: očekivan EI uz 13501-1")

    r3 = [o for o in obs if o["slot"] == "facade_insulation_material" and o["value"]]
    values = {o["value"] for o in r3}
    docs_r3 = set()
    for o in r3:
        docs_r3.add(ev_by_id[o["evidence_id"]]["document_id"])
    if values != {"A1", "mineral_wool"} or len(docs_r3) != 2:
        fail("R3: po jedno opažanje iz GPZOP i arhitekture")

    r4_hit = [o for o in obs if o["slot"] == "gpzop_element_in_predmer" and o["value"]]
    r4_miss = [
        o
        for o in obs
        if o["slot"] == "gpzop_element_in_predmer" and o["value"] is None
    ]
    if not r4_hit or not r4_miss or "search_scope" not in r4_miss[0]:
        fail("R4: element iz GPZOP + search_scope na predmeru")
    if r4_miss[0]["search_scope"]["documents"] != ["doc_anon_predmer"]:
        fail("R4: obuhvat pretrage mora biti predmer")

    r5_miss = [
        o
        for o in obs
        if o["slot"] == "emergency_lighting_photometry" and o["value"] is None
    ]
    if not r5_miss or "search_scope" not in r5_miss[0]:
        fail("R5: fotometrija nedostaje uz search_scope, bez izmišljenog citata")

    r6 = [o for o in obs if o["slot"] == "occupant_load_vs_area" and o["value"]]
    if not r6 or "180" not in str(r6[0]["value"]):
        fail("R6: površina i lica")

    schema = json.loads(
        (ROOT / "contracts/jsonschema/dossier.schema.json").read_text(encoding="utf-8")
    )
    try:
        from jsonschema import Draft202012Validator
    except ImportError:
        print("evals/test_extract: SKIP jsonschema (nije instaliran)")
    else:
        obs_schema = {
            "$schema": schema["$schema"],
            "$defs": schema["$defs"],
            **schema["$defs"]["observation"],
        }
        v = Draft202012Validator(obs_schema)
        for o in obs:
            errors = list(v.iter_errors(o))
            if errors:
                fail(f"observation schema: {o['id']}: {errors[0].message}")

    pack = json.loads(
        (ROOT / "domains/fire_protection/pack.v1.json").read_text(encoding="utf-8")
    )
    by_id = {r["id"]: r for r in pack["rules"]}
    mapping = slots_by_rule()
    for rid, slots in mapping.items():
        if by_id[rid].get("requires_slots") != slots:
            fail(f"pack {rid} requires_slots nije popunjen")

    print("evals/test_extract: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
