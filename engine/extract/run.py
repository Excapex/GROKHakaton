#!/usr/bin/env python3
"""Ciljana ekstrakcija R1–R6 nad ingest izlazom (manifest.json + pages/*.txt).

  python3 engine/extract/run.py --role gpzop=/path/to/ingest-out --role arh=/path

Izlaz ide na stdout ili --out (drži van Gita, npr. artifacts-local/).
Privatni PDF-ovi se ne čitaju ovde — prvo ingest, pa ovaj korak nad tekstom strana.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from engine.extract.pipeline import load_roles, run_extract  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--role",
        action="append",
        required=True,
        metavar="ROLE=DIR",
        help="uloga=putanja ingest izlaza (gpzop, arh, predmer, elektro)",
    )
    parser.add_argument("--out", type=Path, help="JSON izlaz (podrazumevano stdout)")
    args = parser.parse_args()
    role_dirs: dict[str, Path] = {}
    for item in args.role:
        if "=" not in item:
            print("Očekivano ROLE=DIR", file=sys.stderr)
            return 2
        role, raw = item.split("=", 1)
        path = Path(raw).expanduser()
        if not (path / "manifest.json").is_file():
            print(f"Nema manifest.json u {path}", file=sys.stderr)
            return 2
        role_dirs[role] = path
    result = run_extract(load_roles(role_dirs))
    text = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    print(
        f"extract: {len(result['observations'])} observations, {len(result['evidence'])} evidence",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
