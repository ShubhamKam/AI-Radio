# AI Radio App - Setup Guide

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- PostgreSQL (or use Docker)
- Redis (or use Docker)
- Android Studio (for building APK)

### 2. API Keys Required

You'll need to obtain API keys for:

1. **OpenAI API** - https://platform.openai.com/api-keys
2. **Google Cloud** - https://console.cloud.google.com/
   - Enable Google Sheets API
   - Enable Google Docs API
   - Enable Custom Search API
   - Create API key
3. **YouTube Data API v3** - https://console.cloud.google.com/apis/library/youtube.googleapis.com
4. **Spotify** - https://developer.spotify.com/dashboard
   - Create app
   - Get Client ID and Client Secret

### 3. Installation Steps

#### Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### Step 2: Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Edit .env with API URL
```

#### Step 3: Start Database Services

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Wait for services to be ready (about 10 seconds)
```

#### Step 4: Run Database Migrations

```bash
cd backend

# Create database tables
psql -h localhost -U airadio -d airadio_db -f migrations/001_initial_schema.sql

# Or if using Docker:
docker exec -i ai-radio-postgres psql -U airadio -d airadio_db < migrations/001_initial_schema.sql
```

#### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app should now be running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 4. Building APK

#### Step 1: Build Frontend

```bash
cd frontend
npm run build
```

#### Step 2: Initialize Capacitor (First Time Only)

```bash
# Install Capacitor CLI globally if not already installed
npm install -g @capacitor/cli

# Sync Capacitor
npx cap sync
```

#### Step 3: Open in Android Studio

```bash
npx cap open android
```

#### Step 4: Build APK in Android Studio

1. Open Android Studio
2. Wait for Gradle sync to complete
3. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. Wait for build to complete
5. APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk` (debug) or `android/app/build/outputs/apk/release/app-release.apk` (release)

#### Alternative: Build APK via Command Line

```bash
cd android
./gradlew assembleDebug  # For debug APK
./gradlew assembleRelease  # For release APK (requires signing config)
```

### 5. Using Docker (Full Stack)

To run everything with Docker:

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 6. Troubleshooting

#### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps`
- Check connection string in `.env`
- Verify database exists: `docker exec -it ai-radio-postgres psql -U airadio -l`

#### Redis Connection Issues
- Ensure Redis is running: `docker ps`
- Check Redis URL in `.env`

#### API Key Issues
- Verify all API keys are correctly set in `backend/.env`
- Check API quotas and limits
- Ensure APIs are enabled in respective consoles

#### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf frontend/.next`
- Clear Capacitor cache: `rm -rf .capacitor`

#### Android Build Issues
- Ensure Android SDK is installed
- Check `android/local.properties` for SDK path
- Verify Gradle version compatibility

### 7. Production Deployment

For production:

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Use production database (managed PostgreSQL)
4. Set up proper SSL certificates
5. Configure CORS for production domain
6. Set up monitoring and logging
7. Configure CDN for static assets

### 8. Testing the App

1. **Register/Login**: Create an account or login
2. **Upload Content**: Try uploading audio, video, or text
3. **Research**: Test deep and wide research features
4. **Music**: Search for music on YouTube or Spotify
5. **Radio Shows**: Generate radio shows from your content
6. **Knowledge Nudges**: Check for generated knowledge nudges

### 9. Next Steps

- Configure Google OAuth for Sheets/Docs access
- Set up file storage (AWS S3 or Google Cloud Storage)
- Configure production database
- Set up CI/CD pipeline
- Add error tracking (Sentry, etc.)
- Set up monitoring and analytics
