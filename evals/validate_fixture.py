#!/usr/bin/env python3
"""Validate S01 fixtures with Draft202012Validator (jsonschema CLI is gone)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
except ImportError:
    print(
        "Nedostaje jsonschema. U korenu repoa:\n"
        "  python3 -m venv .venv && .venv/bin/pip install -r requirements.txt",
        file=sys.stderr,
    )
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
PAIRS = (
    (
        ROOT / "evals/fixtures/dossier.valid.json",
        ROOT / "contracts/jsonschema/dossier.schema.json",
    ),
    (
        ROOT / "evals/fixtures/changeset.valid.json",
        ROOT / "contracts/jsonschema/changeset.schema.json",
    ),
    (
        ROOT / "evals/fixtures/ingest/anon-two-page/manifest.json",
        ROOT / "contracts/jsonschema/document-manifest.schema.json",
    ),
    (
        ROOT / "evals/fixtures/extract/gpzop/manifest.json",
        ROOT / "contracts/jsonschema/document-manifest.schema.json",
    ),
    (
        ROOT / "evals/fixtures/extract/arh/manifest.json",
        ROOT / "contracts/jsonschema/document-manifest.schema.json",
    ),
)


def main() -> int:
    failed = 0
    for instance_path, schema_path in PAIRS:
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        instance = json.loads(instance_path.read_text(encoding="utf-8"))
        errors = sorted(
            Draft202012Validator(schema).iter_errors(instance),
            key=lambda e: list(e.path),
        )
        rel = instance_path.relative_to(ROOT)
        if errors:
            failed = 1
            print(f"FAIL {rel}")
            for err in errors:
                loc = "/".join(str(p) for p in err.path) or "(root)"
                print(f"  {loc}: {err.message}")
        else:
            print(f"OK {rel}")
    if failed:
        print("evals/validate_fixture: FAIL")
        return 1
    print("evals/validate_fixture: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
