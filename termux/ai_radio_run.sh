#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Termux runner for AI-Radio categorization.
# Expected repo location: wherever you cloned it; run this script from repo root.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load .env if present
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ".env"
  set +a
fi

LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/run_$(date -u +%Y-%m-%dT%H%M%SZ).log"

echo "[ai-radio] starting: $(date -u)" | tee -a "$LOG_FILE"
echo "[ai-radio] root: $ROOT_DIR" | tee -a "$LOG_FILE"

python -m ai_radio_categorizer.main \
  --bookmarks "${BOOKMARKS_PATH:-~/storage/downloads/AI-Radio/bookmarks.html}" \
  --links "${LINKS_PATH:-~/storage/downloads/AI-Radio/links.txt}" \
  --input-dir "${INPUT_DIR:-~/storage/downloads/AI-Radio/inputs}" \
  --out-dir "${OUT_DIR:-$ROOT_DIR/output}" \
  ${MAX_ITEMS:+--max-items "$MAX_ITEMS"} \
  ${NO_FETCH:+--no-fetch} \
  ${UPLOAD_TO_DRIVE:+--upload} \
  ${DRY_RUN_UPLOAD:+--dry-run-upload} \
  2>&1 | tee -a "$LOG_FILE"

echo "[ai-radio] done: $(date -u)" | tee -a "$LOG_FILE"
