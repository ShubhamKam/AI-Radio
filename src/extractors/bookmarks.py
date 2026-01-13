"""
Bookmark extraction for various browsers.
Supports Chrome, Firefox, and Brave on Android via Termux.
"""

import json
import os
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from ..core.config import Config
from ..core.database import Database
from ..core.models import Content, ContentType

logger = logging.getLogger(__name__)


class BookmarkExtractor:
    """Extracts bookmarks from various browsers on Android."""
    
    def __init__(self):
        self.config = Config()
        self.db = Database()
        self.extraction_config = self.config.get_extraction_config()
    
    def extract_all(self) -> List[Dict[str, Any]]:
        """Extract bookmarks from all supported browsers."""
        all_bookmarks = []
        
        # Try Chrome
        chrome_bookmarks = self.extract_chrome_bookmarks()
        all_bookmarks.extend(chrome_bookmarks)
        logger.info(f"Extracted {len(chrome_bookmarks)} Chrome bookmarks")
        
        # Try Firefox
        firefox_bookmarks = self.extract_firefox_bookmarks()
        all_bookmarks.extend(firefox_bookmarks)
        logger.info(f"Extracted {len(firefox_bookmarks)} Firefox bookmarks")
        
        # Try Brave
        brave_bookmarks = self.extract_brave_bookmarks()
        all_bookmarks.extend(brave_bookmarks)
        logger.info(f"Extracted {len(brave_bookmarks)} Brave bookmarks")
        
        # Try exported bookmark files
        exported_bookmarks = self.extract_exported_bookmarks()
        all_bookmarks.extend(exported_bookmarks)
        logger.info(f"Extracted {len(exported_bookmarks)} exported bookmarks")
        
        # Save to database
        for bookmark in all_bookmarks:
            self.db.save_bookmark(
                url=bookmark['url'],
                title=bookmark.get('title', ''),
                browser=bookmark.get('browser', 'unknown'),
                folder_path=bookmark.get('folder_path', ''),
                added_date=bookmark.get('added_date')
            )
        
        return all_bookmarks
    
    def extract_chrome_bookmarks(self) -> List[Dict[str, Any]]:
        """Extract bookmarks from Chrome browser."""
        bookmarks = []
        
        # Chrome bookmark paths (try multiple locations)
        chrome_paths = [
            self.extraction_config.get('bookmarks', {}).get('chrome', ''),
            '/data/data/com.android.chrome/app_chrome/Default/Bookmarks',
            os.path.expanduser('~/storage/shared/Android/data/com.android.chrome'),
            # Termux accessible backup location
            os.path.expanduser('~/storage/downloads/chrome_bookmarks.json'),
            os.path.expanduser('~/bookmarks/chrome_bookmarks.json'),
        ]
        
        for path in chrome_paths:
            if path and os.path.exists(path):
                try:
                    bookmarks.extend(self._parse_chrome_bookmarks(path))
                    logger.info(f"Found Chrome bookmarks at: {path}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to parse Chrome bookmarks at {path}: {e}")
        
        return bookmarks
    
    def _parse_chrome_bookmarks(self, path: str) -> List[Dict[str, Any]]:
        """Parse Chrome bookmark JSON file."""
        bookmarks = []
        
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        def extract_from_node(node: Dict, folder_path: str = ""):
            if node.get('type') == 'url':
                bookmarks.append({
                    'url': node.get('url', ''),
                    'title': node.get('name', ''),
                    'browser': 'chrome',
                    'folder_path': folder_path,
                    'added_date': self._chrome_timestamp_to_datetime(
                        node.get('date_added', '0')
                    ),
                })
            elif node.get('type') == 'folder':
                new_path = f"{folder_path}/{node.get('name', '')}" if folder_path else node.get('name', '')
                for child in node.get('children', []):
                    extract_from_node(child, new_path)
        
        # Process bookmark bar and other bookmark folders
        roots = data.get('roots', {})
        for root_name, root_node in roots.items():
            if isinstance(root_node, dict):
                extract_from_node(root_node, root_name)
        
        return bookmarks
    
    def _chrome_timestamp_to_datetime(self, timestamp: str) -> str:
        """Convert Chrome timestamp to ISO datetime."""
        try:
            # Chrome uses microseconds since 1601-01-01
            ts = int(timestamp)
            if ts > 0:
                # Convert to Unix timestamp
                unix_ts = (ts - 11644473600000000) / 1000000
                return datetime.fromtimestamp(unix_ts).isoformat()
        except (ValueError, OSError):
            pass
        return datetime.now().isoformat()
    
    def extract_firefox_bookmarks(self) -> List[Dict[str, Any]]:
        """Extract bookmarks from Firefox browser."""
        bookmarks = []
        
        firefox_paths = [
            self.extraction_config.get('bookmarks', {}).get('firefox', ''),
            '/data/data/org.mozilla.firefox/files/places.sqlite',
            os.path.expanduser('~/storage/shared/Android/data/org.mozilla.firefox'),
            # Termux accessible backup location
            os.path.expanduser('~/storage/downloads/firefox_bookmarks.html'),
            os.path.expanduser('~/bookmarks/firefox_bookmarks.html'),
        ]
        
        for path in firefox_paths:
            if path and os.path.exists(path):
                try:
                    if path.endswith('.sqlite'):
                        bookmarks.extend(self._parse_firefox_sqlite(path))
                    elif path.endswith('.html'):
                        bookmarks.extend(self._parse_firefox_html(path))
                    logger.info(f"Found Firefox bookmarks at: {path}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to parse Firefox bookmarks at {path}: {e}")
        
        return bookmarks
    
    def _parse_firefox_sqlite(self, path: str) -> List[Dict[str, Any]]:
        """Parse Firefox places.sqlite database."""
        bookmarks = []
        
        try:
            conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT p.url, b.title, b.dateAdded
                FROM moz_bookmarks b
                JOIN moz_places p ON b.fk = p.id
                WHERE p.url NOT LIKE 'place:%'
            ''')
            
            for row in cursor.fetchall():
                url, title, date_added = row
                bookmarks.append({
                    'url': url,
                    'title': title or '',
                    'browser': 'firefox',
                    'folder_path': '',
                    'added_date': datetime.fromtimestamp(date_added / 1000000).isoformat() if date_added else None,
                })
            
            conn.close()
        except Exception as e:
            logger.error(f"Error parsing Firefox SQLite: {e}")
        
        return bookmarks
    
    def _parse_firefox_html(self, path: str) -> List[Dict[str, Any]]:
        """Parse Firefox bookmark HTML export."""
        bookmarks = []
        
        try:
            from bs4 import BeautifulSoup
            
            with open(path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            
            for link in soup.find_all('a'):
                url = link.get('href', '')
                if url and url.startswith(('http://', 'https://')):
                    bookmarks.append({
                        'url': url,
                        'title': link.get_text(strip=True),
                        'browser': 'firefox',
                        'folder_path': '',
                        'added_date': datetime.now().isoformat(),
                    })
        except ImportError:
            logger.warning("BeautifulSoup not installed, cannot parse HTML bookmarks")
        except Exception as e:
            logger.error(f"Error parsing Firefox HTML: {e}")
        
        return bookmarks
    
    def extract_brave_bookmarks(self) -> List[Dict[str, Any]]:
        """Extract bookmarks from Brave browser (Chrome-based)."""
        bookmarks = []
        
        brave_paths = [
            self.extraction_config.get('bookmarks', {}).get('brave', ''),
            '/data/data/com.brave.browser/app_chrome/Default/Bookmarks',
            os.path.expanduser('~/storage/downloads/brave_bookmarks.json'),
            os.path.expanduser('~/bookmarks/brave_bookmarks.json'),
        ]
        
        for path in brave_paths:
            if path and os.path.exists(path):
                try:
                    brave_bookmarks = self._parse_chrome_bookmarks(path)
                    # Update browser name
                    for b in brave_bookmarks:
                        b['browser'] = 'brave'
                    bookmarks.extend(brave_bookmarks)
                    logger.info(f"Found Brave bookmarks at: {path}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to parse Brave bookmarks at {path}: {e}")
        
        return bookmarks
    
    def extract_exported_bookmarks(self) -> List[Dict[str, Any]]:
        """Extract bookmarks from exported files in common locations."""
        bookmarks = []
        
        # Check common export locations
        export_dirs = [
            os.path.expanduser('~/storage/downloads'),
            os.path.expanduser('~/storage/shared/Download'),
            os.path.expanduser('~/bookmarks'),
            os.path.expanduser('~/Documents'),
        ]
        
        for export_dir in export_dirs:
            if not os.path.isdir(export_dir):
                continue
            
            for filename in os.listdir(export_dir):
                filepath = os.path.join(export_dir, filename)
                
                try:
                    if filename.endswith('.json') and 'bookmark' in filename.lower():
                        # Chrome/Brave style JSON
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        if 'roots' in data:
                            bookmarks.extend(self._parse_chrome_bookmarks(filepath))
                    
                    elif filename.endswith('.html') and 'bookmark' in filename.lower():
                        # HTML export
                        bookmarks.extend(self._parse_firefox_html(filepath))
                    
                    elif filename.endswith('.txt') and 'bookmark' in filename.lower():
                        # Plain text URL list
                        bookmarks.extend(self._parse_text_urls(filepath))
                
                except Exception as e:
                    logger.warning(f"Failed to parse {filepath}: {e}")
        
        return bookmarks
    
    def _parse_text_urls(self, path: str) -> List[Dict[str, Any]]:
        """Parse plain text file with URLs."""
        bookmarks = []
        
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith(('http://', 'https://')):
                    bookmarks.append({
                        'url': line,
                        'title': '',
                        'browser': 'text_export',
                        'folder_path': '',
                        'added_date': datetime.now().isoformat(),
                    })
        
        return bookmarks
    
    def get_new_bookmarks(self) -> List[Dict[str, Any]]:
        """Get bookmarks that haven't been processed yet."""
        return self.db.get_unprocessed_bookmarks()
    
    def create_content_from_bookmark(self, bookmark: Dict[str, Any]) -> Content:
        """Create a Content object from a bookmark."""
        return Content(
            source=bookmark['url'],
            source_type=ContentType.BOOKMARK,
            title=bookmark.get('title', ''),
            metadata={
                'browser': bookmark.get('browser', ''),
                'folder_path': bookmark.get('folder_path', ''),
                'added_date': bookmark.get('added_date', ''),
            }
        )


class ClipboardExtractor:
    """Extract URLs and content from clipboard history."""
    
    def __init__(self):
        self.config = Config()
    
    def get_clipboard_content(self) -> Optional[str]:
        """Get current clipboard content using Termux API."""
        try:
            import subprocess
            result = subprocess.run(
                ['termux-clipboard-get'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception as e:
            logger.warning(f"Failed to get clipboard: {e}")
        return None
    
    def extract_urls_from_text(self, text: str) -> List[str]:
        """Extract URLs from text content."""
        import re
        url_pattern = r'https?://[^\s<>"\'}\])]+'
        return re.findall(url_pattern, text)
    
    def get_clipboard_urls(self) -> List[str]:
        """Get URLs from current clipboard."""
        content = self.get_clipboard_content()
        if content:
            return self.extract_urls_from_text(content)
        return []
