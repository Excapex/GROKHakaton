#!/usr/bin/env python3
"""Full extract→judge pipeline writes a schema-valid dossier (anon fixtures)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.judge.dossier import run_dirs  # noqa: E402

try:
    from jsonschema import Draft202012Validator
except ImportError:
    Draft202012Validator = None  # type: ignore[misc, assignment]

FIX = ROOT / "evals/fixtures/extract"
OUT = ROOT / "evals/fixtures/dossier.engine.json"
SCHEMA = ROOT / "contracts/jsonschema/dossier.schema.json"


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    result = run_dirs(
        {
            "gpzop": FIX / "gpzop",
            "arh": FIX / "arh",
            "predmer": FIX / "predmer",
            "elektro": FIX / "elektro",
        }
    )
    dossier = result["dossier"]
    if not any(f["id"] == "find_r3" and f["status"] == "conflict" for f in dossier["findings"]):
        fail("očekivan R3 conflict")
    if not any(f["id"] == "find_r1" and f["status"] == "fail" for f in dossier["findings"]):
        fail("očekivan R1 fail")
    if any(f["status"] == "pass" for f in dossier["findings"]):
        fail("anon fixture ne sme da proizvede PASS")
    if "change_set" not in result:
        fail("R1 fail treba ChangeSet plan (ne UI apply)")
    OUT.write_text(json.dumps(dossier, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if Draft202012Validator is None:
        print("evals/test_pipeline: SKIP schema (nema jsonschema), dossier upisan")
        return 0
    errors = sorted(Draft202012Validator(json.loads(SCHEMA.read_text(encoding="utf-8"))).iter_errors(dossier), key=lambda e: list(e.path))
    if errors:
        for err in errors:
            loc = "/".join(str(p) for p in err.path) or "(root)"
            print(f"  {loc}: {err.message}", file=sys.stderr)
        fail("dossier.engine.json ne prolazi jsonschema")
    print("evals/test_pipeline: OK", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
