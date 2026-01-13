#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Requires Termux:API app + `pkg install termux-api`
LINK_FILE="${LINKS_PATH:-$HOME/storage/downloads/AI-Radio/links.txt}"
mkdir -p "$(dirname "$LINK_FILE")"

url="$(termux-clipboard-get | tr -d '\r' | head -n 1 || true)"
if [ -z "${url:-}" ]; then
  echo "Clipboard empty."
  exit 1
fi

echo "$url" >> "$LINK_FILE"
echo "Added to $LINK_FILE:"
echo "$url"
