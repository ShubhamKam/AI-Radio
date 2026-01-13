"""
Data models for AI Radio Content Categorizer.
Defines the structure for content, categories, and upload tracking.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
import json
import hashlib


class ContentType(Enum):
    """Types of content that can be processed."""
    URL = "url"
    FILE = "file"
    BOOKMARK = "bookmark"
    CLIPBOARD = "clipboard"
    TEXT = "text"


class ContentStatus(Enum):
    """Processing status of content."""
    PENDING = "pending"
    ANALYZING = "analyzing"
    CATEGORIZED = "categorized"
    UPLOADED = "uploaded"
    FAILED = "failed"
    SKIPPED = "skipped"


class UploadStatus(Enum):
    """Upload status for Google Drive."""
    PENDING = "pending"
    UPLOADING = "uploading"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Category:
    """Represents a radio content category."""
    id: str
    name: str
    description: str
    subcategories: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    priority_weight: float = 1.0
    radio_format: str = "general_segment"
    
    def matches_keywords(self, text: str) -> int:
        """Count how many keywords match in the given text."""
        text_lower = text.lower()
        return sum(1 for kw in self.keywords if kw.lower() in text_lower)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'subcategories': self.subcategories,
            'keywords': self.keywords,
            'priority_weight': self.priority_weight,
            'radio_format': self.radio_format,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any], category_id: str = None) -> 'Category':
        """Create Category from dictionary."""
        return cls(
            id=category_id or data.get('id', 'unknown'),
            name=data.get('name', ''),
            description=data.get('description', ''),
            subcategories=data.get('subcategories', []),
            keywords=data.get('keywords', []),
            priority_weight=data.get('priority_weight', 1.0),
            radio_format=data.get('radio_format', 'general_segment'),
        )


@dataclass
class AIAnalysis:
    """Results from AI analysis of content."""
    summary: str = ""
    topics: List[str] = field(default_factory=list)
    sentiment: str = "neutral"  # positive, negative, neutral
    radio_suitability_score: float = 0.0  # 0-1 scale
    suggested_category: str = ""
    suggested_subcategory: str = ""
    tags: List[str] = field(default_factory=list)
    language: str = "en"
    content_quality: float = 0.0  # 0-1 scale
    estimated_duration: int = 0  # seconds for radio segment
    raw_response: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'summary': self.summary,
            'topics': self.topics,
            'sentiment': self.sentiment,
            'radio_suitability_score': self.radio_suitability_score,
            'suggested_category': self.suggested_category,
            'suggested_subcategory': self.suggested_subcategory,
            'tags': self.tags,
            'language': self.language,
            'content_quality': self.content_quality,
            'estimated_duration': self.estimated_duration,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AIAnalysis':
        """Create AIAnalysis from dictionary."""
        return cls(
            summary=data.get('summary', ''),
            topics=data.get('topics', []),
            sentiment=data.get('sentiment', 'neutral'),
            radio_suitability_score=data.get('radio_suitability_score', 0.0),
            suggested_category=data.get('suggested_category', ''),
            suggested_subcategory=data.get('suggested_subcategory', ''),
            tags=data.get('tags', []),
            language=data.get('language', 'en'),
            content_quality=data.get('content_quality', 0.0),
            estimated_duration=data.get('estimated_duration', 0),
            raw_response=data.get('raw_response', ''),
        )


@dataclass
class Content:
    """Represents a piece of content to be processed."""
    id: str = ""
    source: str = ""  # URL, file path, or source identifier
    source_type: ContentType = ContentType.TEXT
    title: str = ""
    raw_content: str = ""
    extracted_text: str = ""
    
    # Analysis results
    analysis: Optional[AIAnalysis] = None
    
    # Categorization
    category_id: str = ""
    subcategory: str = ""
    tags: List[str] = field(default_factory=list)
    priority_score: float = 0.0
    
    # Status tracking
    status: ContentStatus = ContentStatus.PENDING
    upload_status: UploadStatus = UploadStatus.PENDING
    drive_file_id: str = ""
    drive_folder_id: str = ""
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    processed_at: Optional[datetime] = None
    uploaded_at: Optional[datetime] = None
    
    # Additional metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Generate ID if not provided."""
        if not self.id:
            self.id = self._generate_id()
    
    def _generate_id(self) -> str:
        """Generate a unique ID based on source and content."""
        content_hash = hashlib.md5(
            f"{self.source}{self.raw_content[:500] if self.raw_content else ''}".encode()
        ).hexdigest()[:12]
        return f"content_{content_hash}"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            'id': self.id,
            'source': self.source,
            'source_type': self.source_type.value,
            'title': self.title,
            'raw_content': self.raw_content,
            'extracted_text': self.extracted_text,
            'analysis': self.analysis.to_dict() if self.analysis else None,
            'category_id': self.category_id,
            'subcategory': self.subcategory,
            'tags': self.tags,
            'priority_score': self.priority_score,
            'status': self.status.value,
            'upload_status': self.upload_status.value,
            'drive_file_id': self.drive_file_id,
            'drive_folder_id': self.drive_folder_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'metadata': self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Content':
        """Create Content from dictionary."""
        content = cls(
            id=data.get('id', ''),
            source=data.get('source', ''),
            source_type=ContentType(data.get('source_type', 'text')),
            title=data.get('title', ''),
            raw_content=data.get('raw_content', ''),
            extracted_text=data.get('extracted_text', ''),
            category_id=data.get('category_id', ''),
            subcategory=data.get('subcategory', ''),
            tags=data.get('tags', []),
            priority_score=data.get('priority_score', 0.0),
            status=ContentStatus(data.get('status', 'pending')),
            upload_status=UploadStatus(data.get('upload_status', 'pending')),
            drive_file_id=data.get('drive_file_id', ''),
            drive_folder_id=data.get('drive_folder_id', ''),
            metadata=data.get('metadata', {}),
        )
        
        if data.get('analysis'):
            content.analysis = AIAnalysis.from_dict(data['analysis'])
        
        # Parse datetime fields
        if data.get('created_at'):
            content.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('updated_at'):
            content.updated_at = datetime.fromisoformat(data['updated_at'])
        if data.get('processed_at'):
            content.processed_at = datetime.fromisoformat(data['processed_at'])
        if data.get('uploaded_at'):
            content.uploaded_at = datetime.fromisoformat(data['uploaded_at'])
        
        return content
    
    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'Content':
        """Create Content from JSON string."""
        return cls.from_dict(json.loads(json_str))
    
    def mark_analyzing(self) -> None:
        """Mark content as being analyzed."""
        self.status = ContentStatus.ANALYZING
        self.updated_at = datetime.now()
    
    def mark_categorized(self) -> None:
        """Mark content as categorized."""
        self.status = ContentStatus.CATEGORIZED
        self.processed_at = datetime.now()
        self.updated_at = datetime.now()
    
    def mark_uploaded(self, file_id: str, folder_id: str) -> None:
        """Mark content as uploaded to Google Drive."""
        self.status = ContentStatus.UPLOADED
        self.upload_status = UploadStatus.COMPLETED
        self.drive_file_id = file_id
        self.drive_folder_id = folder_id
        self.uploaded_at = datetime.now()
        self.updated_at = datetime.now()
    
    def mark_failed(self, error: str = "") -> None:
        """Mark content as failed."""
        self.status = ContentStatus.FAILED
        self.updated_at = datetime.now()
        if error:
            self.metadata['error'] = error


@dataclass
class ProcessingBatch:
    """Represents a batch of content being processed."""
    id: str
    contents: List[Content] = field(default_factory=list)
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    total_items: int = 0
    processed_items: int = 0
    failed_items: int = 0
    uploaded_items: int = 0
    
    def add_content(self, content: Content) -> None:
        """Add content to the batch."""
        self.contents.append(content)
        self.total_items = len(self.contents)
    
    def get_progress(self) -> float:
        """Get processing progress as percentage."""
        if self.total_items == 0:
            return 0.0
        return (self.processed_items / self.total_items) * 100
    
    def mark_complete(self) -> None:
        """Mark batch as complete."""
        self.completed_at = datetime.now()
