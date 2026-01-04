import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-node';
import { logger } from '../utils/logger';

interface MusicTrack {
  id: string;
  platform: 'youtube' | 'spotify';
  platformId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnailUrl?: string;
  streamUrl?: string;
  metadata?: Record<string, any>;
}

export class MusicService {
  private static spotifyApi: SpotifyWebApi;

  static initializeSpotify() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }

  static async searchYouTube(query: string, maxResults: number = 10): Promise<MusicTrack[]> {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          key: process.env.YOUTUBE_API_KEY,
        },
      });

      return response.data.items.map((item: any) => ({
        id: item.id.videoId,
        platform: 'youtube' as const,
        platformId: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.default?.url,
        duration: 0, // YouTube API doesn't provide duration in search, need video details
        metadata: {
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
        },
      }));
    } catch (error) {
      logger.error('Error searching YouTube:', error);
      throw error;
    }
  }

  static async getYouTubeVideoDetails(videoId: string): Promise<MusicTrack | null> {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,contentDetails',
          id: videoId,
          key: process.env.YOUTUBE_API_KEY,
        },
      });

      if (response.data.items.length === 0) {
        return null;
      }

      const item = response.data.items[0];
      const duration = this.parseYouTubeDuration(item.contentDetails.duration);

      return {
        id: videoId,
        platform: 'youtube' as const,
        platformId: videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.default?.url,
        duration,
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        metadata: {
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
        },
      };
    } catch (error) {
      logger.error('Error getting YouTube video details:', error);
      throw error;
    }
  }

  static async searchSpotify(query: string, limit: number = 10): Promise<MusicTrack[]> {
    try {
      if (!this.spotifyApi) {
        this.initializeSpotify();
      }

      // Get access token
      const tokenResponse = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(tokenResponse.body.access_token);

      const response = await this.spotifyApi.searchTracks(query, { limit });

      return response.body.tracks?.items.map((track: any) => ({
        id: track.id,
        platform: 'spotify' as const,
        platformId: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        thumbnailUrl: track.album.images[0]?.url,
        streamUrl: track.external_urls.spotify,
        metadata: {
          popularity: track.popularity,
          previewUrl: track.preview_url,
        },
      })) || [];
    } catch (error) {
      logger.error('Error searching Spotify:', error);
      throw error;
    }
  }

  static async getSpotifyTrack(trackId: string): Promise<MusicTrack | null> {
    try {
      if (!this.spotifyApi) {
        this.initializeSpotify();
      }

      const tokenResponse = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(tokenResponse.body.access_token);

      const response = await this.spotifyApi.getTrack(trackId);

      const track = response.body;
      return {
        id: track.id,
        platform: 'spotify' as const,
        platformId: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        thumbnailUrl: track.album.images[0]?.url,
        streamUrl: track.external_urls.spotify,
        metadata: {
          popularity: track.popularity,
          previewUrl: track.preview_url,
        },
      };
    } catch (error) {
      logger.error('Error getting Spotify track:', error);
      throw error;
    }
  }

  static async getRecommendations(
    genres: string[],
    limit: number = 20
  ): Promise<MusicTrack[]> {
    try {
      if (!this.spotifyApi) {
        this.initializeSpotify();
      }

      const tokenResponse = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(tokenResponse.body.access_token);

      const seedGenres = genres.slice(0, 5).join(',');
      const response = await this.spotifyApi.getRecommendations({
        seed_genres: seedGenres,
        limit,
      });

      return response.body.tracks.map((track: any) => ({
        id: track.id,
        platform: 'spotify' as const,
        platformId: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        thumbnailUrl: track.album.images[0]?.url,
        streamUrl: track.external_urls.spotify,
        metadata: {
          popularity: track.popularity,
        },
      }));
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  private static parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}
