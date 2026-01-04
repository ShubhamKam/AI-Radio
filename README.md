# 🎙️ AI Radio App

**Status:** ✅ **Production Ready** | **Version:** 1.0.0 | **Build:** Complete

An AI-powered personalized radio application that creates custom radio shows from your content, integrates with YouTube and Spotify for music, and uses advanced AI for content curation and generation.

**🚀 Quick Links:**
- [Quick Start](#quick-start) - Get running in 5 minutes
- [Setup Guide](SETUP_GUIDE.md) - Comprehensive setup instructions  
- [Project Plan](PROJECT_PLAN.md) - Full architecture & features
- [Project Summary](PROJECT_SUMMARY.md) - What's implemented & next steps

## Features

- 🎙️ **AI Radio Show Generation**: Create personalized radio shows with AI-generated scripts and TTS
- 📁 **Multi-Format Content Ingestion**: Upload audio, video, documents, text, or fetch from URLs
- 🎵 **Music Integration**: YouTube and Spotify integration for music playback
- 🤖 **AI Content Curation**: Machine learning-powered content selection and recommendations
- 📱 **Mobile App**: Native Android/iOS apps built with Capacitor
- 🔄 **Auto-Refresh**: Automatic content updates and personalized recommendations
- 👤 **User Personalization**: Track history, likes, preferences, and create custom profiles

## Tech Stack

### Backend
- Node.js 20 + TypeScript
- Express.js REST API
- PostgreSQL with pgvector for embeddings
- Redis for caching and job queues
- Prisma ORM
- Bull for background jobs
- OpenAI GPT-4 for AI generation
- Google Cloud TTS / ElevenLabs for voice synthesis

### Frontend
- React 18 + TypeScript
- Material-UI for components
- Redux Toolkit for state management
- Capacitor for mobile builds
- Vite for build tooling

### Infrastructure
- Docker & Docker Compose
- GitHub Actions for CI/CD

## Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)
- Android Studio (for Android builds)
- FFmpeg (for audio/video processing)

### API Keys Required

1. **OpenAI API Key** - For AI generation and embeddings
2. **YouTube Data API Key** - For YouTube integration
3. **Spotify Client ID & Secret** - For Spotify integration
4. **Google Cloud TTS** (optional) - For text-to-speech
5. **Serper API Key** (optional) - For web search

## Quick Start

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd workspace
```

2. **Run setup script**
```bash
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

3. **Update environment variables**
Edit `.env` file and add your API keys:
```env
OPENAI_API_KEY=your-key-here
YOUTUBE_API_KEY=your-key-here
SPOTIFY_CLIENT_ID=your-id-here
SPOTIFY_CLIENT_SECRET=your-secret-here
```

4. **Start development servers**

Option 1: Run locally
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Option 2: Use Docker
```bash
docker-compose -f docker-compose.dev.yml up
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs (coming soon)

## Production Deployment

### Using Docker

1. **Build production image**
```bash
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

2. **Start production containers**
```bash
docker-compose up -d
```

### Manual Deployment

1. **Build backend**
```bash
cd backend
npm install
npm run build
npx prisma migrate deploy
```

2. **Build frontend**
```bash
cd frontend
npm install
npm run build
```

3. **Start application**
```bash
cd backend
npm start
```

## Mobile App Build

### Android APK

1. **Run build script**
```bash
chmod +x scripts/build-android.sh
./scripts/build-android.sh
```

2. **Install on device**
```bash
adb install ai-radio-debug.apk
```

### iOS (macOS only)

```bash
cd frontend
npm run build
npx cap sync ios
npx cap open ios
# Build in Xcode
```

## Project Structure

```
workspace/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── queues/      # Background jobs
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utilities
│   ├── prisma/          # Database schema
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   ├── services/    # API services
│   │   └── hooks/       # Custom hooks
│   ├── android/         # Capacitor Android
│   └── package.json
├── docker/              # Docker configs
├── scripts/             # Build scripts
├── docker-compose.yml   # Production compose
├── docker-compose.dev.yml # Dev compose
└── PROJECT_PLAN.md      # Detailed project plan
```

## API Documentation

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed API endpoint documentation.

### Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/content/upload` - Upload content
- `POST /api/shows/generate` - Generate radio show
- `GET /api/shows` - List shows
- `GET /api/shows/:id/audio` - Stream show audio
- `GET /api/music/search` - Search music
- `GET /api/recommendations/shows` - Get recommendations

## Development

### Database Migrations

```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma generate
```

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Redis Connection Issues
```bash
# Check Redis
docker-compose logs redis

# Test connection
redis-cli ping
```

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Docker cache
docker-compose down -v
docker system prune -a
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file

## Support

For issues and questions:
- Check [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed documentation
- Open an issue on GitHub
- Contact the development team

## Roadmap

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed roadmap and feature plans.

### Coming Soon
- [ ] Multi-language support
- [ ] Podcast mode
- [ ] Social features
- [ ] Advanced analytics
- [ ] Voice cloning
- [ ] Smart home integration

## Acknowledgments

- OpenAI for GPT-4 and embeddings
- Google Cloud for TTS services
- YouTube and Spotify for music APIs
- The open-source community

---

Built with ❤️ using React, Node.js, and AI
