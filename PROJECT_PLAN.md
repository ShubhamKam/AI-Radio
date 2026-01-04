# AI Radio App - Project Plan & Development Guide

## Project Overview

**Project Name:** AI Radio  
**Version:** 1.0.0  
**Last Updated:** January 4, 2026  
**Status:** In Development

### Vision
Build an intelligent AI-powered radio application that transforms various content inputs (audio, video, documents, web research) into engaging radio shows, knowledge nudges, and seamless music experiences through YouTube and Spotify integration.

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Technical Architecture](#technical-architecture)
3. [Epic & Stories](#epic--stories)
4. [Task Breakdown](#task-breakdown)
5. [Dependencies](#dependencies)
6. [API Integrations](#api-integrations)
7. [Database Schema](#database-schema)
8. [Development Phases](#development-phases)
9. [Testing Strategy](#testing-strategy)

---

## Features Overview

### Core Features

| Feature ID | Feature Name | Description | Priority |
|------------|--------------|-------------|----------|
| F001 | Multi-Format Input Processing | Accept audio, video, slides, Google Sheets/Docs, text | High |
| F002 | YouTube Integration | Search, play, and curate music from YouTube | High |
| F003 | Spotify Integration | Stream music and access playlists from Spotify | High |
| F004 | AI Content Engine | ML-driven content curation and radio show generation | Critical |
| F005 | Live AI Radio Player | Real-time radio experience with shows and music | Critical |
| F006 | Web Research | Deep and wide research through web search | Medium |
| F007 | User Personalization | Feeds, history, likes, subscriptions | High |
| F008 | Knowledge Nudges | Quick informational snippets during playback | Medium |
| F009 | Auto-Refresh Content | Regular content updates based on user preferences | High |
| F010 | Content Discovery | AI-powered content matching and recommendations | High |

### Input Sources Supported

- **Audio Files:** MP3, WAV, AAC, FLAC, OGG
- **Video Files:** MP4, AVI, MOV, MKV, WebM
- **Documents:** PDF, DOCX, PPTX, TXT
- **Cloud Documents:** Google Docs, Google Sheets, Google Slides
- **Text Input:** Pasted text, URLs
- **Web Search:** Google Search integration for research
- **Music Platforms:** YouTube, Spotify

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **UI Library:** Tailwind CSS + Headless UI
- **State Management:** Zustand
- **Audio/Video:** Howler.js, React Player
- **Mobile:** Capacitor for Android APK

### Backend Stack
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js with TypeScript
- **Database:** SQLite (development) / PostgreSQL (production)
- **ORM:** Prisma
- **Queue:** Bull (Redis-backed job queue)
- **AI/ML:** OpenAI API, Whisper for transcription

### Infrastructure
- **Container:** Docker with Docker Compose
- **Process Manager:** PM2
- **Caching:** Redis

### External APIs
- YouTube Data API v3
- Spotify Web API
- Google Cloud APIs (Docs, Sheets, Drive)
- OpenAI API (GPT-4, Whisper)
- Google Custom Search API

---

## Epic & Stories

### Epic 1: Content Input System
**Goal:** Enable users to input content from multiple sources

#### Story 1.1: File Upload System
- **ID:** S-101
- **Description:** As a user, I want to upload audio/video/document files so that they can be processed for radio content
- **Acceptance Criteria:**
  - Support drag-and-drop file upload
  - Show upload progress
  - Validate file types and sizes
  - Store files securely
- **Story Points:** 8

#### Story 1.2: Google Integration
- **ID:** S-102
- **Description:** As a user, I want to connect my Google account to import Docs, Sheets, and Slides
- **Acceptance Criteria:**
  - OAuth2 authentication with Google
  - List and select documents
  - Import document content
  - Sync changes periodically
- **Story Points:** 13

#### Story 1.3: Text Input Processing
- **ID:** S-103
- **Description:** As a user, I want to paste text or URLs for content processing
- **Acceptance Criteria:**
  - Text area for pasting content
  - URL detection and content extraction
  - Character/word count display
  - Save as draft option
- **Story Points:** 5

#### Story 1.4: Web Research Integration
- **ID:** S-104
- **Description:** As a user, I want to search the web for information to include in my radio content
- **Acceptance Criteria:**
  - Search input with suggestions
  - Deep research mode (comprehensive)
  - Wide research mode (broad overview)
  - Save research results
- **Story Points:** 13

### Epic 2: Music Platform Integration
**Goal:** Seamless music playback through YouTube and Spotify

#### Story 2.1: YouTube Music Integration
- **ID:** S-201
- **Description:** As a user, I want to search and play music from YouTube
- **Acceptance Criteria:**
  - Search YouTube for music
  - Display search results with thumbnails
  - Play audio from YouTube videos
  - Create and manage playlists
- **Story Points:** 13

#### Story 2.2: Spotify Integration
- **ID:** S-202
- **Description:** As a user, I want to connect Spotify and play my music
- **Acceptance Criteria:**
  - Spotify OAuth authentication
  - Access user's playlists and saved tracks
  - Playback controls (requires Spotify Premium)
  - Display currently playing track
- **Story Points:** 13

#### Story 2.3: Unified Music Player
- **ID:** S-203
- **Description:** As a user, I want a single player interface for all music sources
- **Acceptance Criteria:**
  - Unified play/pause/skip controls
  - Volume and progress controls
  - Queue management
  - Source indicator (YouTube/Spotify)
- **Story Points:** 8

### Epic 3: AI Content Engine
**Goal:** Intelligent content processing and radio show generation

#### Story 3.1: Content Transcription
- **ID:** S-301
- **Description:** As a system, I want to transcribe audio/video content to text
- **Acceptance Criteria:**
  - Use Whisper API for transcription
  - Support multiple languages
  - Timestamp alignment
  - Speaker diarization
- **Story Points:** 13

#### Story 3.2: Content Analysis
- **ID:** S-302
- **Description:** As a system, I want to analyze content for topics, sentiment, and key points
- **Acceptance Criteria:**
  - Extract main topics and themes
  - Sentiment analysis
  - Key points extraction
  - Generate content summary
- **Story Points:** 13

#### Story 3.3: Radio Show Generator
- **ID:** S-303
- **Description:** As a system, I want to generate radio show scripts from content
- **Acceptance Criteria:**
  - Multiple show formats (news, talk, educational)
  - Natural conversational style
  - Music cue integration
  - Customizable show length
- **Story Points:** 21

#### Story 3.4: Text-to-Speech Engine
- **ID:** S-304
- **Description:** As a system, I want to convert show scripts to natural speech
- **Acceptance Criteria:**
  - Multiple voice options
  - Adjustable speaking rate
  - Emotional tone variation
  - Background music mixing
- **Story Points:** 13

#### Story 3.5: Content Curation Algorithm
- **ID:** S-305
- **Description:** As a system, I want to curate content based on user preferences
- **Acceptance Criteria:**
  - Learn from user interactions
  - Time-based content scheduling
  - Trending content detection
  - Diversity in recommendations
- **Story Points:** 21

### Epic 4: AI Radio Player
**Goal:** Immersive live radio experience

#### Story 4.1: Radio Player Interface
- **ID:** S-401
- **Description:** As a user, I want a radio-style interface for listening
- **Acceptance Criteria:**
  - Classic radio dial design
  - Channel/station selection
  - Now playing display
  - Upcoming shows preview
- **Story Points:** 13

#### Story 4.2: Live Radio Stream
- **ID:** S-402
- **Description:** As a user, I want continuous radio playback like a live station
- **Acceptance Criteria:**
  - Seamless content transitions
  - Music interleaved with content
  - Time-based programming
  - Background playback support
- **Story Points:** 21

#### Story 4.3: Knowledge Nudges
- **ID:** S-403
- **Description:** As a user, I want quick knowledge snippets during music
- **Acceptance Criteria:**
  - Brief audio snippets (15-30 seconds)
  - Visual notification option
  - Skip or replay controls
  - Save for later feature
- **Story Points:** 8

### Epic 5: User Personalization
**Goal:** Personalized experience based on user behavior

#### Story 5.1: User Authentication
- **ID:** S-501
- **Description:** As a user, I want to create an account and login
- **Acceptance Criteria:**
  - Email/password registration
  - Social login (Google, Apple)
  - Password reset flow
  - Session management
- **Story Points:** 8

#### Story 5.2: Listening History
- **ID:** S-502
- **Description:** As a user, I want to see my listening history
- **Acceptance Criteria:**
  - Track all played content
  - Filter by type/date
  - Resume playback option
  - Clear history option
- **Story Points:** 5

#### Story 5.3: Likes and Subscriptions
- **ID:** S-503
- **Description:** As a user, I want to like content and subscribe to channels
- **Acceptance Criteria:**
  - Like/unlike functionality
  - Subscribe to content creators/topics
  - Notification preferences
  - Export liked content
- **Story Points:** 8

#### Story 5.4: Personalized Feed
- **ID:** S-504
- **Description:** As a user, I want a personalized content feed
- **Acceptance Criteria:**
  - Algorithm-based recommendations
  - Mix of new and familiar content
  - Refresh manually or auto
  - Feedback mechanism
- **Story Points:** 13

---

## Task Breakdown

### Phase 1: Foundation (Week 1-2)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-001 | Setup React project with TypeScript | - | Dev | Pending | - |
| T-002 | Setup Express.js backend | - | Dev | Pending | - |
| T-003 | Configure Prisma with SQLite | - | Dev | Pending | T-002 |
| T-004 | Setup Docker development environment | - | Dev | Pending | T-001, T-002 |
| T-005 | Create database schema | - | Dev | Pending | T-003 |
| T-006 | Setup Capacitor for mobile | - | Dev | Pending | T-001 |
| T-007 | Configure Tailwind CSS | - | Dev | Pending | T-001 |
| T-008 | Setup API routing structure | - | Dev | Pending | T-002 |
| T-009 | Implement basic authentication | S-501 | Dev | Pending | T-005 |
| T-010 | Create file upload endpoint | S-101 | Dev | Pending | T-008 |

### Phase 2: Input Processing (Week 3-4)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-011 | Build file upload UI component | S-101 | Dev | Pending | T-007 |
| T-012 | Implement audio file processor | S-101 | Dev | Pending | T-010 |
| T-013 | Implement video file processor | S-101 | Dev | Pending | T-010 |
| T-014 | Implement document parser | S-101 | Dev | Pending | T-010 |
| T-015 | Setup Google OAuth | S-102 | Dev | Pending | T-009 |
| T-016 | Implement Google Docs API | S-102 | Dev | Pending | T-015 |
| T-017 | Implement Google Sheets API | S-102 | Dev | Pending | T-015 |
| T-018 | Build text input component | S-103 | Dev | Pending | T-007 |
| T-019 | Implement URL content extractor | S-103 | Dev | Pending | T-008 |
| T-020 | Setup Google Custom Search | S-104 | Dev | Pending | T-008 |

### Phase 3: Music Integration (Week 5-6)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-021 | Setup YouTube Data API | S-201 | Dev | Pending | T-008 |
| T-022 | Build YouTube search component | S-201 | Dev | Pending | T-021 |
| T-023 | Implement YouTube audio extraction | S-201 | Dev | Pending | T-021 |
| T-024 | Setup Spotify OAuth | S-202 | Dev | Pending | T-009 |
| T-025 | Implement Spotify Web Playback SDK | S-202 | Dev | Pending | T-024 |
| T-026 | Build playlist management | S-201, S-202 | Dev | Pending | T-022, T-025 |
| T-027 | Create unified player component | S-203 | Dev | Pending | T-023, T-025 |
| T-028 | Implement queue system | S-203 | Dev | Pending | T-027 |

### Phase 4: AI Engine (Week 7-9)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-029 | Setup OpenAI API integration | S-301 | Dev | Pending | T-008 |
| T-030 | Implement Whisper transcription | S-301 | Dev | Pending | T-029 |
| T-031 | Build content analysis service | S-302 | Dev | Pending | T-029 |
| T-032 | Create topic extraction algorithm | S-302 | Dev | Pending | T-031 |
| T-033 | Build radio script generator | S-303 | Dev | Pending | T-031 |
| T-034 | Implement show templates | S-303 | Dev | Pending | T-033 |
| T-035 | Setup TTS service | S-304 | Dev | Pending | T-029 |
| T-036 | Build audio mixer service | S-304 | Dev | Pending | T-035 |
| T-037 | Create curation algorithm | S-305 | Dev | Pending | T-031 |
| T-038 | Implement ML recommendation model | S-305 | Dev | Pending | T-037 |

### Phase 5: Radio Player (Week 10-11)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-039 | Design radio player UI | S-401 | Dev | Pending | T-007 |
| T-040 | Build channel selection | S-401 | Dev | Pending | T-039 |
| T-041 | Implement now playing display | S-401 | Dev | Pending | T-039 |
| T-042 | Create streaming service | S-402 | Dev | Pending | T-036 |
| T-043 | Build content scheduler | S-402 | Dev | Pending | T-037 |
| T-044 | Implement seamless transitions | S-402 | Dev | Pending | T-042 |
| T-045 | Create knowledge nudge system | S-403 | Dev | Pending | T-031 |
| T-046 | Build nudge UI component | S-403 | Dev | Pending | T-045 |

### Phase 6: Personalization (Week 12-13)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-047 | Implement listening history tracking | S-502 | Dev | Pending | T-009 |
| T-048 | Build history UI | S-502 | Dev | Pending | T-047 |
| T-049 | Create like/unlike functionality | S-503 | Dev | Pending | T-009 |
| T-050 | Implement subscription system | S-503 | Dev | Pending | T-009 |
| T-051 | Build personalized feed algorithm | S-504 | Dev | Pending | T-038 |
| T-052 | Create feed UI component | S-504 | Dev | Pending | T-051 |
| T-053 | Implement auto-refresh service | S-504 | Dev | Pending | T-051 |

### Phase 7: Polish & Build (Week 14)

| Task ID | Task | Story | Assignee | Status | Dependencies |
|---------|------|-------|----------|--------|--------------|
| T-054 | Mobile UI optimization | - | Dev | Pending | All UI tasks |
| T-055 | Performance optimization | - | Dev | Pending | All tasks |
| T-056 | Build Android APK | - | Dev | Pending | T-054 |
| T-057 | Testing and bug fixes | - | Dev | Pending | T-056 |
| T-058 | Documentation | - | Dev | Pending | All tasks |

---

## Dependencies

### NPM Packages (Frontend)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "zustand": "^4.4.7",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.1.1",
    "howler": "^2.2.4",
    "react-player": "^2.14.1",
    "axios": "^1.6.2",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "@capacitor/core": "^5.6.0",
    "@capacitor/android": "^5.6.0",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "@vitejs/plugin-react": "^4.2.1",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### NPM Packages (Backend)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "openai": "^4.24.1",
    "googleapis": "^129.0.0",
    "spotify-web-api-node": "^5.0.2",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2",
    "fluent-ffmpeg": "^2.1.2",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "node-fetch": "^3.3.2",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prisma": "^5.7.1",
    "@types/express": "^4.17.21",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "tsx": "^4.7.0"
  }
}
```

### System Dependencies

- Node.js 20 LTS
- Redis 7.x
- FFmpeg 6.x
- Android SDK (for APK build)
- Java 17 (for Android build)

---

## API Integrations

### YouTube Data API v3

**Purpose:** Search and retrieve video/music information  
**Endpoints Used:**
- `search.list` - Search for videos
- `videos.list` - Get video details
- `playlists.list` - Get playlist information

**Rate Limits:** 10,000 units/day (free tier)

### Spotify Web API

**Purpose:** Music streaming and playlist access  
**Endpoints Used:**
- `/me/player` - Playback control
- `/search` - Search tracks
- `/playlists` - Playlist management
- `/me/tracks` - Saved tracks

**Requirements:** Spotify Premium for playback

### OpenAI API

**Purpose:** Content analysis, script generation, TTS  
**Models Used:**
- GPT-4 Turbo - Content analysis and script generation
- Whisper - Audio transcription
- TTS-1-HD - Text-to-speech

### Google Cloud APIs

**Purpose:** Document access and web search  
**APIs Used:**
- Google Docs API
- Google Sheets API
- Google Drive API
- Custom Search JSON API

---

## Database Schema

### Core Tables

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String?
  avatar        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  contents      Content[]
  history       ListeningHistory[]
  likes         Like[]
  subscriptions Subscription[]
  playlists     Playlist[]
  preferences   UserPreference?
}

model Content {
  id          String      @id @default(uuid())
  userId      String
  type        ContentType
  title       String
  description String?
  sourceUrl   String?
  filePath    String?
  transcript  String?
  summary     String?
  topics      String[]
  duration    Int?
  status      ContentStatus @default(PROCESSING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  user        User        @relation(fields: [userId], references: [id])
  shows       RadioShow[]
  nudges      KnowledgeNudge[]
  likes       Like[]
}

model RadioShow {
  id          String   @id @default(uuid())
  title       String
  description String?
  script      String
  audioUrl    String?
  duration    Int
  format      ShowFormat
  status      ShowStatus @default(DRAFT)
  scheduledAt DateTime?
  createdAt   DateTime @default(now())
  
  contents    Content[]
  segments    ShowSegment[]
}

model ShowSegment {
  id        String      @id @default(uuid())
  showId    String
  type      SegmentType
  content   String
  audioUrl  String?
  startTime Int
  duration  Int
  order     Int
  
  show      RadioShow   @relation(fields: [showId], references: [id])
}

model KnowledgeNudge {
  id        String   @id @default(uuid())
  contentId String
  text      String
  audioUrl  String?
  duration  Int
  category  String?
  createdAt DateTime @default(now())
  
  content   Content  @relation(fields: [contentId], references: [id])
}

model ListeningHistory {
  id        String   @id @default(uuid())
  userId    String
  itemType  String
  itemId    String
  progress  Int      @default(0)
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}

model Like {
  id        String   @id @default(uuid())
  userId    String
  contentId String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  content   Content  @relation(fields: [contentId], references: [id])
  
  @@unique([userId, contentId])
}

model Subscription {
  id        String   @id @default(uuid())
  userId    String
  topicId   String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  topic     Topic    @relation(fields: [topicId], references: [id])
}

model Topic {
  id            String         @id @default(uuid())
  name          String         @unique
  description   String?
  subscriptions Subscription[]
}

model Playlist {
  id        String         @id @default(uuid())
  userId    String
  name      String
  isPublic  Boolean        @default(false)
  createdAt DateTime       @default(now())
  
  user      User           @relation(fields: [userId], references: [id])
  items     PlaylistItem[]
}

model PlaylistItem {
  id         String   @id @default(uuid())
  playlistId String
  source     String   // youtube, spotify, local
  sourceId   String
  title      String
  artist     String?
  thumbnail  String?
  duration   Int?
  order      Int
  
  playlist   Playlist @relation(fields: [playlistId], references: [id])
}

model UserPreference {
  id                String   @id @default(uuid())
  userId            String   @unique
  preferredTopics   String[]
  preferredFormats  String[]
  autoRefresh       Boolean  @default(true)
  refreshInterval   Int      @default(3600)
  notificationsOn   Boolean  @default(true)
  
  user              User     @relation(fields: [userId], references: [id])
}

model ContentQueue {
  id          String   @id @default(uuid())
  type        String
  priority    Int      @default(0)
  data        Json
  status      QueueStatus @default(PENDING)
  attempts    Int      @default(0)
  lastError   String?
  scheduledAt DateTime @default(now())
  createdAt   DateTime @default(now())
  processedAt DateTime?
}

// Enums
enum ContentType {
  AUDIO
  VIDEO
  DOCUMENT
  TEXT
  WEB_RESEARCH
}

enum ContentStatus {
  PROCESSING
  READY
  ERROR
}

enum ShowFormat {
  NEWS
  TALK
  EDUCATIONAL
  ENTERTAINMENT
  MUSIC_MIX
}

enum ShowStatus {
  DRAFT
  SCHEDULED
  LIVE
  ARCHIVED
}

enum SegmentType {
  INTRO
  CONTENT
  MUSIC
  NUDGE
  TRANSITION
  OUTRO
}

enum QueueStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup and configuration
- Database schema implementation
- Basic authentication
- Docker environment

### Phase 2: Input Processing (Week 3-4)
- File upload system
- Content processors
- Google integration
- Web research

### Phase 3: Music Integration (Week 5-6)
- YouTube API integration
- Spotify API integration
- Unified player

### Phase 4: AI Engine (Week 7-9)
- Transcription service
- Content analysis
- Show generation
- TTS implementation

### Phase 5: Radio Player (Week 10-11)
- Radio UI
- Streaming service
- Knowledge nudges

### Phase 6: Personalization (Week 12-13)
- User preferences
- Recommendation engine
- Auto-refresh

### Phase 7: Polish & Build (Week 14)
- Mobile optimization
- APK build
- Testing

---

## Testing Strategy

### Unit Tests
- Service layer tests
- Utility function tests
- Component tests

### Integration Tests
- API endpoint tests
- Database integration tests
- External API mock tests

### E2E Tests
- User flow tests
- Mobile app tests

### Performance Tests
- Load testing
- Audio streaming tests

---

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-key"

# Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_SEARCH_API_KEY="your-search-api-key"
GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"

# YouTube
YOUTUBE_API_KEY="your-youtube-api-key"

# Spotify
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3001
NODE_ENV="development"

# Frontend
VITE_API_URL="http://localhost:3001/api"
```

---

## Changelog

### Version 1.0.0 (January 4, 2026)
- Initial project plan created
- All features defined
- Task breakdown completed
- Database schema designed
- ✅ Frontend React app created with TypeScript
- ✅ Backend Express API server implemented
- ✅ Database configured with Prisma and SQLite
- ✅ Content processing system built (audio, video, documents, text)
- ✅ YouTube integration implemented
- ✅ Spotify integration implemented
- ✅ AI content analysis engine created
- ✅ Radio show generator implemented
- ✅ Knowledge nudges system built
- ✅ User personalization features added
- ✅ Web research capabilities (deep/wide) implemented
- ✅ Recommendation engine created
- ✅ Capacitor configured for Android APK build
- ✅ Docker development environment set up
- ✅ Database seeded with demo data

---

## Quick Start Commands

```bash
# Install all dependencies
cd backend && npm install && cd ../frontend && npm install

# Set up database
cd backend && npx prisma generate && npx prisma db push && npx tsx src/seed.ts

# Start development servers
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# Build APK (requires Android SDK)
cd frontend && npm run build && npx cap sync android
cd android && ./gradlew assembleDebug

# Or use Docker
docker-compose up -d
```

## Demo Credentials

- **Email**: demo@airadio.app
- **Password**: demo123

---

*This document is automatically updated as development progresses.*
