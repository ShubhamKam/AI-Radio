#!/data/data/com.termux/files/usr/bin/bash
# Script to help export bookmarks from browsers

echo "=============================================="
echo "Bookmark Export Helper"
echo "=============================================="
echo ""

BOOKMARKS_DIR="$HOME/bookmarks"
mkdir -p "$BOOKMARKS_DIR"

# Function to check and copy Chrome bookmarks
export_chrome() {
    echo "Looking for Chrome bookmarks..."
    
    # Common Chrome bookmark locations
    CHROME_PATHS=(
        "/data/data/com.android.chrome/app_chrome/Default/Bookmarks"
        "$HOME/storage/shared/Android/data/com.android.chrome"
    )
    
    for path in "${CHROME_PATHS[@]}"; do
        if [ -f "$path" ]; then
            cp "$path" "$BOOKMARKS_DIR/chrome_bookmarks.json"
            echo "Chrome bookmarks exported to $BOOKMARKS_DIR/chrome_bookmarks.json"
            return 0
        fi
    done
    
    echo ""
    echo "Chrome bookmarks not found automatically."
    echo ""
    echo "Manual export instructions for Chrome:"
    echo "1. Open Chrome on your phone"
    echo "2. Go to chrome://bookmarks"
    echo "3. Tap the three dots menu"
    echo "4. Select 'Export bookmarks'"
    echo "5. Save to Downloads folder"
    echo "6. Copy to: $BOOKMARKS_DIR/chrome_bookmarks.html"
    echo ""
}

# Function to check and copy Firefox bookmarks
export_firefox() {
    echo "Looking for Firefox bookmarks..."
    
    FIREFOX_PATHS=(
        "/data/data/org.mozilla.firefox/files/places.sqlite"
        "$HOME/storage/shared/Android/data/org.mozilla.firefox"
    )
    
    for path in "${FIREFOX_PATHS[@]}"; do
        if [ -f "$path" ]; then
            cp "$path" "$BOOKMARKS_DIR/firefox_places.sqlite"
            echo "Firefox bookmarks exported to $BOOKMARKS_DIR/firefox_places.sqlite"
            return 0
        fi
    done
    
    echo ""
    echo "Firefox bookmarks not found automatically."
    echo ""
    echo "Manual export instructions for Firefox:"
    echo "1. Open Firefox on your phone"
    echo "2. Tap menu > Bookmarks"
    echo "3. Tap the three dots"
    echo "4. Select 'Export bookmarks'"
    echo "5. Save as HTML to Downloads"
    echo "6. Copy to: $BOOKMARKS_DIR/firefox_bookmarks.html"
    echo ""
}

# Function to check Brave bookmarks
export_brave() {
    echo "Looking for Brave bookmarks..."
    
    BRAVE_PATHS=(
        "/data/data/com.brave.browser/app_chrome/Default/Bookmarks"
    )
    
    for path in "${BRAVE_PATHS[@]}"; do
        if [ -f "$path" ]; then
            cp "$path" "$BOOKMARKS_DIR/brave_bookmarks.json"
            echo "Brave bookmarks exported to $BOOKMARKS_DIR/brave_bookmarks.json"
            return 0
        fi
    done
    
    echo ""
    echo "Brave bookmarks not found automatically."
    echo "Export manually using the browser's export feature."
    echo ""
}

# Function to create a simple URL list
create_url_list() {
    echo ""
    echo "You can also create a simple text file with URLs:"
    echo "  $BOOKMARKS_DIR/my_urls.txt"
    echo ""
    echo "Format: One URL per line"
    echo "Example:"
    echo "  https://example.com/article1"
    echo "  https://example.com/article2"
    echo ""
    
    # Create sample file
    cat > "$BOOKMARKS_DIR/sample_urls.txt" << 'EOF'
# AI Radio Content Categorizer - URL List
# Add your URLs below (one per line)
# Lines starting with # are ignored

# Example news URLs:
# https://www.bbc.com/news
# https://www.reuters.com

# Example tech URLs:
# https://techcrunch.com
# https://www.theverge.com

# Example music URLs:
# https://pitchfork.com
# https://www.rollingstone.com

# Add your URLs here:

EOF
    
    echo "Sample file created: $BOOKMARKS_DIR/sample_urls.txt"
}

# Main
echo "Checking for browser bookmarks..."
echo ""

export_chrome
export_firefox
export_brave
create_url_list

echo ""
echo "=============================================="
echo "Bookmark export complete!"
echo ""
echo "Your bookmarks directory: $BOOKMARKS_DIR"
echo ""
echo "Files found:"
ls -la "$BOOKMARKS_DIR" 2>/dev/null || echo "  (directory is empty)"
echo ""
echo "Next step: Run the categorizer"
echo "  ai-radio --extract"
echo "=============================================="
