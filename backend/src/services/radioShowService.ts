import { RadioShowModel } from '../models/RadioShow';
import { AIService } from './aiService';
import { MusicService } from './musicService';
import { ContentModel } from '../models/Content';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export class RadioShowService {
  static async generateShow(
    userId: string,
    contentIds: string[],
    showType: 'news' | 'talk' | 'music' | 'knowledge' | 'mixed',
    duration: number = 30
  ): Promise<RadioShowModel> {
    try {
      // Get content
      const contents = await Promise.all(
        contentIds.map((id) => ContentModel.findById(id))
      );
      const validContents = contents.filter((c) => c && c.content_text) as any[];

      if (validContents.length === 0) {
        throw new Error('No valid content found');
      }

      // Generate script
      const script = await AIService.generateRadioShowScript(
        validContents.map((c) => c.content_text),
        showType,
        duration
      );

      // Get music tracks
      const musicTracks = await MusicService.getRecommendations(['pop', 'rock'], 5);
      const musicTrackIds = musicTracks.map((t) => t.id);

      // Create radio show
      const radioShow = await RadioShowModel.create({
        user_id: userId,
        title: `${showType.charAt(0).toUpperCase() + showType.slice(1)} Show`,
        description: `Generated ${showType} show`,
        show_type: showType,
        script,
        duration,
        music_tracks: musicTrackIds,
        content_sources: contentIds,
      });

      // Generate audio (optional - can be done async)
      // await this.generateAudio(radioShow.id, script);

      return radioShow;
    } catch (error) {
      logger.error('Error generating radio show:', error);
      throw error;
    }
  }

  static async generateAudio(showId: string, script: string): Promise<string> {
    try {
      // Convert script to speech
      const audioBuffer = await AIService.textToSpeech(script);

      // Save audio file
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      await fs.mkdir(uploadDir, { recursive: true });
      
      const audioPath = path.join(uploadDir, `${showId}.mp3`);
      await fs.writeFile(audioPath, audioBuffer);

      // Update radio show with audio URL
      const audioUrl = `/api/radio/shows/${showId}/audio`;
      await RadioShowModel.updateAudioUrl(showId, audioUrl);

      return audioUrl;
    } catch (error) {
      logger.error('Error generating audio:', error);
      throw error;
    }
  }

  static async getShowWithMusic(showId: string): Promise<any> {
    try {
      const show = await RadioShowModel.findById(showId);
      if (!show) {
        throw new Error('Radio show not found');
      }

      // Get music track details
      const musicTracks = await Promise.all(
        (JSON.parse(show.music_tracks as any) || []).map(async (trackId: string) => {
          // Try Spotify first, then YouTube
          try {
            const track = await MusicService.getSpotifyTrack(trackId);
            if (track) return track;
          } catch (e) {
            // Try YouTube
            try {
              const track = await MusicService.getYouTubeVideoDetails(trackId);
              if (track) return track;
            } catch (e2) {
              logger.error('Error fetching track:', trackId);
            }
          }
          return null;
        })
      );

      return {
        ...show,
        musicTracks: musicTracks.filter((t) => t !== null),
      };
    } catch (error) {
      logger.error('Error getting show with music:', error);
      throw error;
    }
  }
}
