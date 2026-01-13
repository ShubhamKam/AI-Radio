# AI Radio Content Categorization & Automation - Project Plan

## Project Overview
This project aims to create a Termux-based automation script for Android devices. The script will extract content and links (including browser bookmarks), analyze them using a Cloud AI model, categorize them for AI-driven radio content creation, and upload the categorized content to Google Drive.

## Features
1.  **Content Extraction**:
    *   Extract browser bookmarks (Chrome, generic export formats).
    *   Scan specific local directories for relevant content (text, audio).
2.  **Cloud AI Analysis**:
    *   Integrate with a Cloud AI provider (e.g., Google Gemini, OpenAI, or a lightweight model if feasible, but user asked for "Cloud AI model").
    *   Analyze text and metadata to determine relevance for radio content.
3.  **Categorization Engine**:
    *   Define categories suitable for radio (e.g., News, Tech Talk, Music Analysis, Storytelling, Interviews).
    *   Map analyzed content to these categories.
4.  **Google Drive Integration**:
    *   Authenticate with Google Drive API.
    *   Create folder structures based on categories.
    *   Upload content/metadata files to the respective folders.
5.  **Automation**:
    *   Cron job setup or Termux:Boot integration for automatic execution.
    *   Standalone execution capability.

## User Stories & Tasks

### Story 1: Project Setup & Environment
*   **Task 1.1**: Initialize git repository and project structure. (Completed)
*   **Task 1.2**: Create comprehensive Project Plan (this document). (Completed)
*   **Task 1.3**: Set up Dev Container (Dockerfile) for consistent development environment. (Completed)

### Story 2: Content Extraction Module
*   **Task 2.1**: Research Termux access to browser bookmarks (requires root or specific export steps). *Constraint: Non-root access might require manual export or specific browser API if available via Termux API.* (Completed - Implemented File/Bookmark Parser)
*   **Task 2.2**: Write script to parse bookmark files (HTML/JSON). (Completed)
*   **Task 2.3**: Write script to scan local storage for target file types. (Completed)

### Story 3: AI Analysis & Categorization
*   **Task 3.1**: Select Cloud AI provider and set up API keys (Configurable). (Completed - Config structure ready)
*   **Task 3.2**: Develop prompt engineering for radio content categorization. (Completed - in `ai_analyzer.py`)
*   **Task 3.3**: Implement API client to send content for analysis and receive JSON classification. (Completed)

### Story 4: Google Drive Integration
*   **Task 4.1**: Set up Google Cloud Project and enable Drive API. (Pending User Action)
*   **Task 4.2**: Implement OAuth2 flow for Termux (device authorization grant or service account). (Mocked in `drive_uploader.py` - Needs real creds)
*   **Task 4.3**: Write upload logic to organize files by category. (Completed)

### Story 5: Orchestration & Automation
*   **Task 5.1**: Create main driver script `run_pipeline.sh`. (Completed as `main.py`)
*   **Task 5.2**: Create `setup.sh` for easy installation of dependencies (pkg install, pip install). (Completed)
*   **Task 5.3**: Document scheduling (cron/Termux:Boot). (See Instructions Below)

## Dependencies
*   **System**: Termux (Android), Python 3.x
*   **Python Packages**:
    *   `google-api-python-client` (Drive API)
    *   `google-auth-httplib2`
    *   `google-auth-oauthlib`
    *   `requests` (AI API)
    *   `beautifulsoup4` (Bookmark parsing)
    *   `termux-api` (Optional, for device integration)
*   **External APIs**:
    *   Google Drive API
    *   Cloud AI Provider (e.g., Gemini API, OpenAI API)

## Current Status
*   Project Plan Created: Yes
*   Dev Container Setup: Yes
*   Implementation: Core Modules Complete (Extraction, Analysis, Categorization, Upload Logic)
*   Pending: Real API Key configuration by user.
