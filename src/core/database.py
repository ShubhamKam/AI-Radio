"""
Database management for AI Radio Content Categorizer.
Uses SQLite for local storage with async support.
"""

import os
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from contextlib import contextmanager

from .config import Config
from .models import Content, ContentStatus, UploadStatus, ContentType


class Database:
    """SQLite database manager for content storage."""
    
    def __init__(self, db_path: str = None):
        """Initialize database connection."""
        config = Config()
        if db_path is None:
            db_path = config.get('database', 'path', 
                                default=str(config.get_data_dir() / 'content.db'))
        
        self.db_path = Path(os.path.expanduser(db_path))
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._init_db()
    
    def _init_db(self) -> None:
        """Initialize database tables."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Content table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS content (
                    id TEXT PRIMARY KEY,
                    source TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    title TEXT,
                    raw_content TEXT,
                    extracted_text TEXT,
                    analysis_json TEXT,
                    category_id TEXT,
                    subcategory TEXT,
                    tags_json TEXT,
                    priority_score REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'pending',
                    upload_status TEXT DEFAULT 'pending',
                    drive_file_id TEXT,
                    drive_folder_id TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    processed_at TEXT,
                    uploaded_at TEXT,
                    metadata_json TEXT
                )
            ''')
            
            # Bookmarks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS bookmarks (
                    id TEXT PRIMARY KEY,
                    url TEXT UNIQUE NOT NULL,
                    title TEXT,
                    browser TEXT,
                    folder_path TEXT,
                    added_date TEXT,
                    processed INTEGER DEFAULT 0,
                    content_id TEXT,
                    FOREIGN KEY (content_id) REFERENCES content(id)
                )
            ''')
            
            # Upload tracking table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS uploads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content_id TEXT NOT NULL,
                    drive_file_id TEXT,
                    drive_folder_id TEXT,
                    file_name TEXT,
                    file_size INTEGER,
                    uploaded_at TEXT,
                    status TEXT DEFAULT 'pending',
                    error_message TEXT,
                    FOREIGN KEY (content_id) REFERENCES content(id)
                )
            ''')
            
            # Processing history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS processing_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    batch_id TEXT,
                    started_at TEXT,
                    completed_at TEXT,
                    total_items INTEGER,
                    processed_items INTEGER,
                    failed_items INTEGER,
                    uploaded_items INTEGER,
                    notes TEXT
                )
            ''')
            
            # Create indexes
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_content_status ON content(status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_content_upload ON content(upload_status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url)')
            
            conn.commit()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def save_content(self, content: Content) -> None:
        """Save or update content in database."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO content (
                    id, source, source_type, title, raw_content, extracted_text,
                    analysis_json, category_id, subcategory, tags_json, priority_score,
                    status, upload_status, drive_file_id, drive_folder_id,
                    created_at, updated_at, processed_at, uploaded_at, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                content.id,
                content.source,
                content.source_type.value,
                content.title,
                content.raw_content,
                content.extracted_text,
                json.dumps(content.analysis.to_dict()) if content.analysis else None,
                content.category_id,
                content.subcategory,
                json.dumps(content.tags),
                content.priority_score,
                content.status.value,
                content.upload_status.value,
                content.drive_file_id,
                content.drive_folder_id,
                content.created_at.isoformat(),
                content.updated_at.isoformat(),
                content.processed_at.isoformat() if content.processed_at else None,
                content.uploaded_at.isoformat() if content.uploaded_at else None,
                json.dumps(content.metadata),
            ))
            
            conn.commit()
    
    def get_content(self, content_id: str) -> Optional[Content]:
        """Get content by ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM content WHERE id = ?', (content_id,))
            row = cursor.fetchone()
            
            if row:
                return self._row_to_content(row)
            return None
    
    def get_content_by_source(self, source: str) -> Optional[Content]:
        """Get content by source URL or path."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM content WHERE source = ?', (source,))
            row = cursor.fetchone()
            
            if row:
                return self._row_to_content(row)
            return None
    
    def get_pending_content(self, limit: int = 100) -> List[Content]:
        """Get content pending processing."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM content 
                WHERE status = 'pending' 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            return [self._row_to_content(row) for row in cursor.fetchall()]
    
    def get_categorized_content(self, limit: int = 100) -> List[Content]:
        """Get content that's been categorized but not uploaded."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM content 
                WHERE status = 'categorized' AND upload_status = 'pending'
                ORDER BY priority_score DESC, updated_at DESC 
                LIMIT ?
            ''', (limit,))
            
            return [self._row_to_content(row) for row in cursor.fetchall()]
    
    def get_content_by_category(self, category_id: str, limit: int = 100) -> List[Content]:
        """Get content by category."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM content 
                WHERE category_id = ?
                ORDER BY priority_score DESC, updated_at DESC 
                LIMIT ?
            ''', (category_id, limit))
            
            return [self._row_to_content(row) for row in cursor.fetchall()]
    
    def get_all_content(self, limit: int = 1000, offset: int = 0) -> List[Content]:
        """Get all content with pagination."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM content 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            return [self._row_to_content(row) for row in cursor.fetchall()]
    
    def delete_content(self, content_id: str) -> bool:
        """Delete content by ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM content WHERE id = ?', (content_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def content_exists(self, source: str) -> bool:
        """Check if content from this source already exists."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT 1 FROM content WHERE source = ?', (source,))
            return cursor.fetchone() is not None
    
    def _row_to_content(self, row: sqlite3.Row) -> Content:
        """Convert database row to Content object."""
        from .models import AIAnalysis
        
        data = {
            'id': row['id'],
            'source': row['source'],
            'source_type': row['source_type'],
            'title': row['title'] or '',
            'raw_content': row['raw_content'] or '',
            'extracted_text': row['extracted_text'] or '',
            'category_id': row['category_id'] or '',
            'subcategory': row['subcategory'] or '',
            'tags': json.loads(row['tags_json']) if row['tags_json'] else [],
            'priority_score': row['priority_score'] or 0.0,
            'status': row['status'],
            'upload_status': row['upload_status'],
            'drive_file_id': row['drive_file_id'] or '',
            'drive_folder_id': row['drive_folder_id'] or '',
            'created_at': row['created_at'],
            'updated_at': row['updated_at'],
            'processed_at': row['processed_at'],
            'uploaded_at': row['uploaded_at'],
            'metadata': json.loads(row['metadata_json']) if row['metadata_json'] else {},
        }
        
        if row['analysis_json']:
            data['analysis'] = json.loads(row['analysis_json'])
        
        return Content.from_dict(data)
    
    # Bookmark methods
    def save_bookmark(self, url: str, title: str, browser: str, 
                     folder_path: str = "", added_date: str = None) -> str:
        """Save a bookmark to the database."""
        import hashlib
        bookmark_id = hashlib.md5(url.encode()).hexdigest()[:12]
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO bookmarks 
                (id, url, title, browser, folder_path, added_date, processed)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            ''', (bookmark_id, url, title, browser, folder_path, 
                  added_date or datetime.now().isoformat()))
            conn.commit()
        
        return bookmark_id
    
    def get_unprocessed_bookmarks(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get bookmarks that haven't been processed yet."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM bookmarks 
                WHERE processed = 0 
                ORDER BY added_date DESC 
                LIMIT ?
            ''', (limit,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def mark_bookmark_processed(self, bookmark_id: str, content_id: str) -> None:
        """Mark a bookmark as processed."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE bookmarks 
                SET processed = 1, content_id = ?
                WHERE id = ?
            ''', (content_id, bookmark_id))
            conn.commit()
    
    # Statistics methods
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            stats = {}
            
            # Total content count
            cursor.execute('SELECT COUNT(*) FROM content')
            stats['total_content'] = cursor.fetchone()[0]
            
            # Content by status
            cursor.execute('''
                SELECT status, COUNT(*) as count 
                FROM content 
                GROUP BY status
            ''')
            stats['by_status'] = {row['status']: row['count'] for row in cursor.fetchall()}
            
            # Content by category
            cursor.execute('''
                SELECT category_id, COUNT(*) as count 
                FROM content 
                WHERE category_id != ''
                GROUP BY category_id
            ''')
            stats['by_category'] = {row['category_id']: row['count'] for row in cursor.fetchall()}
            
            # Upload statistics
            cursor.execute('''
                SELECT upload_status, COUNT(*) as count 
                FROM content 
                GROUP BY upload_status
            ''')
            stats['by_upload_status'] = {row['upload_status']: row['count'] for row in cursor.fetchall()}
            
            # Bookmark count
            cursor.execute('SELECT COUNT(*) FROM bookmarks')
            stats['total_bookmarks'] = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM bookmarks WHERE processed = 1')
            stats['processed_bookmarks'] = cursor.fetchone()[0]
            
            return stats
    
    def log_processing_run(self, batch_id: str, total: int, processed: int, 
                          failed: int, uploaded: int, notes: str = "") -> None:
        """Log a processing run to history."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO processing_history 
                (batch_id, started_at, completed_at, total_items, 
                 processed_items, failed_items, uploaded_items, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (batch_id, datetime.now().isoformat(), datetime.now().isoformat(),
                  total, processed, failed, uploaded, notes))
            conn.commit()
