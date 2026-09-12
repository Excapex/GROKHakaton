#!/usr/bin/env bash
# Cloud Agent install: refresh Node 24 toolchain, npm deps and the Python engine.
# Idempotent: safe to run repeatedly against cached or partially prepared state.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

NODE_MAJOR=24

# --- Node 24 via nvm -------------------------------------------------------
# The base image ships an older Node ahead of nvm on PATH, so we install the
# required major with nvm and make it win for every future login shell.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "install: nvm not found, bootstrapping…"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

nvm install "$NODE_MAJOR"
nvm alias default "$NODE_MAJOR" >/dev/null
nvm use "$NODE_MAJOR" >/dev/null

NODE24_BIN="$(dirname "$(nvm which "$NODE_MAJOR")")"
export PATH="$NODE24_BIN:$PATH"

# Make Node 24 take precedence in future interactive/login shells (and the
# terminals launched by environment.json), overriding any base-image Node.
MARK="# >>> saglasnik node24 (managed by .cursor/install.sh) >>>"
if ! grep -qF "$MARK" "$HOME/.bashrc" 2>/dev/null; then
  {
    echo ""
    echo "$MARK"
    echo 'export NVM_DIR="$HOME/.nvm"'
    echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'
    echo 'NODE24_BIN="$(dirname "$(nvm which 24 2>/dev/null)" 2>/dev/null)"'
    echo '[ -n "$NODE24_BIN" ] && [ -d "$NODE24_BIN" ] && export PATH="$NODE24_BIN:$PATH"'
    echo "# <<< saglasnik node24 (managed by .cursor/install.sh) <<<"
  } >> "$HOME/.bashrc"
fi

echo "install: node $(node -v), npm $(npm -v)"

# --- Frontend / Convex dependencies ---------------------------------------
npm ci

# --- Python engine (extract → verify → judge) ------------------------------
# The venv module needs python3-venv on Debian/Ubuntu base images.
if ! python3 -c "import ensurepip" >/dev/null 2>&1; then
  PYVER="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
  echo "install: installing python${PYVER}-venv…"
  sudo apt-get update -qq
  sudo apt-get install -y "python${PYVER}-venv"
fi

if [ ! -x ".venv/bin/python" ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet -r requirements.txt

echo "install: done."
