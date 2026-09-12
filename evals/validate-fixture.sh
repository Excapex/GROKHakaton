#!/usr/bin/env bash
# Validate S01 fixtures. jsonschema CLI (python -m jsonschema) je uklonjen;
# koristi se Draft202012Validator. Python zavisnost: requirements.txt
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
if [ -x "$root/.venv/bin/python" ]; then
  py="$root/.venv/bin/python"
else
  py="${PYTHON:-python3}"
fi
if ! "$py" -c "import jsonschema" 2>/dev/null; then
  echo "Nedostaje jsonschema za: $py" >&2
  echo "  python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
  exit 1
fi
"$py" "$root/evals/validate_fixture.py"
"$py" "$root/evals/test_extract.py"
"$py" "$root/evals/test_verify.py"
exec "$py" "$root/evals/test_judge.py"
