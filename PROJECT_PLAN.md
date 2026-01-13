# AI Radio Content Categorization Engine - Project Plan

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-13  
> **Status**: Active Development

## Executive Summary

This project creates an automated Termux-based solution that extracts content from Android phones and browser bookmarks, analyzes them using Cloud AI models, categorizes content suitable for AI-driven radio production, and uploads organized content to Google Drive.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [User Stories](#user-stories)
5. [Tasks and Subtasks](#tasks-and-subtasks)
6. [Dependencies](#dependencies)
7. [Configuration](#configuration)
8. [Development Progress](#development-progress)

---

## Project Overview

### Goals
- Extract content from Android device (files, bookmarks, clipboard history)
- Analyze content using Cloud AI models (OpenAI, Claude, Gemini)
- Categorize content for radio production (news, music, interviews, stories, etc.)
- Automatically upload organized content to Google Drive
- Run autonomously on Android via Termux

### Target Users
- Content creators for AI-driven radio
- Podcast producers
- Digital content curators

---

## Features

### F1: Content Extraction Engine
- **F1.1**: Browser bookmark extraction (Chrome, Firefox, Brave)
- **F1.2**: Clipboard history extraction
- **F1.3**: File system scanning (documents, media, downloads)
- **F1.4**: URL content fetching and parsing
- **F1.5**: Social media link extraction

### F2: AI Content Analysis
- **F2.1**: Multi-model AI support (OpenAI, Claude, Gemini)
- **F2.2**: Content summarization
- **F2.3**: Topic extraction and classification
- **F2.4**: Sentiment analysis
- **F2.5**: Radio suitability scoring

### F3: Categorization Engine
- **F3.1**: Radio content categories (News, Music, Talk, Stories, Interviews, etc.)
- **F3.2**: Sub-category classification
- **F3.3**: Content tagging system
- **F3.4**: Priority scoring for radio scheduling
- **F3.5**: Custom category creation

### F4: Google Drive Integration
- **F4.1**: OAuth2 authentication
- **F4.2**: Folder structure creation
- **F4.3**: Automated file upload
- **F4.4**: Metadata preservation
- **F4.5**: Sync status tracking

### F5: Automation & Scheduling
- **F5.1**: Termux boot automation
- **F5.2**: Scheduled task execution (cron)
- **F5.3**: Background service mode
- **F5.4**: Manual trigger support
- **F5.5**: Progress notifications

### F6: Configuration & Management
- **F6.1**: YAML configuration files
- **F6.2**: API key management
- **F6.3**: Category customization
- **F6.4**: Export/Import settings
- **F6.5**: Logging and debugging

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TERMUX ENVIRONMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Content    │───▶│     AI       │───▶│   Category   │      │
│  │  Extractors  │    │   Analyzer   │    │    Engine    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  Local Database                       │      │
│  │              (SQLite + JSON Cache)                    │      │
│  └──────────────────────────────────────────────────────┘      │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Google Drive Uploader                    │      │
│  └──────────────────────────────────────────────────────┘      │
│                            │                                    │
└────────────────────────────│────────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │ Google Drive │
                    │   (Cloud)    │
                    └──────────────┘
```

---

## User Stories

### Epic 1: Content Collection
| ID | Story | Priority | Status |
|----|-------|----------|--------|
| US1.1 | As a user, I want to extract bookmarks from my browser so that I can analyze saved content | High | TODO |
| US1.2 | As a user, I want to scan my phone's documents folder for relevant content | High | TODO |
| US1.3 | As a user, I want to fetch actual content from URLs in my bookmarks | Medium | TODO |
| US1.4 | As a user, I want to access my clipboard history for recent links | Low | TODO |

### Epic 2: AI Analysis
| ID | Story | Priority | Status |
|----|-------|----------|--------|
| US2.1 | As a user, I want AI to summarize lengthy articles automatically | High | TODO |
| US2.2 | As a user, I want AI to identify the main topics of each content piece | High | TODO |
| US2.3 | As a user, I want AI to rate content suitability for radio broadcast | High | TODO |
| US2.4 | As a user, I want to choose between different AI providers | Medium | TODO |

### Epic 3: Categorization
| ID | Story | Priority | Status |
|----|-------|----------|--------|
| US3.1 | As a user, I want content automatically sorted into radio categories | High | TODO |
| US3.2 | As a user, I want to define custom categories for my radio format | Medium | TODO |
| US3.3 | As a user, I want content tagged with relevant keywords | Medium | TODO |
| US3.4 | As a user, I want priority scores to help schedule content | Low | TODO |

### Epic 4: Cloud Storage
| ID | Story | Priority | Status |
|----|-------|----------|--------|
| US4.1 | As a user, I want categorized content uploaded to Google Drive | High | TODO |
| US4.2 | As a user, I want organized folder structures on Drive | High | TODO |
| US4.3 | As a user, I want to track what has been uploaded | Medium | TODO |

### Epic 5: Automation
| ID | Story | Priority | Status |
|----|-------|----------|--------|
| US5.1 | As a user, I want the script to run automatically on a schedule | High | TODO |
| US5.2 | As a user, I want to manually trigger content processing | High | TODO |
| US5.3 | As a user, I want notifications about processing status | Low | TODO |

---

## Tasks and Subtasks

### Phase 1: Foundation (Sprint 1)

#### Task 1.1: Project Setup
- [x] Create directory structure
- [x] Initialize git repository
- [x] Create project plan document
- [ ] Setup Python virtual environment for Termux
- [ ] Install base dependencies

#### Task 1.2: Content Extractors
- [ ] **1.2.1**: Create bookmark extractor base class
- [ ] **1.2.2**: Implement Chrome bookmark parser
- [ ] **1.2.3**: Implement Firefox bookmark parser
- [ ] **1.2.4**: Create file system scanner
- [ ] **1.2.5**: Implement URL content fetcher
- [ ] **1.2.6**: Create clipboard history reader

#### Task 1.3: Database Layer
- [ ] **1.3.1**: Design SQLite schema
- [ ] **1.3.2**: Create database models
- [ ] **1.3.3**: Implement CRUD operations
- [ ] **1.3.4**: Add caching layer

### Phase 2: AI Integration (Sprint 2)

#### Task 2.1: AI Provider Abstraction
- [ ] **2.1.1**: Create AI provider interface
- [ ] **2.1.2**: Implement OpenAI adapter
- [ ] **2.1.3**: Implement Claude adapter
- [ ] **2.1.4**: Implement Gemini adapter
- [ ] **2.1.5**: Add fallback mechanism

#### Task 2.2: Content Analysis
- [ ] **2.2.1**: Implement summarization module
- [ ] **2.2.2**: Create topic extraction
- [ ] **2.2.3**: Build sentiment analyzer
- [ ] **2.2.4**: Develop radio suitability scorer

### Phase 3: Categorization (Sprint 3)

#### Task 3.1: Category System
- [ ] **3.1.1**: Define radio content categories
- [ ] **3.1.2**: Create category classifier
- [ ] **3.1.3**: Implement tagging system
- [ ] **3.1.4**: Build priority scorer
- [ ] **3.1.5**: Add custom category support

### Phase 4: Cloud Integration (Sprint 4)

#### Task 4.1: Google Drive Setup
- [ ] **4.1.1**: Create GCP project and credentials
- [ ] **4.1.2**: Implement OAuth2 flow for Termux
- [ ] **4.1.3**: Build folder structure manager
- [ ] **4.1.4**: Create upload handler
- [ ] **4.1.5**: Implement sync tracking

### Phase 5: Automation (Sprint 5)

#### Task 5.1: Termux Automation
- [ ] **5.1.1**: Create main entry script
- [ ] **5.1.2**: Setup cron jobs
- [ ] **5.1.3**: Implement boot automation
- [ ] **5.1.4**: Add notification support
- [ ] **5.1.5**: Create widget support

---

## Dependencies

### System Dependencies (Termux)
```
pkg install python
pkg install git
pkg install termux-api
pkg install sqlite
pkg install openssl
pkg install libxml2
pkg install libxslt
```

### Python Dependencies
```
# Core
python>=3.9

# AI APIs
openai>=1.0.0
anthropic>=0.18.0
google-generativeai>=0.3.0

# Web Scraping
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=5.0.0

# Google Drive
google-api-python-client>=2.100.0
google-auth-httplib2>=0.1.0
google-auth-oauthlib>=1.1.0

# Database
sqlalchemy>=2.0.0
aiosqlite>=0.19.0

# Utilities
pyyaml>=6.0.0
python-dotenv>=1.0.0
rich>=13.0.0
click>=8.1.0
schedule>=1.2.0
```

### External APIs
- OpenAI API (GPT-4/GPT-4-turbo)
- Anthropic API (Claude 3)
- Google Gemini API
- Google Drive API

---

## Configuration

### Environment Variables
```bash
# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_gemini_key

# Google Drive
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# App Settings
AI_PROVIDER=openai  # openai, claude, gemini
LOG_LEVEL=INFO
```

### Category Configuration
```yaml
categories:
  news:
    subcategories: [breaking, politics, technology, sports, entertainment]
    keywords: [news, report, update, breaking, announcement]
    priority_weight: 1.5
  
  music:
    subcategories: [reviews, releases, artist_features, playlists]
    keywords: [music, song, album, artist, playlist]
    priority_weight: 1.2
  
  talk_show:
    subcategories: [interviews, discussions, debates, panels]
    keywords: [interview, discuss, opinion, talk, conversation]
    priority_weight: 1.3
  
  stories:
    subcategories: [fiction, non_fiction, historical, educational]
    keywords: [story, tale, narrative, history, lesson]
    priority_weight: 1.0
  
  educational:
    subcategories: [tutorials, explainers, documentaries, how_to]
    keywords: [learn, how to, guide, explain, tutorial]
    priority_weight: 1.1
  
  entertainment:
    subcategories: [comedy, drama, reviews, pop_culture]
    keywords: [fun, entertainment, celebrity, movie, show]
    priority_weight: 0.9
```

---

## Development Progress

### Current Sprint: Sprint 1 - Foundation
- **Start Date**: 2026-01-13
- **Target End Date**: 2026-01-20
- **Completion**: 15%

### Changelog
| Date | Version | Changes |
|------|---------|---------|
| 2026-01-13 | 0.1.0 | Initial project setup, created plan document |

### Known Issues
- None yet

### Next Actions
1. Implement content extractors
2. Setup AI provider integrations
3. Build categorization engine
4. Create Google Drive upload system
5. Develop Termux automation scripts

---

## Notes for AI Assistant Context

This document serves as the primary context for AI-assisted development. When adding new features:

1. Update the relevant sections (Features, Tasks, Dependencies)
2. Add new user stories if applicable
3. Update the Development Progress section
4. Document any new configuration options
5. Keep the Architecture diagram current

**Integration Points:**
- Termux API for device access
- Cloud AI for content analysis
- Google Drive API for storage
- SQLite for local caching
