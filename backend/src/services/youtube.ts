const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchResult {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number | null;
  source: 'youtube';
}

export async function searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
  if (!YOUTUBE_API_KEY) {
    // Return mock data for demo
    return getMockYouTubeResults(query);
  }

  try {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      q: query,
      type: 'video',
      part: 'snippet',
      maxResults: '20',
      videoCategoryId: '10', // Music category
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: null, // Would need another API call to get duration
      source: 'youtube',
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return getMockYouTubeResults(query);
  }
}

export async function getYouTubeVideo(videoId: string): Promise<YouTubeSearchResult | null> {
  if (!YOUTUBE_API_KEY) {
    return {
      id: videoId,
      videoId,
      title: 'Demo Video',
      artist: 'Demo Artist',
      thumbnail: 'https://via.placeholder.com/320x180',
      duration: 180,
      source: 'youtube',
    };
  }

  try {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      id: videoId,
      part: 'snippet,contentDetails',
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const item = data.items[0];
    const duration = parseDuration(item.contentDetails?.duration);

    return {
      id: item.id,
      videoId: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url,
      duration,
      source: 'youtube',
    };
  } catch (error) {
    console.error('YouTube video fetch error:', error);
    return null;
  }
}

function parseDuration(duration: string | undefined): number {
  if (!duration) return 0;
  
  // Parse ISO 8601 duration (PT1H2M3S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function getMockYouTubeResults(query: string): YouTubeSearchResult[] {
  const mockTracks = [
    { title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl' },
    { title: 'Chill Beats Mix', artist: 'ChillHop Music' },
    { title: 'Jazz Piano Session', artist: 'Jazz Cafe' },
    { title: 'Ambient Soundscapes', artist: 'Nature Sounds' },
    { title: 'Electronic Dreams', artist: 'Synthwave FM' },
  ];

  return mockTracks.map((track, index) => ({
    id: `demo-${index}`,
    videoId: `dQw4w9WgXcQ`,
    title: `${track.title} - ${query}`,
    artist: track.artist,
    thumbnail: `https://via.placeholder.com/320x180?text=${encodeURIComponent(track.title)}`,
    duration: 180 + Math.floor(Math.random() * 120),
    source: 'youtube',
  }));
}
