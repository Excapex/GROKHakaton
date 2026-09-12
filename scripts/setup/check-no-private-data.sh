#!/usr/bin/env bash
# Guard: odbija commit ako staged sadržaj izgleda kao privatni korpus,
# licenciran standard, CAD izvor ili naziv stvarnog predmeta.
#   bash scripts/setup/check-no-private-data.sh
set -uo pipefail
export LC_ALL=${LC_ALL:-en_US.UTF-8}   # multibajtni znakovi u regexu

# Nazivi stvarnih predmeta se NE drže u repou — lista je lokalna.
CASE_FILE="$(dirname "$0")/cases.local.txt"
if [ -f "$CASE_FILE" ]; then
  CASES=$(grep -vE '^[[:space:]]*(#|$)' "$CASE_FILE" | paste -sd'|' -)
else
  CASES=''
  echo "check-no-private-data: NAPOMENA — nema $CASE_FILE, provera naziva predmeta je preskocena."
  echo "  cp scripts/setup/cases.example.txt scripts/setup/cases.local.txt"
fi

staged=$(git diff --cached --name-only)
[ -z "$staged" ] && { echo "check-no-private-data: nema staged fajlova."; exit 0; }

fail=0
flag() { printf '  BLOKIRANO: %s — %s\n' "$1" "$2"; fail=1; }

while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    *.dwg|*.DWG|*.dwfx|*.DWFX) flag "$f" "CAD izvor ostaje lokalno (vodi se kao design_task)" ;;
  esac
  # Putanje: matchuje se SEGMENT staze, ne podstring imena fajla.
  if printf '%s' "/$f" | grep -qE '/(private-data|local-corpus|standardi|propisi|za sergeja|neki bitni standardi|izgradnja zakoni i pravlinici)/'; then
    flag "$f" "privatni korpus ili licenciran standard"
  fi
  # Naziv predmeta u imenu fajla.
  if [ -n "$CASES" ] && printf '%s' "$f" | grep -qiE "$CASES"; then
    flag "$f" "naziv stvarnog predmeta u imenu fajla (anonimizuj)"
  fi
done <<< "$staged"

# Sadržaj: naziv predmeta u dodatim linijama.
scan=$(printf '%s\n' "$staged" | grep -E '\.(md|json|ts|tsx|js|mjs|py|txt|html)$' || true)
if [ -n "$CASES" ] && [ -n "$scan" ]; then
  hits=$(git diff --cached -- $(printf '%s ' $scan) 2>/dev/null \
          | grep -nEi "^\+.*($CASES)" | head -5 || true)
  if [ -n "$hits" ]; then
    echo "  BLOKIRANO: naziv stvarnog predmeta u sadržaju:"
    printf '%s\n' "$hits" | cut -c1-120 | sed 's/^/    /'
    fail=1
  fi
fi

# Tajne
secrets=$(git diff --cached | grep -nE '^\+.*(xai-[A-Za-z0-9]{20}|rnd_[A-Za-z0-9]{20}|dtn_[a-f0-9]{40}|sk-[A-Za-z0-9]{20})' | head -3 || true)
if [ -n "$secrets" ]; then
  echo "  BLOKIRANO: izgleda kao API ključ u staged sadržaju (vrednost nije ispisana):"
  printf '%s\n' "$secrets" | sed -E 's/(xai-|rnd_|dtn_|sk-)[A-Za-z0-9]+/\1[REDACTED]/g' | cut -c1-100 | sed 's/^/    /'
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo; echo "check-no-private-data: FAIL — ukloni iz staged-a (git restore --staged <fajl>)."
  exit 1
fi
echo "check-no-private-data: OK — nema privatnog korpusa ni tajni u staged sadržaju."
