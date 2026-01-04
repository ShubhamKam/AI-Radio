# AI Radio App - Setup & Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [API Keys Configuration](#api-keys-configuration)
4. [Building the App](#building-the-app)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1-Minute Setup

```bash
# Clone and enter directory
cd /workspace

# Run setup script
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Update API keys in .env file
nano .env

# Start everything
docker-compose -f docker-compose.dev.yml up
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379

---

## Detailed Setup

### 1. System Requirements

**Required:**
- Node.js 20.x LTS
- npm 10.x
- Docker 24.x
- Docker Compose 2.x
- Git 2.x

**For Android Builds:**
- Android Studio Hedgehog or later
- Android SDK 34
- Java JDK 17+
- Gradle 8.x

**For iOS Builds (macOS only):**
- Xcode 15+
- CocoaPods 1.12+

### 2. Repository Setup

```bash
cd /workspace

# Install backend dependencies
cd backend
npm install
npx prisma generate

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

#### Backend Environment (.env)

Copy the example and configure:

```bash
cp backend/.env.example .env
```

**Required Variables:**

```env
# Database (if not using Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_radio

# Redis
REDIS_URL=redis://localhost:6379

# JWT Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# OpenAI (REQUIRED for AI features)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# YouTube (REQUIRED for music)
YOUTUBE_API_KEY=your-youtube-api-key

# Spotify (REQUIRED for music)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/oauth/spotify/callback
```

**Optional but Recommended:**

```env
# Google Cloud TTS (for better voice quality)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS_PATH=./credentials/google-cloud.json

# ElevenLabs (premium TTS alternative)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Web Search
SERPER_API_KEY=your-serper-api-key

# Pinecone (for vector search)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=ai-radio-embeddings
```

#### Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

#### Option B: Local Installation

**PostgreSQL:**
```bash
# Install pgvector extension
sudo apt-get install postgresql-16-pgvector  # Ubuntu/Debian
brew install pgvector  # macOS

# Create database
psql -U postgres
CREATE DATABASE ai_radio;
CREATE EXTENSION vector;
\q
```

**Redis:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

#### Run Migrations

```bash
cd backend
npx prisma migrate dev --name init
# or
npx prisma db push
```

---

## API Keys Configuration

### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key and add to `.env`:
   ```env
   OPENAI_API_KEY=sk-...
   ```

**Costs:** ~$0.01-0.05 per radio show generation

### YouTube Data API

1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Add to `.env`:
   ```env
   YOUTUBE_API_KEY=AIza...
   ```

**Quota:** 10,000 units/day (free tier)

### Spotify API

1. Go to https://developer.spotify.com/dashboard
2. Create new app
3. Set redirect URI: `http://localhost:3000/api/auth/oauth/spotify/callback`
4. Copy Client ID and Secret to `.env`:
   ```env
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   ```

**Note:** Users need Spotify Premium for full playback features

### Google Cloud TTS (Optional)

1. Go to https://console.cloud.google.com/
2. Enable "Cloud Text-to-Speech API"
3. Create service account
4. Download JSON key file
5. Place in `backend/credentials/google-cloud.json`
6. Add to `.env`:
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_CREDENTIALS_PATH=./credentials/google-cloud.json
   ```

---

## Building the App

### Development Mode

#### Option 1: Local Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database (if using Docker)
docker-compose -f docker-compose.dev.yml up postgres redis
```

#### Option 2: Full Docker Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Build

```bash
# Build everything
./scripts/build-all.sh

# Or manually:
cd backend && npm run build
cd ../frontend && npm run build
```

### Android APK Build

#### Automatic Build

```bash
# Run build script
./scripts/build-android.sh

# APK location: frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Manual Build

```bash
cd frontend

# Build web app
npm run build

# Sync Capacitor
npx cap sync android

# Option 1: Use Android Studio
npx cap open android
# Then: Build > Build Bundle(s) / APK(s) > Build APK(s)

# Option 2: Use Gradle
cd android
./gradlew assembleDebug

# For release build (requires keystore)
./gradlew assembleRelease
```

#### Install on Device

```bash
# Connect device via USB and enable USB debugging
adb devices

# Install APK
adb install -r ai-radio-debug.apk

# View logs
adb logcat | grep -i airadio
```

### iOS Build (macOS only)

```bash
cd frontend

# Build and sync
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build in Xcode:
# Product > Archive > Distribute App
```

---

## Deployment

### Production Docker Deployment

1. **Prepare environment:**

```bash
cp .env.example .env
# Edit .env with production values
```

2. **Build production image:**

```bash
./scripts/build-production.sh
```

3. **Start services:**

```bash
docker-compose up -d
```

4. **Check status:**

```bash
docker-compose ps
docker-compose logs -f app
```

5. **Access application:**
- Application: http://your-domain:3000
- Health check: http://your-domain:3000/health

### Cloud Deployment Options

#### AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag ai-radio-app:latest YOUR_ECR_URI/ai-radio-app:latest
docker push YOUR_ECR_URI/ai-radio-app:latest

# Deploy using ECS task definition
aws ecs update-service --cluster your-cluster --service ai-radio --force-new-deployment
```

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT/ai-radio-app
gcloud run deploy ai-radio --image gcr.io/YOUR_PROJECT/ai-radio-app --platform managed
```

#### Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Database Migration in Production

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Or connect to production database
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Content upload (file, text, URL)
- [ ] Content processing (check status)
- [ ] Radio show generation
- [ ] Audio playback
- [ ] User preferences
- [ ] History tracking
- [ ] Mobile app functionality

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Verify connection
psql -h localhost -U postgres -d ai_radio
```

#### Redis Connection Errors

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solutions:**
```bash
# Check Redis
docker-compose logs redis
redis-cli ping  # Should return PONG

# Restart Redis
docker-compose restart redis
```

#### OpenAI API Errors

**Problem:** `401 Unauthorized` or `429 Rate Limit`

**Solutions:**
- Verify API key in `.env`
- Check billing: https://platform.openai.com/account/billing
- Wait if rate limited (temporary)

#### Build Errors

**Problem:** TypeScript compilation errors

**Solutions:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate

# Clear TypeScript cache
rm -rf dist .tsbuildinfo
```

#### Android Build Errors

**Problem:** Gradle build fails

**Solutions:**
```bash
# Check ANDROID_HOME
echo $ANDROID_HOME  # Should point to Android SDK

# Clean Gradle cache
cd frontend/android
./gradlew clean

# Update Gradle wrapper
./gradlew wrapper --gradle-version=8.2.1

# Check Java version
java -version  # Should be 17+
```

#### Memory Issues

**Problem:** JavaScript heap out of memory

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json scripts:
"build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
```

### Getting Help

**Check logs:**
```bash
# Backend logs
docker-compose logs -f app

# Database logs
docker-compose logs postgres

# Application logs
tail -f backend/logs/combined.log
```

**Database debugging:**
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d ai_radio

# Check tables
\dt

# Check users
SELECT * FROM users;
```

**Redis debugging:**
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check keys
KEYS *

# Check queue status
LLEN bull:content-processing:wait
```

### Performance Optimization

**Backend:**
- Enable Redis caching
- Use connection pooling
- Implement rate limiting
- Optimize database queries

**Frontend:**
- Enable code splitting
- Lazy load routes
- Optimize images
- Use service workers

**Database:**
- Add indexes on frequently queried columns
- Use pgvector for efficient similarity search
- Regular VACUUM and ANALYZE

---

## Production Checklist

Before going to production:

- [ ] Change all default secrets in `.env`
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable rate limiting
- [ ] Set up CDN for static assets
- [ ] Configure firewall rules
- [ ] Set up health checks
- [ ] Plan for scaling (load balancer, etc.)
- [ ] Review security best practices
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and DNS
- [ ] Test all functionality in production

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for errors
- Check system resources
- Verify API quotas

**Weekly:**
- Review and cleanup old content
- Check database size
- Update dependencies

**Monthly:**
- Security updates
- Performance optimization
- Backup verification

### Backup Strategy

**Database:**
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres ai_radio > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres ai_radio < backup.sql
```

**Files:**
```bash
# Backup uploads
tar -czf uploads-backup.tar.gz backend/uploads

# Restore
tar -xzf uploads-backup.tar.gz
```

---

## Support & Resources

- **Documentation:** [PROJECT_PLAN.md](PROJECT_PLAN.md)
- **API Documentation:** http://localhost:3000/api-docs (when running)
- **Issues:** GitHub Issues
- **OpenAI Docs:** https://platform.openai.com/docs
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

**Last Updated:** January 4, 2026  
**Version:** 1.0.0
