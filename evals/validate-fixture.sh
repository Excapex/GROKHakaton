#!/usr/bin/env bash
# Validate S01 fixtures against JSON Schema (python3.12 + jsonschema).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
python3 -m jsonschema \
  -i "$root/evals/fixtures/dossier.valid.json" \
  "$root/contracts/jsonschema/dossier.schema.json"
python3 -m jsonschema \
  -i "$root/evals/fixtures/changeset.valid.json" \
  "$root/contracts/jsonschema/changeset.schema.json"
echo "evals/validate-fixture: OK dossier.valid.json changeset.valid.json"
