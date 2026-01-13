"""
File system scanner and content extractor.
Scans directories for relevant files on Android via Termux.
"""

import os
import mimetypes
from pathlib import Path
from typing import List, Dict, Any, Optional, Generator
from datetime import datetime
import logging
import hashlib

from ..core.config import Config
from ..core.models import Content, ContentType

logger = logging.getLogger(__name__)


class FileExtractor:
    """Extracts content from files on the device."""
    
    # Supported file types and their content extractors
    SUPPORTED_EXTENSIONS = {
        '.txt': 'text',
        '.md': 'text',
        '.json': 'text',
        '.html': 'html',
        '.htm': 'html',
        '.pdf': 'pdf',
        '.doc': 'document',
        '.docx': 'document',
        '.rtf': 'document',
        '.csv': 'text',
        '.xml': 'text',
    }
    
    def __init__(self):
        self.config = Config()
        self.extraction_config = self.config.get_extraction_config()
        self.scan_dirs = self._get_scan_directories()
    
    def _get_scan_directories(self) -> List[str]:
        """Get list of directories to scan."""
        default_dirs = [
            os.path.expanduser('~/storage/downloads'),
            os.path.expanduser('~/storage/shared/Download'),
            os.path.expanduser('~/storage/shared/Documents'),
            os.path.expanduser('~/Documents'),
            os.path.expanduser('~/Downloads'),
        ]
        
        config_dirs = self.extraction_config.get('scan_dirs', [])
        all_dirs = config_dirs + default_dirs
        
        # Return only existing directories
        return [d for d in all_dirs if os.path.isdir(d)]
    
    def scan_all(self) -> Generator[Dict[str, Any], None, None]:
        """Scan all configured directories for files."""
        seen_files = set()
        
        for directory in self.scan_dirs:
            logger.info(f"Scanning directory: {directory}")
            
            for file_info in self._scan_directory(directory):
                # Avoid duplicates (symlinks, etc.)
                file_hash = hashlib.md5(file_info['path'].encode()).hexdigest()
                if file_hash not in seen_files:
                    seen_files.add(file_hash)
                    yield file_info
    
    def _scan_directory(self, directory: str, max_depth: int = 3) -> Generator[Dict[str, Any], None, None]:
        """Recursively scan a directory for supported files."""
        try:
            for root, dirs, files in os.walk(directory):
                # Calculate current depth
                depth = root[len(directory):].count(os.sep)
                if depth >= max_depth:
                    dirs.clear()  # Don't recurse deeper
                    continue
                
                # Skip hidden directories
                dirs[:] = [d for d in dirs if not d.startswith('.')]
                
                for filename in files:
                    if filename.startswith('.'):
                        continue
                    
                    filepath = os.path.join(root, filename)
                    ext = os.path.splitext(filename)[1].lower()
                    
                    if ext in self.SUPPORTED_EXTENSIONS:
                        try:
                            stat = os.stat(filepath)
                            yield {
                                'path': filepath,
                                'filename': filename,
                                'extension': ext,
                                'size': stat.st_size,
                                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                                'content_type': self.SUPPORTED_EXTENSIONS[ext],
                            }
                        except OSError as e:
                            logger.warning(f"Cannot access file {filepath}: {e}")
        
        except PermissionError as e:
            logger.warning(f"Permission denied for directory {directory}: {e}")
    
    def extract_content(self, file_info: Dict[str, Any]) -> Optional[str]:
        """Extract text content from a file."""
        filepath = file_info['path']
        content_type = file_info.get('content_type', 'text')
        
        try:
            if content_type == 'text':
                return self._extract_text(filepath)
            elif content_type == 'html':
                return self._extract_html(filepath)
            elif content_type == 'pdf':
                return self._extract_pdf(filepath)
            elif content_type == 'document':
                return self._extract_document(filepath)
        except Exception as e:
            logger.error(f"Failed to extract content from {filepath}: {e}")
        
        return None
    
    def _extract_text(self, filepath: str) -> str:
        """Extract content from plain text files."""
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        
        for encoding in encodings:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        
        # Fallback: read as binary and decode with errors='replace'
        with open(filepath, 'rb') as f:
            return f.read().decode('utf-8', errors='replace')
    
    def _extract_html(self, filepath: str) -> str:
        """Extract text content from HTML files."""
        try:
            from bs4 import BeautifulSoup
            
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            return soup.get_text(separator=' ', strip=True)
        
        except ImportError:
            logger.warning("BeautifulSoup not installed, reading raw HTML")
            return self._extract_text(filepath)
    
    def _extract_pdf(self, filepath: str) -> str:
        """Extract text content from PDF files."""
        try:
            import pypdf
            
            text_parts = []
            with open(filepath, 'rb') as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
            
            return '\n'.join(text_parts)
        
        except ImportError:
            logger.warning("pypdf not installed, cannot extract PDF content")
            return f"[PDF file: {os.path.basename(filepath)}]"
        except Exception as e:
            logger.error(f"Error extracting PDF {filepath}: {e}")
            return ""
    
    def _extract_document(self, filepath: str) -> str:
        """Extract text content from document files (doc, docx)."""
        ext = os.path.splitext(filepath)[1].lower()
        
        if ext == '.docx':
            try:
                from docx import Document
                
                doc = Document(filepath)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                return '\n'.join(paragraphs)
            
            except ImportError:
                logger.warning("python-docx not installed, cannot extract DOCX content")
                return f"[DOCX file: {os.path.basename(filepath)}]"
        
        elif ext in ['.doc', '.rtf']:
            # Try using antiword or other tools if available
            try:
                import subprocess
                result = subprocess.run(
                    ['antiword', filepath],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    return result.stdout
            except Exception:
                pass
            
            return f"[{ext.upper()} file: {os.path.basename(filepath)}]"
        
        return ""
    
    def create_content_from_file(self, file_info: Dict[str, Any]) -> Content:
        """Create a Content object from a file."""
        extracted_text = self.extract_content(file_info)
        
        return Content(
            source=file_info['path'],
            source_type=ContentType.FILE,
            title=file_info['filename'],
            raw_content=extracted_text or '',
            extracted_text=extracted_text or '',
            metadata={
                'extension': file_info['extension'],
                'size': file_info['size'],
                'modified': file_info['modified'],
                'created': file_info['created'],
                'content_type': file_info['content_type'],
            }
        )
    
    def get_recent_files(self, days: int = 7, limit: int = 100) -> List[Dict[str, Any]]:
        """Get files modified within the last N days."""
        from datetime import timedelta
        
        cutoff = datetime.now() - timedelta(days=days)
        recent_files = []
        
        for file_info in self.scan_all():
            try:
                modified = datetime.fromisoformat(file_info['modified'])
                if modified >= cutoff:
                    recent_files.append(file_info)
                    
                    if len(recent_files) >= limit:
                        break
            except (ValueError, KeyError):
                continue
        
        # Sort by modification time (newest first)
        recent_files.sort(key=lambda x: x.get('modified', ''), reverse=True)
        return recent_files[:limit]


class MediaScanner:
    """Scanner for media files (audio, video, images)."""
    
    MEDIA_EXTENSIONS = {
        'audio': ['.mp3', '.m4a', '.wav', '.ogg', '.flac', '.aac'],
        'video': ['.mp4', '.mkv', '.avi', '.mov', '.webm'],
        'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    }
    
    def __init__(self):
        self.config = Config()
    
    def scan_media(self, media_type: str = None) -> Generator[Dict[str, Any], None, None]:
        """Scan for media files."""
        media_dirs = [
            os.path.expanduser('~/storage/shared/DCIM'),
            os.path.expanduser('~/storage/shared/Pictures'),
            os.path.expanduser('~/storage/shared/Music'),
            os.path.expanduser('~/storage/shared/Movies'),
            os.path.expanduser('~/storage/shared/Download'),
        ]
        
        extensions = []
        if media_type and media_type in self.MEDIA_EXTENSIONS:
            extensions = self.MEDIA_EXTENSIONS[media_type]
        else:
            for exts in self.MEDIA_EXTENSIONS.values():
                extensions.extend(exts)
        
        for media_dir in media_dirs:
            if not os.path.isdir(media_dir):
                continue
            
            for root, dirs, files in os.walk(media_dir):
                dirs[:] = [d for d in dirs if not d.startswith('.')]
                
                for filename in files:
                    ext = os.path.splitext(filename)[1].lower()
                    if ext in extensions:
                        filepath = os.path.join(root, filename)
                        try:
                            stat = os.stat(filepath)
                            yield {
                                'path': filepath,
                                'filename': filename,
                                'extension': ext,
                                'size': stat.st_size,
                                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                'media_type': self._get_media_type(ext),
                            }
                        except OSError:
                            continue
    
    def _get_media_type(self, ext: str) -> str:
        """Determine media type from extension."""
        for media_type, extensions in self.MEDIA_EXTENSIONS.items():
            if ext in extensions:
                return media_type
        return 'unknown'
