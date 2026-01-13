# AI-Radio

Phone-first pipeline (Termux-friendly) to:

- ingest links + exported bookmarks + local notes
- use a **cloud AI model** to build a **radio-optimized categorization engine**
- generate per-item briefs (JSON + Markdown)
- upload/sync the organized output tree to **Google Drive**

---

## Termux (Android) setup

### 1) Install Termux prerequisites

In Termux:

```bash
pkg update -y
pkg install -y python git rclone
python -m pip install --upgrade pip
```

Optional (clipboard helper / scheduling integrations):

```bash
pkg install -y termux-api
```

Then grant storage:

```bash
termux-setup-storage
```

### 2) Clone this repo and install Python deps

```bash
cd ~
git clone <YOUR_REPO_URL> AI-Radio
cd AI-Radio
pip install -r requirements.txt
```

### 3) Configure the cloud AI model + Drive upload

Create `.env`:

```bash
cp .env.example .env
nano .env
```

Set:
- `OPENAI_API_KEY`
- (optional) `OPENAI_MODEL`
- For Drive upload: `RCLONE_REMOTE` and `DRIVE_ROOT`

### 4) Configure rclone Google Drive remote (once)

Run:

```bash
rclone config
```

Create a remote named the same as `RCLONE_REMOTE` (default: `gdrive`) and connect it to your Google Drive.

### 5) Put inputs on your phone (bookmarks + links + notes)

Create the input folder:

```bash
mkdir -p ~/storage/downloads/AI-Radio/inputs
```

Supported inputs:
- **Bookmarks export**: `~/storage/downloads/AI-Radio/bookmarks.html`
  - Export bookmarks from a browser that supports HTML export (commonly via desktop sync/export),
    then copy it to that path on your phone.
- **Links queue**: `~/storage/downloads/AI-Radio/links.txt`
  - One URL per line, or `title | url`
- **Local notes/files**: put `*.txt` / `*.md` under `~/storage/downloads/AI-Radio/inputs/`

### 6) Run it

From repo root:

```bash
chmod +x termux/*.sh
./termux/ai_radio_run.sh
```

Outputs go into `output/<YYYY-MM-DD>/categories/<primary_category>/<slug>/...`

### 7) Add a link from your clipboard (optional)

Requires Termux:API app + `pkg install termux-api`:

```bash
chmod +x termux/add_clipboard_link.sh
./termux/add_clipboard_link.sh
```

### 8) Automate it on your phone

You have three practical options:

**A) Termux:Widget (one-tap)**
- Install the **Termux:Widget** app
- Create `~/.shortcuts/AI_Radio.sh` with:

```bash
#!/data/data/com.termux/files/usr/bin/bash
cd "$HOME/AI-Radio"
./termux/ai_radio_run.sh
```

Make it executable:

```bash
chmod +x ~/.shortcuts/AI_Radio.sh
```

**B) Termux:Boot (run at phone boot)**
- Install the **Termux:Boot** app
- Create `~/.termux/boot/ai_radio.sh` with:

```bash
#!/data/data/com.termux/files/usr/bin/bash
cd "$HOME/AI-Radio"
./termux/ai_radio_run.sh
```

Then:

```bash
chmod +x ~/.termux/boot/ai_radio.sh
```

**C) Tasker (scheduled)**
- Use Tasker to run a Termux task on a schedule (e.g., nightly)
- Point it to `termux/ai_radio_run.sh`

---

## Docker (dev container image)

Build:

```bash
docker build -t ai-radio .
```

Run (example):

```bash
docker run --rm -it \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -v "$PWD:/app" \
  ai-radio python -m ai_radio_categorizer.main --help
```