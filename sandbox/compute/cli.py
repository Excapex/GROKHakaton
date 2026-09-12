#!/usr/bin/env python3
"""Apply a ChangeSet JSON to copies. Originals are never overwritten.

  python3 sandbox/compute/cli.py apply \\
    --change-set cs.json --source doc_id=/path/file.docx --out /tmp/rev2 \\
    --revision-id rev_2
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sandbox.compute.apply import apply_changeset  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    ap = sub.add_parser("apply")
    ap.add_argument("--change-set", type=Path, required=True)
    ap.add_argument("--source", action="append", required=True, help="document_id=/abs/path")
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--revision-id", default="")
    args = p.parse_args()
    if args.cmd != "apply":
        return 2
    change_set = json.loads(args.change_set.read_text(encoding="utf-8"))
    sources: dict[str, Path] = {}
    for item in args.source:
        doc_id, path = item.split("=", 1)
        sources[doc_id] = Path(path).expanduser()
        if not sources[doc_id].is_file():
            print(f"nema izvora {sources[doc_id]}", file=sys.stderr)
            return 1
    result = apply_changeset(change_set, sources, args.out)
    if args.revision_id:
        prov_path = Path(result["provenance"])
        data = json.loads(prov_path.read_text(encoding="utf-8"))
        data["revision_id"] = args.revision_id
        prov_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
