#!/usr/bin/env python3
"""
AI Radio Content Categorizer - Main Entry Point

This script orchestrates the content extraction, AI analysis,
categorization, and upload process.
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from typing import List, Optional
import uuid

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.config import Config
from src.core.database import Database
from src.core.models import Content, ContentStatus, ProcessingBatch
from src.extractors.bookmarks import BookmarkExtractor, ClipboardExtractor
from src.extractors.files import FileExtractor
from src.extractors.urls import URLExtractor, URLBatchProcessor
from src.categorization.ai_analyzer import AIAnalyzer
from src.categorization.categorizer import ContentCategorizer
from src.upload.google_drive import GoogleDriveUploader
from src.utils.logger import setup_logging, ProgressLogger
from src.utils.notifications import TermuxNotifier

logger = logging.getLogger(__name__)


class AIRadioCategorizer:
    """Main orchestrator for the AI Radio Content Categorizer."""
    
    def __init__(self):
        self.config = Config()
        self.db = Database()
        self.notifier = TermuxNotifier()
        
        # Initialize components
        self.bookmark_extractor = BookmarkExtractor()
        self.file_extractor = FileExtractor()
        self.url_extractor = URLExtractor()
        self.ai_analyzer = AIAnalyzer()
        self.categorizer = ContentCategorizer()
        self.uploader = GoogleDriveUploader()
        
        # Batch tracking
        self.current_batch: Optional[ProcessingBatch] = None
    
    def run_full_pipeline(self, 
                         extract: bool = True,
                         analyze: bool = True,
                         categorize: bool = True,
                         upload: bool = True,
                         max_items: int = None) -> dict:
        """
        Run the complete content processing pipeline.
        
        Args:
            extract: Whether to extract new content
            analyze: Whether to run AI analysis
            categorize: Whether to categorize content
            upload: Whether to upload to Google Drive
            max_items: Maximum items to process (None for config default)
            
        Returns:
            Dictionary with processing statistics
        """
        batch_id = f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        self.current_batch = ProcessingBatch(id=batch_id)
        
        stats = {
            'batch_id': batch_id,
            'extracted': 0,
            'analyzed': 0,
            'categorized': 0,
            'uploaded': 0,
            'failed': 0,
            'started_at': datetime.now().isoformat(),
            'completed_at': None,
        }
        
        if max_items is None:
            max_items = self.config.get('automation', 'limits', 'max_items_per_run', default=100)
        
        try:
            self.notifier.notify_start("Starting content processing pipeline...")
            
            # Step 1: Extract content
            if extract:
                logger.info("=== Step 1: Extracting Content ===")
                stats['extracted'] = self._extract_content(max_items)
            
            # Step 2: AI Analysis
            if analyze:
                logger.info("=== Step 2: AI Analysis ===")
                stats['analyzed'] = self._analyze_content(max_items)
            
            # Step 3: Categorization
            if categorize:
                logger.info("=== Step 3: Categorization ===")
                stats['categorized'] = self._categorize_content(max_items)
            
            # Step 4: Upload to Google Drive
            if upload:
                logger.info("=== Step 4: Uploading to Google Drive ===")
                stats['uploaded'] = self._upload_content(max_items)
            
            stats['completed_at'] = datetime.now().isoformat()
            
            # Log to history
            self.db.log_processing_run(
                batch_id=batch_id,
                total=stats['extracted'],
                processed=stats['categorized'],
                failed=stats['failed'],
                uploaded=stats['uploaded'],
                notes=f"Full pipeline run"
            )
            
            # Send completion notification
            self.notifier.notify_complete(
                processed=stats['categorized'],
                uploaded=stats['uploaded'],
                failed=stats['failed']
            )
            
            logger.info(f"Pipeline complete: {stats}")
            
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            stats['error'] = str(e)
            stats['failed'] += 1
            self.notifier.notify_error(str(e))
        
        return stats
    
    def _extract_content(self, max_items: int) -> int:
        """Extract content from all sources."""
        extracted_count = 0
        
        # Extract bookmarks
        logger.info("Extracting bookmarks...")
        try:
            bookmarks = self.bookmark_extractor.extract_all()
            logger.info(f"Found {len(bookmarks)} bookmarks")
            
            # Get unprocessed bookmarks
            unprocessed = self.bookmark_extractor.get_new_bookmarks()[:max_items]
            
            for bookmark in unprocessed:
                if extracted_count >= max_items:
                    break
                
                # Check if already in database
                if self.db.content_exists(bookmark['url']):
                    continue
                
                # Create content from bookmark
                content = self.bookmark_extractor.create_content_from_bookmark(bookmark)
                
                # Fetch URL content
                url_content = self.url_extractor.create_content_from_url(bookmark['url'])
                if url_content:
                    content.raw_content = url_content.raw_content
                    content.extracted_text = url_content.extracted_text
                    content.title = url_content.title or content.title
                    content.metadata.update(url_content.metadata)
                
                self.db.save_content(content)
                self.db.mark_bookmark_processed(bookmark['id'], content.id)
                extracted_count += 1
                
                self.notifier.notify_progress(extracted_count, max_items, "Extracting")
            
        except Exception as e:
            logger.error(f"Bookmark extraction error: {e}")
        
        # Extract from recent files
        logger.info("Scanning recent files...")
        try:
            recent_files = self.file_extractor.get_recent_files(days=7, limit=max_items - extracted_count)
            
            for file_info in recent_files:
                if extracted_count >= max_items:
                    break
                
                # Check if already in database
                if self.db.content_exists(file_info['path']):
                    continue
                
                content = self.file_extractor.create_content_from_file(file_info)
                if content.extracted_text:  # Only save if we got content
                    self.db.save_content(content)
                    extracted_count += 1
            
        except Exception as e:
            logger.error(f"File extraction error: {e}")
        
        # Extract from clipboard
        logger.info("Checking clipboard...")
        try:
            clipboard_extractor = ClipboardExtractor()
            clipboard_urls = clipboard_extractor.get_clipboard_urls()
            
            for url in clipboard_urls:
                if extracted_count >= max_items:
                    break
                
                if self.db.content_exists(url):
                    continue
                
                content = self.url_extractor.create_content_from_url(url)
                if content:
                    self.db.save_content(content)
                    extracted_count += 1
            
        except Exception as e:
            logger.error(f"Clipboard extraction error: {e}")
        
        logger.info(f"Extracted {extracted_count} new content items")
        return extracted_count
    
    def _analyze_content(self, max_items: int) -> int:
        """Run AI analysis on pending content."""
        pending = self.db.get_pending_content(limit=max_items)
        
        if not pending:
            logger.info("No pending content to analyze")
            return 0
        
        analyzed_count = 0
        max_ai_calls = self.config.get('automation', 'limits', 'max_ai_calls_per_run', default=50)
        
        progress = ProgressLogger(min(len(pending), max_ai_calls), "Analyzing")
        
        for content in pending[:max_ai_calls]:
            try:
                content.mark_analyzing()
                
                analysis = self.ai_analyzer.analyze(content)
                if analysis:
                    content.analysis = analysis
                    analyzed_count += 1
                    progress.update(content.title or content.source[:50])
                else:
                    logger.warning(f"No analysis result for {content.id}")
                
                self.db.save_content(content)
                self.notifier.notify_progress(analyzed_count, max_ai_calls, "Analyzing")
                
            except Exception as e:
                logger.error(f"Analysis error for {content.id}: {e}")
                content.mark_failed(str(e))
                self.db.save_content(content)
        
        progress.complete()
        logger.info(f"Analyzed {analyzed_count} content items")
        return analyzed_count
    
    def _categorize_content(self, max_items: int) -> int:
        """Categorize analyzed content."""
        # Get content that's been analyzed but not categorized
        pending = [c for c in self.db.get_pending_content(limit=max_items * 2)
                   if c.analysis is not None][:max_items]
        
        if not pending:
            logger.info("No content to categorize")
            return 0
        
        categorized = self.categorizer.categorize_batch(pending)
        logger.info(f"Categorized {len(categorized)} content items")
        return len(categorized)
    
    def _upload_content(self, max_items: int) -> int:
        """Upload categorized content to Google Drive."""
        # Check Drive connection
        if not self.uploader.check_connection():
            logger.warning("Google Drive not connected. Skipping upload.")
            return 0
        
        uploaded = self.uploader.upload_pending(limit=max_items)
        logger.info(f"Uploaded {uploaded} content items to Google Drive")
        return uploaded
    
    def extract_only(self, max_items: int = 100) -> int:
        """Only extract content, don't process."""
        return self._extract_content(max_items)
    
    def analyze_only(self, max_items: int = 50) -> int:
        """Only run AI analysis on pending content."""
        return self._analyze_content(max_items)
    
    def categorize_only(self, max_items: int = 100) -> int:
        """Only categorize content."""
        return self._categorize_content(max_items)
    
    def upload_only(self, max_items: int = 50) -> int:
        """Only upload categorized content."""
        return self._upload_content(max_items)
    
    def show_statistics(self) -> dict:
        """Get and display database statistics."""
        stats = self.db.get_statistics()
        
        print("\n" + "="*50)
        print("AI Radio Content Categorizer - Statistics")
        print("="*50)
        print(f"\nTotal Content Items: {stats['total_content']}")
        print(f"Total Bookmarks: {stats['total_bookmarks']}")
        print(f"Processed Bookmarks: {stats['processed_bookmarks']}")
        
        print("\nContent by Status:")
        for status, count in stats.get('by_status', {}).items():
            print(f"  {status}: {count}")
        
        print("\nContent by Category:")
        for category, count in stats.get('by_category', {}).items():
            print(f"  {category}: {count}")
        
        print("\nUpload Status:")
        for status, count in stats.get('by_upload_status', {}).items():
            print(f"  {status}: {count}")
        
        print("="*50 + "\n")
        
        return stats
    
    def setup_google_drive(self, client_id: str = None, client_secret: str = None) -> bool:
        """Setup Google Drive authentication."""
        if client_id and client_secret:
            self.uploader.setup_credentials_file(client_id, client_secret)
        
        # This will trigger the OAuth flow
        return self.uploader.setup_folder_structure()


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description='AI Radio Content Categorizer - Extract, analyze, categorize, and upload content'
    )
    
    parser.add_argument('--extract', '-e', action='store_true',
                       help='Extract content from bookmarks and files')
    parser.add_argument('--analyze', '-a', action='store_true',
                       help='Run AI analysis on pending content')
    parser.add_argument('--categorize', '-c', action='store_true',
                       help='Categorize analyzed content')
    parser.add_argument('--upload', '-u', action='store_true',
                       help='Upload categorized content to Google Drive')
    parser.add_argument('--full', '-f', action='store_true',
                       help='Run full pipeline (extract, analyze, categorize, upload)')
    parser.add_argument('--stats', '-s', action='store_true',
                       help='Show statistics')
    parser.add_argument('--setup-drive', action='store_true',
                       help='Setup Google Drive authentication')
    parser.add_argument('--max-items', '-m', type=int, default=None,
                       help='Maximum items to process')
    parser.add_argument('--log-level', '-l', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
                       default='INFO', help='Logging level')
    parser.add_argument('--provider', '-p', choices=['openai', 'claude', 'gemini'],
                       help='AI provider to use')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.log_level)
    
    # Initialize categorizer
    categorizer = AIRadioCategorizer()
    
    # Override AI provider if specified
    if args.provider:
        categorizer.ai_analyzer = AIAnalyzer(preferred_provider=args.provider)
    
    # Handle commands
    if args.stats:
        categorizer.show_statistics()
        return 0
    
    if args.setup_drive:
        print("Setting up Google Drive authentication...")
        print("You'll need your Google Cloud Console credentials.")
        client_id = input("Enter Client ID: ").strip()
        client_secret = input("Enter Client Secret: ").strip()
        
        if categorizer.setup_google_drive(client_id, client_secret):
            print("Google Drive setup complete!")
            return 0
        else:
            print("Google Drive setup failed. Check logs for details.")
            return 1
    
    if args.full:
        stats = categorizer.run_full_pipeline(max_items=args.max_items)
        print(f"\nPipeline complete: {stats}")
        return 0
    
    # Run individual steps
    if args.extract:
        count = categorizer.extract_only(args.max_items or 100)
        print(f"Extracted {count} items")
    
    if args.analyze:
        count = categorizer.analyze_only(args.max_items or 50)
        print(f"Analyzed {count} items")
    
    if args.categorize:
        count = categorizer.categorize_only(args.max_items or 100)
        print(f"Categorized {count} items")
    
    if args.upload:
        count = categorizer.upload_only(args.max_items or 50)
        print(f"Uploaded {count} items")
    
    # If no specific action, show help
    if not any([args.extract, args.analyze, args.categorize, args.upload, 
                args.full, args.stats, args.setup_drive]):
        parser.print_help()
        return 1
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
