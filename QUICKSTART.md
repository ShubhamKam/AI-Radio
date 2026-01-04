# Quick Start Guide - AI-Radio News Application

This guide will help you get the AI-Radio News Application up and running in less than 10 minutes.

## Prerequisites Checklist

- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] At least 4GB of free RAM
- [ ] At least 5GB of free disk space

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-radio.git
cd ai-radio
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

**Minimal Configuration (Required):**

Open `.env` and set these essential variables:

```bash
# Database credentials (default values work for local dev)
POSTGRES_USER=airadio
POSTGRES_PASSWORD=airadio_dev_password
POSTGRES_DB=airadio

# Redis password
REDIS_PASSWORD=airadio_redis_password

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your_secure_random_string_here

# API Keys (sign up for free tiers)
NEWSAPI_KEY=get_from_newsapi.org
OPENAI_API_KEY=get_from_platform.openai.com
```

**Optional but Recommended:**

```bash
# Additional news sources
GNEWS_API_KEY=get_from_gnews.io
FINNHUB_API_KEY=get_from_finnhub.io

# Market data
ALPHA_VANTAGE_KEY=get_from_alphavantage.co

# Text-to-speech
ELEVENLABS_API_KEY=get_from_elevenlabs.io
```

### 3. Start the Application

**Option A: Basic Setup (Backend + Frontend + Database + Redis)**

```bash
docker-compose up -d
```

**Option B: Full Setup with Development Tools**

```bash
docker-compose --profile tools up -d
```

This adds:
- Adminer (Database UI) at http://localhost:8081
- Redis Commander at http://localhost:8082

**Option C: Full Setup with Monitoring**

```bash
docker-compose --profile monitoring up -d
```

This adds:
- Prometheus at http://localhost:9090
- Grafana at http://localhost:3001

### 4. Verify Services are Running

```bash
docker-compose ps
```

You should see all services as "Up" or "healthy".

### 5. Access the Application

**Main Application:**
- Frontend: http://localhost:5173 (development)
- Backend API: http://localhost:3000
- API Health Check: http://localhost:3000/health

**Development Tools (if using --profile tools):**
- Adminer (Database): http://localhost:8081
  - System: PostgreSQL
  - Server: postgres
  - Username: airadio
  - Password: airadio_dev_password
  - Database: airadio
- Redis Commander: http://localhost:8082

**Monitoring (if using --profile monitoring):**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
  - Username: admin
  - Password: admin (change immediately)

### 6. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 7. Stop the Application

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## Getting API Keys (Free Tiers)

### Essential APIs

1. **NewsAPI** (Free: 100 requests/day)
   - Visit: https://newsapi.org/
   - Click "Get API Key"
   - Sign up for free account
   - Copy your API key to `.env` as `NEWSAPI_KEY`

2. **OpenAI** (Pay-as-you-go, $5 credit for new accounts)
   - Visit: https://platform.openai.com/
   - Sign up and verify your account
   - Go to API Keys section
   - Create new secret key
   - Copy to `.env` as `OPENAI_API_KEY`

### Optional APIs (Enhance functionality)

3. **GNews** (Free: 100 requests/day)
   - Visit: https://gnews.io/
   - Sign up for free
   - Get API token
   - Add to `.env` as `GNEWS_API_KEY`

4. **Finnhub** (Free: 60 calls/minute)
   - Visit: https://finnhub.io/
   - Create free account
   - Get API key from dashboard
   - Add to `.env` as `FINNHUB_API_KEY`

5. **Alpha Vantage** (Free: 5 calls/minute)
   - Visit: https://www.alphavantage.co/
   - Get free API key
   - Add to `.env` as `ALPHA_VANTAGE_KEY`

6. **ElevenLabs** (Free: 10,000 characters/month)
   - Visit: https://elevenlabs.io/
   - Sign up for free
   - Get API key
   - Add to `.env` as `ELEVENLABS_API_KEY`

## Common Issues and Solutions

### Issue: Port already in use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Find process using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
PORT=3001
```

### Issue: Docker out of memory

**Error:** `Container killed due to OOM`

**Solution:**
- Increase Docker memory limit in Docker Desktop settings
- Recommended: 4GB minimum, 8GB preferred

### Issue: Database connection failed

**Solution:**
```bash
# Check if PostgreSQL container is healthy
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: API returns 401 Unauthorized

**Solution:**
- Verify your API keys in `.env` are correct
- Some APIs require email verification
- Check if you've exceeded free tier limits

### Issue: Frontend shows blank page

**Solution:**
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

## Next Steps

1. **Explore the Application:**
   - Browse news articles by category
   - Try the search functionality
   - Test audio playback (if TTS configured)

2. **Read the Documentation:**
   - [README.md](README.md) - Complete documentation
   - [PROJECT_PLAN.md](PROJECT_PLAN.md) - Feature roadmap
   - [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

3. **Customize:**
   - Modify categories in database
   - Adjust news fetch intervals in `.env`
   - Customize UI components in `frontend/src`

4. **Deploy to Production:**
   - See deployment section in README.md
   - Use `docker-compose.prod.yml` for production
   - Set up SSL certificates
   - Configure environment variables for production

## Development Workflow

### Making Changes to Backend

```bash
# Backend uses hot reload (nodemon)
# Edit files in backend/src/
# Changes will automatically reload
```

### Making Changes to Frontend

```bash
# Frontend uses Vite HMR
# Edit files in frontend/src/
# Changes reflect immediately in browser
```

### Running Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test
```

### Accessing Database Directly

```bash
# Using psql
docker-compose exec postgres psql -U airadio -d airadio

# Or use Adminer at http://localhost:8081
```

## Getting Help

- **Issues:** https://github.com/yourusername/ai-radio/issues
- **Discussions:** https://github.com/yourusername/ai-radio/discussions
- **Email:** support@airadio.com

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Congratulations!** 🎉 You now have AI-Radio News Application running locally!
