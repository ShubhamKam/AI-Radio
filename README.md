# 📻 AI Radio

**Your Intelligent Personal Radio Experience**

AI Radio transforms your content into engaging radio shows, knowledge nudges, and seamless music experiences. Upload documents, videos, audio files, or research the web – AI Radio curates and presents it all as personalized radio programming.

![AI Radio Banner](https://via.placeholder.com/800x400?text=AI+Radio)

## ✨ Features

### 🎙️ Content Input
- **File Upload**: Audio (MP3, WAV, AAC), Video (MP4, AVI, MOV), Documents (PDF, DOCX, PPTX)
- **Text Input**: Paste text or URLs for content extraction
- **Google Integration**: Import from Google Docs, Sheets, and Slides
- **Web Research**: Deep and wide research modes using web search

### 🎵 Music Integration
- **YouTube**: Search and play music from YouTube
- **Spotify**: Connect your Spotify account for seamless streaming
- **Unified Player**: Single interface for all music sources
- **Playlists**: Create and manage your own playlists

### 🤖 AI-Powered
- **Content Analysis**: Automatic transcription, summarization, and topic extraction
- **Radio Show Generation**: AI creates natural radio scripts from your content
- **Knowledge Nudges**: Quick facts and insights during music playback
- **Personalized Feed**: ML-driven content recommendations

### 📱 Mobile Experience
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Live Radio**: Continuous playback with seamless transitions
- **Offline Support**: Coming soon
- **Android APK**: Build native Android app with Capacitor

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- npm or pnpm
- Docker (optional, for development)
- Android SDK (for APK build)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-radio.git
   cd ai-radio
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit .env with your API keys (optional for demo mode)
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📱 Building Android APK

### Prerequisites
- Android SDK with build-tools 34.0.0
- Java 17
- Gradle

### Build Steps

```bash
cd frontend

# Build the web app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync web assets to Android
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Alternative: Build with Docker

```bash
docker build -t ai-radio-builder -f Dockerfile .
docker run -v $(pwd)/output:/output ai-radio-builder sh -c "
  cd frontend && npm run build && npx cap sync android &&
  cd android && ./gradlew assembleDebug &&
  cp app/build/outputs/apk/debug/app-debug.apk /output/
"
```

## 🔧 Configuration

### API Keys (Optional)
The app works in demo mode without API keys. For full functionality:

| Service | Purpose | Get Key |
|---------|---------|---------|
| OpenAI | Transcription, AI analysis, TTS | [OpenAI API](https://platform.openai.com) |
| YouTube | Music search and playback | [Google Cloud Console](https://console.cloud.google.com) |
| Spotify | Music streaming | [Spotify Developer](https://developer.spotify.com) |
| Google | Docs/Sheets import | [Google Cloud Console](https://console.cloud.google.com) |

### Environment Variables

```env
# Required
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"

# Optional - AI Features
OPENAI_API_KEY="sk-..."

# Optional - Music
YOUTUBE_API_KEY="..."
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."

# Optional - Google Integration
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 📖 API Documentation

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login
GET  /api/auth/me - Get current user
```

### Content
```
GET    /api/content - List all content
POST   /api/content/upload - Upload file
POST   /api/content/text - Create from text
POST   /api/content/url - Import from URL
DELETE /api/content/:id - Delete content
```

### Radio
```
GET  /api/radio/shows - List shows
POST /api/radio/shows/generate - Generate new show
GET  /api/radio/channels/:id/current - Current show
GET  /api/radio/nudges - Knowledge nudges
```

### Music
```
GET /api/music/youtube/search - Search YouTube
GET /api/music/spotify/search - Search Spotify
GET /api/music/playlists - User playlists
```

## 🏗️ Architecture

```
ai-radio/
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── capacitor.config.ts
├── backend/                # Express + TypeScript
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── prisma/
│       └── schema.prisma  # Database schema
├── docker-compose.yml
└── PROJECT_PLAN.md        # Detailed project plan
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📅 Roadmap

- [x] Core radio player
- [x] Content upload and processing
- [x] YouTube integration
- [x] Spotify integration
- [x] AI content analysis
- [x] Radio show generation
- [x] Knowledge nudges
- [x] User personalization
- [ ] Offline mode
- [ ] iOS app
- [ ] Real-time collaboration
- [ ] Podcast publishing

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for AI capabilities
- [Spotify](https://developer.spotify.com) for music streaming
- [YouTube](https://developers.google.com/youtube) for video content
- The open-source community for amazing tools

---

**Made with ❤️ for music and knowledge lovers**
