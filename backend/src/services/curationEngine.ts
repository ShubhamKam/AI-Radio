import { query } from '../config/database';
import { ContentModel } from '../models/Content';
import { RadioShowModel } from '../models/RadioShow';
import { UserActivityModel } from '../models/UserActivity';
import { AIService } from './aiService';
import { MusicService } from './musicService';
import { logger } from '../utils/logger';

export class CurationEngine {
  static async refreshContent(userId?: string): Promise<void> {
    try {
      logger.info('Starting content curation refresh', { userId });

      // Get unprocessed or stale content
      const staleContent = await this.getStaleContent(userId);
      
      for (const content of staleContent) {
        await this.processAndCategorizeContent(content.id);
      }

      // Generate new radio shows based on curated content
      await this.generateRadioShows(userId);

      // Generate knowledge nudges
      await this.generateKnowledgeNudges(userId);

      logger.info('Content curation refresh completed', { userId });
    } catch (error) {
      logger.error('Error in content curation refresh:', error);
      throw error;
    }
  }

  private static async getStaleContent(userId?: string): Promise<any[]> {
    const maxAge = parseInt(process.env.MAX_CONTENT_AGE_DAYS || '30') * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - maxAge);

    let sql = `
      SELECT c.* FROM content c
      LEFT JOIN content_curation cc ON c.id = cc.content_id
      WHERE (cc.last_refreshed IS NULL OR cc.last_refreshed < $1)
        AND c.processed = true
    `;
    const params: any[] = [cutoffDate];

    if (userId) {
      sql += ' AND c.user_id = $2';
      params.push(userId);
    }

    sql += ' LIMIT 50';

    const result = await query(sql, params);
    return result.rows;
  }

  private static async processAndCategorizeContent(contentId: string): Promise<void> {
    try {
      const content = await ContentModel.findById(contentId);
      if (!content || !content.content_text) {
        return;
      }

      // Analyze content
      const analysis = await AIService.analyzeContent(content.content_text);
      
      // Generate embedding
      const embedding = await AIService.generateEmbedding(content.content_text);

      // Store curation metadata
      await query(
        `INSERT INTO content_curation (content_id, category, tags, embedding, relevance_score, last_refreshed)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (content_id)
         DO UPDATE SET
           category = EXCLUDED.category,
           tags = EXCLUDED.tags,
           embedding = EXCLUDED.embedding,
           relevance_score = EXCLUDED.relevance_score,
           last_refreshed = NOW()`,
        [
          contentId,
          analysis.category,
          JSON.stringify(analysis.tags),
          JSON.stringify(embedding),
          1.0, // Default relevance score
        ]
      );
    } catch (error) {
      logger.error('Error processing content:', error);
    }
  }

  private static async generateRadioShows(userId?: string): Promise<void> {
    try {
      // Get user preferences
      const preferences = userId
        ? await query('SELECT * FROM user_preferences WHERE user_id = $1', [userId])
        : null;

      // Get relevant content based on user preferences or popular content
      const relevantContent = await this.getRelevantContent(userId, preferences?.rows[0]);

      if (relevantContent.length === 0) {
        return;
      }

      // Generate different types of shows
      const showTypes: Array<'news' | 'talk' | 'music' | 'knowledge' | 'mixed'> = [
        'news',
        'talk',
        'knowledge',
        'mixed',
      ];

      for (const showType of showTypes) {
        const contentTexts = relevantContent
          .slice(0, 5)
          .map((c: any) => c.content_text)
          .filter((t: string) => t);

        if (contentTexts.length === 0) continue;

        const script = await AIService.generateRadioShowScript(
          contentTexts,
          showType,
          preferences?.rows[0]?.show_duration_preference || 30,
          preferences?.rows[0]
        );

        // Get music recommendations
        const musicGenres = preferences?.rows[0]?.preferred_music_genres || ['pop', 'rock'];
        const musicTracks = await MusicService.getRecommendations(musicGenres, 5);
        const musicTrackIds = musicTracks.map((t) => t.id);

        await RadioShowModel.create({
          user_id: userId,
          title: `${showType.charAt(0).toUpperCase() + showType.slice(1)} Show - ${new Date().toLocaleDateString()}`,
          description: `Auto-generated ${showType} show`,
          show_type: showType,
          script,
          duration: preferences?.rows[0]?.show_duration_preference || 30,
          music_tracks: musicTrackIds,
          content_sources: relevantContent.slice(0, 5).map((c: any) => c.id),
        });
      }
    } catch (error) {
      logger.error('Error generating radio shows:', error);
    }
  }

  private static async getRelevantContent(
    userId?: string,
    preferences?: any
  ): Promise<any[]> {
    let sql = `
      SELECT c.*, cc.category, cc.tags, cc.relevance_score
      FROM content c
      INNER JOIN content_curation cc ON c.id = cc.content_id
      WHERE c.processed = true
        AND c.content_text IS NOT NULL
        AND LENGTH(c.content_text) > 100
    `;

    const params: any[] = [];

    if (userId && preferences?.preferred_topics) {
      const topics = JSON.parse(preferences.preferred_topics || '[]');
      if (topics.length > 0) {
        sql += ` AND (cc.category = ANY($${params.length + 1}) OR cc.tags ?| $${params.length + 2})`;
        params.push(topics);
        params.push(topics);
      }
    }

    sql += ' ORDER BY cc.relevance_score DESC, c.created_at DESC LIMIT 20';

    const result = await query(sql, params);
    return result.rows;
  }

  private static async generateKnowledgeNudges(userId?: string): Promise<void> {
    try {
      // Get users who have knowledge nudges enabled
      let sql = `
        SELECT up.user_id, c.id as content_id, c.content_text
        FROM user_preferences up
        CROSS JOIN content c
        INNER JOIN content_curation cc ON c.id = cc.content_id
        WHERE up.knowledge_nudge_enabled = true
          AND c.processed = true
          AND c.content_text IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM knowledge_nudges kn
            WHERE kn.user_id = up.user_id AND kn.source_content_id = c.id
          )
      `;

      if (userId) {
        sql += ' AND up.user_id = $1';
      }

      sql += ' LIMIT 10';

      const result = await query(sql, userId ? [userId] : []);

      for (const row of result.rows) {
        try {
          const nudge = await AIService.generateKnowledgeNudge(row.content_text);

          await query(
            `INSERT INTO knowledge_nudges (user_id, title, content, source_content_id)
             VALUES ($1, $2, $3, $4)`,
            [row.user_id, nudge.title, nudge.content, row.content_id]
          );
        } catch (error) {
          logger.error('Error generating knowledge nudge:', error);
        }
      }
    } catch (error) {
      logger.error('Error generating knowledge nudges:', error);
    }
  }

  static async getPersonalizedContent(userId: string, limit: number = 10): Promise<any[]> {
    try {
      // Get user preferences and activity
      const preferences = await query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );

      const likedShows = await UserActivityModel.getUserLikes(userId, 'radio_show');
      const likedContentIds = likedShows.map((a) => a.entity_id);

      // Get content similar to liked content
      let sql = `
        SELECT c.*, cc.category, cc.tags
        FROM content c
        INNER JOIN content_curation cc ON c.id = cc.content_id
        WHERE c.processed = true
      `;

      const params: any[] = [];

      if (likedContentIds.length > 0) {
        sql += ` AND c.id = ANY($${params.length + 1})`;
        params.push(likedContentIds);
      } else if (preferences.rows[0]?.preferred_topics) {
        const topics = JSON.parse(preferences.rows[0].preferred_topics || '[]');
        if (topics.length > 0) {
          sql += ` AND (cc.category = ANY($${params.length + 1}) OR cc.tags ?| $${params.length + 2})`;
          params.push(topics);
          params.push(topics);
        }
      }

      sql += ` ORDER BY cc.relevance_score DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting personalized content:', error);
      return [];
    }
  }
}
