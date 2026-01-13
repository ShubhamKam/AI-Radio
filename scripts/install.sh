#!/data/data/com.termux/files/usr/bin/bash
# AI Radio Content Categorizer - Termux Installation Script
# This script sets up the complete environment in Termux

set -e

echo "=================================================="
echo "AI Radio Content Categorizer - Installation"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Installation directory
INSTALL_DIR="$HOME/ai-radio-categorizer"
DATA_DIR="$HOME/.ai-radio-categorizer"

# Check if running in Termux
check_termux() {
    if [ ! -d "/data/data/com.termux" ]; then
        echo -e "${YELLOW}Warning: Not running in Termux environment${NC}"
        echo "Some features may not work correctly."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Update packages
update_packages() {
    echo -e "${GREEN}Updating packages...${NC}"
    pkg update -y
    pkg upgrade -y
}

# Install system dependencies
install_system_deps() {
    echo -e "${GREEN}Installing system dependencies...${NC}"
    pkg install -y \
        python \
        git \
        termux-api \
        sqlite \
        openssl \
        libxml2 \
        libxslt \
        clang \
        make \
        pkg-config \
        libjpeg-turbo \
        libpng \
        freetype
}

# Setup storage access
setup_storage() {
    echo -e "${GREEN}Setting up storage access...${NC}"
    if [ ! -d "$HOME/storage" ]; then
        termux-setup-storage
        echo "Please grant storage permission when prompted."
        sleep 5
    fi
}

# Create virtual environment
setup_venv() {
    echo -e "${GREEN}Setting up Python virtual environment...${NC}"
    
    if [ ! -d "$INSTALL_DIR" ]; then
        mkdir -p "$INSTALL_DIR"
    fi
    
    cd "$INSTALL_DIR"
    
    if [ ! -d "venv" ]; then
        python -m venv venv
    fi
    
    source venv/bin/activate
}

# Install Python dependencies
install_python_deps() {
    echo -e "${GREEN}Installing Python dependencies...${NC}"
    
    pip install --upgrade pip setuptools wheel
    
    # Core dependencies
    pip install \
        requests>=2.31.0 \
        beautifulsoup4>=4.12.0 \
        lxml>=5.0.0 \
        pyyaml>=6.0.0 \
        python-dotenv>=1.0.0 \
        rich>=13.0.0 \
        click>=8.1.0 \
        schedule>=1.2.0 \
        SQLAlchemy>=2.0.0
    
    # AI APIs
    pip install \
        openai>=1.0.0 \
        anthropic>=0.18.0 \
        google-generativeai>=0.3.0
    
    # Google Drive
    pip install \
        google-api-python-client>=2.100.0 \
        google-auth-httplib2>=0.1.0 \
        google-auth-oauthlib>=1.1.0
    
    # Document processing (optional, may fail on some systems)
    pip install pypdf || echo "Warning: pypdf installation failed"
    pip install python-docx || echo "Warning: python-docx installation failed"
}

# Clone or update repository
setup_repository() {
    echo -e "${GREEN}Setting up repository...${NC}"
    
    cd "$INSTALL_DIR"
    
    if [ -d "src" ]; then
        echo "Repository already exists, pulling latest..."
        git pull origin main 2>/dev/null || true
    else
        # Copy files from current location if available
        if [ -d "$(dirname "$0")/../src" ]; then
            cp -r "$(dirname "$0")/../src" .
            cp -r "$(dirname "$0")/../config" .
            cp -r "$(dirname "$0")/../scripts" .
        fi
    fi
}

# Create data directories
setup_data_dirs() {
    echo -e "${GREEN}Creating data directories...${NC}"
    
    mkdir -p "$DATA_DIR"
    mkdir -p "$DATA_DIR/logs"
    mkdir -p "$HOME/bookmarks"
    
    # Copy default config if not exists
    if [ ! -f "$DATA_DIR/config.yaml" ] && [ -f "$INSTALL_DIR/config/config.yaml" ]; then
        cp "$INSTALL_DIR/config/config.yaml" "$DATA_DIR/"
    fi
    
    # Create .env from template if not exists
    if [ ! -f "$DATA_DIR/.env" ] && [ -f "$INSTALL_DIR/config/.env.example" ]; then
        cp "$INSTALL_DIR/config/.env.example" "$DATA_DIR/.env"
        echo -e "${YELLOW}Please edit $DATA_DIR/.env with your API keys${NC}"
    fi
}

# Setup automation scripts
setup_automation() {
    echo -e "${GREEN}Setting up automation scripts...${NC}"
    
    # Create bin directory
    mkdir -p "$HOME/.local/bin"
    
    # Create main runner script
    cat > "$HOME/.local/bin/ai-radio" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# AI Radio Content Categorizer Runner

INSTALL_DIR="$HOME/ai-radio-categorizer"
cd "$INSTALL_DIR"
source venv/bin/activate
python -m src.main "$@"
EOF
    chmod +x "$HOME/.local/bin/ai-radio"
    
    # Create quick shortcuts
    cat > "$HOME/.local/bin/ai-radio-full" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Run full pipeline
$HOME/.local/bin/ai-radio --full
EOF
    chmod +x "$HOME/.local/bin/ai-radio-full"
    
    cat > "$HOME/.local/bin/ai-radio-extract" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Extract content only
$HOME/.local/bin/ai-radio --extract
EOF
    chmod +x "$HOME/.local/bin/ai-radio-extract"
    
    cat > "$HOME/.local/bin/ai-radio-stats" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Show statistics
$HOME/.local/bin/ai-radio --stats
EOF
    chmod +x "$HOME/.local/bin/ai-radio-stats"
    
    # Add to PATH if not already
    if ! grep -q '.local/bin' "$HOME/.bashrc" 2>/dev/null; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    fi
}

# Setup cron job for automation
setup_cron() {
    echo -e "${GREEN}Setting up scheduled automation...${NC}"
    
    # Install cronie if not available
    pkg install -y cronie 2>/dev/null || true
    
    # Create cron script
    cat > "$HOME/.local/bin/ai-radio-cron" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Scheduled run script
LOG_FILE="$HOME/.ai-radio-categorizer/logs/cron.log"
echo "=== Run at $(date) ===" >> "$LOG_FILE"
$HOME/.local/bin/ai-radio --full --log-level INFO >> "$LOG_FILE" 2>&1
EOF
    chmod +x "$HOME/.local/bin/ai-radio-cron"
    
    echo ""
    echo -e "${YELLOW}To enable automatic scheduling, run:${NC}"
    echo "  crontab -e"
    echo ""
    echo "Add this line for every 6 hours:"
    echo "  0 */6 * * * $HOME/.local/bin/ai-radio-cron"
    echo ""
}

# Setup Termux:Widget support
setup_widget() {
    echo -e "${GREEN}Setting up Termux:Widget shortcuts...${NC}"
    
    WIDGET_DIR="$HOME/.shortcuts"
    mkdir -p "$WIDGET_DIR"
    
    # Full pipeline widget
    cat > "$WIDGET_DIR/AI Radio - Full Run" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
termux-toast "Starting AI Radio Categorizer..."
$HOME/.local/bin/ai-radio --full
termux-toast "AI Radio Categorizer complete!"
EOF
    chmod +x "$WIDGET_DIR/AI Radio - Full Run"
    
    # Extract only widget
    cat > "$WIDGET_DIR/AI Radio - Extract" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
termux-toast "Extracting content..."
$HOME/.local/bin/ai-radio --extract
termux-toast "Extraction complete!"
EOF
    chmod +x "$WIDGET_DIR/AI Radio - Extract"
    
    # Stats widget
    cat > "$WIDGET_DIR/AI Radio - Stats" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
$HOME/.local/bin/ai-radio --stats
read -p "Press Enter to close..."
EOF
    chmod +x "$WIDGET_DIR/AI Radio - Stats"
    
    echo -e "${GREEN}Widget shortcuts created in $WIDGET_DIR${NC}"
    echo "Install Termux:Widget from F-Droid to use them."
}

# Setup Termux:Boot for auto-start
setup_boot() {
    echo -e "${GREEN}Setting up Termux:Boot...${NC}"
    
    BOOT_DIR="$HOME/.termux/boot"
    mkdir -p "$BOOT_DIR"
    
    cat > "$BOOT_DIR/ai-radio-startup" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Start scheduled tasks on boot

# Wait for network
sleep 30

# Start crond if available
crond 2>/dev/null || true

# Optionally run extraction on boot
# $HOME/.local/bin/ai-radio --extract

termux-notification \
    --id "ai-radio-boot" \
    --title "AI Radio Categorizer" \
    --content "Started and ready" \
    --priority low
EOF
    chmod +x "$BOOT_DIR/ai-radio-startup"
    
    echo "Install Termux:Boot from F-Droid for auto-start on device boot."
}

# Print instructions
print_instructions() {
    echo ""
    echo "=================================================="
    echo -e "${GREEN}Installation Complete!${NC}"
    echo "=================================================="
    echo ""
    echo "Next Steps:"
    echo ""
    echo "1. Configure API Keys:"
    echo "   Edit: $DATA_DIR/.env"
    echo "   Add your OpenAI/Claude/Gemini API keys"
    echo ""
    echo "2. Setup Google Drive (optional):"
    echo "   ai-radio --setup-drive"
    echo ""
    echo "3. Export your browser bookmarks:"
    echo "   - Chrome: Menu > Bookmarks > Export"
    echo "   - Save to: ~/bookmarks/chrome_bookmarks.json"
    echo ""
    echo "4. Run the categorizer:"
    echo "   ai-radio --full           # Full pipeline"
    echo "   ai-radio --extract        # Extract only"
    echo "   ai-radio --analyze        # Analyze only"
    echo "   ai-radio --categorize     # Categorize only"
    echo "   ai-radio --upload         # Upload only"
    echo "   ai-radio --stats          # Show statistics"
    echo ""
    echo "5. For widget support:"
    echo "   Install Termux:Widget from F-Droid"
    echo ""
    echo "6. For boot automation:"
    echo "   Install Termux:Boot from F-Droid"
    echo ""
    echo "Log file: $DATA_DIR/logs/app.log"
    echo ""
    echo "Run 'source ~/.bashrc' to update PATH"
    echo "=================================================="
}

# Main installation flow
main() {
    check_termux
    update_packages
    install_system_deps
    setup_storage
    setup_venv
    install_python_deps
    setup_repository
    setup_data_dirs
    setup_automation
    setup_cron
    setup_widget
    setup_boot
    print_instructions
}

# Run installation
main "$@"
