# AI Radio Cursor — Project Plan (living document)

This document is intended to be **kept up to date** as features are added. It is written to serve as ongoing context for Cursor agents.

## Goals

- Build an “AI radio” project with a clear, modular architecture and reproducible developer environment.
- Keep a **single source of truth** for features, stories, tasks, and dependencies.
- Maintain a **Docker-based dev container image** that includes required system tools and language runtimes.

## Assumptions (current)

- The repository is currently a skeleton (README + LICENSE).
- Exact product requirements are not yet defined; the plan below is structured so we can refine scope quickly.

## Proposed product scope (MVP → V1)

### MVP features

- **Android app (Capacitor)**
  - Authenticate with **Spotify** and **YouTube** via OAuth (PKCE) from the UI.
  - Automatically pull (“sync”) user content into the app (where APIs allow).
  - Play synced content inside an in-app player.
- **Station playlist generation**
  - Generate an ordered “radio hour” from a topic/genre prompt.
  - Persist a schedule (tracks/segments with timestamps and metadata).
- **Segment scripting**
  - Generate short spoken “DJ” segments (intro/outro, transitions).
  - Allow editing and regeneration of individual segments.
- **Audio pipeline (basic)**
  - Support a placeholder audio source (local mp3/wav) and concatenate segments.
  - Export a final mixed file (e.g., WAV/MP3).
- **CLI first**
  - A small CLI that can generate a show, render it, and export artifacts.

### V1 features

- **Streaming output**
  - Stream to an Icecast-compatible endpoint or output HLS segments.
- **Content safety**
  - Basic guardrails: banned topics list, profanity filter, length limits.
- **Observability**
  - Structured logs, basic metrics, and a “run report” artifact.
- **Web UI**
  - Minimal dashboard to create shows, view schedule, and download outputs.

## Architecture (suggested)

### Components

- **Core domain**
  - `Show`, `Segment`, `Track`, `Schedule`, `RenderJob`
- **Generation**
  - LLM-backed script generation (provider-agnostic interface)
- **Audio**
  - Rendering/mixing layer (FFmpeg wrapper + pipeline graph)
- **Storage**
  - Local file storage initially; later S3-compatible interface
- **Interfaces**
  - CLI first; optional REST API; optional Web UI

### Suggested repo structure (when code starts)

- `src/` (or `app/`) — core code
- `src/core/` — domain models + validation
- `src/generation/` — prompt templates + provider adapters
- `src/audio/` — ffmpeg pipeline, mixing, exporting
- `src/cli/` — entrypoints / commands
- `tests/` — unit/integration tests
- `docs/` — architecture notes, prompts, runbooks

## Stories, tasks, and subtasks

### Epic: Developer Experience & Foundations

- **Story**: As a developer, I can run everything in a consistent container.
  - **Task**: Add Docker-based dev environment
    - Subtask: Create `Dockerfile` with system tools and runtimes
    - Subtask: Add `.devcontainer/devcontainer.json`
    - Subtask: Add `.dockerignore`
    - Subtask: Document usage in README

### Epic: Android App (Capacitor) — OAuth + Sync + Player

- **Story**: As a user, I can connect Spotify from the app UI (OAuth/PKCE).
  - **Task**: Implement Spotify OAuth
    - Subtask: PKCE + deep-link redirect handling
    - Subtask: Store/refresh tokens
    - Subtask: Sync recently played, playlists, saved albums

- **Story**: As a user, I can connect YouTube from the app UI (Google OAuth/PKCE).
  - **Task**: Implement YouTube OAuth
    - Subtask: PKCE + deep-link redirect handling
    - Subtask: Store/refresh tokens
    - Subtask: Sync user uploads + playlists (note: watch history/feed limitations)

- **Story**: As a user, I see my synced content automatically (no URL pasting).
  - **Task**: Auto-sync policy
    - Subtask: Sync on app open/resume + manual “Sync now”
    - Subtask: Cache last synced feed locally for offline viewing

- **Story**: As a user, I can play items inside the app.
  - **Task**: In-app player
    - Subtask: Render embedded YouTube player for videos
    - Subtask: Render embedded Spotify player for tracks/playlists/albums

- **Story**: As a developer, I can build an APK.
  - **Task**: CI build
    - Subtask: GitHub Actions workflow builds and uploads debug APK artifact

- **Story**: As a developer, I can manage dependencies and reproducible builds.
  - **Task**: Choose language/runtime (Node, Python, etc.) when implementation starts
    - Subtask: Add `package.json` or `pyproject.toml` with pinned versions
    - Subtask: Add formatter/linter config
    - Subtask: Add test runner config

### Epic: Show Generator (MVP)

- **Story**: As a user, I can generate a 60-minute “radio hour” schedule from a prompt.
  - **Task**: Define schedule schema (JSON)
    - Subtask: Add validation (length, ordering, required fields)
  - **Task**: Implement schedule generator (deterministic placeholder first)
    - Subtask: Add provider interface for LLM later

- **Story**: As a user, I can generate a DJ script for each segment.
  - **Task**: Implement script generator
    - Subtask: Prompt templates per segment type
    - Subtask: Cache by (prompt, config) for repeatable runs

### Epic: Audio Rendering (MVP)

- **Story**: As a user, I can render a show to a single output file.
  - **Task**: Implement FFmpeg wrapper
    - Subtask: Concatenate audio tracks + generated speech placeholders
    - Subtask: Normalize loudness
    - Subtask: Export MP3/WAV

### Epic: CLI (MVP)

- **Story**: As a user, I can run a single command to generate and render a show.
  - **Task**: CLI scaffolding
    - Subtask: `generate` command
    - Subtask: `render` command
    - Subtask: `export` command
    - Subtask: `run` command (generate + render + export)

## Dependency management (policy)

- Prefer a single primary runtime for MVP (Node **or** Python) to reduce complexity.
- Pin versions using lockfiles:
  - Node: `package-lock.json` / `pnpm-lock.yaml`
  - Python: `uv.lock` or `poetry.lock`
- System dependencies (FFmpeg, build tools) are installed in the Docker image.

## Docker image / dev container

### Requirements

- Include:
  - `git`, `curl`, `ca-certificates`, `bash`
  - build essentials (`build-essential`, `pkg-config`)
  - `ffmpeg` (for audio rendering)
  - a language runtime baseline (Python 3 + Node LTS)
  - optional: `gh` for GitHub workflows (already available in this environment but useful in dev)

### Build & run (local developer)

- Build:
  - `docker build -t ai-radio-cursor:dev .`
- Run:
  - `docker run --rm -it -v "$PWD:/workspace" -w /workspace ai-radio-cursor:dev bash`

## Maintenance checklist (update this doc when adding features)

- Add new features under “Proposed product scope”
- Add user stories/tasks/subtasks under the appropriate epic
- Update repo structure if new top-level directories are added
- Record new dependencies (system + runtime) and how they’re installed

