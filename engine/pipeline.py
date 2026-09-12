#!/usr/bin/env python3
"""Jedna komanda: extract → verify → judge. Izlaz JSON (drži u artifacts-local/)."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from engine.judge.dossier import run_dirs  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--role", action="append", required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--revision-id", default="rev_extract")
    args = p.parse_args()
    roles = {}
    for item in args.role:
        k, v = item.split("=", 1)
        roles[k] = Path(v).expanduser()
    result = run_dirs(roles, revision_id=args.revision_id)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    d = result["dossier"]
    print(
        f"pipeline: findings={len(d['findings'])} integrity_ok={d['integrity_report']['ok']} -> {args.out}",
        file=sys.stderr,
    )
    return 0 if d["integrity_report"]["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
