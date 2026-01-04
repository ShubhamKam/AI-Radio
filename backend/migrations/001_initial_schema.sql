-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_topics JSONB DEFAULT '[]',
  preferred_music_genres JSONB DEFAULT '[]',
  show_duration_preference INTEGER DEFAULT 30,
  knowledge_nudge_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content table (stores all input content)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('audio', 'video', 'slides', 'google_sheets', 'google_docs', 'text', 'research')),
  source_type VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  content_text TEXT,
  metadata JSONB DEFAULT '{}',
  file_url TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_processed ON content(processed);

-- Radio shows table
CREATE TABLE IF NOT EXISTS radio_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  show_type VARCHAR(50) NOT NULL CHECK (show_type IN ('news', 'talk', 'music', 'knowledge', 'mixed')),
  script TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER NOT NULL,
  music_tracks JSONB DEFAULT '[]',
  content_sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_radio_shows_user_id ON radio_shows(user_id);
CREATE INDEX idx_radio_shows_type ON radio_shows(show_type);
CREATE INDEX idx_radio_shows_created_at ON radio_shows(created_at DESC);

-- Music tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('youtube', 'spotify')),
  platform_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(255),
  album VARCHAR(255),
  duration INTEGER,
  thumbnail_url TEXT,
  stream_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, platform_id)
);

CREATE INDEX idx_music_tracks_platform ON music_tracks(platform);
CREATE INDEX idx_music_tracks_title ON music_tracks(title);

-- User activities (likes, plays, history)
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('like', 'dislike', 'play', 'skip', 'subscribe', 'unsubscribe', 'search')),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('radio_show', 'music_track', 'content', 'topic')),
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_entity ON user_activities(entity_type, entity_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);

-- Research results table
CREATE TABLE IF NOT EXISTS research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  research_type VARCHAR(50) NOT NULL CHECK (research_type IN ('deep', 'wide')),
  results JSONB NOT NULL,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_research_user_id ON research_results(user_id);
CREATE INDEX idx_research_type ON research_results(research_type);

-- Knowledge nudges table
CREATE TABLE IF NOT EXISTS knowledge_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  source_content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nudges_user_id ON knowledge_nudges(user_id);
CREATE INDEX idx_nudges_delivered ON knowledge_nudges(delivered);

-- Content curation metadata
CREATE TABLE IF NOT EXISTS content_curation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  embedding VECTOR(1536),
  relevance_score FLOAT,
  last_refreshed TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_curation_content_id ON content_curation(content_id);
CREATE INDEX idx_curation_category ON content_curation(category);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL CHECK (subscription_type IN ('topic', 'show_type', 'artist', 'playlist')),
  subscription_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, subscription_type, subscription_value)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
