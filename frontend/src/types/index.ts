// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Content types
export type ContentType = 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'TEXT' | 'WEB_RESEARCH';
export type ContentStatus = 'PROCESSING' | 'READY' | 'ERROR';

export interface Content {
  id: string;
  userId: string;
  type: ContentType;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  filePath: string | null;
  transcript: string | null;
  summary: string | null;
  topics: string[];
  duration: number | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Radio show types
export type ShowFormat = 'NEWS' | 'TALK' | 'EDUCATIONAL' | 'ENTERTAINMENT' | 'MUSIC_MIX';
export type ShowStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ARCHIVED';
export type SegmentType = 'INTRO' | 'CONTENT' | 'MUSIC' | 'NUDGE' | 'TRANSITION' | 'OUTRO';

export interface RadioShow {
  id: string;
  title: string;
  description: string | null;
  script: string;
  audioUrl: string | null;
  duration: number;
  format: ShowFormat;
  status: ShowStatus;
  scheduledAt: string | null;
  createdAt: string;
  segments: ShowSegment[];
}

export interface ShowSegment {
  id: string;
  showId: string;
  type: SegmentType;
  content: string;
  audioUrl: string | null;
  startTime: number;
  duration: number;
  order: number;
}

export interface KnowledgeNudge {
  id: string;
  contentId: string;
  text: string;
  audioUrl: string | null;
  duration: number;
  category: string | null;
  createdAt: string;
}

// Music types
export type MusicSource = 'youtube' | 'spotify' | 'local';

export interface Track {
  id: string;
  source: MusicSource;
  sourceId: string;
  title: string;
  artist: string | null;
  album: string | null;
  thumbnail: string | null;
  duration: number | null;
  url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  trackCount: number;
  tracks: Track[];
  source: MusicSource;
}

// Player types
export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentShow: RadioShow | null;
  queue: (Track | RadioShow)[];
  volume: number;
  progress: number;
  duration: number;
  mode: 'radio' | 'music' | 'show';
  isLoading: boolean;
}

// Search types
export interface SearchResult {
  id: string;
  type: 'track' | 'show' | 'content' | 'web';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  source?: MusicSource;
  data: Track | RadioShow | Content | WebSearchResult;
}

export interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
  thumbnail?: string;
}

// User preferences
export interface UserPreference {
  id: string;
  userId: string;
  preferredTopics: string[];
  preferredFormats: ShowFormat[];
  autoRefresh: boolean;
  refreshInterval: number;
  notificationsOn: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// History types
export interface ListeningHistory {
  id: string;
  userId: string;
  itemType: 'track' | 'show' | 'nudge';
  itemId: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  item?: Track | RadioShow | KnowledgeNudge;
}

// Subscription types
export interface Topic {
  id: string;
  name: string;
  description: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  topicId: string;
  createdAt: string;
  topic: Topic;
}
