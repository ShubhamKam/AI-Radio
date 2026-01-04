import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { aiService } from './ai.service';
import { radioShowQueue } from '../queues/radio-show.queue';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';

class RadioShowService {
  async createShow(
    userId: string,
    options: {
      showType: string;
      contentIds?: string[];
      title?: string;
    }
  ) {
    const show = await prisma.radioShow.create({
      data: {
        userId,
        title: options.title || `${options.showType} - ${new Date().toLocaleDateString()}`,
        showType: options.showType,
        sourceContentIds: options.contentIds || [],
        status: 'generating'
      }
    });

    // Queue for generation
    await radioShowQueue.add('generate-show', {
      showId: show.id,
      userId,
      showType: options.showType,
      contentIds: options.contentIds || []
    });

    return show;
  }

  async generateShow(
    showId: string,
    userId: string,
    showType: string,
    contentIds: string[]
  ) {
    try {
      // Get user preferences
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      // Get content for the show
      let content: any[] = [];
      
      if (contentIds.length > 0) {
        content = await prisma.content.findMany({
          where: {
            id: { in: contentIds },
            userId,
            processingStatus: 'completed'
          }
        });
      } else {
        // Auto-select content based on user preferences
        content = await this.selectContentForShow(userId, showType, preferences);
      }

      // Generate script
      const contentTexts = content.map(c => {
        return `Title: ${c.title}\n${c.summary || c.extractedText?.substring(0, 500)}`;
      });

      const script = await aiService.generateRadioScript({
        showType,
        content: contentTexts,
        userPreferences: preferences
      });

      // TODO: Generate TTS audio
      // For now, just save the script
      const audioUrl = `/audio/shows/${showId}.mp3`;
      
      // Select music tracks if needed
      const musicTracks = await this.selectMusicForShow(userId, showType);

      // Calculate estimated duration
      const durationSeconds = this.estimateDuration(script, musicTracks.length);

      // Update show
      await prisma.radioShow.update({
        where: { id: showId },
        data: {
          script,
          audioUrl,
          musicTracks,
          durationSeconds,
          status: 'ready',
          generatedAt: new Date()
        }
      });
    } catch (error) {
      await prisma.radioShow.update({
        where: { id: showId },
        data: { status: 'failed' }
      });
      throw error;
    }
  }

  private async selectContentForShow(
    userId: string,
    showType: string,
    preferences: any
  ): Promise<any[]> {
    // Select content based on show type and user preferences
    const limit = showType === 'quick_hits' ? 1 : showType === 'deep_dive' ? 3 : 5;

    const content = await prisma.content.findMany({
      where: {
        userId,
        processingStatus: 'completed'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return content;
  }

  private async selectMusicForShow(userId: string, showType: string): Promise<any[]> {
    // TODO: Integrate with YouTube/Spotify to select music
    // For now, return empty array
    return [];
  }

  private estimateDuration(script: string, musicCount: number): number {
    // Rough estimate: 150 words per minute for speech
    const words = script.split(/\s+/).length;
    const speechMinutes = words / 150;
    const musicMinutes = musicCount * 3; // Average 3 minutes per track
    
    return Math.round((speechMinutes + musicMinutes) * 60);
  }

  async listShows(
    userId: string,
    options: { page: number; limit: number; status?: string }
  ) {
    const where: any = { userId };
    if (options.status) where.status = options.status;

    const [items, total] = await Promise.all([
      prisma.radioShow.findMany({
        where,
        take: options.limit,
        skip: (options.page - 1) * options.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.radioShow.count({ where })
    ]);

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      pages: Math.ceil(total / options.limit)
    };
  }

  async getShow(showId: string, userId: string) {
    const show = await prisma.radioShow.findFirst({
      where: { id: showId, userId }
    });

    if (!show) {
      throw new AppError('Show not found', 404);
    }

    return show;
  }

  async deleteShow(showId: string, userId: string) {
    const show = await prisma.radioShow.findFirst({
      where: { id: showId, userId }
    });

    if (!show) {
      throw new AppError('Show not found', 404);
    }

    // Delete audio file if exists
    if (show.audioUrl) {
      const audioPath = path.join(config.localStoragePath, show.audioUrl);
      try {
        await fs.unlink(audioPath);
      } catch (error) {
        // File might not exist
      }
    }

    await prisma.radioShow.delete({
      where: { id: showId }
    });
  }
}

export const radioShowService = new RadioShowService();
