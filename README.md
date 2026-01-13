# AI Radio Content Categorizer

A powerful Termux-based solution that uses Cloud AI models to analyze content from your phone and browser bookmarks, automatically categorize it for AI-driven radio content creation, and upload organized content to Google Drive.

## Features

- **Multi-Source Content Extraction**
  - Browser bookmarks (Chrome, Firefox, Brave)
  - Files from your device (documents, PDFs, text files)
  - Clipboard URLs
  - Direct URL content fetching

- **AI-Powered Analysis**
  - Support for multiple AI providers (OpenAI, Claude, Gemini)
  - Content summarization
  - Topic extraction and classification
  - Sentiment analysis
  - Radio suitability scoring

- **Smart Categorization**
  - Automatic categorization into radio-friendly categories
  - News, Music, Talk Show, Stories, Educational, Entertainment, Lifestyle
  - Priority scoring for content scheduling
  - Custom category support

- **Google Drive Integration**
  - Automatic folder structure creation
  - Organized content upload
  - Progress tracking and sync status

- **Termux Automation**
  - Scheduled execution (cron support)
  - Widget shortcuts
  - Boot automation
  - Notification support

## Quick Start

### Option 1: Termux Installation (Recommended for Mobile)

1. **Install Termux** from [F-Droid](https://f-droid.org/en/packages/com.termux/) (not Play Store)

2. **Install Termux:API** from F-Droid (for notifications)

3. **Run the installation script:**
   ```bash
   # Download and run installer
   curl -fsSL https://raw.githubusercontent.com/yourusername/ai-radio-categorizer/main/scripts/install.sh -o install.sh
   chmod +x install.sh
   ./install.sh
   ```

4. **Configure API keys:**
   ```bash
   nano ~/.ai-radio-categorizer/.env
   ```
   Add your API keys:
   ```
   OPENAI_API_KEY=sk-your-key-here
   # or
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   # or
   GOOGLE_AI_API_KEY=your-gemini-key-here
   ```

5. **Export your bookmarks:**
   ```bash
   ./scripts/export_bookmarks.sh
   ```

6. **Run the categorizer:**
   ```bash
   ai-radio --full
   ```

### Option 2: Docker (For Desktop/Server)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-radio-categorizer.git
   cd ai-radio-categorizer
   ```

2. **Create .env file:**
   ```bash
   cp config/.env.example .env
   nano .env  # Add your API keys
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   docker-compose exec ai-radio-categorizer python -m src.main --full
   ```

## Detailed Setup Instructions

### 1. API Key Setup

You need at least one AI provider API key:

#### OpenAI (GPT-4)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

#### Anthropic (Claude)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

#### Google (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env`: `GOOGLE_AI_API_KEY=...`

### 2. Google Drive Setup (Optional but Recommended)

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Drive API

2. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Desktop app"
   - Download the credentials

3. **Configure OAuth Consent:**
   - Go to "OAuth consent screen"
   - Add your email as a test user

4. **Run setup script:**
   ```bash
   ./scripts/setup_drive.sh
   # Enter your Client ID and Secret when prompted
   
   # Complete OAuth flow
   ai-radio --setup-drive
   ```

### 3. Bookmark Export

#### Chrome (Android)
1. Open Chrome
2. Go to `chrome://bookmarks`
3. Tap menu (three dots) > "Export bookmarks"
4. Save to Downloads
5. Move to `~/bookmarks/chrome_bookmarks.html`

#### Firefox (Android)
1. Open Firefox
2. Tap menu > Bookmarks
3. Tap three dots > "Export bookmarks"
4. Save to Downloads
5. Move to `~/bookmarks/firefox_bookmarks.html`

#### Manual URL List
Create a text file with URLs (one per line):
```bash
nano ~/bookmarks/my_urls.txt
```

## Usage

### Command Line

```bash
# Run full pipeline (extract, analyze, categorize, upload)
ai-radio --full

# Run individual steps
ai-radio --extract      # Extract content from sources
ai-radio --analyze      # Run AI analysis
ai-radio --categorize   # Categorize content
ai-radio --upload       # Upload to Google Drive

# Options
ai-radio --full --max-items 50        # Limit items processed
ai-radio --full --provider claude     # Use specific AI provider
ai-radio --full --log-level DEBUG     # Verbose logging

# View statistics
ai-radio --stats

# Setup Google Drive
ai-radio --setup-drive
```

### Termux Widget Shortcuts

After installing Termux:Widget from F-Droid:

1. Add a widget to your home screen
2. Select from available shortcuts:
   - **AI Radio - Full Run**: Run complete pipeline
   - **AI Radio - Extract**: Extract content only
   - **AI Radio - Stats**: View statistics

### Scheduled Automation

```bash
# Use the schedule manager
./scripts/schedule.sh

# Or set up cron manually
crontab -e
# Add: 0 */6 * * * $HOME/.local/bin/ai-radio-cron
```

### Boot Automation

1. Install Termux:Boot from F-Droid
2. The boot script is automatically created at `~/.termux/boot/`
3. Grant Termux boot permission in Android settings

## Configuration

### Main Configuration (`~/.ai-radio-categorizer/config.yaml`)

```yaml
# AI Provider
ai:
  default_provider: openai  # openai, claude, or gemini

# Categories
categories:
  news:
    keywords: [news, breaking, update]
    priority_weight: 1.5
  music:
    keywords: [music, song, album]
    priority_weight: 1.2
  # ... more categories

# Automation
automation:
  schedule:
    interval_hours: 6
  limits:
    max_items_per_run: 100
    max_ai_calls_per_run: 50
```

### Environment Variables (`.env`)

```bash
# Required: At least one AI provider
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Optional: Google Drive
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Optional: Settings
AI_PROVIDER=openai
LOG_LEVEL=INFO
```

## Radio Content Categories

| Category | Description | Use Case |
|----------|-------------|----------|
| News | Breaking news, current affairs | News bulletins, updates |
| Music | Reviews, releases, artist features | Music segments, playlists |
| Talk Show | Interviews, discussions, debates | Talk segments, panels |
| Stories | Fiction, non-fiction, narratives | Story time, audio dramas |
| Educational | Tutorials, explainers, how-to | Educational segments |
| Entertainment | Comedy, pop culture, reviews | Entertainment blocks |
| Lifestyle | Health, fitness, travel | Lifestyle segments |

## Project Structure

```
ai-radio-categorizer/
├── src/
│   ├── core/           # Configuration, database, models
│   ├── extractors/     # Content extraction (bookmarks, files, URLs)
│   ├── categorization/ # AI analysis and categorization
│   ├── upload/         # Google Drive integration
│   └── utils/          # Logging, notifications
├── scripts/
│   ├── install.sh      # Termux installation
│   ├── run.sh          # Quick runner
│   ├── setup_drive.sh  # Google Drive setup
│   └── schedule.sh     # Automation scheduler
├── config/
│   ├── config.yaml     # Main configuration
│   └── .env.example    # Environment template
├── Dockerfile          # Docker container
├── docker-compose.yml  # Docker Compose config
└── PROJECT_PLAN.md     # Development roadmap
```

## Troubleshooting

### Common Issues

**"Storage permission denied"**
```bash
termux-setup-storage
# Grant permission when prompted
```

**"API key not found"**
```bash
# Check your .env file
cat ~/.ai-radio-categorizer/.env

# Make sure keys are set correctly
echo $OPENAI_API_KEY
```

**"Google Drive authentication failed"**
```bash
# Remove old token and re-authenticate
rm ~/.ai-radio-categorizer/token.json
ai-radio --setup-drive
```

**"No bookmarks found"**
```bash
# Export bookmarks manually and place in ~/bookmarks/
# Or create a URL list:
echo "https://example.com" > ~/bookmarks/urls.txt
```

### Logs

```bash
# View logs
cat ~/.ai-radio-categorizer/logs/app.log

# Tail logs in real-time
tail -f ~/.ai-radio-categorizer/logs/app.log
```

## Development

### Running Tests
```bash
pytest tests/
```

### Building Docker Image
```bash
docker build -t ai-radio-categorizer:latest .
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-radio-categorizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-radio-categorizer/discussions)

---

Made with AI for AI-driven radio content creation
