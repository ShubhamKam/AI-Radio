"""Tests for the content categorizer."""

import pytest
from unittest.mock import Mock, patch
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestCategoryMatching:
    """Test category keyword matching."""
    
    def test_news_keywords(self):
        """Test news category detection."""
        from src.core.models import Category
        
        news = Category(
            id='news',
            name='News',
            description='News content',
            keywords=['news', 'breaking', 'update', 'report']
        )
        
        text = "Breaking news: Major update reported today"
        matches = news.matches_keywords(text)
        assert matches >= 3  # Should match breaking, news, update, report
    
    def test_music_keywords(self):
        """Test music category detection."""
        from src.core.models import Category
        
        music = Category(
            id='music',
            name='Music',
            description='Music content',
            keywords=['music', 'song', 'album', 'artist']
        )
        
        text = "New album release from popular artist"
        matches = music.matches_keywords(text)
        assert matches >= 2
    
    def test_no_matches(self):
        """Test when no keywords match."""
        from src.core.models import Category
        
        cat = Category(
            id='test',
            name='Test',
            description='Test',
            keywords=['xyz', 'abc']
        )
        
        text = "This text has no matching keywords"
        matches = cat.matches_keywords(text)
        assert matches == 0


class TestContentModel:
    """Test Content model."""
    
    def test_content_creation(self):
        """Test creating a content object."""
        from src.core.models import Content, ContentType
        
        content = Content(
            source='https://example.com',
            source_type=ContentType.URL,
            title='Test Article',
            raw_content='This is test content'
        )
        
        assert content.source == 'https://example.com'
        assert content.source_type == ContentType.URL
        assert content.title == 'Test Article'
        assert content.id.startswith('content_')
    
    def test_content_to_dict(self):
        """Test converting content to dictionary."""
        from src.core.models import Content, ContentType
        
        content = Content(
            source='test.txt',
            source_type=ContentType.FILE,
            title='Test File'
        )
        
        data = content.to_dict()
        
        assert 'id' in data
        assert data['source'] == 'test.txt'
        assert data['source_type'] == 'file'
    
    def test_content_status_transitions(self):
        """Test content status transitions."""
        from src.core.models import Content, ContentStatus
        
        content = Content(source='test')
        assert content.status == ContentStatus.PENDING
        
        content.mark_analyzing()
        assert content.status == ContentStatus.ANALYZING
        
        content.mark_categorized()
        assert content.status == ContentStatus.CATEGORIZED
        assert content.processed_at is not None


class TestAIAnalysis:
    """Test AI analysis model."""
    
    def test_analysis_from_dict(self):
        """Test creating analysis from dictionary."""
        from src.core.models import AIAnalysis
        
        data = {
            'summary': 'Test summary',
            'topics': ['topic1', 'topic2'],
            'sentiment': 'positive',
            'radio_suitability_score': 0.8,
            'suggested_category': 'news',
            'tags': ['tag1', 'tag2'],
        }
        
        analysis = AIAnalysis.from_dict(data)
        
        assert analysis.summary == 'Test summary'
        assert len(analysis.topics) == 2
        assert analysis.sentiment == 'positive'
        assert analysis.radio_suitability_score == 0.8


class TestURLExtraction:
    """Test URL extraction."""
    
    def test_url_validation(self):
        """Test URL validation."""
        from src.extractors.urls import URLExtractor
        
        extractor = URLExtractor()
        
        assert extractor.is_valid_url('https://example.com')
        assert extractor.is_valid_url('http://test.org/path')
        assert not extractor.is_valid_url('not-a-url')
        assert not extractor.is_valid_url('ftp://example.com')
    
    def test_domain_extraction(self):
        """Test domain extraction from URLs."""
        from src.extractors.urls import URLExtractor
        
        extractor = URLExtractor()
        
        assert extractor.get_domain('https://example.com/path') == 'example.com'
        assert extractor.get_domain('http://sub.domain.org/') == 'sub.domain.org'
    
    def test_url_categorization(self):
        """Test URL pre-categorization by domain."""
        from src.extractors.urls import URLExtractor
        
        extractor = URLExtractor()
        
        assert extractor.categorize_url('https://bbc.com/news') == 'news'
        assert extractor.categorize_url('https://spotify.com/track') == 'music'
        assert extractor.categorize_url('https://github.com/repo') == 'technology'
        assert extractor.categorize_url('https://randomsite.com') == 'general'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
