import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://airadio:airadio_dev_password@localhost:5432/airadio',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://:airadio_redis_password@localhost:6379',
  },
  
  // Elasticsearch (optional)
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    enabled: process.env.ENABLE_ELASTICSEARCH === 'true',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8080'],
  },
  
  // External APIs
  apis: {
    newsapi: {
      key: process.env.NEWSAPI_KEY || '',
      baseUrl: 'https://newsapi.org/v2',
    },
    gnews: {
      key: process.env.GNEWS_API_KEY || '',
      baseUrl: 'https://gnews.io/api/v4',
    },
    finnhub: {
      key: process.env.FINNHUB_API_KEY || '',
      baseUrl: 'https://finnhub.io/api/v1',
    },
    alphaVantage: {
      key: process.env.ALPHA_VANTAGE_KEY || '',
      baseUrl: 'https://www.alphavantage.co/query',
    },
  },
  
  // AI/ML Services
  ai: {
    openai: {
      key: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
    elevenlabs: {
      key: process.env.ELEVENLABS_API_KEY || '',
      voiceId: process.env.ELEVENLABS_VOICE_ID || '',
    },
  },
  
  // Caching
  cache: {
    ttl: {
      articles: parseInt(process.env.CACHE_TTL_ARTICLES || '300', 10),
      marketData: parseInt(process.env.CACHE_TTL_MARKET_DATA || '60', 10),
      userSessions: parseInt(process.env.CACHE_TTL_USER_SESSIONS || '86400', 10),
    },
  },
  
  // Job scheduling
  jobs: {
    newsFetchInterval: parseInt(process.env.NEWS_FETCH_INTERVAL || '300000', 10), // 5 minutes
    marketUpdateInterval: parseInt(process.env.MARKET_UPDATE_INTERVAL || '60000', 10), // 1 minute
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};
