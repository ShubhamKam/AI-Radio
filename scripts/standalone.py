#!/usr/bin/env python3
"""
AI Radio Content Categorizer - Standalone Script
This is a self-contained version that can run without the full project structure.
Ideal for quick testing or minimal deployments.

Usage:
    python standalone.py --help
    python standalone.py --analyze-url "https://example.com"
    python standalone.py --analyze-text "Your content here"
"""

import os
import sys
import json
import argparse
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List


# Check for required packages
def check_dependencies():
    """Check and report missing dependencies."""
    missing = []
    
    try:
        import requests
    except ImportError:
        missing.append('requests')
    
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        missing.append('beautifulsoup4')
    
    # Check AI providers
    ai_available = []
    try:
        import openai
        ai_available.append('openai')
    except ImportError:
        pass
    
    try:
        import anthropic
        ai_available.append('anthropic')
    except ImportError:
        pass
    
    try:
        import google.generativeai
        ai_available.append('google-generativeai')
    except ImportError:
        pass
    
    if missing:
        print(f"Missing required packages: {', '.join(missing)}")
        print(f"Install with: pip install {' '.join(missing)}")
        sys.exit(1)
    
    if not ai_available:
        print("No AI provider packages installed.")
        print("Install at least one: pip install openai anthropic google-generativeai")
        sys.exit(1)
    
    return ai_available


# Radio content categories
CATEGORIES = {
    'news': {
        'keywords': ['news', 'breaking', 'report', 'update', 'announcement', 'politics'],
        'weight': 1.5
    },
    'music': {
        'keywords': ['music', 'song', 'album', 'artist', 'band', 'playlist', 'concert'],
        'weight': 1.2
    },
    'talk_show': {
        'keywords': ['interview', 'discussion', 'talk', 'opinion', 'debate', 'podcast'],
        'weight': 1.3
    },
    'stories': {
        'keywords': ['story', 'narrative', 'fiction', 'tale', 'drama', 'chapter'],
        'weight': 1.0
    },
    'educational': {
        'keywords': ['learn', 'how to', 'guide', 'tutorial', 'education', 'course'],
        'weight': 1.1
    },
    'entertainment': {
        'keywords': ['entertainment', 'celebrity', 'movie', 'show', 'fun', 'comedy'],
        'weight': 0.9
    },
    'lifestyle': {
        'keywords': ['health', 'fitness', 'food', 'travel', 'lifestyle', 'wellness'],
        'weight': 0.8
    }
}

# AI Analysis prompt
ANALYSIS_PROMPT = """Analyze this content for radio broadcasting suitability.

Content: {content}

Provide JSON response with:
{{
    "summary": "2-3 sentence summary for radio introduction",
    "topics": ["main", "topics"],
    "sentiment": "positive/negative/neutral",
    "radio_suitability_score": 0.0-1.0,
    "suggested_category": "news/music/talk_show/stories/educational/entertainment/lifestyle",
    "tags": ["relevant", "tags"],
    "estimated_duration": seconds_for_radio_segment
}}

Respond ONLY with valid JSON."""


def fetch_url(url: str) -> Optional[Dict[str, Any]]:
    """Fetch and extract content from URL."""
    import requests
    from bs4 import BeautifulSoup
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AI-Radio-Categorizer/1.0'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer']):
            element.decompose()
        
        # Extract title
        title = ""
        if soup.title:
            title = soup.title.string or ""
        og_title = soup.find('meta', property='og:title')
        if og_title:
            title = og_title.get('content', title)
        
        # Extract content
        content = soup.get_text(separator=' ', strip=True)
        
        return {
            'url': url,
            'title': title.strip(),
            'content': content[:15000],  # Limit content
        }
    
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return None


def analyze_with_openai(content: str, api_key: str) -> Optional[Dict[str, Any]]:
    """Analyze content using OpenAI."""
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a content analyst for radio broadcasting. Respond only with valid JSON."},
                {"role": "user", "content": ANALYSIS_PROMPT.format(content=content[:10000])}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        result = response.choices[0].message.content
        return json.loads(result)
    
    except Exception as e:
        print(f"OpenAI error: {e}")
        return None


def analyze_with_claude(content: str, api_key: str) -> Optional[Dict[str, Any]]:
    """Analyze content using Claude."""
    try:
        from anthropic import Anthropic
        
        client = Anthropic(api_key=api_key)
        
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": ANALYSIS_PROMPT.format(content=content[:10000])}
            ]
        )
        
        result = response.content[0].text
        return json.loads(result)
    
    except Exception as e:
        print(f"Claude error: {e}")
        return None


def analyze_with_gemini(content: str, api_key: str) -> Optional[Dict[str, Any]]:
    """Analyze content using Gemini."""
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        response = model.generate_content(ANALYSIS_PROMPT.format(content=content[:10000]))
        
        result = response.text
        # Extract JSON from response
        start = result.find('{')
        end = result.rfind('}') + 1
        if start >= 0 and end > start:
            return json.loads(result[start:end])
        return None
    
    except Exception as e:
        print(f"Gemini error: {e}")
        return None


def categorize_by_keywords(content: str) -> str:
    """Fallback categorization using keywords."""
    content_lower = content.lower()
    
    best_category = 'uncategorized'
    best_score = 0
    
    for cat_id, cat_data in CATEGORIES.items():
        score = sum(1 for kw in cat_data['keywords'] if kw in content_lower)
        weighted_score = score * cat_data['weight']
        
        if weighted_score > best_score:
            best_score = weighted_score
            best_category = cat_id
    
    return best_category


def analyze_content(content: str, title: str = "", provider: str = None) -> Dict[str, Any]:
    """Analyze content using available AI provider."""
    
    # Determine provider
    if provider is None:
        provider = os.getenv('AI_PROVIDER', 'openai')
    
    # Get API keys
    api_keys = {
        'openai': os.getenv('OPENAI_API_KEY'),
        'claude': os.getenv('ANTHROPIC_API_KEY'),
        'gemini': os.getenv('GOOGLE_AI_API_KEY'),
    }
    
    # Try AI analysis
    analysis = None
    
    if provider == 'openai' and api_keys['openai']:
        analysis = analyze_with_openai(content, api_keys['openai'])
    elif provider == 'claude' and api_keys['claude']:
        analysis = analyze_with_claude(content, api_keys['claude'])
    elif provider == 'gemini' and api_keys['gemini']:
        analysis = analyze_with_gemini(content, api_keys['gemini'])
    else:
        # Try any available provider
        for prov, key in api_keys.items():
            if key:
                if prov == 'openai':
                    analysis = analyze_with_openai(content, key)
                elif prov == 'claude':
                    analysis = analyze_with_claude(content, key)
                elif prov == 'gemini':
                    analysis = analyze_with_gemini(content, key)
                if analysis:
                    break
    
    # Fallback to keyword categorization
    if not analysis:
        print("AI analysis not available, using keyword categorization")
        category = categorize_by_keywords(content)
        analysis = {
            'summary': content[:200] + '...' if len(content) > 200 else content,
            'topics': [],
            'sentiment': 'neutral',
            'radio_suitability_score': 0.5,
            'suggested_category': category,
            'tags': [],
            'estimated_duration': 300
        }
    
    # Add metadata
    result = {
        'title': title,
        'analysis': analysis,
        'category': analysis.get('suggested_category', categorize_by_keywords(content)),
        'priority_score': analysis.get('radio_suitability_score', 0.5),
        'analyzed_at': datetime.now().isoformat(),
    }
    
    return result


def format_output(result: Dict[str, Any], format: str = 'text') -> str:
    """Format analysis result for output."""
    if format == 'json':
        return json.dumps(result, indent=2)
    
    # Text format
    lines = [
        "=" * 60,
        "AI Radio Content Analysis",
        "=" * 60,
        f"\nTitle: {result.get('title', 'Untitled')}",
        f"Category: {result.get('category', 'uncategorized').upper()}",
        f"Priority Score: {result.get('priority_score', 0):.2f}",
        f"\nSummary:",
        result.get('analysis', {}).get('summary', 'No summary available'),
        f"\nTopics: {', '.join(result.get('analysis', {}).get('topics', []))}",
        f"Sentiment: {result.get('analysis', {}).get('sentiment', 'unknown')}",
        f"Tags: {', '.join(result.get('analysis', {}).get('tags', []))}",
        f"Est. Duration: {result.get('analysis', {}).get('estimated_duration', 0)} seconds",
        f"\nAnalyzed: {result.get('analyzed_at', '')}",
        "=" * 60,
    ]
    
    return '\n'.join(lines)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='AI Radio Content Categorizer - Standalone Analyzer'
    )
    
    parser.add_argument('--analyze-url', '-u', help='Analyze content from URL')
    parser.add_argument('--analyze-text', '-t', help='Analyze text content')
    parser.add_argument('--analyze-file', '-f', help='Analyze content from file')
    parser.add_argument('--provider', '-p', choices=['openai', 'claude', 'gemini'],
                       help='AI provider to use')
    parser.add_argument('--format', choices=['text', 'json'], default='text',
                       help='Output format')
    parser.add_argument('--check-deps', action='store_true',
                       help='Check dependencies and exit')
    
    args = parser.parse_args()
    
    # Check dependencies
    available = check_dependencies()
    
    if args.check_deps:
        print(f"Available AI providers: {', '.join(available)}")
        sys.exit(0)
    
    # Analyze content
    content = ""
    title = ""
    
    if args.analyze_url:
        print(f"Fetching: {args.analyze_url}")
        fetched = fetch_url(args.analyze_url)
        if fetched:
            content = fetched['content']
            title = fetched['title']
        else:
            print("Failed to fetch URL")
            sys.exit(1)
    
    elif args.analyze_text:
        content = args.analyze_text
        title = "Text Input"
    
    elif args.analyze_file:
        try:
            with open(args.analyze_file, 'r') as f:
                content = f.read()
            title = os.path.basename(args.analyze_file)
        except Exception as e:
            print(f"Failed to read file: {e}")
            sys.exit(1)
    
    else:
        parser.print_help()
        sys.exit(1)
    
    # Run analysis
    print("Analyzing content...")
    result = analyze_content(content, title, args.provider)
    
    # Output result
    print(format_output(result, args.format))


if __name__ == '__main__':
    main()
