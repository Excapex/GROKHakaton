#!/usr/bin/env python3
"""S13: applied finding becomes verified only when re-read no longer produces it."""
from __future__ import annotations

import copy
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.extract.pipeline import load_roles, run_extract  # noqa: E402
from engine.extract.slots import F_MARK  # noqa: E402
from engine.reread.compare import compare_revisions, judge_extract  # noqa: E402

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
    first = run_extract(docs)
    prev = judge_extract(first)
    if not any(f["id"] == "find_r1" and f["status"] == "fail" for f in prev):
        fail("rev1 R1 fail")

    # Simulate new revision: F60 rewritten to EI 60 on the gpzop page (new ingest, not cache).
    docs2 = copy.deepcopy(docs)
    page = docs2["gpzop"]["pages"][0]
    page["text"] = F_MARK.sub("EI 60", page["text"])
    docs2["gpzop"]["input_hash"] = "sha256:anon-extract-gpzop-rev2"
    second = run_extract(docs2)
    new = judge_extract(second)
    if any(f["id"] == "find_r1" and f["status"] == "fail" for f in new):
        fail("rev2 ne sme zadržati R1 fail posle novog čitanja")

    diff = compare_revisions(prev, new)
    if not any(v["id"] == "find_r1" for v in diff["verified"]):
        fail("R1 verified posle novog čitanja")
    if not any(s["id"] == "find_r4" for s in diff["still_open"]):
        fail("R4 ostaje otvoren")

    same_hash = compare_revisions(prev, prev)
    if same_hash["verified"]:
        fail("isti nalazi / isti hash ne smeju dati verified")

    print("evals/test_reread: OK", diff["note"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
