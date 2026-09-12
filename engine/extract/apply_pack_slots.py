#!/usr/bin/env python3
"""Copy slot_map requires_slots onto matching pack rules (S06 / issue #7)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / "domains/fire_protection/pack.v1.json"
SLOT_MAP = ROOT / "engine/extract/slot_map.json"


def slots_by_rule() -> dict[str, list[str]]:
    raw = json.loads(SLOT_MAP.read_text(encoding="utf-8"))
    out: dict[str, list[str]] = {}
    for spec in raw.values():
        for rid in spec["rule_ids"]:
            for slot in spec["slots"]:
                if slot not in out.setdefault(rid, []):
                    out[rid].append(slot)
    return out


def apply(pack: dict, mapping: dict[str, list[str]]) -> int:
    n = 0
    for rule in pack["rules"]:
        slots = mapping.get(rule["id"])
        if slots is None:
            continue
        if rule.get("requires_slots") != slots:
            rule["requires_slots"] = slots
            n += 1
    return n


def main() -> int:
    mapping = slots_by_rule()
    pack = json.loads(PACK.read_text(encoding="utf-8"))
    n = apply(pack, mapping)
    PACK.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"pack requires_slots: patched {n} rules ({len(mapping)} mapped)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
