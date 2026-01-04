# AI Radio App - Project Plan

## Project Overview
An AI-driven radio application that synthesizes various content inputs (documents, media, web) into personalized radio shows and knowledge nudges, integrated with music streaming services (YouTube, Spotify). The app provides a live radio experience with automatic content curation.

## Tech Stack
- **Frontend:** React, Ionic Framework, Capacitor (for Android/iOS builds)
- **Backend:** Node.js (NestJS), Python (for advanced content processing if needed)
- **Database:** PostgreSQL (User data, metadata), Vector Store (pgvector or similar for content embedding)
- **AI/ML:** OpenAI GPT-4 / Claude 3 (Content generation), TTS Models (ElevenLabs/OpenAI), LangChain (Orchestration)
- **Integrations:** Google Drive API, YouTube Data API, Spotify Web API, Serper/Google Search API
- **Infrastructure:** Docker, Redis (Queues)

## Dependencies & Tools
### System Level
- Node.js (v20+)
- Python (v3.11+)
- Docker & Docker Compose
- Android Studio (for APK build - external requirement)
- ffmpeg (for audio processing)

### Application Dependencies
- `react`, `react-dom`, `@ionic/react`, `@capacitor/core`
- `@nestjs/core`, `@nestjs/common`, `typeorm`, `pg`
- `langchain`, `openai`, `googleapis`
- `bull` (Redis queues)

## Stories & Tasks

### Epics
1. **Project Setup & Infrastructure**
2. **User Authentication & Profile**
3. **Input Sources Integration**
4. **Content Curation & AI Engine**
5. **Radio Player & TTS**
6. **Mobile Build (Capacitor)**

### Detailed Tasks

#### 1. Project Setup & Infrastructure
- [ ] **Task 1.1:** Initialize Monorepo structure (Frontend/Backend).
  - Subtask: Set up `client` (Ionic/React).
  - Subtask: Set up `server` (NestJS).
  - Subtask: Create `docker-compose.yml` for DB, Redis, App.
- [ ] **Task 1.2:** Configure Database.
  - Subtask: Setup PostgreSQL schema.
  - Subtask: Setup Vector extension (pgvector).

#### 2. User Authentication & Profile
- [ ] **Task 2.1:** Implement Auth System.
  - Subtask: JWT Auth endpoints (Login/Signup).
  - Subtask: User profile schema (preferences, history).
- [ ] **Task 2.2:** Connect 3rd Party Accounts.
  - Subtask: OAuth flow for Spotify.
  - Subtask: OAuth flow for Google (Drive/Docs/YouTube).

#### 3. Input Sources Integration
- [ ] **Task 3.1:** File Upload & Parsing.
  - Subtask: API for uploading PDF/Docx/Audio.
  - Subtask: Text extraction service (OCR/Transcripts).
- [ ] **Task 3.2:** Web Research Module.
  - Subtask: Integration with Search API.
  - Subtask: Scraper/Content fetcher.
- [ ] **Task 3.3:** Google Workspace Integration.
  - Subtask: Fetch content from Sheets/Docs.

#### 4. Content Curation & AI Engine
- [ ] **Task 4.1:** Knowledge Base (RAG).
  - Subtask: Chunking and Embedding logic.
  - Subtask: Vector search service.
- [ ] **Task 4.2:** Script Generation Engine.
  - Subtask: Prompt templates for "Radio Show" format.
  - Subtask: Prompt templates for "Knowledge Nudges".
  - Subtask: AI Agent for synthesizing multiple sources.
- [ ] **Task 4.3:** Recommendation Engine.
  - Subtask: Logic to mix music (Spotify/YT) with AI speech.
  - Subtask: Scheduler for "Live" feel.

#### 5. Radio Player & TTS
- [ ] **Task 5.1:** Audio Synthesis (TTS).
  - Subtask: Integration with TTS provider (e.g., ElevenLabs).
  - Subtask: Audio buffer/stream management.
- [ ] **Task 5.2:** Media Player UI.
  - Subtask: Play/Pause, Skip, Like controls.
  - Subtask: Visualizer or "Now Playing" info.

#### 6. Mobile Build
- [ ] **Task 6.1:** Capacitor Configuration.
  - Subtask: Add Android platform.
  - Subtask: Configure permissions (Internet, Audio).
- [ ] **Task 6.2:** Build APK.
  - Subtask: Build automation script.

## Roadmap
1. **Sprint 1:** Infrastructure, Auth, Basic Text-to-Radio pipeline.
2. **Sprint 2:** Integrations (Spotify/Google), Advanced Content Parsing.
3. **Sprint 3:** Mobile Polish, Background Playback, Notifications.
