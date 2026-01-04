import { query } from '../config/database';

export interface RadioShow {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  show_type: 'news' | 'talk' | 'music' | 'knowledge' | 'mixed';
  script: string;
  audio_url?: string;
  duration: number;
  music_tracks?: string[];
  content_sources?: string[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class RadioShowModel {
  static async create(show: Omit<RadioShow, 'id' | 'created_at' | 'updated_at'>): Promise<RadioShow> {
    const result = await query(
      `INSERT INTO radio_shows (user_id, title, description, show_type, script, audio_url, duration, music_tracks, content_sources, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        show.user_id,
        show.title,
        show.description,
        show.show_type,
        show.script,
        show.audio_url,
        show.duration,
        JSON.stringify(show.music_tracks || []),
        JSON.stringify(show.content_sources || []),
        JSON.stringify(show.metadata || {}),
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<RadioShow | null> {
    const result = await query('SELECT * FROM radio_shows WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit: number = 20): Promise<RadioShow[]> {
    const result = await query(
      'SELECT * FROM radio_shows WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async findRecent(limit: number = 20): Promise<RadioShow[]> {
    const result = await query(
      'SELECT * FROM radio_shows ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async updateAudioUrl(id: string, audioUrl: string): Promise<void> {
    await query(
      'UPDATE radio_shows SET audio_url = $1, updated_at = NOW() WHERE id = $2',
      [audioUrl, id]
    );
  }
}
