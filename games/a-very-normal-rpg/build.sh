#!/usr/bin/env bash
set -euo pipefail

# This command dynamically finds the folder where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verify Emscripten is active in the terminal
command -v em++ >/dev/null 2>&1 || {
  echo "error: em++ not found on PATH. Activate the Emscripten SDK first:" >&2
  echo "  source /path/to/emsdk/emsdk_env.sh" >&2
  exit 1
}

echo "==> Vendoring xterm.js"
cd "$SCRIPT_DIR"
npm install @xterm/xterm @xterm/addon-fit --no-audit --no-fund --no-save
mkdir -p vendor
cp node_modules/@xterm/xterm/lib/xterm.js vendor/xterm.js
cp node_modules/@xterm/xterm/css/xterm.css vendor/xterm.css
cp node_modules/@xterm/addon-fit/lib/addon-fit.js vendor/xterm-addon-fit.js

echo "==> Compiling main.cpp with em++ (in-place execution)"
em++ "$SCRIPT_DIR/main.cpp" \
  -O2 \
  -std=c++17 \
  -Wno-trigraphs \
  -s ASYNCIFY=1 \
  -s ASYNCIFY_STACK_SIZE=65536 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s ENVIRONMENT=web \
  -s EXIT_RUNTIME=1 \
  -s MODULARIZE=0 \
  --shell-file "$SCRIPT_DIR/shell/terminal_shell.html" \
  --pre-js "$SCRIPT_DIR/pre.js" \
  -o "$SCRIPT_DIR/index.html"

echo "==> Done. Output written to $SCRIPT_DIR"
ls -la "$SCRIPT_DIR"