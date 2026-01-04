# AI-Radio News Application

> An AI-powered news aggregation platform inspired by Bloomberg, delivering real-time financial, economic, and general news with intelligent categorization, personalization, and audio playback capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- 📰 **Multi-Source News Aggregation** - Aggregates news from NewsAPI, GNews, Finnhub, and more
- 🏷️ **Smart Categorization** - AI-powered content categorization (Economics, Markets, Latest, Industries, etc.)
- 📊 **Real-Time Market Data** - Live stock prices, indices, and financial indicators
- 🤖 **AI Summarization** - GPT-4 powered article summaries and key points extraction
- 🎧 **Audio News (Radio Mode)** - Text-to-speech conversion for hands-free listening
- 🔍 **Intelligent Search** - Full-text search with Elasticsearch (optional)
- 👤 **Personalization** - ML-based content recommendations based on reading history
- 📱 **Mobile-First Design** - Responsive PWA with Bloomberg-inspired UI
- 🔔 **Real-Time Updates** - WebSocket-based live news and market updates

### Premium Features
- ⭐ **Exclusive Content** - Access to premium news sources and analysis
- 📈 **Advanced Analytics** - Detailed market insights and trend analysis
- 🎯 **Custom Watchlists** - Track specific stocks, topics, or keywords
- 📧 **Email Digests** - Personalized daily/weekly news summaries
- 💾 **Unlimited Bookmarks** - Save and organize unlimited articles

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **React Router** for navigation
- **Howler.js** for audio playback
- **Framer Motion** for animations

### Backend
- **Node.js 20** with TypeScript
- **Express.js** framework
- **PostgreSQL 16** database
- **Redis 7** for caching
- **Elasticsearch 8** for search (optional)
- **Socket.io** for real-time updates
- **Bull** for job queuing

### AI/ML Services
- **OpenAI GPT-4** for summarization
- **ElevenLabs** for text-to-speech
- **Hugging Face** for additional NLP tasks

### Infrastructure
- **Docker** & Docker Compose
- **Prometheus** & **Grafana** for monitoring
- **GitHub Actions** for CI/CD
- **Nginx** as reverse proxy

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **Docker** >= 24.0.0
- **Docker Compose** >= 2.20.0
- **Git**

### API Keys Required

You'll need to sign up for the following services and obtain API keys:

1. **News APIs:**
   - [NewsAPI](https://newsapi.org/) - Free tier available
   - [GNews](https://gnews.io/) - Free tier available
   - [Finnhub](https://finnhub.io/) - Free tier available

2. **Market Data:**
   - [Alpha Vantage](https://www.alphavantage.co/) - Free tier available

3. **AI Services:**
   - [OpenAI](https://platform.openai.com/) - Pay-as-you-go
   - [ElevenLabs](https://elevenlabs.io/) - Free tier available

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-radio.git
cd ai-radio
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys and configuration:

```bash
# Essential API Keys
NEWSAPI_KEY=your_newsapi_key_here
OPENAI_API_KEY=your_openai_key_here
ALPHA_VANTAGE_KEY=your_alpha_vantage_key_here

# Database (default values work for local development)
POSTGRES_USER=airadio
POSTGRES_PASSWORD=airadio_dev_password
POSTGRES_DB=airadio

# JWT Secret (change for production)
JWT_SECRET=change_this_to_a_secure_random_string
```

### 3. Start with Docker Compose

#### Development Mode (with hot reload)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- **Frontend:** http://localhost:5173 (dev) or http://localhost:8080 (prod)
- **Backend API:** http://localhost:3000
- **Database Admin (Adminer):** http://localhost:8081 (with `--profile tools`)
- **Redis Commander:** http://localhost:8082 (with `--profile tools`)

#### With Development Tools

```bash
docker-compose --profile tools up -d
```

#### With Monitoring Stack

```bash
docker-compose --profile monitoring up -d
```

Then access:
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001

### 4. Initialize the Project

The database will be automatically initialized with the schema defined in `scripts/init-db.sql`.

For sample data, you can run:

```bash
# Will be added in future updates
npm run seed
```

## 📁 Project Structure

```
ai-radio/
├── backend/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── jobs/           # Background jobs
│   │   └── config/         # Configuration files
│   ├── tests/              # Backend tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # State management
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/               # Utility scripts
│   └── init-db.sql       # Database initialization
│
├── monitoring/            # Monitoring configuration
│   ├── prometheus.yml
│   └── grafana/
│
├── docs/                  # Documentation (to be added)
│
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile.backend     # Backend Dockerfile
├── Dockerfile.frontend    # Frontend Dockerfile
├── .env.example          # Environment variables example
├── .gitignore
├── PROJECT_PLAN.md       # Detailed project plan and tasks
├── README.md             # This file
└── LICENSE
```

## 💻 Development

### Without Docker (Local Development)

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp ../.env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp ../.env.example .env.local

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "feat: add user authentication"
   ```

3. **Run tests** before pushing:
   ```bash
   npm test
   ```

4. **Push and create a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linting:
```bash
npm run lint
npm run lint:fix
```

### Database Migrations

```bash
# Create a new migration
npm run migrate:create migration_name

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### Key Endpoints

#### News
- `GET /articles` - Get articles list
- `GET /articles/:id` - Get article details
- `GET /articles/category/:categorySlug` - Get articles by category
- `GET /articles/:id/audio` - Get article audio

#### Market Data
- `GET /markets/indices` - Get major market indices
- `GET /markets/symbol/:symbol` - Get specific symbol data
- `GET /markets/watchlist` - Get user's watchlist

#### User
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /user/profile` - Get user profile
- `PUT /user/preferences` - Update preferences
- `GET /user/bookmarks` - Get bookmarks

#### Search
- `GET /search` - Search articles
- `GET /search/trending` - Get trending searches

Full API documentation: [Coming soon - Swagger/OpenAPI]

## 🚢 Deployment

### Docker Production Build

```bash
# Build images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Ensure you set the following in production:

```bash
NODE_ENV=production
BUILD_TARGET=production
JWT_SECRET=<secure-random-string>
DATABASE_URL=<production-database-url>
REDIS_URL=<production-redis-url>
```

### CI/CD Pipeline

This project includes GitHub Actions workflows for:
- **Build and Test** - Runs on every push
- **Deploy to Staging** - Runs on push to `develop` branch
- **Deploy to Production** - Runs on push to `main` branch

Configuration files will be in `.github/workflows/` (to be added).

### Monitoring

Access monitoring dashboards:
- **Prometheus:** http://your-domain:9090
- **Grafana:** http://your-domain:3001

Default Grafana credentials:
- Username: `admin`
- Password: `admin` (change immediately)

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

Target coverage:
- Backend: > 80%
- Frontend: > 70%

## 🔒 Security

### Best Practices Implemented

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Helmet.js for security headers
- ✅ Input validation with Joi
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention
- ✅ HTTPS enforcement (in production)

### Reporting Security Issues

Please report security vulnerabilities to: [security@airadio.com]

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation:** [Coming soon]
- **Issues:** [GitHub Issues](https://github.com/yourusername/ai-radio/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/ai-radio/discussions)

## 🗺️ Roadmap

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed project roadmap and features.

### Upcoming Features

- [ ] Mobile apps (iOS/Android) with React Native
- [ ] Video news support
- [ ] Podcast integration
- [ ] Advanced market analytics
- [ ] Social sharing and discussions
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode improvements

## 👏 Acknowledgments

- Inspired by [Bloomberg](https://www.bloomberg.com/) design
- News data provided by NewsAPI, GNews, and Finnhub
- AI capabilities powered by OpenAI
- Icons by [Lucide](https://lucide.dev/)

---

**Built with ❤️ by the AI-Radio Team**
