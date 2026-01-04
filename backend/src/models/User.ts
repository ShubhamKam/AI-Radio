import { query } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  user_id: string;
  preferred_topics?: string[];
  preferred_music_genres?: string[];
  show_duration_preference?: number;
  knowledge_nudge_enabled?: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at, updated_at`,
      [email, username, passwordHash]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const result = await query(
      `INSERT INTO user_preferences (user_id, preferred_topics, preferred_music_genres, 
        show_duration_preference, knowledge_nudge_enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         preferred_topics = EXCLUDED.preferred_topics,
         preferred_music_genres = EXCLUDED.preferred_music_genres,
         show_duration_preference = EXCLUDED.show_duration_preference,
         knowledge_nudge_enabled = EXCLUDED.knowledge_nudge_enabled,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        JSON.stringify(preferences.preferred_topics || []),
        JSON.stringify(preferences.preferred_music_genres || []),
        preferences.show_duration_preference || 30,
        preferences.knowledge_nudge_enabled ?? true,
      ]
    );
    return result.rows[0];
  }

  static async getPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }
}
