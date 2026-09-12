#!/usr/bin/env python3
"""Drugi prolaz nad ingest+extract. Ne prima value iz S06.

  python3 engine/verify/run.py --role gpzop=DIR --out artifacts-local/verify.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from engine.verify.compare import verify_dirs  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--role", action="append", required=True, metavar="ROLE=DIR")
    p.add_argument("--out", type=Path)
    args = p.parse_args()
    role_dirs = {}
    for item in args.role:
        role, raw = item.split("=", 1)
        role_dirs[role] = Path(raw).expanduser()
    result = verify_dirs(role_dirs)
    v = result["verification"]
    text = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    print(
        f"verify: sent={v['sent_to_second_pass']} disagreed={v['disagreed']}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
