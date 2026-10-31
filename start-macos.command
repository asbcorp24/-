#!/bin/bash
cd "$(dirname "$0")" || exit 1
if [[ ! -f server.py ]]; then
  echo "Error: server.py not found."
  read -r -p "Press Enter to close..."
  exit 1
fi
PYTHON=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)' >/dev/null 2>&1; then
    PYTHON="$candidate"
    break
  fi
done
if [[ -z "$PYTHON" ]]; then
  echo "Python 3.10+ is required: https://www.python.org/downloads/"
  read -r -p "Press Enter to close..."
  exit 1
fi
echo "Starting STL Cosmic Morph: http://127.0.0.1:8000/"
(sleep 1; open "http://127.0.0.1:8000/") &
"$PYTHON" server.py
echo "Server stopped."
read -r -p "Press Enter to close..."
