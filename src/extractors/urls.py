"""
URL content fetcher and extractor.
Fetches and parses web content from URLs.
"""

import os
import re
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from urllib.parse import urlparse, urljoin
import hashlib

from ..core.config import Config
from ..core.models import Content, ContentType

logger = logging.getLogger(__name__)


class URLExtractor:
    """Fetches and extracts content from URLs."""
    
    def __init__(self):
        self.config = Config()
        self.extraction_config = self.config.get_extraction_config()
        self.url_config = self.extraction_config.get('url_fetch', {})
        
        self.timeout = self.url_config.get('timeout', 30)
        self.max_content_length = self.url_config.get('max_content_length', 500000)
        self.user_agent = self.url_config.get(
            'user_agent',
            'Mozilla/5.0 (Linux; Android 13) AI-Radio-Categorizer/1.0'
        )
    
    def fetch_url(self, url: str) -> Optional[Dict[str, Any]]:
        """Fetch content from a URL."""
        try:
            import requests
            from bs4 import BeautifulSoup
        except ImportError:
            logger.error("requests and beautifulsoup4 are required for URL extraction")
            return None
        
        try:
            headers = {
                'User-Agent': self.user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
            
            response = requests.get(
                url,
                headers=headers,
                timeout=self.timeout,
                allow_redirects=True,
                stream=True
            )
            
            # Check content length
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > self.max_content_length:
                logger.warning(f"Content too large for {url}: {content_length} bytes")
                return None
            
            # Check content type
            content_type = response.headers.get('content-type', '')
            if not any(ct in content_type.lower() for ct in ['text/html', 'text/plain', 'application/json']):
                logger.info(f"Skipping non-text content: {content_type} for {url}")
                return None
            
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract metadata
            title = self._extract_title(soup)
            description = self._extract_description(soup)
            main_content = self._extract_main_content(soup)
            
            return {
                'url': url,
                'final_url': response.url,
                'title': title,
                'description': description,
                'content': main_content,
                'raw_html': response.text[:self.max_content_length],
                'content_type': content_type,
                'fetched_at': datetime.now().isoformat(),
                'status_code': response.status_code,
            }
        
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout fetching {url}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"Error fetching {url}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}")
        
        return None
    
    def _extract_title(self, soup) -> str:
        """Extract page title."""
        # Try Open Graph title first
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content']
        
        # Try Twitter title
        twitter_title = soup.find('meta', attrs={'name': 'twitter:title'})
        if twitter_title and twitter_title.get('content'):
            return twitter_title['content']
        
        # Fall back to title tag
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        
        # Try h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        return ""
    
    def _extract_description(self, soup) -> str:
        """Extract page description."""
        # Try Open Graph description
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            return og_desc['content']
        
        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content']
        
        # Try Twitter description
        twitter_desc = soup.find('meta', attrs={'name': 'twitter:description'})
        if twitter_desc and twitter_desc.get('content'):
            return twitter_desc['content']
        
        return ""
    
    def _extract_main_content(self, soup) -> str:
        """Extract main text content from page."""
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 
                            'aside', 'form', 'noscript', 'iframe']):
            element.decompose()
        
        # Try to find main content area
        main_content = None
        
        # Common article containers
        for selector in ['article', 'main', '[role="main"]', '.content', 
                        '.post-content', '.entry-content', '#content']:
            main_content = soup.select_one(selector)
            if main_content:
                break
        
        if main_content is None:
            main_content = soup.body if soup.body else soup
        
        # Extract text
        text = main_content.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Limit length
        max_length = 50000  # 50KB of text
        if len(text) > max_length:
            text = text[:max_length] + "..."
        
        return text
    
    def extract_links(self, soup, base_url: str) -> List[str]:
        """Extract all links from a page."""
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            
            # Skip anchors, javascript, mailto, etc.
            if href.startswith(('#', 'javascript:', 'mailto:', 'tel:')):
                continue
            
            # Convert relative URLs to absolute
            absolute_url = urljoin(base_url, href)
            
            # Only include HTTP(S) URLs
            if absolute_url.startswith(('http://', 'https://')):
                links.append(absolute_url)
        
        return list(set(links))  # Remove duplicates
    
    def create_content_from_url(self, url: str) -> Optional[Content]:
        """Create a Content object from a URL."""
        fetched = self.fetch_url(url)
        
        if not fetched:
            return None
        
        return Content(
            source=url,
            source_type=ContentType.URL,
            title=fetched['title'],
            raw_content=fetched['raw_html'],
            extracted_text=fetched['content'],
            metadata={
                'final_url': fetched['final_url'],
                'description': fetched['description'],
                'content_type': fetched['content_type'],
                'fetched_at': fetched['fetched_at'],
                'status_code': fetched['status_code'],
            }
        )
    
    def is_valid_url(self, url: str) -> bool:
        """Check if a URL is valid and fetchable."""
        try:
            result = urlparse(url)
            return all([result.scheme in ('http', 'https'), result.netloc])
        except Exception:
            return False
    
    def get_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            parsed = urlparse(url)
            return parsed.netloc
        except Exception:
            return ""
    
    def categorize_url(self, url: str) -> str:
        """Categorize URL based on domain patterns."""
        domain = self.get_domain(url).lower()
        
        # News sites
        news_domains = ['cnn.com', 'bbc.com', 'reuters.com', 'nytimes.com', 
                       'washingtonpost.com', 'theguardian.com', 'news.']
        if any(nd in domain for nd in news_domains):
            return 'news'
        
        # Tech sites
        tech_domains = ['techcrunch.com', 'wired.com', 'arstechnica.com', 
                       'theverge.com', 'engadget.com', 'github.com']
        if any(td in domain for td in tech_domains):
            return 'technology'
        
        # Music sites
        music_domains = ['spotify.com', 'soundcloud.com', 'bandcamp.com',
                        'pitchfork.com', 'rollingstone.com']
        if any(md in domain for md in music_domains):
            return 'music'
        
        # Video platforms
        video_domains = ['youtube.com', 'vimeo.com', 'twitch.tv', 'dailymotion.com']
        if any(vd in domain for vd in video_domains):
            return 'video'
        
        # Social media
        social_domains = ['twitter.com', 'x.com', 'facebook.com', 'instagram.com',
                         'linkedin.com', 'reddit.com']
        if any(sd in domain for sd in social_domains):
            return 'social'
        
        # Educational
        edu_domains = ['wikipedia.org', 'medium.com', 'edu', 'coursera.org',
                      'udemy.com', 'khan']
        if any(ed in domain for ed in edu_domains):
            return 'educational'
        
        return 'general'


class URLBatchProcessor:
    """Process multiple URLs in batch."""
    
    def __init__(self):
        self.extractor = URLExtractor()
    
    def process_urls(self, urls: List[str], max_concurrent: int = 5) -> List[Content]:
        """Process multiple URLs and return content objects."""
        contents = []
        
        for url in urls:
            if not self.extractor.is_valid_url(url):
                logger.warning(f"Skipping invalid URL: {url}")
                continue
            
            content = self.extractor.create_content_from_url(url)
            if content:
                contents.append(content)
                logger.info(f"Processed: {url}")
            else:
                logger.warning(f"Failed to process: {url}")
        
        return contents
