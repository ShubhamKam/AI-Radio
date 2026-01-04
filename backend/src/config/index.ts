import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large',

  // Google Cloud
  googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  googleCloudCredentialsPath: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH,

  // ElevenLabs
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,

  // YouTube
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',

  // Spotify
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI || '',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,

  // Google Drive/Docs
  googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY,

  // Web Search
  serperApiKey: process.env.SERPER_API_KEY,

  // Storage
  storageType: process.env.STORAGE_TYPE || 'local',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET,
  localStoragePath: process.env.LOCAL_STORAGE_PATH || './uploads',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Job Queue
  bullRedisUrl: process.env.BULL_REDIS_URL || 'redis://localhost:6379',
  bullMaxJobs: parseInt(process.env.BULL_MAX_JOBS || '5', 10),

  // Pinecone
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'ai-radio-embeddings',

  // Content Processing
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10),
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'audio/*,video/*,application/pdf,text/*',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'capacitor://localhost'],

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || './logs',
};
