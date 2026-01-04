# AI Radio App - Comprehensive Project Plan

**Project Name:** AI Radio App  
**Version:** 1.0.0  
**Last Updated:** January 4, 2026  
**Status:** In Development

---

## Executive Summary

An AI-powered radio application that ingests content from multiple sources (audio, video, documents, web searches), integrates with YouTube and Spotify for music, and uses AI to create personalized radio shows with music, news, and knowledge nuggets.

---

## Tech Stack

### Frontend
- **Framework:** React 18.x with TypeScript
- **Mobile:** Capacitor 6.x for native Android/iOS builds
- **UI Library:** Material-UI (MUI) for modern, responsive design
- **State Management:** Redux Toolkit + RTK Query
- **Audio Player:** Howler.js for web audio, native players for mobile
- **Styling:** Tailwind CSS + CSS Modules

### Backend
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express.js 4.x
- **Language:** TypeScript
- **API Documentation:** Swagger/OpenAPI

### Database
- **Primary DB:** PostgreSQL 16.x (structured data)
- **Cache:** Redis 7.x (sessions, real-time data)
- **File Storage:** AWS S3 or local storage with MinIO
- **Vector DB:** Pinecone or Chroma (for AI embeddings)

### AI & ML Services
- **LLM:** OpenAI GPT-4 / Anthropic Claude for content generation
- **Text-to-Speech:** Google Cloud TTS / ElevenLabs for radio voice
- **Speech-to-Text:** OpenAI Whisper for audio transcription
- **Embeddings:** OpenAI text-embedding-3-large for semantic search
- **Content Analysis:** LangChain for document processing

### External Integrations
- **YouTube:** YouTube Data API v3 + YouTube Music
- **Spotify:** Spotify Web API + SDK
- **Google Services:** Drive API, Sheets API, Docs API
- **Web Search:** Serper API or Google Custom Search
- **Document Processing:** Apache Tika, pdf.js

### DevOps & Deployment
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Environment Management:** dotenv
- **Process Manager:** PM2 for Node.js

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Capacitor)                │
│                   React + TypeScript                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ REST API / WebSocket
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   API Gateway (Express)                  │
│                  Authentication & Routing                │
└─────┬───────┬──────┬──────┬──────┬──────┬──────┬───────┘
      │       │      │      │      │      │      │
      ▼       ▼      ▼      ▼      ▼      ▼      ▼
   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
   │Auth│ │User│ │Cont│ │Cura│ │Radio│ │Ext │ │AI  │
   │Svc │ │Svc │ │ent │ │tion│ │Show│ │Int │ │Eng │
   └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
     │      │      │      │      │      │      │
     └──────┴──────┴──────┴──────┴──────┴──────┴────┐
                                                      │
     ┌────────────────────────────────────────────────▼──┐
     │         PostgreSQL + Redis + Vector DB          │
     └─────────────────────────────────────────────────┘
```

---

## Feature Breakdown & User Stories

### Epic 1: Content Ingestion System
**Priority:** Critical  
**Estimated Effort:** 40 hours

#### Story 1.1: Multi-Format File Upload
**As a** user  
**I want to** upload various file formats (audio, video, PDF, docs)  
**So that** the AI can extract content for radio shows

**Tasks:**
- [ ] 1.1.1: Create file upload API endpoint with multipart/form-data support
- [ ] 1.1.2: Implement file validation and size limits (max 500MB)
- [ ] 1.1.3: Set up file storage (S3-compatible or local)
- [ ] 1.1.4: Build frontend upload component with drag-and-drop
- [ ] 1.1.5: Add progress tracking for large uploads
- [ ] 1.1.6: Implement file processing queue with Bull

**Subtasks for 1.1.1:**
- Set up multer middleware for Express
- Configure storage path and file naming
- Add metadata extraction
- Implement error handling

**Dependencies:** Backend setup, Database schema

#### Story 1.2: Document Processing Pipeline
**As a** system  
**I want to** extract text and metadata from uploaded documents  
**So that** content can be used for radio generation

**Tasks:**
- [ ] 1.2.1: Integrate Apache Tika for document parsing
- [ ] 1.2.2: Implement PDF text extraction with pdf-parse
- [ ] 1.2.3: Build Google Docs integration for fetching documents
- [ ] 1.2.4: Create Google Sheets parser for structured data
- [ ] 1.2.5: Add PowerPoint/Slides content extraction
- [ ] 1.2.6: Store extracted content in database with embeddings

**Dependencies:** Story 1.1

#### Story 1.3: Audio/Video Processing
**As a** system  
**I want to** transcribe audio and video content  
**So that** spoken content can be used in radio shows

**Tasks:**
- [ ] 1.3.1: Integrate Whisper API for audio transcription
- [ ] 1.3.2: Extract audio from video files using FFmpeg
- [ ] 1.3.3: Implement chunking for long audio files
- [ ] 1.3.4: Add speaker diarization if needed
- [ ] 1.3.5: Store transcriptions with timestamps
- [ ] 1.3.6: Extract audio metadata (duration, format, bitrate)

**Dependencies:** Story 1.1

#### Story 1.4: Web Research Integration
**As a** user  
**I want to** provide topics for AI to research on the web  
**So that** current information can be included in radio shows

**Tasks:**
- [ ] 1.4.1: Integrate Serper API or Google Custom Search
- [ ] 1.4.2: Implement deep research mode (multi-query, follow-up)
- [ ] 1.4.3: Build web scraping with Cheerio for article content
- [ ] 1.4.4: Add content summarization with LLM
- [ ] 1.4.5: Implement citation tracking
- [ ] 1.4.6: Create research caching to avoid duplicate searches

**Dependencies:** AI Engine setup

#### Story 1.5: Pasted Text Input
**As a** user  
**I want to** paste text directly into the app  
**So that** I can quickly add content without files

**Tasks:**
- [ ] 1.5.1: Create text input component with rich text editor
- [ ] 1.5.2: Add character count and formatting preservation
- [ ] 1.5.3: Implement text content API endpoint
- [ ] 1.5.4: Store pasted content with metadata
- [ ] 1.5.5: Add text summarization option

**Dependencies:** Database schema

---

### Epic 2: Music Integration
**Priority:** Critical  
**Estimated Effort:** 35 hours

#### Story 2.1: YouTube Integration
**As a** user  
**I want to** play music from YouTube  
**So that** I can enjoy music in my radio experience

**Tasks:**
- [ ] 2.1.1: Set up YouTube Data API v3 credentials
- [ ] 2.1.2: Implement YouTube search functionality
- [ ] 2.1.3: Build YouTube player component (react-youtube)
- [ ] 2.1.4: Add playlist management
- [ ] 2.1.5: Implement background playback for mobile
- [ ] 2.1.6: Track user's YouTube likes and history
- [ ] 2.1.7: Add YouTube music recommendations

**Dependencies:** Frontend setup, User authentication

#### Story 2.2: Spotify Integration
**As a** user  
**I want to** play music from Spotify  
**So that** I have access to licensed music streaming

**Tasks:**
- [ ] 2.2.1: Set up Spotify Developer account and app
- [ ] 2.2.2: Implement Spotify OAuth flow
- [ ] 2.2.3: Integrate Spotify Web SDK for playback
- [ ] 2.2.4: Build Spotify search and browse UI
- [ ] 2.2.5: Sync user's Spotify playlists and liked songs
- [ ] 2.2.6: Implement Spotify playback controls
- [ ] 2.2.7: Add currently playing track display
- [ ] 2.2.8: Handle Spotify Premium vs Free users

**Dependencies:** Frontend setup, User authentication

#### Story 2.3: Unified Music Player
**As a** user  
**I want to** have a unified player for YouTube and Spotify  
**So that** I have a seamless music experience

**Tasks:**
- [ ] 2.3.1: Create abstracted music player interface
- [ ] 2.3.2: Build unified playback controls
- [ ] 2.3.3: Implement queue management (mixed sources)
- [ ] 2.3.4: Add crossfade and transition effects
- [ ] 2.3.5: Build now playing screen
- [ ] 2.3.6: Implement playback history

**Dependencies:** Stories 2.1, 2.2

---

### Epic 3: AI Content Curation Engine
**Priority:** Critical  
**Estimated Effort:** 50 hours

#### Story 3.1: Content Embeddings & Semantic Search
**As a** system  
**I want to** create embeddings for all content  
**So that** I can find semantically similar content

**Tasks:**
- [ ] 3.1.1: Integrate OpenAI embeddings API
- [ ] 3.1.2: Set up vector database (Pinecone or Chroma)
- [ ] 3.1.3: Create embedding generation pipeline
- [ ] 3.1.4: Implement batch processing for existing content
- [ ] 3.1.5: Build semantic search functionality
- [ ] 3.1.6: Add content clustering for topic discovery

**Dependencies:** Content ingestion system

#### Story 3.2: User Preference Learning
**As a** system  
**I want to** learn user preferences from their behavior  
**So that** I can personalize content recommendations

**Tasks:**
- [ ] 3.2.1: Track user interactions (plays, skips, likes, dislikes)
- [ ] 3.2.2: Build user preference profile model
- [ ] 3.2.3: Implement collaborative filtering
- [ ] 3.2.4: Add content-based filtering
- [ ] 3.2.5: Create hybrid recommendation system
- [ ] 3.2.6: Implement A/B testing for recommendations

**Dependencies:** User tracking system, Database schema

#### Story 3.3: Content Classification
**As a** system  
**I want to** automatically classify content by type and topic  
**So that** I can curate appropriate radio segments

**Tasks:**
- [ ] 3.3.1: Build content classification with LLM
- [ ] 3.3.2: Define content categories (news, education, entertainment, etc.)
- [ ] 3.3.3: Extract topics and keywords
- [ ] 3.3.4: Determine content sentiment and tone
- [ ] 3.3.5: Assign content suitability ratings
- [ ] 3.3.6: Store classification metadata

**Dependencies:** AI Engine, Content ingestion

#### Story 3.4: Trending & Discovery
**As a** system  
**I want to** identify trending topics and fresh content  
**So that** radio shows stay current and engaging

**Tasks:**
- [ ] 3.4.1: Implement trending algorithm based on recency and engagement
- [ ] 3.4.2: Track content popularity across users
- [ ] 3.4.3: Add "content freshness" scoring
- [ ] 3.4.4: Build discovery feed for new content
- [ ] 3.4.5: Implement content diversity in recommendations
- [ ] 3.4.6: Add serendipity factor for discovery

**Dependencies:** User tracking, Content classification

---

### Epic 4: AI Radio Show Generation
**Priority:** Critical  
**Estimated Effort:** 60 hours

#### Story 4.1: Radio Show Formats
**As a** user  
**I want to** different types of radio shows  
**So that** I have variety in my listening experience

**Show Types:**
1. **Morning Briefing** - News, weather, motivational content (15-30 min)
2. **Deep Dive** - Long-form educational content (30-60 min)
3. **Music Mix** - Music with brief interludes (60+ min)
4. **Quick Hits** - Short knowledge nuggets (5-10 min)
5. **News Flash** - Breaking news and updates (3-5 min)
6. **Storytelling** - Narrative content (20-40 min)
7. **Interview Style** - Q&A format with synthesized voices (30-45 min)

**Tasks:**
- [ ] 4.1.1: Define show format templates
- [ ] 4.1.2: Create show scheduling logic
- [ ] 4.1.3: Build show format selection UI
- [ ] 4.1.4: Implement format-specific content selection
- [ ] 4.1.5: Add user preference for show types

**Dependencies:** Content curation system

#### Story 4.2: Script Generation
**As a** system  
**I want to** generate radio show scripts using AI  
**So that** content is presented in an engaging format

**Tasks:**
- [ ] 4.2.1: Design prompt templates for each show type
- [ ] 4.2.2: Integrate GPT-4 or Claude for script generation
- [ ] 4.2.3: Implement context management (previous shows, user context)
- [ ] 4.2.4: Add personality and tone customization
- [ ] 4.2.5: Build script structure (intro, segments, transitions, outro)
- [ ] 4.2.6: Implement fact-checking and citation
- [ ] 4.2.7: Add humor and engagement elements
- [ ] 4.2.8: Create script approval/editing interface

**Dependencies:** AI Engine, Content curation

#### Story 4.3: Text-to-Speech Integration
**As a** system  
**I want to** convert scripts to natural-sounding speech  
**So that** radio shows sound professional

**Tasks:**
- [ ] 4.3.1: Integrate Google Cloud TTS or ElevenLabs
- [ ] 4.3.2: Select and configure voice personas
- [ ] 4.3.3: Implement SSML for prosody control
- [ ] 4.3.4: Add voice variation for different segments
- [ ] 4.3.5: Build audio caching system
- [ ] 4.3.6: Optimize for streaming delivery
- [ ] 4.3.7: Add voice speed/pitch customization

**Dependencies:** Script generation

#### Story 4.4: Audio Mixing & Transitions
**As a** system  
**I want to** mix voice, music, and effects  
**So that** shows sound like professional radio

**Tasks:**
- [ ] 4.4.1: Implement audio mixing with FFmpeg
- [ ] 4.4.2: Add background music and intro/outro jingles
- [ ] 4.4.3: Create smooth transitions between segments
- [ ] 4.4.4: Implement dynamic volume normalization
- [ ] 4.4.5: Add sound effects library
- [ ] 4.4.6: Build audio preview functionality
- [ ] 4.4.7: Optimize audio format for streaming (AAC/Opus)

**Dependencies:** TTS integration, Music integration

#### Story 4.5: Live Radio Stream
**As a** user  
**I want to** listen to a continuous AI radio stream  
**So that** I have a traditional radio experience

**Tasks:**
- [ ] 4.5.1: Build continuous playlist generation
- [ ] 4.5.2: Implement audio streaming server (HLS or DASH)
- [ ] 4.5.3: Create seamless show-to-show transitions
- [ ] 4.5.4: Add "live" radio schedule
- [ ] 4.5.5: Implement buffer management
- [ ] 4.5.6: Build "what's playing now" feature
- [ ] 4.5.7: Add rewind/replay functionality

**Dependencies:** Audio mixing, Show generation

---

### Epic 5: User Management & Personalization
**Priority:** High  
**Estimated Effort:** 30 hours

#### Story 5.1: User Authentication
**As a** user  
**I want to** create an account and log in  
**So that** my preferences are saved

**Tasks:**
- [ ] 5.1.1: Implement JWT-based authentication
- [ ] 5.1.2: Build registration flow
- [ ] 5.1.3: Create login/logout functionality
- [ ] 5.1.4: Add password reset flow
- [ ] 5.1.5: Implement OAuth (Google, Spotify)
- [ ] 5.1.6: Add session management
- [ ] 5.1.7: Build profile management UI

**Dependencies:** Database schema

#### Story 5.2: User Preferences & Settings
**As a** user  
**I want to** customize my experience  
**So that** the app works the way I like

**Tasks:**
- [ ] 5.2.1: Build preferences model (topics, show types, voice, etc.)
- [ ] 5.2.2: Create settings UI
- [ ] 5.2.3: Implement preference persistence
- [ ] 5.2.4: Add content filtering options
- [ ] 5.2.5: Build notification settings
- [ ] 5.2.6: Add theme customization (dark/light mode)

**Dependencies:** User authentication

#### Story 5.3: User History & Library
**As a** user  
**I want to** see my listening history and saved content  
**So that** I can revisit content I enjoyed

**Tasks:**
- [ ] 5.3.1: Track listening history
- [ ] 5.3.2: Implement "like" and "save" functionality
- [ ] 5.3.3: Build library/collection management
- [ ] 5.3.4: Create "recently played" section
- [ ] 5.3.5: Add "favorites" playlist
- [ ] 5.3.6: Implement download for offline listening

**Dependencies:** User authentication

#### Story 5.4: Social Features
**As a** user  
**I want to** share shows and content  
**So that** I can connect with others

**Tasks:**
- [ ] 5.4.1: Add share functionality (link generation)
- [ ] 5.4.2: Build show embedding for websites
- [ ] 5.4.3: Implement comments/feedback system
- [ ] 5.4.4: Add rating system for shows
- [ ] 5.4.5: Create public profiles (optional)

**Dependencies:** User authentication

---

### Epic 6: Frontend Application
**Priority:** Critical  
**Estimated Effort:** 55 hours

#### Story 6.1: App Shell & Navigation
**As a** user  
**I want to** navigate easily through the app  
**So that** I can access all features

**Tasks:**
- [ ] 6.1.1: Set up React + TypeScript project with Vite
- [ ] 6.1.2: Configure Capacitor for mobile builds
- [ ] 6.1.3: Build responsive navigation (bottom tabs for mobile)
- [ ] 6.1.4: Implement routing with React Router
- [ ] 6.1.5: Create global state management
- [ ] 6.1.6: Add loading states and error boundaries
- [ ] 6.1.7: Implement offline support with PWA

**Dependencies:** None (starting point)

#### Story 6.2: Home/Dashboard Screen
**As a** user  
**I want to** see personalized content when I open the app  
**So that** I can quickly start listening

**Components:**
- Featured show of the day
- Continue listening
- Recommended shows
- Quick access to live radio
- Trending content
- Your library shortcuts

**Tasks:**
- [ ] 6.2.1: Design dashboard layout
- [ ] 6.2.2: Build featured content carousel
- [ ] 6.2.3: Implement recommendation cards
- [ ] 6.2.4: Add quick play buttons
- [ ] 6.2.5: Create loading skeletons
- [ ] 6.2.6: Implement pull-to-refresh

**Dependencies:** Backend API, Design system

#### Story 6.3: Radio Player Interface
**As a** user  
**I want to** control playback easily  
**So that** I have a great listening experience

**Tasks:**
- [ ] 6.3.1: Build mini player (persistent bottom bar)
- [ ] 6.3.2: Create full-screen player view
- [ ] 6.3.3: Implement playback controls (play/pause, skip, rewind)
- [ ] 6.3.4: Add progress bar with seek functionality
- [ ] 6.3.5: Build volume control
- [ ] 6.3.6: Display current show/track info
- [ ] 6.3.7: Add like/save/share buttons
- [ ] 6.3.8: Implement sleep timer
- [ ] 6.3.9: Add playback speed control

**Dependencies:** Audio player library integration

#### Story 6.4: Content Upload Interface
**As a** user  
**I want to** easily upload content  
**So that** I can add it to my radio

**Tasks:**
- [ ] 6.4.1: Build file upload component with drag-and-drop
- [ ] 6.4.2: Add upload progress indicators
- [ ] 6.4.3: Create text input interface
- [ ] 6.4.4: Build Google integration (Drive, Docs, Sheets)
- [ ] 6.4.5: Implement web research input
- [ ] 6.4.6: Add content preview before upload
- [ ] 6.4.7: Build upload history view

**Dependencies:** Upload API

#### Story 6.5: Content Library
**As a** user  
**I want to** manage my uploaded content  
**So that** I can organize and use it effectively

**Tasks:**
- [ ] 6.5.1: Build content list view (grid/list toggle)
- [ ] 6.5.2: Implement search and filtering
- [ ] 6.5.3: Add sorting options
- [ ] 6.5.4: Create content detail view
- [ ] 6.5.5: Build edit/delete functionality
- [ ] 6.5.6: Add bulk actions
- [ ] 6.5.7: Implement content tagging

**Dependencies:** Content API

#### Story 6.6: Settings & Profile
**As a** user  
**I want to** manage my account and preferences  
**So that** the app works the way I want

**Tasks:**
- [ ] 6.6.1: Build profile editing interface
- [ ] 6.6.2: Create preferences/settings screen
- [ ] 6.6.3: Implement account management
- [ ] 6.6.4: Add connected services management
- [ ] 6.6.5: Build about/help section
- [ ] 6.6.6: Add logout functionality

**Dependencies:** User API

#### Story 6.7: Mobile-Specific Features
**As a** mobile user  
**I want to** native mobile features  
**So that** the app feels native

**Tasks:**
- [ ] 6.7.1: Implement background audio playback
- [ ] 6.7.2: Add lock screen controls
- [ ] 6.7.3: Implement notifications
- [ ] 6.7.4: Add haptic feedback
- [ ] 6.7.5: Implement deep linking
- [ ] 6.7.6: Add splash screen
- [ ] 6.7.7: Implement app icon and branding

**Dependencies:** Capacitor plugins

---

### Epic 7: Backend API
**Priority:** Critical  
**Estimated Effort:** 45 hours

#### Story 7.1: API Infrastructure
**As a** developer  
**I want to** have a robust API foundation  
**So that** all features work reliably

**Tasks:**
- [ ] 7.1.1: Set up Express.js with TypeScript
- [ ] 7.1.2: Configure middleware (CORS, helmet, compression)
- [ ] 7.1.3: Implement request validation with Zod
- [ ] 7.1.4: Add rate limiting
- [ ] 7.1.5: Set up logging (Winston or Pino)
- [ ] 7.1.6: Implement error handling middleware
- [ ] 7.1.7: Add API documentation with Swagger
- [ ] 7.1.8: Set up health check endpoints

**Dependencies:** None (starting point)

#### Story 7.2: Database Setup
**As a** developer  
**I want to** have a well-structured database  
**So that** data is organized and accessible

**Tasks:**
- [ ] 7.2.1: Set up PostgreSQL with Docker
- [ ] 7.2.2: Configure Prisma ORM
- [ ] 7.2.3: Design database schema (see Schema section below)
- [ ] 7.2.4: Create migrations
- [ ] 7.2.5: Set up Redis for caching
- [ ] 7.2.6: Implement database connection pooling
- [ ] 7.2.7: Add database backup strategy

**Dependencies:** Docker setup

#### Story 7.3: Authentication API
**Tasks:**
- [ ] 7.3.1: Build registration endpoint
- [ ] 7.3.2: Implement login with JWT
- [ ] 7.3.3: Create refresh token mechanism
- [ ] 7.3.4: Add password reset flow
- [ ] 7.3.5: Implement OAuth endpoints (Google, Spotify)
- [ ] 7.3.6: Build auth middleware
- [ ] 7.3.7: Add session management

**Dependencies:** Database setup

#### Story 7.4: Content Management API
**Tasks:**
- [ ] 7.4.1: Build upload endpoints (POST /api/content/upload)
- [ ] 7.4.2: Implement content listing (GET /api/content)
- [ ] 7.4.3: Create content detail endpoint (GET /api/content/:id)
- [ ] 7.4.4: Add content update (PUT /api/content/:id)
- [ ] 7.4.5: Implement content deletion (DELETE /api/content/:id)
- [ ] 7.4.6: Build search endpoint (GET /api/content/search)
- [ ] 7.4.7: Add content processing status tracking

**Dependencies:** Database, File storage

#### Story 7.5: Radio Show API
**Tasks:**
- [ ] 7.5.1: Build show generation endpoint (POST /api/shows/generate)
- [ ] 7.5.2: Implement show listing (GET /api/shows)
- [ ] 7.5.3: Create show detail with audio (GET /api/shows/:id)
- [ ] 7.5.4: Add live stream endpoint (GET /api/radio/live)
- [ ] 7.5.5: Implement show scheduling
- [ ] 7.5.6: Build show history endpoint
- [ ] 7.5.7: Add show regeneration

**Dependencies:** AI engine, Audio processing

#### Story 7.6: User Preferences API
**Tasks:**
- [ ] 7.6.1: Build preferences endpoints (GET/PUT /api/user/preferences)
- [ ] 7.6.2: Implement history tracking (POST /api/user/history)
- [ ] 7.6.3: Create likes/saves endpoints
- [ ] 7.6.4: Add recommendations endpoint (GET /api/recommendations)
- [ ] 7.6.5: Build library management endpoints

**Dependencies:** Database, Recommendation engine

#### Story 7.7: Integration Endpoints
**Tasks:**
- [ ] 7.7.1: Build YouTube proxy endpoints
- [ ] 7.7.2: Implement Spotify integration endpoints
- [ ] 7.7.3: Create Google Drive/Docs endpoints
- [ ] 7.7.4: Add web search endpoint
- [ ] 7.7.5: Build webhook receivers for external services

**Dependencies:** External service integrations

---

### Epic 8: Background Jobs & Automation
**Priority:** High  
**Estimated Effort:** 25 hours

#### Story 8.1: Content Processing Jobs
**As a** system  
**I want to** process content asynchronously  
**So that** uploads don't block users

**Tasks:**
- [ ] 8.1.1: Set up Bull queue with Redis
- [ ] 8.1.2: Create file processing job
- [ ] 8.1.3: Build transcription job
- [ ] 8.1.4: Implement embedding generation job
- [ ] 8.1.5: Add content classification job
- [ ] 8.1.6: Build job status tracking
- [ ] 8.1.7: Implement job retry logic

**Dependencies:** Redis, Content processing

#### Story 8.2: Scheduled Content Refresh
**As a** system  
**I want to** automatically refresh content  
**So that** radio shows stay current

**Tasks:**
- [ ] 8.2.1: Set up cron jobs with node-cron
- [ ] 8.2.2: Build daily news fetch job
- [ ] 8.2.3: Implement trending topic update job
- [ ] 8.2.4: Create user feed sync job (YouTube, Spotify)
- [ ] 8.2.5: Add recommendation cache refresh
- [ ] 8.2.6: Build show pre-generation job
- [ ] 8.2.7: Implement cleanup job for old content

**Dependencies:** External integrations, Recommendation engine

#### Story 8.3: User Engagement Jobs
**As a** system  
**I want to** send notifications and updates  
**So that** users stay engaged

**Tasks:**
- [ ] 8.3.1: Build notification queue
- [ ] 8.3.2: Implement new show notifications
- [ ] 8.3.3: Create daily digest job
- [ ] 8.3.4: Add trending content alerts
- [ ] 8.3.5: Build email notification system

**Dependencies:** User management, Notification service

---

### Epic 9: DevOps & Deployment
**Priority:** High  
**Estimated Effort:** 20 hours

#### Story 9.1: Docker Configuration
**As a** developer  
**I want to** containerize the application  
**So that** it's easy to deploy and develop

**Tasks:**
- [ ] 9.1.1: Create Dockerfile for backend
- [ ] 9.1.2: Create Dockerfile for frontend
- [ ] 9.1.3: Build docker-compose.yml for local development
- [ ] 9.1.4: Add database container configuration
- [ ] 9.1.5: Configure Redis container
- [ ] 9.1.6: Set up volume mounts for persistence
- [ ] 9.1.7: Create .dockerignore files
- [ ] 9.1.8: Add Docker networking configuration
- [ ] 9.1.9: Create development and production configs

**Dependencies:** Application code complete

#### Story 9.2: Environment Configuration
**Tasks:**
- [ ] 9.2.1: Create .env.example files
- [ ] 9.2.2: Document all environment variables
- [ ] 9.2.3: Set up environment validation
- [ ] 9.2.4: Create separate configs for dev/staging/prod
- [ ] 9.2.5: Add secrets management strategy

**Dependencies:** Application setup

#### Story 9.3: CI/CD Pipeline
**Tasks:**
- [ ] 9.3.1: Create GitHub Actions workflow
- [ ] 9.3.2: Add linting and type checking
- [ ] 9.3.3: Implement automated testing
- [ ] 9.3.4: Build Docker images on push
- [ ] 9.3.5: Add automated deployment (optional)

**Dependencies:** Docker configuration

---

### Epic 10: Testing & Quality Assurance
**Priority:** High  
**Estimated Effort:** 30 hours

#### Story 10.1: Backend Testing
**Tasks:**
- [ ] 10.1.1: Set up Jest for backend
- [ ] 10.1.2: Write unit tests for services
- [ ] 10.1.3: Create integration tests for API endpoints
- [ ] 10.1.4: Add database test fixtures
- [ ] 10.1.5: Implement mocking for external services
- [ ] 10.1.6: Achieve 70%+ code coverage

#### Story 10.2: Frontend Testing
**Tasks:**
- [ ] 10.2.1: Set up Vitest for frontend
- [ ] 10.2.2: Write component tests with Testing Library
- [ ] 10.2.3: Add integration tests for user flows
- [ ] 10.2.4: Implement E2E tests with Playwright
- [ ] 10.2.5: Test mobile-specific features

#### Story 10.3: Performance Testing
**Tasks:**
- [ ] 10.3.1: Benchmark API response times
- [ ] 10.3.2: Test audio streaming performance
- [ ] 10.3.3: Measure app load time
- [ ] 10.3.4: Test with large content libraries
- [ ] 10.3.5: Optimize based on results

---

### Epic 11: Mobile Build & Deployment
**Priority:** Critical  
**Estimated Effort:** 15 hours

#### Story 11.1: Android Build
**As a** developer  
**I want to** build an Android APK  
**So that** users can test the app

**Tasks:**
- [ ] 11.1.1: Configure Capacitor for Android
- [ ] 11.1.2: Set up Android Studio requirements
- [ ] 11.1.3: Configure app permissions in AndroidManifest.xml
- [ ] 11.1.4: Add app icons and splash screens
- [ ] 11.1.5: Build debug APK
- [ ] 11.1.6: Test on physical device
- [ ] 11.1.7: Build release APK with signing
- [ ] 11.1.8: Optimize APK size

**Dependencies:** Frontend complete, Capacitor setup

#### Story 11.2: iOS Build (Future)
**Tasks:**
- [ ] 11.2.1: Configure Capacitor for iOS
- [ ] 11.2.2: Set up Xcode requirements
- [ ] 11.2.3: Configure Info.plist
- [ ] 11.2.4: Build iOS app
- [ ] 11.2.5: Test on iOS device

---

## Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  display_name VARCHAR(255),
  avatar_url TEXT,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  spotify_token TEXT,
  spotify_refresh_token TEXT,
  spotify_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

#### user_preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_show_types JSONB DEFAULT '[]',
  preferred_topics JSONB DEFAULT '[]',
  preferred_voice VARCHAR(50) DEFAULT 'default',
  music_preference VARCHAR(20) DEFAULT 'mixed', -- youtube, spotify, mixed
  notification_enabled BOOLEAN DEFAULT true,
  autoplay_enabled BOOLEAN DEFAULT true,
  content_filter JSONB DEFAULT '{}',
  theme VARCHAR(20) DEFAULT 'auto',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### content
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- audio, video, document, text, web
  source_type VARCHAR(50), -- upload, google_drive, paste, web_search, youtube, spotify
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  duration_seconds INT,
  extracted_text TEXT,
  summary TEXT,
  topics JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  sentiment VARCHAR(20),
  language VARCHAR(10) DEFAULT 'en',
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_status ON content(processing_status);
CREATE INDEX idx_content_created ON content(created_at DESC);
```

#### content_embeddings
```sql
CREATE TABLE content_embeddings (
  content_id UUID PRIMARY KEY REFERENCES content(id) ON DELETE CASCADE,
  embedding_model VARCHAR(100) NOT NULL,
  embedding VECTOR(1536), -- Assuming OpenAI embeddings
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_embedding_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops);
```

#### radio_shows
```sql
CREATE TABLE radio_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  show_type VARCHAR(50) NOT NULL, -- morning_briefing, deep_dive, music_mix, etc.
  duration_seconds INT,
  script TEXT,
  audio_url TEXT,
  status VARCHAR(20) DEFAULT 'generating', -- generating, ready, failed
  source_content_ids JSONB DEFAULT '[]',
  music_tracks JSONB DEFAULT '[]',
  play_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP,
  generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shows_user_id ON radio_shows(user_id);
CREATE INDEX idx_shows_status ON radio_shows(status);
CREATE INDEX idx_shows_scheduled ON radio_shows(scheduled_at);
```

#### listening_history
```sql
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL, -- show, music, content
  item_id UUID NOT NULL,
  play_duration_seconds INT,
  completed BOOLEAN DEFAULT false,
  progress_seconds INT DEFAULT 0,
  played_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_user_id ON listening_history(user_id);
CREATE INDEX idx_history_played_at ON listening_history(played_at DESC);
```

#### user_likes
```sql
CREATE TABLE user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL, -- show, content, music
  item_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_likes_user ON user_likes(user_id);
```

#### user_library
```sql
CREATE TABLE user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  item_id UUID NOT NULL,
  folder VARCHAR(255) DEFAULT 'default',
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);
```

#### music_tracks
```sql
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(20) NOT NULL, -- youtube, spotify
  source_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  artist VARCHAR(500),
  album VARCHAR(500),
  duration_seconds INT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source, source_id)
);
```

#### jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  payload JSONB,
  result JSONB,
  error TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/oauth/:provider` - OAuth login (Google, Spotify)
- `GET /api/auth/oauth/:provider/callback` - OAuth callback

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/stats` - Get user statistics

### Content
- `POST /api/content/upload` - Upload file
- `POST /api/content/text` - Add text content
- `POST /api/content/url` - Add content from URL
- `POST /api/content/google` - Import from Google Drive/Docs
- `GET /api/content` - List user's content
- `GET /api/content/:id` - Get content detail
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `POST /api/content/search` - Search content
- `GET /api/content/:id/similar` - Find similar content

### Radio Shows
- `POST /api/shows/generate` - Generate new show
- `GET /api/shows` - List shows
- `GET /api/shows/:id` - Get show detail
- `GET /api/shows/:id/audio` - Stream show audio
- `DELETE /api/shows/:id` - Delete show
- `POST /api/shows/:id/regenerate` - Regenerate show
- `GET /api/radio/live` - Get live radio stream
- `GET /api/radio/schedule` - Get radio schedule

### Music
- `GET /api/music/search` - Search music (YouTube + Spotify)
- `GET /api/music/youtube/search` - Search YouTube
- `GET /api/music/spotify/search` - Search Spotify
- `GET /api/music/spotify/playlists` - Get user's Spotify playlists
- `GET /api/music/spotify/liked` - Get liked songs from Spotify
- `GET /api/music/recommendations` - Get music recommendations

### User Interactions
- `POST /api/user/history` - Add to listening history
- `GET /api/user/history` - Get listening history
- `POST /api/user/likes` - Like item
- `DELETE /api/user/likes/:id` - Unlike item
- `GET /api/user/likes` - Get liked items
- `POST /api/user/library` - Add to library
- `DELETE /api/user/library/:id` - Remove from library
- `GET /api/user/library` - Get library items

### Recommendations
- `GET /api/recommendations/shows` - Get recommended shows
- `GET /api/recommendations/content` - Get recommended content
- `GET /api/recommendations/music` - Get recommended music
- `GET /api/recommendations/trending` - Get trending content

### Research
- `POST /api/research/search` - Perform web search
- `POST /api/research/deep` - Deep research on topic
- `GET /api/research/results/:id` - Get research results

### Admin/System
- `GET /api/health` - Health check
- `GET /api/jobs/:id` - Get job status
- `POST /api/jobs/:id/retry` - Retry failed job

---

## External Services & API Keys Required

### Critical
1. **OpenAI API**
   - Purpose: LLM for content generation, embeddings
   - Endpoint: https://api.openai.com/v1
   - Cost: ~$0.01-0.03 per show generated

2. **Text-to-Speech Service**
   - Option 1: Google Cloud TTS (recommended)
   - Option 2: ElevenLabs (higher quality, more expensive)
   - Cost: ~$0.10-0.30 per show

3. **YouTube Data API v3**
   - Purpose: Search, playback, user data
   - Free tier: 10,000 units/day
   - No cost for playback

4. **Spotify Web API**
   - Purpose: Music streaming, user data
   - Free tier available
   - Requires Spotify Premium for full playback

### Important
5. **Google Cloud Services**
   - Purpose: Drive API, Docs API, Sheets API
   - Free tier available

6. **Whisper API (OpenAI)**
   - Purpose: Audio transcription
   - Cost: $0.006 per minute

7. **Web Search API**
   - Option 1: Serper API (recommended)
   - Option 2: Google Custom Search
   - Cost: ~$0.001-0.005 per search

### Optional
8. **AWS S3** or **MinIO**
   - Purpose: File storage
   - Cost: Variable

9. **PostgreSQL Cloud** (if not self-hosted)
   - Options: Supabase, Railway, Heroku

10. **Redis Cloud** (if not self-hosted)
    - Options: Redis Cloud, Upstash

---

## Dependencies & Installation

### System Requirements
- Node.js 20.x LTS
- PostgreSQL 16.x
- Redis 7.x
- FFmpeg (for audio processing)
- Docker & Docker Compose (recommended)
- Android Studio (for APK build)
- Java JDK 17+ (for Android build)

### Frontend Dependencies
```json
{
  "@capacitor/android": "^6.0.0",
  "@capacitor/app": "^6.0.0",
  "@capacitor/core": "^6.0.0",
  "@capacitor/filesystem": "^6.0.0",
  "@capacitor/haptics": "^6.0.0",
  "@capacitor/ios": "^6.0.0",
  "@capacitor/splash-screen": "^6.0.0",
  "@capacitor/status-bar": "^6.0.0",
  "@mui/material": "^5.15.0",
  "@mui/icons-material": "^5.15.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-redux": "^9.0.0",
  "react-router-dom": "^6.21.0",
  "axios": "^1.6.0",
  "howler": "^2.2.4",
  "react-dropzone": "^14.2.0",
  "react-youtube": "^10.1.0",
  "tailwindcss": "^3.4.0"
}
```

### Backend Dependencies
```json
{
  "@prisma/client": "^5.8.0",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "zod": "^3.22.0",
  "bull": "^4.12.0",
  "redis": "^4.6.0",
  "winston": "^3.11.0",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "fluent-ffmpeg": "^2.1.2",
  "pdf-parse": "^1.1.1",
  "cheerio": "^1.0.0-rc.12",
  "axios": "^1.6.0",
  "openai": "^4.24.0",
  "googleapis": "^131.0.0",
  "node-cron": "^3.0.3",
  "dotenv": "^16.3.1"
}
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [x] Project setup and structure
- [ ] Database design and setup
- [ ] Basic authentication
- [ ] API infrastructure
- [ ] Frontend shell

### Phase 2: Content Ingestion (Week 2-3)
- [ ] File upload system
- [ ] Document processing
- [ ] Audio/video transcription
- [ ] Text input
- [ ] Web search integration

### Phase 3: Music Integration (Week 3-4)
- [ ] YouTube integration
- [ ] Spotify integration
- [ ] Unified player
- [ ] Music recommendations

### Phase 4: AI Engine (Week 4-5)
- [ ] Content embeddings
- [ ] Classification system
- [ ] Recommendation engine
- [ ] Script generation
- [ ] TTS integration

### Phase 5: Radio Shows (Week 5-6)
- [ ] Show format definitions
- [ ] Script generation
- [ ] Audio mixing
- [ ] Live stream setup

### Phase 6: Frontend (Week 6-7)
- [ ] All UI screens
- [ ] Player interface
- [ ] Upload interface
- [ ] Settings and profile

### Phase 7: Mobile & Testing (Week 7-8)
- [ ] Capacitor integration
- [ ] Mobile-specific features
- [ ] Testing
- [ ] Bug fixes
- [ ] APK build

### Phase 8: Polish & Deploy (Week 8)
- [ ] Performance optimization
- [ ] Docker setup
- [ ] Documentation
- [ ] Final testing
- [ ] Release APK

---

## Risk Management

### Technical Risks
1. **AI API Costs**
   - Mitigation: Implement caching, batch processing, usage limits
   
2. **Audio Processing Performance**
   - Mitigation: Background jobs, pre-generation, CDN for delivery

3. **Third-party API Rate Limits**
   - Mitigation: Request caching, exponential backoff, premium tier if needed

4. **Mobile Background Playback**
   - Mitigation: Use proven Capacitor plugins, test extensively

5. **Content Storage Costs**
   - Mitigation: Compression, cleanup jobs, user quotas

### Business Risks
1. **Spotify Premium Requirement**
   - Mitigation: Support YouTube as fallback, clearly communicate requirements

2. **API Key Management**
   - Mitigation: Secure key storage, rotation policy

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Average session duration
- Shows generated per user
- Content uploaded per user
- Return rate (7-day, 30-day)

### Technical Performance
- API response time < 200ms (p95)
- Show generation time < 2 minutes
- App load time < 3 seconds
- Crash-free rate > 99%

### Content Quality
- User ratings for shows (target > 4.0/5)
- Skip rate < 30%
- Completion rate > 60%

---

## Future Enhancements (Post-MVP)

1. **Multi-language Support**
   - Translation of content
   - Multi-lingual TTS voices
   - Language-specific recommendations

2. **Podcast Mode**
   - Multi-episode series
   - RSS feed generation
   - Podcast distribution

3. **Collaborative Features**
   - Shared radio stations
   - Co-created content
   - Social feed

4. **Advanced AI Features**
   - Voice cloning for personalized host
   - AI-generated music
   - Real-time news integration

5. **Monetization**
   - Premium features
   - Ad insertion
   - Content creator tools

6. **Smart Integrations**
   - Calendar integration for briefings
   - Location-based content
   - Smart home device support

7. **Analytics Dashboard**
   - Usage analytics
   - Content performance
   - Recommendation insights

---

## Glossary

- **Radio Show**: AI-generated audio program combining content and music
- **Content**: User-uploaded or imported material (documents, audio, video, text)
- **Curation**: AI-powered selection of relevant content for shows
- **Script**: Generated text for TTS in radio shows
- **Embedding**: Vector representation of content for semantic search
- **Show Format**: Template defining structure of radio show (e.g., Morning Briefing)
- **Knowledge Nugget**: Short factoid or tip (3-5 minutes)
- **Live Radio**: Continuous stream of pre-generated shows
- **Deep Research**: Comprehensive web search with multiple queries
- **TTS**: Text-to-Speech synthesis

---

## Notes for Cursor Agent

This document serves as the source of truth for the AI Radio App project. 

**Instructions for automatic updates:**
- When new features are added during development, append them to relevant Epic section
- Update dependency status as integrations are completed
- Mark tasks as complete with checkmarks
- Add new risks or technical decisions to appropriate sections
- Update tech stack versions when dependencies are upgraded
- Log any API changes or breaking changes in a dedicated section below

**Change Log:**
- 2026-01-04: Initial project plan created
- [Future updates will be appended here]

---

## Contact & Resources

- **Project Repository**: /workspace (current)
- **Documentation**: /workspace/docs (to be created)
- **Environment Setup**: See Docker Compose configuration
- **API Documentation**: Will be available at http://localhost:3000/api-docs after setup

---

*This document will be automatically updated by the Cursor Agent as development progresses.*
