# AI-Radio News Application - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Web App   │  │ Mobile App  │  │     PWA     │  │   Desktop   │  │
│  │   (React)   │  │   (React    │  │  (Service   │  │   (Electron)│  │
│  │             │  │   Native)   │  │   Worker)   │  │  [Future]   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                 │                 │          │
└─────────┼────────────────┼─────────────────┼─────────────────┼──────────┘
          │                │                 │                 │
          └────────────────┴─────────────────┴─────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                         │
│                            (Nginx)                                       │
│                                                                           │
│  • SSL Termination                                                       │
│  • Rate Limiting                                                         │
│  • Static Asset Serving                                                  │
│  • Request Routing                                                       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   HTTP/REST Endpoints     │   │   WebSocket Connections   │
│   (Express.js)            │   │   (Socket.io)             │
└─────────┬─────────────────┘   └─────────┬─────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                 │
│                    (Node.js + Express + TypeScript)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   News Service  │  │  Market Data    │  │  User Service   │        │
│  │                 │  │    Service      │  │                 │        │
│  │  • Aggregation  │  │                 │  │  • Auth         │        │
│  │  • Parsing      │  │  • Real-time    │  │  • Profile      │        │
│  │  • Dedup        │  │    Updates      │  │  • Preferences  │        │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘        │
│           │                    │                     │                  │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐        │
│  │   AI/ML         │  │  Search         │  │  Audio          │        │
│  │   Service       │  │  Service        │  │  Service        │        │
│  │                 │  │                 │  │                 │        │
│  │  • Summarize    │  │  • Full-text    │  │  • TTS          │        │
│  │  • Categorize   │  │  • Filter       │  │  • Streaming    │        │
│  │  • Recommend    │  │  • Trending     │  │  • Playlist     │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   Background Jobs         │   │   Scheduled Tasks         │
│   (Bull Queue)            │   │   (node-cron)             │
│                           │   │                           │
│  • Email Notifications    │   │  • News Fetch (5 min)     │
│  • Image Processing       │   │  • Market Update (1 min)  │
│  • Audio Generation       │   │  • Cache Warming          │
│  • Report Generation      │   │  • Analytics Processing   │
└───────────────────────────┘   └───────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                       PostgreSQL 16                             │    │
│  │                    (Primary Database)                           │    │
│  │                                                                  │    │
│  │  Tables:                                                         │    │
│  │  • users, user_preferences, subscriptions                       │    │
│  │  • articles, categories, sources, article_categories           │    │
│  │  • ai_summaries, audio_content                                  │    │
│  │  • market_data                                                  │    │
│  │  • bookmarks, reading_history                                   │    │
│  │  • api_rate_limits, system_logs                                │    │
│  │                                                                  │    │
│  │  Features:                                                       │    │
│  │  ✓ ACID Compliance                                              │    │
│  │  ✓ Full-text Search (pg_trgm)                                  │    │
│  │  ✓ JSON Support (JSONB)                                         │    │
│  │  ✓ Replication Ready                                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                         Redis 7                                 │    │
│  │                    (Cache & Session Store)                      │    │
│  │                                                                  │    │
│  │  Use Cases:                                                      │    │
│  │  • API Response Caching                                          │    │
│  │  • Session Management                                            │    │
│  │  • Rate Limiting                                                 │    │
│  │  • Real-time Pub/Sub                                            │    │
│  │  • Job Queue (Bull)                                             │    │
│  │                                                                  │    │
│  │  TTL Strategies:                                                 │    │
│  │  • Articles: 5 minutes                                           │    │
│  │  • Market Data: 1 minute                                         │    │
│  │  • User Sessions: 24 hours                                       │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Elasticsearch 8                              │    │
│  │                    (Search Engine) [OPTIONAL]                   │    │
│  │                                                                  │    │
│  │  Indices:                                                        │    │
│  │  • articles_index                                                │    │
│  │  • users_index                                                   │    │
│  │                                                                  │    │
│  │  Features:                                                       │    │
│  │  ✓ Full-text Search                                             │    │
│  │  ✓ Fuzzy Matching                                               │    │
│  │  ✓ Aggregations                                                 │    │
│  │  ✓ Real-time Indexing                                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   NewsAPI    │  │    GNews     │  │   Finnhub    │                 │
│  │              │  │              │  │              │                 │
│  │  General     │  │  General     │  │  Financial   │                 │
│  │  News        │  │  News        │  │  News        │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Alpha        │  │   Yahoo      │  │  Polygon.io  │                 │
│  │ Vantage      │  │   Finance    │  │              │                 │
│  │              │  │              │  │              │                 │
│  │  Market      │  │  Market      │  │  Market      │                 │
│  │  Data        │  │  Data        │  │  Data        │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   OpenAI     │  │  ElevenLabs  │  │  Anthropic   │                 │
│  │   GPT-4      │  │              │  │  Claude      │                 │
│  │              │  │              │  │  [Optional]  │                 │
│  │  AI/ML       │  │  Text-to-    │  │  AI/ML       │                 │
│  │  Services    │  │  Speech      │  │  Services    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   MONITORING & OBSERVABILITY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                       Prometheus                                │    │
│  │                   (Metrics Collection)                          │    │
│  │                                                                  │    │
│  │  Metrics:                                                        │    │
│  │  • HTTP Request Rate & Duration                                 │    │
│  │  • Database Query Performance                                   │    │
│  │  • Cache Hit/Miss Ratio                                         │    │
│  │  • External API Response Times                                  │    │
│  │  • Memory & CPU Usage                                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                │                                         │
│                                ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                        Grafana                                  │    │
│  │                  (Visualization & Alerting)                     │    │
│  │                                                                  │    │
│  │  Dashboards:                                                     │    │
│  │  • System Overview                                               │    │
│  │  • API Performance                                               │    │
│  │  • User Analytics                                                │    │
│  │  • Error Tracking                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Winston Logger                               │    │
│  │                 (Application Logging)                           │    │
│  │                                                                  │    │
│  │  Outputs:                                                        │    │
│  │  • Console (Development)                                         │    │
│  │  • File (error.log, combined.log)                               │    │
│  │  • ELK Stack (Production) [Optional]                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### News Aggregation Flow

```
┌─────────────┐
│ Cron Job    │ (Every 5 minutes)
│ Scheduler   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ News Service    │
│ fetchNews()     │
└──────┬──────────┘
       │
       ├─────────────► NewsAPI  ─────┐
       │                              │
       ├─────────────► GNews    ─────┤
       │                              │
       └─────────────► Finnhub  ─────┤
                                      │
                              ┌───────▼────────┐
                              │ Parse & Normalize│
                              │ Articles         │
                              └───────┬──────────┘
                                      │
                              ┌───────▼────────┐
                              │ Deduplication   │
                              │ (by title/url)  │
                              └───────┬──────────┘
                                      │
                              ┌───────▼────────┐
                              │ AI Categorization│
                              │ (OpenAI GPT-4)  │
                              └───────┬──────────┘
                                      │
                              ┌───────▼────────┐
                              │ Save to         │
                              │ PostgreSQL      │
                              └───────┬──────────┘
                                      │
                              ┌───────▼────────┐
                              │ Update Cache    │
                              │ (Redis)         │
                              └───────┬──────────┘
                                      │
                              ┌───────▼────────┐
                              │ Notify Clients  │
                              │ (WebSocket)     │
                              └─────────────────┘
```

### User Authentication Flow

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌──────────────────┐
│ Auth Controller  │
└──────┬───────────┘
       │ 2. Validate Input
       ▼
┌──────────────────┐
│  Auth Service    │
└──────┬───────────┘
       │ 3. Query User
       ▼
┌──────────────────┐
│   PostgreSQL     │
│  users table     │
└──────┬───────────┘
       │ 4. Return user
       ▼
┌──────────────────┐
│  Auth Service    │
│  bcrypt.compare  │
└──────┬───────────┘
       │ 5. Password valid?
       ▼
┌──────────────────┐
│  JWT Service     │
│  generateToken   │
└──────┬───────────┘
       │ 6. Create JWT
       ▼
┌──────────────────┐
│    Redis         │
│  Store Session   │
└──────┬───────────┘
       │ 7. Session saved
       ▼
┌──────────────────┐
│ Auth Controller  │
│ Return Response  │
└──────┬───────────┘
       │ 8. { token, user }
       ▼
┌──────────────────┐
│    Client        │
│ Store Token      │
└──────────────────┘
```

### Article Reading Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. GET /articles/:id
       ▼
┌──────────────────┐
│ Articles         │
│ Controller       │
└──────┬───────────┘
       │ 2. Check Cache
       ▼
┌──────────────────┐
│    Redis         │
└──────┬───────────┘
       │ 3. Cache hit?
       │
       ├─── Yes ──► Return cached data ─────┐
       │                                     │
       └─── No ──────┐                       │
                     │                       │
                     ▼                       │
            ┌──────────────────┐            │
            │   PostgreSQL     │            │
            │  articles table  │            │
            └──────┬───────────┘            │
                   │ 4. Query article       │
                   ▼                        │
            ┌──────────────────┐            │
            │  AI Summary      │            │
            │  Service         │            │
            └──────┬───────────┘            │
                   │ 5. Generate summary    │
                   ▼                        │
            ┌──────────────────┐            │
            │   Save to Cache  │            │
            │   (5 min TTL)    │            │
            └──────┬───────────┘            │
                   │                        │
                   └────────────────────────┤
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │  Return Article  │
                                   │  + AI Summary    │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │   Update Stats   │
                                   │  (view_count)    │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │  Track Reading   │
                                   │  History         │
                                   └──────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN (Cloudflare)                          │
│               (Static Assets, DDoS Protection)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer (AWS ALB)                       │
│               (SSL Termination, Health Checks)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Frontend Pods   │           │  Backend Pods    │
│  (Kubernetes)    │           │  (Kubernetes)    │
│                  │           │                  │
│  • Auto-scaling  │           │  • Auto-scaling  │
│  • 3+ replicas   │           │  • 3+ replicas   │
└──────────────────┘           └────────┬─────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼                               ▼
              ┌───────────────────┐         ┌───────────────────┐
              │  RDS PostgreSQL   │         │  ElastiCache      │
              │  (Multi-AZ)       │         │  Redis            │
              │                   │         │  (Cluster Mode)   │
              │  • Primary        │         └───────────────────┘
              │  • Read Replicas  │
              │  • Auto Backup    │
              └───────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: Network Security                                        │
│  ├── Cloudflare WAF                                              │
│  ├── DDoS Protection                                             │
│  └── Rate Limiting                                               │
│                                                                   │
│  Layer 2: Application Security                                   │
│  ├── Helmet.js (Security Headers)                                │
│  ├── CORS Configuration                                          │
│  ├── Input Validation (Joi)                                      │
│  └── SQL Injection Prevention                                    │
│                                                                   │
│  Layer 3: Authentication & Authorization                          │
│  ├── JWT Tokens                                                  │
│  ├── Bcrypt Password Hashing                                     │
│  ├── Role-Based Access Control                                   │
│  └── Session Management (Redis)                                  │
│                                                                   │
│  Layer 4: Data Security                                          │
│  ├── Encryption at Rest                                          │
│  ├── Encryption in Transit (TLS 1.3)                             │
│  ├── Database Access Controls                                    │
│  └── Secrets Management (AWS Secrets Manager)                    │
│                                                                   │
│  Layer 5: Monitoring & Auditing                                  │
│  ├── Security Logs (Winston)                                     │
│  ├── Vulnerability Scanning (Trivy)                              │
│  ├── Dependency Auditing (npm audit)                             │
│  └── Intrusion Detection                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Maintained By:** Cursor Agent & Development Team
