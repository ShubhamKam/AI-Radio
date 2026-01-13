#!/data/data/com.termux/files/usr/bin/bash
# Google Drive Setup Script for Termux

echo "=============================================="
echo "Google Drive Setup for AI Radio Categorizer"
echo "=============================================="
echo ""
echo "Before running this script, you need to:"
echo ""
echo "1. Go to Google Cloud Console:"
echo "   https://console.cloud.google.com/"
echo ""
echo "2. Create a new project (or select existing)"
echo ""
echo "3. Enable Google Drive API:"
echo "   - Go to 'APIs & Services' > 'Library'"
echo "   - Search for 'Google Drive API'"
echo "   - Click 'Enable'"
echo ""
echo "4. Create OAuth 2.0 credentials:"
echo "   - Go to 'APIs & Services' > 'Credentials'"
echo "   - Click 'Create Credentials' > 'OAuth client ID'"
echo "   - Application type: 'Desktop app'"
echo "   - Download the credentials JSON"
echo ""
echo "5. Configure OAuth consent screen:"
echo "   - Go to 'OAuth consent screen'"
echo "   - Add your email as a test user"
echo ""
echo "=============================================="
echo ""

DATA_DIR="$HOME/.ai-radio-categorizer"
mkdir -p "$DATA_DIR"

read -p "Do you have your Client ID and Secret ready? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the Google Cloud setup first."
    exit 1
fi

echo ""
read -p "Enter your Google OAuth Client ID: " CLIENT_ID
read -p "Enter your Google OAuth Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "Error: Client ID and Secret are required."
    exit 1
fi

# Create credentials.json
cat > "$DATA_DIR/credentials.json" << EOF
{
    "installed": {
        "client_id": "$CLIENT_ID",
        "client_secret": "$CLIENT_SECRET",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
    }
}
EOF

echo ""
echo "Credentials saved to $DATA_DIR/credentials.json"
echo ""
echo "Now run the categorizer to complete OAuth flow:"
echo "  ai-radio --setup-drive"
echo ""
echo "You'll be prompted to open a URL and authorize the app."
