#!/data/data/com.termux/files/usr/bin/bash
# AI Radio Content Categorizer - Quick Run Script
# Usage: ./run.sh [options]

set -e

INSTALL_DIR="$HOME/ai-radio-categorizer"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# If running from repo, use local files
if [ -f "$SCRIPT_DIR/../src/main.py" ]; then
    INSTALL_DIR="$SCRIPT_DIR/.."
fi

# Activate virtual environment if exists
if [ -f "$INSTALL_DIR/venv/bin/activate" ]; then
    source "$INSTALL_DIR/venv/bin/activate"
fi

# Change to install directory
cd "$INSTALL_DIR"

# Run the main script
python -m src.main "$@"
