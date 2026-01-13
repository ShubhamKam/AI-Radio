"""
Content categorization engine for radio content.
Assigns categories, subcategories, and priority scores.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

from ..core.config import Config
from ..core.models import Content, Category, AIAnalysis
from ..core.database import Database

logger = logging.getLogger(__name__)


class ContentCategorizer:
    """Categorizes content for radio production."""
    
    def __init__(self):
        self.config = Config()
        self.db = Database()
        self.categories = self._load_categories()
    
    def _load_categories(self) -> Dict[str, Category]:
        """Load categories from configuration."""
        categories = {}
        config_categories = self.config.get_categories()
        
        for cat_id, cat_data in config_categories.items():
            categories[cat_id] = Category.from_dict(cat_data, cat_id)
        
        return categories
    
    def categorize(self, content: Content) -> Content:
        """
        Categorize a content item.
        
        Uses AI analysis if available, falls back to keyword matching.
        """
        # If AI analysis suggests a category, use it
        if content.analysis and content.analysis.suggested_category:
            category_id = self._normalize_category(content.analysis.suggested_category)
            
            if category_id in self.categories:
                content.category_id = category_id
                content.subcategory = content.analysis.suggested_subcategory or ""
                content.tags = content.analysis.tags or []
                content.priority_score = self._calculate_priority(content)
                content.mark_categorized()
                return content
        
        # Fall back to keyword-based categorization
        category_id, subcategory = self._categorize_by_keywords(content)
        content.category_id = category_id
        content.subcategory = subcategory
        content.priority_score = self._calculate_priority(content)
        content.mark_categorized()
        
        return content
    
    def _normalize_category(self, category: str) -> str:
        """Normalize category name to ID."""
        # Handle variations in category names
        category = category.lower().strip()
        
        # Direct mappings
        mappings = {
            'news': 'news',
            'news & current affairs': 'news',
            'current affairs': 'news',
            'music': 'music',
            'music content': 'music',
            'talk show': 'talk_show',
            'talk_show': 'talk_show',
            'talkshow': 'talk_show',
            'talk': 'talk_show',
            'interview': 'talk_show',
            'interviews': 'talk_show',
            'stories': 'stories',
            'story': 'stories',
            'stories & narratives': 'stories',
            'narrative': 'stories',
            'educational': 'educational',
            'education': 'educational',
            'educational content': 'educational',
            'entertainment': 'entertainment',
            'lifestyle': 'lifestyle',
            'lifestyle & wellness': 'lifestyle',
        }
        
        return mappings.get(category, 'uncategorized')
    
    def _categorize_by_keywords(self, content: Content) -> Tuple[str, str]:
        """Categorize content based on keyword matching."""
        text = f"{content.title} {content.extracted_text or content.raw_content}"
        text = text.lower()
        
        best_category = 'uncategorized'
        best_score = 0
        best_subcategory = ''
        
        for cat_id, category in self.categories.items():
            score = category.matches_keywords(text)
            
            # Apply priority weight
            weighted_score = score * category.priority_weight
            
            if weighted_score > best_score:
                best_score = weighted_score
                best_category = cat_id
                best_subcategory = self._find_subcategory(text, category)
        
        return best_category, best_subcategory
    
    def _find_subcategory(self, text: str, category: Category) -> str:
        """Find the best matching subcategory."""
        if not category.subcategories:
            return ''
        
        best_subcategory = category.subcategories[0] if category.subcategories else ''
        best_count = 0
        
        for subcategory in category.subcategories:
            # Count occurrences of subcategory-related words
            subcat_words = subcategory.replace('_', ' ').split()
            count = sum(1 for word in subcat_words if word in text)
            
            if count > best_count:
                best_count = count
                best_subcategory = subcategory
        
        return best_subcategory
    
    def _calculate_priority(self, content: Content) -> float:
        """Calculate priority score for content scheduling."""
        score = 0.5  # Base score
        
        # Factor 1: AI-assessed radio suitability
        if content.analysis:
            score += content.analysis.radio_suitability_score * 0.3
            score += content.analysis.content_quality * 0.2
        
        # Factor 2: Category priority weight
        if content.category_id in self.categories:
            category = self.categories[content.category_id]
            score *= category.priority_weight
        
        # Factor 3: Recency (newer content gets higher priority)
        age_hours = (datetime.now() - content.created_at).total_seconds() / 3600
        if age_hours < 24:
            score *= 1.2  # Boost for content less than 24 hours old
        elif age_hours < 72:
            score *= 1.1  # Slight boost for content less than 3 days old
        
        # Factor 4: Content length (moderate length preferred)
        text_length = len(content.extracted_text or content.raw_content)
        if 500 <= text_length <= 5000:
            score *= 1.1  # Ideal length for radio
        elif text_length < 100:
            score *= 0.7  # Too short
        
        # Normalize to 0-1 range
        return min(max(score, 0.0), 1.0)
    
    def categorize_batch(self, contents: List[Content]) -> List[Content]:
        """Categorize multiple content items."""
        categorized = []
        
        for content in contents:
            try:
                categorized_content = self.categorize(content)
                self.db.save_content(categorized_content)
                categorized.append(categorized_content)
                logger.info(f"Categorized: {content.title or content.source} -> {content.category_id}")
            except Exception as e:
                logger.error(f"Failed to categorize {content.source}: {e}")
                content.mark_failed(str(e))
                self.db.save_content(content)
        
        return categorized
    
    def get_category_stats(self) -> Dict[str, int]:
        """Get content count by category."""
        stats = self.db.get_statistics()
        return stats.get('by_category', {})
    
    def recategorize_all(self) -> int:
        """Recategorize all pending content."""
        pending = self.db.get_pending_content(limit=1000)
        categorized = self.categorize_batch(pending)
        return len(categorized)
    
    def suggest_radio_schedule(self, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Suggest a radio schedule based on categorized content.
        
        Args:
            hours: Number of hours to schedule for
            
        Returns:
            List of scheduled content items with suggested times
        """
        schedule = []
        
        # Get categorized content sorted by priority
        all_content = self.db.get_categorized_content(limit=200)
        all_content.sort(key=lambda x: x.priority_score, reverse=True)
        
        # Distribute content across categories
        slots_per_hour = 4  # 15-minute slots
        total_slots = hours * slots_per_hour
        
        # Track category distribution
        category_counts = {cat_id: 0 for cat_id in self.categories.keys()}
        category_counts['uncategorized'] = 0
        
        for i, content in enumerate(all_content):
            if i >= total_slots:
                break
            
            hour = i // slots_per_hour
            slot = i % slots_per_hour
            
            schedule.append({
                'content_id': content.id,
                'title': content.title,
                'category': content.category_id,
                'subcategory': content.subcategory,
                'priority': content.priority_score,
                'scheduled_hour': hour,
                'scheduled_slot': slot,
                'estimated_duration': content.analysis.estimated_duration if content.analysis else 300,
            })
            
            if content.category_id in category_counts:
                category_counts[content.category_id] += 1
        
        logger.info(f"Generated schedule with {len(schedule)} items")
        logger.info(f"Category distribution: {category_counts}")
        
        return schedule
