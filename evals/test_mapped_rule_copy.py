#!/usr/bin/env python3
"""mappedRuleCopy.ts fields match pack.v1.json verbatim."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK = json.loads((ROOT / "domains/fire_protection/pack.v1.json").read_text(encoding="utf-8"))
TS = (ROOT / "convex/lib/perception/mappedRuleCopy.ts").read_text(encoding="utf-8")
MAPPED = ["I-35", "VII-75", "I-87", "VII-31", "VII-82", "II-34", "I-61", "I-62"]


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def parse_rules() -> dict[str, dict]:
    block = TS.split("const RULES: Record<string, MappedRuleCopy> = {", 1)[1]
    block = block.split("};", 1)[0]
    out: dict[str, dict] = {}
    for match in re.finditer(r'"((?:I|II|VII)-\d+)": (\{.*?\})', block):
        out[match.group(1)] = json.loads(match.group(2))
    return out


def main() -> int:
    if "RULES[id] ?? null" not in TS:
        fail("nepoznato pravilo mora vratiti null")
    if "IX-999" in TS:
        fail("nepoznato pravilo ne sme biti u rečniku")
    by_id = {row["id"]: row for row in PACK["rules"]}
    copied = parse_rules()
    for rid in MAPPED:
        src = by_id[rid]
        row = copied.get(rid)
        if row is None:
            fail(f"nema {rid} u mappedRuleCopy.ts")
        expected = {
            "id": src["id"],
            "chapter": src["chapter"],
            "section": src["section"],
            "primedba": src["primedba"],
            "osnov_raw": (src.get("osnov") or {}).get("raw") or "",
            "korekcija": src["korekcija"],
        }
        if row != expected:
            fail(f"{rid} nije identičan packu")
    print("evals/test_mapped_rule_copy: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
