export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  author: string | null;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  viewCount: number;
  isFeatured: boolean;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface MarketData {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  preferredCategories: number[];
  preferredSources: number[];
  notificationEnabled: boolean;
  emailDigestFrequency: string;
  theme: string;
  language: string;
}
