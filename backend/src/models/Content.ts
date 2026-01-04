import { query } from '../config/database';

export interface Content {
  id: string;
  user_id: string;
  content_type: 'audio' | 'video' | 'slides' | 'google_sheets' | 'google_docs' | 'text' | 'research';
  source_type: string;
  title: string;
  content_text?: string;
  metadata?: Record<string, any>;
  file_url?: string;
  processed: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ContentModel {
  static async create(content: Omit<Content, 'id' | 'created_at' | 'updated_at'>): Promise<Content> {
    const result = await query(
      `INSERT INTO content (user_id, content_type, source_type, title, content_text, metadata, file_url, processed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        content.user_id,
        content.content_type,
        content.source_type,
        content.title,
        content.content_text,
        JSON.stringify(content.metadata || {}),
        content.file_url,
        content.processed || false,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Content | null> {
    const result = await query('SELECT * FROM content WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<Content[]> {
    const result = await query(
      'SELECT * FROM content WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async markAsProcessed(id: string): Promise<void> {
    await query('UPDATE content SET processed = true, updated_at = NOW() WHERE id = $1', [id]);
  }

  static async updateContentText(id: string, contentText: string): Promise<void> {
    await query(
      'UPDATE content SET content_text = $1, updated_at = NOW() WHERE id = $2',
      [contentText, id]
    );
  }
}
