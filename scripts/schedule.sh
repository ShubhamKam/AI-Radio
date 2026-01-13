#!/data/data/com.termux/files/usr/bin/bash
# AI Radio Content Categorizer - Schedule Manager

echo "=============================================="
echo "AI Radio Categorizer - Schedule Manager"
echo "=============================================="
echo ""

# Install cronie if needed
if ! command -v crond &> /dev/null; then
    echo "Installing cron daemon..."
    pkg install -y cronie
fi

# Start crond if not running
if ! pgrep -x "crond" > /dev/null; then
    echo "Starting cron daemon..."
    crond
fi

show_menu() {
    echo ""
    echo "Options:"
    echo "  1) Schedule every 6 hours (recommended)"
    echo "  2) Schedule every 12 hours"
    echo "  3) Schedule once daily (midnight)"
    echo "  4) Schedule custom interval"
    echo "  5) View current schedule"
    echo "  6) Remove all schedules"
    echo "  7) Run now (manual)"
    echo "  8) Exit"
    echo ""
}

# Cron job script path
CRON_SCRIPT="$HOME/.local/bin/ai-radio-cron"

# Ensure cron script exists
if [ ! -f "$CRON_SCRIPT" ]; then
    mkdir -p "$HOME/.local/bin"
    cat > "$CRON_SCRIPT" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# AI Radio Scheduled Run
LOG_FILE="$HOME/.ai-radio-categorizer/logs/cron.log"
mkdir -p "$(dirname "$LOG_FILE")"
echo "=== Scheduled run at $(date) ===" >> "$LOG_FILE"
$HOME/.local/bin/ai-radio --full --log-level INFO >> "$LOG_FILE" 2>&1
echo "=== Completed at $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
EOF
    chmod +x "$CRON_SCRIPT"
fi

add_cron_job() {
    local schedule="$1"
    # Remove existing ai-radio cron jobs
    crontab -l 2>/dev/null | grep -v "ai-radio" | crontab - 2>/dev/null
    
    # Add new job
    (crontab -l 2>/dev/null; echo "$schedule $CRON_SCRIPT") | crontab -
    
    echo "Schedule added: $schedule"
}

view_schedule() {
    echo ""
    echo "Current cron jobs:"
    echo ""
    crontab -l 2>/dev/null || echo "No cron jobs scheduled"
    echo ""
}

remove_schedule() {
    crontab -l 2>/dev/null | grep -v "ai-radio" | crontab - 2>/dev/null
    echo "All AI Radio schedules removed."
}

run_now() {
    echo "Running AI Radio Categorizer now..."
    $HOME/.local/bin/ai-radio --full
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter choice (1-8): " choice
    
    case $choice in
        1)
            add_cron_job "0 */6 * * *"
            echo "Scheduled to run every 6 hours"
            ;;
        2)
            add_cron_job "0 */12 * * *"
            echo "Scheduled to run every 12 hours"
            ;;
        3)
            add_cron_job "0 0 * * *"
            echo "Scheduled to run daily at midnight"
            ;;
        4)
            echo ""
            echo "Enter cron schedule (e.g., '0 */4 * * *' for every 4 hours):"
            echo "Format: minute hour day month weekday"
            read -p "Schedule: " custom_schedule
            if [ -n "$custom_schedule" ]; then
                add_cron_job "$custom_schedule"
            fi
            ;;
        5)
            view_schedule
            ;;
        6)
            remove_schedule
            ;;
        7)
            run_now
            ;;
        8)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
done
