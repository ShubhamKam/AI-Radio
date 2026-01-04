# AI Radio App

An AI-powered radio application that processes multiple input formats and creates personalized radio shows with music integration from YouTube and Spotify.

## Features

- **Multi-Format Input Processing**: Upload audio, video, slides, Google Sheets/Docs, or paste text
- **Web Research**: Deep and wide research through Google Search
- **Music Integration**: Search and play music from YouTube and Spotify
- **AI Radio Shows**: Automatically generated radio shows with AI scripts
- **Content Curation**: AI/ML-driven content curation engine
- **Knowledge Nudges**: Quick, interesting facts and insights
- **Mobile App**: Capacitor-based Android APK

## Tech Stack

### Backend
- Node.js with Express and TypeScript
- PostgreSQL database
- Redis for caching and job queues
- OpenAI API for AI features
- YouTube Data API v3
- Spotify Web API
- Google APIs (Sheets, Docs, Custom Search)

### Frontend
- Next.js 14 with React
- TypeScript
- Tailwind CSS
- Capacitor for mobile

### Infrastructure
- Docker and Docker Compose
- PostgreSQL
- Redis

## Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)
- API Keys:
  - OpenAI API key
  - Google API key
  - YouTube API key
  - Spotify Client ID and Secret

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-radio-app
```

2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your API keys and configuration.

4. Start services with Docker:
```bash
docker-compose up -d
```

Or run manually:
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
cd backend
npm run migrate:up

# Start backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

## Building APK

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Sync with Capacitor:
```bash
npm run cap:sync
```

3. Open Android Studio:
```bash
npm run cap:android
```

4. Build APK in Android Studio:
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK will be generated in `android/app/build/outputs/apk/`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Content
- `POST /api/content/upload/audio` - Upload audio file
- `POST /api/content/upload/video` - Upload video file
- `POST /api/content/upload/slides` - Upload slides (PDF/PPT)
- `POST /api/content/paste-text` - Paste text content
- `POST /api/content/google-sheets` - Process Google Sheet
- `POST /api/content/google-docs` - Process Google Doc
- `GET /api/content` - Get user's content

### Radio Shows
- `POST /api/radio/generate` - Generate radio show
- `GET /api/radio` - Get user's radio shows
- `GET /api/radio/recent` - Get recent radio shows
- `GET /api/radio/:id` - Get specific radio show

### Music
- `GET /api/music/youtube/search` - Search YouTube
- `GET /api/music/spotify/search` - Search Spotify
- `GET /api/music/recommendations` - Get music recommendations

### Research
- `POST /api/research/deep` - Deep research
- `POST /api/research/wide` - Wide research
- `GET /api/research/history` - Get research history

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/preferences` - Update preferences
- `POST /api/user/activity/like` - Like content
- `GET /api/user/nudges` - Get knowledge nudges

## Project Structure

```
.
├── backend/           # Backend API (Node.js/Express)
├── frontend/         # Frontend app (Next.js)
├── docker-compose.yml # Docker configuration
├── PROJECT_PLAN.md   # Detailed project plan
└── README.md         # This file
```

## Development

The content curation engine runs automatically on scheduled intervals (configurable via `CURATION_REFRESH_INTERVAL`). It:
- Processes and categorizes content
- Generates radio shows
- Creates knowledge nudges
- Updates content metadata

## License

MIT
