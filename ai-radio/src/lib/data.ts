export interface Article {
  id: string;
  category: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  timestamp: string;
  isAudioAvailable: boolean;
  isPremium: boolean;
  source: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isUp: boolean;
}

export const MARKET_DATA: MarketData[] = [
  { symbol: "DJIA", name: "DOW JONES", value: "48,063.29", change: "0.63%", isUp: false },
  { symbol: "CL1:COM", name: "NYMEX WTI Crude", value: "57.21", change: "0.37%", isUp: false },
  { symbol: "NKY:IND", name: "Nikkei 225", value: "50,339.48", change: "1.2%", isUp: true },
];

export const ARTICLES: Article[] = [
  {
    id: "1",
    category: "Economics",
    title: "Trump Delays New Tariff Hike on Furniture, Kitchen Cabinets",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    timestamp: "January 1",
    isAudioAvailable: true,
    isPremium: false,
    source: "Bloomberg",
  },
  {
    id: "2",
    category: "Related",
    title: "Here's How the US Economy Fared Under Trump in 2025",
    timestamp: "",
    isAudioAvailable: false,
    isPremium: false,
    source: "Bloomberg",
  },
  {
    id: "3",
    category: "Related",
    title: "US to Cut Tariffs on Imported Pasta, Italy Foreign Ministry Says",
    timestamp: "",
    isAudioAvailable: false,
    isPremium: false,
    source: "Bloomberg",
  },
  {
    id: "4",
    category: "Technology",
    title: "Xi Touts China's AI, Chip Wins In Triumphant New Year's Speech",
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800",
    timestamp: "December 31",
    isAudioAvailable: true,
    isPremium: false,
    source: "Bloomberg",
  },
  {
    id: "5",
    category: "Markets",
    title: "Stocks, Gold, Yields Rise in Lively Start to 2026: Markets Wrap",
    imageUrl: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800",
    timestamp: "55 mins ago",
    isAudioAvailable: true,
    isPremium: false,
    source: "Bloomberg",
  },
  {
    id: "6",
    category: "The Big Take",
    title: "Here's (Almost) Everything Wall Street Expects in 2026",
    imageUrl: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800", // placeholder
    timestamp: "January 2",
    isAudioAvailable: false,
    isPremium: true,
    source: "Bloomberg",
  },
  {
    id: "7",
    category: "Markets",
    title: "US Treasuries Extend Gains After Posting Best Year Since 2020",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
    timestamp: "1 hr ago",
    isAudioAvailable: true,
    isPremium: false,
    source: "Bloomberg",
  },
];
