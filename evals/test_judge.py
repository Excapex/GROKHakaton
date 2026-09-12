#!/usr/bin/env python3
"""S08: integrity gate + negative test (removed evidence => unknown, not PASS)."""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.extract.pipeline import load_roles, run_extract  # noqa: E402
from engine.judge.dossier import assemble  # noqa: E402
from engine.judge.gate import gate  # noqa: E402
from engine.judge.rules import judge, load_pack  # noqa: E402

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
    extracted = run_extract(docs)
    pack = load_pack()
    findings = judge(extracted["observations"], extracted["evidence"], pack)
    r1 = next(f for f in findings if f["id"] == "find_r1")
    if r1["status"] != "fail":
        fail(f"R1 sa dokazom treba fail, dobijeno {r1['status']}")
    r3 = next(f for f in findings if f["id"] == "find_r3")
    if r3["status"] != "conflict" or len(r3["observation_ids"]) < 2:
        fail("R3 konflikt zahteva dva opažanja")
    r5 = next(f for f in findings if f["id"] == "find_r5")
    if r5["status"] != "unknown":
        fail("R5 odsustvo je unknown, ne FAIL")

    stripped = copy.deepcopy(extracted)
    stripped["evidence"] = []
    findings2 = judge(stripped["observations"], stripped["evidence"], pack)
    r1b = next(f for f in findings2 if f["id"] == "find_r1")
    if r1b["status"] != "unknown":
        fail("negativan test: uklonjen dokaz mora dati unknown, ne PASS/FAIL")
    if r1b["status"] == "pass":
        fail("PASS zabranjen")

    report = gate(stripped["observations"], stripped["evidence"], findings2)
    if not report["positive_without_evidence"]:
        fail("gate mora prijaviti positive_without_evidence")
    if report["ok"]:
        fail("gate.ok mora biti false bez dokaza")

    built = assemble(extracted, docs, project_id="proj_anon", revision_id="rev_extract")
    run = built["review_run"]
    for key in ("pack_version", "model_config_hash", "prompt_version", "input_hashes", "revision_id"):
        if not run.get(key):
            fail(f"ReviewRun.{key}")
    dossier = built["dossier"]
    schema = json.loads((ROOT / "contracts/jsonschema/dossier.schema.json").read_text(encoding="utf-8"))
    try:
        from jsonschema import Draft202012Validator
    except ImportError:
        print("evals/test_judge: SKIP jsonschema")
    else:
        errors = list(Draft202012Validator(schema).iter_errors(dossier))
        if errors:
            fail("dossier schema: " + errors[0].message)

    print("evals/test_judge: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
