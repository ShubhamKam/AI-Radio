import { query } from '../config/database';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'like' | 'dislike' | 'play' | 'skip' | 'subscribe' | 'unsubscribe' | 'search';
  entity_type: 'radio_show' | 'music_track' | 'content' | 'topic';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export class UserActivityModel {
  static async create(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<UserActivity> {
    const result = await query(
      `INSERT INTO user_activities (user_id, activity_type, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        activity.user_id,
        activity.activity_type,
        activity.entity_type,
        activity.entity_id,
        JSON.stringify(activity.metadata || {}),
      ]
    );
    return result.rows[0];
  }

  static async getUserLikes(userId: string, entityType: string): Promise<UserActivity[]> {
    const result = await query(
      `SELECT * FROM user_activities 
       WHERE user_id = $1 AND activity_type = 'like' AND entity_type = $2
       ORDER BY created_at DESC`,
      [userId, entityType]
    );
    return result.rows;
  }

  static async getUserHistory(userId: string, limit: number = 50): Promise<UserActivity[]> {
    const result = await query(
      `SELECT * FROM user_activities 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async getPopularContent(entityType: string, limit: number = 20): Promise<any[]> {
    const result = await query(
      `SELECT entity_id, COUNT(*) as like_count
       FROM user_activities
       WHERE activity_type = 'like' AND entity_type = $1
       GROUP BY entity_id
       ORDER BY like_count DESC
       LIMIT $2`,
      [entityType, limit]
    );
    return result.rows;
  }
}
