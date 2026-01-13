"""
Google Drive integration for uploading categorized content.
Handles OAuth2 authentication and file uploads.
"""

import os
import json
import logging
import mimetypes
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import tempfile

from ..core.config import Config
from ..core.models import Content, UploadStatus
from ..core.database import Database

logger = logging.getLogger(__name__)


class GoogleDriveUploader:
    """Handles uploading content to Google Drive."""
    
    # MIME type mappings for Google Drive
    MIME_TYPES = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.html': 'text/html',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    
    def __init__(self):
        self.config = Config()
        self.db = Database()
        self.drive_config = self.config.get_google_drive_config()
        
        self.root_folder = self.drive_config.get('root_folder', 'AI_Radio_Content')
        self.folder_structure = self.drive_config.get('folder_structure', [])
        
        self._service = None
        self._folder_ids = {}
        
        # Credentials path
        self.credentials_path = self.config.get_data_dir() / 'credentials.json'
        self.token_path = self.config.get_data_dir() / 'token.json'
    
    @property
    def service(self):
        """Get or create Google Drive service."""
        if self._service is None:
            self._service = self._authenticate()
        return self._service
    
    def _authenticate(self):
        """Authenticate with Google Drive API."""
        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
        except ImportError:
            logger.error("Google API packages not installed. Run: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
            return None
        
        SCOPES = ['https://www.googleapis.com/auth/drive.file']
        
        creds = None
        
        # Check for existing token
        if self.token_path.exists():
            try:
                creds = Credentials.from_authorized_user_file(str(self.token_path), SCOPES)
            except Exception as e:
                logger.warning(f"Failed to load existing token: {e}")
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    logger.warning(f"Failed to refresh token: {e}")
                    creds = None
            
            if not creds:
                if not self.credentials_path.exists():
                    logger.error(f"Credentials file not found at {self.credentials_path}")
                    logger.info("Please download credentials.json from Google Cloud Console")
                    return None
                
                # Use console-based auth flow for Termux
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.credentials_path),
                    SCOPES,
                    redirect_uri='urn:ietf:wg:oauth:2.0:oob'
                )
                
                # Generate authorization URL
                auth_url, _ = flow.authorization_url(prompt='consent')
                
                print("\n" + "="*60)
                print("Google Drive Authorization Required")
                print("="*60)
                print(f"\n1. Open this URL in a browser:\n\n{auth_url}\n")
                print("2. Sign in and authorize the application")
                print("3. Copy the authorization code")
                print("="*60)
                
                code = input("\nEnter the authorization code: ").strip()
                
                try:
                    flow.fetch_token(code=code)
                    creds = flow.credentials
                except Exception as e:
                    logger.error(f"Failed to authenticate: {e}")
                    return None
            
            # Save credentials for next time
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
        
        try:
            return build('drive', 'v3', credentials=creds)
        except Exception as e:
            logger.error(f"Failed to build Drive service: {e}")
            return None
    
    def setup_credentials_file(self, client_id: str, client_secret: str) -> bool:
        """Create credentials.json from provided client ID and secret."""
        credentials_data = {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
            }
        }
        
        try:
            self.credentials_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.credentials_path, 'w') as f:
                json.dump(credentials_data, f, indent=2)
            logger.info(f"Credentials saved to {self.credentials_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save credentials: {e}")
            return False
    
    def setup_folder_structure(self) -> bool:
        """Create the folder structure in Google Drive."""
        if not self.service:
            return False
        
        try:
            # Create or find root folder
            root_id = self._get_or_create_folder(self.root_folder)
            if not root_id:
                return False
            
            self._folder_ids['root'] = root_id
            
            # Create category folders
            for folder_name in self.folder_structure:
                folder_id = self._get_or_create_folder(folder_name, parent_id=root_id)
                if folder_id:
                    # Map category names to folder IDs
                    key = folder_name.lower().replace(' ', '_')
                    self._folder_ids[key] = folder_id
                    logger.info(f"Created/found folder: {folder_name}")
            
            logger.info(f"Folder structure ready. Root ID: {root_id}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to setup folder structure: {e}")
            return False
    
    def _get_or_create_folder(self, name: str, parent_id: str = None) -> Optional[str]:
        """Get existing folder or create new one."""
        # Search for existing folder
        query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        
        try:
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            
            files = results.get('files', [])
            if files:
                return files[0]['id']
            
            # Create folder
            file_metadata = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            if parent_id:
                file_metadata['parents'] = [parent_id]
            
            folder = self.service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()
            
            return folder.get('id')
        
        except Exception as e:
            logger.error(f"Failed to get/create folder {name}: {e}")
            return None
    
    def _get_folder_for_category(self, category_id: str) -> str:
        """Get the folder ID for a given category."""
        # Map category IDs to folder names
        category_folder_map = {
            'news': 'News',
            'music': 'Music',
            'talk_show': 'TalkShow',
            'stories': 'Stories',
            'educational': 'Educational',
            'entertainment': 'Entertainment',
            'lifestyle': 'Lifestyle',
            'uncategorized': 'Uncategorized',
        }
        
        folder_name = category_folder_map.get(category_id, 'Uncategorized')
        folder_key = folder_name.lower().replace(' ', '_')
        
        return self._folder_ids.get(folder_key, self._folder_ids.get('uncategorized', self._folder_ids.get('root')))
    
    def upload_content(self, content: Content) -> bool:
        """Upload a content item to Google Drive."""
        if not self.service:
            logger.error("Google Drive service not available")
            return False
        
        # Ensure folder structure exists
        if not self._folder_ids:
            self.setup_folder_structure()
        
        try:
            # Get appropriate folder
            folder_id = self._get_folder_for_category(content.category_id)
            
            # Create content file
            filename = self._generate_filename(content)
            file_content = self._format_content_for_upload(content)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
                f.write(file_content)
                temp_path = f.name
            
            try:
                # Upload to Drive
                file_metadata = {
                    'name': filename,
                    'parents': [folder_id],
                    'description': content.analysis.summary if content.analysis else '',
                }
                
                from googleapiclient.http import MediaFileUpload
                
                media = MediaFileUpload(
                    temp_path,
                    mimetype='text/markdown',
                    resumable=True
                )
                
                file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id,name,webViewLink'
                ).execute()
                
                # Update content with Drive info
                content.mark_uploaded(file['id'], folder_id)
                content.metadata['drive_link'] = file.get('webViewLink', '')
                self.db.save_content(content)
                
                logger.info(f"Uploaded: {filename} -> {file['id']}")
                return True
            
            finally:
                # Clean up temp file
                os.unlink(temp_path)
        
        except Exception as e:
            logger.error(f"Failed to upload {content.id}: {e}")
            content.upload_status = UploadStatus.FAILED
            content.metadata['upload_error'] = str(e)
            self.db.save_content(content)
            return False
    
    def _generate_filename(self, content: Content) -> str:
        """Generate a filename for the content."""
        # Sanitize title
        title = content.title or "Untitled"
        title = "".join(c for c in title if c.isalnum() or c in ' -_').strip()
        title = title[:50]  # Limit length
        
        # Add timestamp and category
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        category = content.category_id or "uncategorized"
        
        return f"{timestamp}_{category}_{title}.md"
    
    def _format_content_for_upload(self, content: Content) -> str:
        """Format content as markdown for upload."""
        lines = [
            f"# {content.title or 'Untitled'}",
            "",
            f"**Source:** {content.source}",
            f"**Category:** {content.category_id}",
            f"**Subcategory:** {content.subcategory}",
            f"**Priority Score:** {content.priority_score:.2f}",
            f"**Created:** {content.created_at.isoformat()}",
            "",
        ]
        
        # Add AI analysis if available
        if content.analysis:
            lines.extend([
                "## AI Analysis",
                "",
                f"**Summary:** {content.analysis.summary}",
                f"**Topics:** {', '.join(content.analysis.topics)}",
                f"**Sentiment:** {content.analysis.sentiment}",
                f"**Radio Suitability:** {content.analysis.radio_suitability_score:.2f}",
                f"**Content Quality:** {content.analysis.content_quality:.2f}",
                f"**Estimated Duration:** {content.analysis.estimated_duration} seconds",
                f"**Tags:** {', '.join(content.analysis.tags)}",
                "",
            ])
        
        # Add content
        lines.extend([
            "## Content",
            "",
            content.extracted_text or content.raw_content or "[No content available]",
            "",
        ])
        
        # Add metadata
        lines.extend([
            "---",
            "",
            "## Metadata",
            "",
            f"```json",
            json.dumps(content.metadata, indent=2),
            "```",
        ])
        
        return "\n".join(lines)
    
    def upload_batch(self, contents: List[Content]) -> Dict[str, bool]:
        """Upload multiple content items."""
        results = {}
        
        for content in contents:
            results[content.id] = self.upload_content(content)
        
        success_count = sum(1 for v in results.values() if v)
        logger.info(f"Batch upload complete: {success_count}/{len(contents)} successful")
        
        return results
    
    def upload_pending(self, limit: int = 50) -> int:
        """Upload all pending categorized content."""
        pending = self.db.get_categorized_content(limit=limit)
        
        if not pending:
            logger.info("No pending content to upload")
            return 0
        
        results = self.upload_batch(pending)
        return sum(1 for v in results.values() if v)
    
    def get_uploaded_files(self, folder_name: str = None) -> List[Dict[str, Any]]:
        """List files in a Drive folder."""
        if not self.service:
            return []
        
        try:
            folder_id = self._folder_ids.get('root')
            if folder_name:
                folder_key = folder_name.lower().replace(' ', '_')
                folder_id = self._folder_ids.get(folder_key, folder_id)
            
            query = f"'{folder_id}' in parents and trashed=false"
            
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, createdTime, webViewLink, size)',
                orderBy='createdTime desc',
                pageSize=100
            ).execute()
            
            return results.get('files', [])
        
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    def check_connection(self) -> bool:
        """Check if Google Drive connection is working."""
        if not self.service:
            return False
        
        try:
            # Try to list root folder
            self.service.files().list(pageSize=1).execute()
            return True
        except Exception as e:
            logger.error(f"Drive connection check failed: {e}")
            return False
