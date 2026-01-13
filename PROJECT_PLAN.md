## AI-Radio: Phone Content → AI Categorization → Google Drive

This repository is designed to run **standalone on Android via Termux** (or in a Docker container on desktop) to:

- Ingest **links + bookmarks exports + local notes/files**
- Fetch and extract readable text from web links (when possible)
- Use a **cloud AI model** to generate **structured categorization** optimized for AI-driven radio content creation
- Write out a clean **folder taxonomy + metadata** for each item
- **Upload/sync** outputs to **Google Drive** automatically

This file is a living plan and should be updated as features evolve.

---

## Features (what the system does)

### F1 — Ingestion (phone + exported browser data)
- Read a `bookmarks.html` export (Netscape bookmark format)
- Read `links.txt` (one URL per line, or `title | url`)
- Read local text-like files from an input folder (e.g. `*.txt`, `*.md`)
- Normalize to a unified `ContentItem` list with stable IDs (hashes)

### F2 — Content extraction
- For URLs: download HTML (with timeouts + redirects)
- Extract: title, plain text/markdown (best-effort), snippet for LLM
- Keep a copy of the extracted text used for downstream processing

### F3 — “Radio-first” categorization engine (LLM)
- Generate **structured JSON** per item:
  - primary category + tags
  - content type (news/essay/how-to/etc.)
  - recommended radio segment (headline, deep dive, explainer, monologue, debate, etc.)
  - short summary + key points
  - hooks / soundbites / suggested angles
  - urgency + evergreen score
  - licensing / rights risk flag
  - confidence score
- Categories and tag vocabulary are **configurable** in `config/categories.yaml`

### F4 — Output packaging
- Create a deterministic folder tree:
  - `output/<run-date>/categories/<primary>/<slug>/...`
- Save:
  - `metadata.json` (structured)
  - `brief.md` (human-friendly)
  - `source.txt` or `source.md` (extracted content)
  - `source.url` (original link)

### F5 — Google Drive upload (automation)
- Sync `output/` to Drive using `rclone` (recommended for Termux)
- Drive target is controlled by env vars:
  - `RCLONE_REMOTE`, `DRIVE_ROOT`

### F6 — Termux automation
- One command runner script (`termux/ai_radio_run.sh`)
- Optional helpers:
  - Add clipboard link to queue file
  - Schedule with Termux:Boot / Termux:Widget / Tasker

### F7 — Dev container image (Docker)
- Dockerfile includes system deps + Python deps
- Run categorization locally (Drive upload optional)

---

## Stories → Tasks → Subtasks

### Story S1 — As a phone user, I can drop bookmarks/links and run categorization
- Task T1: Create a Termux runnable entrypoint script
  - Subtask: Resolve repo path + load `.env`
  - Subtask: Use Termux storage paths defaults
  - Subtask: Log to a file + exit codes for automation
- Task T2: Implement bookmarks + links ingestion
  - Subtask: Parse Netscape bookmarks `A[href]`
  - Subtask: Parse `links.txt` URLs and optional titles
  - Subtask: De-duplicate by URL hash

### Story S2 — As a producer, I can get “radio-ready” structured briefs
- Task T3: Implement extractor
  - Subtask: Fetch with timeouts, user-agent, retry (small)
  - Subtask: Convert HTML → markdown-ish text
  - Subtask: Clip to token-friendly prompt snippets
- Task T4: Implement LLM categorizer with a strict JSON schema
  - Subtask: Central prompt template
  - Subtask: Validate JSON against schema, retry on invalid
  - Subtask: Save metadata + brief to output tree

### Story S3 — As a pipeline owner, I can sync outputs to Drive
- Task T5: Implement `rclone sync` wrapper + dry-run
  - Subtask: Validate rclone exists + remote configured
  - Subtask: Configurable remote/root via env vars

### Story S4 — As a developer, I can run it in Docker
- Task T6: Add Dockerfile + docs
  - Subtask: Container entrypoint
  - Subtask: Volume mounting guidance

---

## Dependencies (managed here)

### System (Termux)
- `python`
- `git`
- `rclone`
- `termux-api` (optional: clipboard helpers / notifications)

### Python
- `openai` (cloud model client)
- `requests` (HTTP fetch)
- `beautifulsoup4` (HTML parsing)
- `html2text` (HTML → text)
- `pydantic` (schema validation)
- `python-dotenv` (load `.env`)
- `pyyaml` (read category config)

---

## Configuration Contract (env vars)
- `OPENAI_API_KEY` (required for categorization)
- `OPENAI_MODEL` (default set in code)
- `RCLONE_REMOTE` (e.g. `gdrive`)
- `DRIVE_ROOT` (e.g. `AI-Radio`)

---

## Future Enhancements (backlog)
- Add audio source ingestion (YouTube transcripts, podcasts)
- Add duplicate detection by semantic similarity
- Add per-category “show templates” + script generation
- Add Drive-side index file + search
