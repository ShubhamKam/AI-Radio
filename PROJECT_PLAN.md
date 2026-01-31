## AI Radio — Living Project Plan (Cursor Context)

This document is the **single source of truth** for building the AI Radio app.  
Cursor agents should **update this file whenever features/scope/dependencies change**.

---

## Vision
Build a mobile app (Android APK via Capacitor) that ingests information from multiple sources (text, docs, sheets, audio/video, web research, YouTube/Spotify), uses multiple AI providers to **curate and generate “radio-like” programming**, and plays a continuous mixed queue of:
- AI-narrated segments (radio shows / briefs / nudges via TTS)
- Music tracks (YouTube + Spotify)

The system continuously refreshes programming based on:
- user signals (likes, follows, listening time, skips)
- subscriptions/topics
- history and embeddings-based discovery
- scheduled background refresh jobs

---

## Architecture (Production shape)

### Runtime components
- **Mobile app**: `apps/mobile` (Ionic React + Capacitor Android)
- **Backend API**: `apps/api` (Fastify, TypeScript)
- **Database**: Postgres (Prisma)
- **Queue/Jobs**: Redis + BullMQ (content refresh, transcription, re-ranking)
- **Object Storage** (phase 2): S3-compatible (episodes audio, extracted media)
- **Search/Embeddings** (phase 2): pgvector (or external vector DB)

### Core data flow
1. User ingests source (text/file/url/google doc/sheet/spotify/youtube/web research).
2. Backend normalizes + stores the source + extracts text (transcribe if audio/video).
3. “Curation Engine” ranks sources into station/topic buckets for the user.
4. “Creation Engine” produces an Episode:
   - script outline
   - segment scripts
   - TTS audio for narration
   - music picks (YouTube/Spotify tracks) for interludes
5. Player consumes a **Queue** (TTS + music items) to simulate live radio.
6. Scheduler refreshes episodes periodically and re-ranks using user signals.

---

## Feature Set (v1 → v3)

### v1 (MVP “works end-to-end”)
- **Ingestion**
  - pasted text
  - URLs (simple fetch + extract readable text)
  - file uploads (PDF, audio, video) → stored + extracted
- **AI Provider Layer (multi-provider)**
  - OpenAI
  - Anthropic
  - Grok (xAI) via OpenAI-compatible mode
  - Z.AI via OpenAI-compatible mode
  - SuperNinja via OpenAI-compatible mode
- **Episode generation**
  - quick nudge (1–2 min)
  - daily brief (5–8 min)
  - radio show (10–20 min)
- **Music integration**
  - YouTube search + queue item (play via webview/embed in app)
  - Spotify search + queue item (preview URL where available + deep link fallback)
- **Stations**
  - a few station archetypes: News / Learning / Mix
- **Mobile**
  - Home (stations + now playing)
  - Ingest (paste text)
  - Library (episodes)
  - Settings (API base URL, provider selection)

### v2 (Production hardening)
- Google OAuth sign-in
- Google Docs + Sheets ingest
- Better web research: “deep research” (multi-hop, citations) + “wide research” (breadth)
- Personalization ranking loop (embeddings + signals)
- Robust playback + offline caching for TTS segments
- Observability (structured logs, tracing), rate limit, abuse controls

### v3 (Scale + ML)
- Fine-tuned station personalities
- User-created stations
- Auto-refresh programming schedule by timezone/dayparting
- Stronger discovery engine (vector similarity + collaborative filtering)

---

## AI Provider Integration (Core Requirement)

We support **multiple providers** behind a single interface:

### Provider types
- **OpenAI-native**: OpenAI API
- **Anthropic-native**: Anthropic API
- **OpenAI-compatible**: any provider that implements OpenAI Chat Completions style
  - Grok (xAI)
  - Z.AI
  - SuperNinja

### Capabilities (implemented as methods)
- `chat()` (generate text)
- `summarize()` (structured summary)
- `embed()` (embeddings; phase 2)
- `tts()` (text-to-speech; v1: OpenAI or provider that supports it)

### Routing policy
- Default provider set by env: `AI_DEFAULT_PROVIDER`
- Per request override allowed: `provider=<id>`
- Fallback policy:
  - if provider fails → fallback to `AI_FALLBACK_PROVIDER` (optional)
  - circuit-breaker behavior (phase 2)

### Secrets (never commit)
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_COMPAT_GROK_API_KEY` + `OPENAI_COMPAT_GROK_BASE_URL` + `OPENAI_COMPAT_GROK_MODEL`
- `OPENAI_COMPAT_ZAI_API_KEY` + `OPENAI_COMPAT_ZAI_BASE_URL` + `OPENAI_COMPAT_ZAI_MODEL`
- `OPENAI_COMPAT_SUPERNINJA_API_KEY` + `OPENAI_COMPAT_SUPERNINJA_BASE_URL` + `OPENAI_COMPAT_SUPERNINJA_MODEL`

---

## Stories / Tasks / Subtasks

### Epic A — Repo + Dev Experience
- Story A1: Monorepo scaffold
  - Task: pnpm workspace
  - Task: mobile app skeleton
  - Task: api skeleton
  - Task: shared types package
- Story A2: Dev container + docker
  - Task: Dockerfile (dev image)
  - Task: docker-compose (api + db + redis)
  - Task: docs to build APK

### Epic B — Database + Jobs
- Story B1: Postgres schema for sources/episodes/users/signals
  - Task: Prisma schema + migrations
  - Task: seed minimal stations
- Story B2: Refresh scheduler
  - Task: BullMQ queues
  - Task: cron-like repeatable jobs (refresh stations)

### Epic C — Ingestion
- Story C1: Pasted text ingest
  - Task: API endpoint
  - Task: DB storage
- Story C2: URL ingest
  - Task: fetch + readability extraction
- Story C3: File ingest
  - Task: upload, mime detect, store
  - Task: audio/video -> transcript via AI (phase 1) or whisper (phase 2)

### Epic D — AI Layer (Multi-provider)
- Story D1: Provider abstraction
  - Task: OpenAI adapter
  - Task: Anthropic adapter
  - Task: OpenAI-compatible adapter (baseURL)
  - Task: central router + fallback
- Story D2: Content generation primitives
  - Task: summarize
  - Task: script generation
  - Task: TTS generation

### Epic E — Music Providers
- Story E1: YouTube
  - Task: search endpoint
  - Task: queue item format
  - Task: playback in app
- Story E2: Spotify
  - Task: search endpoint
  - Task: queue item format
  - Task: preview/deeplink playback in app

### Epic F — Player + “AI Radio”
- Story F1: Station feed + episode queue
- Story F2: Now playing + next up
- Story F3: Signals capture (like/skip/listen)

---

## Dependency Management (pin + rationale)

### Backend (`apps/api`)
- `fastify`, `@fastify/cors`, `@fastify/multipart`
- `zod` validation
- `prisma`, `@prisma/client` for DB
- `openai` SDK (OpenAI + OpenAI-compatible providers)
- `@anthropic-ai/sdk` for Anthropic
- `bullmq` + `ioredis` for jobs (next)

### Mobile (`apps/mobile`)
- `@ionic/react`, `@ionic/react-router`
- `@capacitor/core`, `@capacitor/android`, plugins

### System tools (docker/devcontainer)
- Node 22+
- Java 17 + Android SDK/Gradle (for APK builds)
- ffmpeg (media extraction/transcode)

---

## Definition of Done (per feature)
- API endpoints are validated (Zod), logged, and have safe defaults.
- Secrets are read from env and never hard-coded.
- Mobile UI handles loading/error states.
- Docker/devcontainer builds and runs locally.
- Android APK build steps documented and reproducible.

