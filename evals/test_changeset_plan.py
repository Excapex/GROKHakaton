#!/usr/bin/env python3
"""S11: related patches + stale hash rejection. DWG is design_task."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.changeset.plan import StaleSourceError, plan_r1, apply_if_fresh  # noqa: E402


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    cs = plan_r1(
        gpzop_id="doc_anon_gpzop",
        gpzop_hash="sha256:anon-extract-gpzop",
        predmer_id="doc_anon_predmer",
        predmer_hash="sha256:anon-extract-predmer",
        dwg_id="doc_anon_arh_dwg",
        from_mark="F60",
    )
    if len(cs["patches"]) < 2:
        fail("R1 mora dirati opis i predmer")
    formats = {p["format"] for p in cs["patches"]}
    if formats != {"docx", "xlsx"}:
        fail("docx+xlsx")
    if not any(t["reason"] == "unsupported_format" for t in cs["design_tasks"]):
        fail("DWG design_task")
    schema = json.loads((ROOT / "contracts/jsonschema/changeset.schema.json").read_text(encoding="utf-8"))
    try:
        from jsonschema import Draft202012Validator
    except ImportError:
        print("skip schema")
    else:
        errs = list(Draft202012Validator(schema).iter_errors(cs))
        if errs:
            fail(errs[0].message)

    fresh = {
        "doc_anon_gpzop": "sha256:anon-extract-gpzop",
        "doc_anon_predmer": "sha256:anon-extract-predmer",
    }
    applied = apply_if_fresh(cs, fresh)
    if applied["lifecycle"] != "applied":
        fail("fresh apply")
    try:
        apply_if_fresh(cs, {**fresh, "doc_anon_gpzop": "sha256:changed"})
        fail("stale hash must reject")
    except StaleSourceError:
        pass
    print("evals/test_changeset_plan: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
