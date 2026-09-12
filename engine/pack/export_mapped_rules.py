#!/usr/bin/env python3
"""Slice MAPPED_RULES copy out of pack.v1.json. Do not paraphrase."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / "domains/fire_protection/pack.v1.json"
OUT = ROOT / "convex/lib/perception/mappedRuleCopy.ts"
MAPPED = ["I-35", "VII-75", "I-87", "VII-31", "VII-82", "II-34", "I-61", "I-62"]


def main() -> int:
    pack = json.loads(PACK.read_text(encoding="utf-8"))
    by_id = {row["id"]: row for row in pack["rules"]}
    rows = []
    for rid in MAPPED:
        rule = by_id.get(rid)
        if rule is None:
            print(f"nema {rid} u packu", file=sys.stderr)
            return 1
        osnov = rule.get("osnov") or {}
        rows.append(
            {
                "id": rule["id"],
                "chapter": rule["chapter"],
                "section": rule["section"],
                "primedba": rule["primedba"],
                "osnov_raw": osnov.get("raw") or "",
                "korekcija": rule["korekcija"],
            }
        )
    lines = [
        "/** Generated from domains/fire_protection/pack.v1.json — do not paraphrase.",
        " *  Regeneriši: python3 engine/pack/export_mapped_rules.py",
        " */",
        'import { MAPPED_RULES } from "./types.ts";',
        "",
        "export type MappedRuleCopy = {",
        "  id: string;",
        "  chapter: string;",
        "  section: string;",
        "  primedba: string;",
        "  osnov_raw: string;",
        "  korekcija: string;",
        "};",
        "",
        "const RULES: Record<string, MappedRuleCopy> = {",
    ]
    for row in rows:
        lines.append(f"  {json.dumps(row['id'])}: {json.dumps(row, ensure_ascii=False)},")
    lines.extend(
        [
            "};",
            "",
            "export function mappedRuleCopy(id: string): MappedRuleCopy | null {",
            "  return RULES[id] ?? null;",
            "}",
            "",
            "export function mappedRuleCopies(): MappedRuleCopy[] {",
            "  return MAPPED_RULES.map((id) => RULES[id]).filter(",
            "    (row): row is MappedRuleCopy => row !== undefined,",
            "  );",
            "}",
            "",
        ]
    )
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUT} ({len(rows)} rules)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
