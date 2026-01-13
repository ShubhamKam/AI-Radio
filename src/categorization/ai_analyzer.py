"""
AI-powered content analysis using multiple providers.
Supports OpenAI, Claude, and Gemini for content analysis.
"""

import os
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List

from ..core.config import Config
from ..core.models import Content, AIAnalysis

logger = logging.getLogger(__name__)


# Radio content analysis prompt
ANALYSIS_PROMPT = """You are an AI assistant specializing in content analysis for radio broadcasting.
Analyze the following content and provide a structured assessment for radio content production.

Content Title: {title}
Content Source: {source}
Content Text:
{content}

Provide your analysis in the following JSON format:
{{
    "summary": "A 2-3 sentence summary of the content suitable for radio introduction",
    "topics": ["list", "of", "main", "topics"],
    "sentiment": "positive/negative/neutral",
    "radio_suitability_score": 0.0-1.0,
    "suggested_category": "one of: news, music, talk_show, stories, educational, entertainment, lifestyle",
    "suggested_subcategory": "more specific subcategory",
    "tags": ["relevant", "tags", "for", "indexing"],
    "language": "detected language code (e.g., en, es, fr)",
    "content_quality": 0.0-1.0,
    "estimated_duration": estimated_seconds_for_radio_segment,
    "radio_format_suggestions": "How this content could be adapted for radio"
}}

Consider these factors for radio suitability:
- Is the content appropriate for audio-only format?
- Does it have engaging narrative potential?
- Is it timely and relevant?
- Can it be adapted into a radio segment?
- What's the target audience appeal?

Respond ONLY with valid JSON, no additional text."""


class AIProvider(ABC):
    """Abstract base class for AI providers."""
    
    @abstractmethod
    def analyze(self, content: Content) -> Optional[AIAnalysis]:
        """Analyze content and return structured analysis."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is available (API key configured)."""
        pass
    
    def _prepare_prompt(self, content: Content) -> str:
        """Prepare the analysis prompt."""
        text = content.extracted_text or content.raw_content
        # Truncate if too long
        max_length = 15000
        if len(text) > max_length:
            text = text[:max_length] + "...[truncated]"
        
        return ANALYSIS_PROMPT.format(
            title=content.title or "Untitled",
            source=content.source,
            content=text
        )
    
    def _parse_response(self, response_text: str) -> Optional[AIAnalysis]:
        """Parse AI response into AIAnalysis object."""
        try:
            # Try to extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                data = json.loads(json_str)
                
                return AIAnalysis(
                    summary=data.get('summary', ''),
                    topics=data.get('topics', []),
                    sentiment=data.get('sentiment', 'neutral'),
                    radio_suitability_score=float(data.get('radio_suitability_score', 0.0)),
                    suggested_category=data.get('suggested_category', ''),
                    suggested_subcategory=data.get('suggested_subcategory', ''),
                    tags=data.get('tags', []),
                    language=data.get('language', 'en'),
                    content_quality=float(data.get('content_quality', 0.0)),
                    estimated_duration=int(data.get('estimated_duration', 0)),
                    raw_response=response_text,
                )
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.debug(f"Response was: {response_text[:500]}")
        
        return None


class OpenAIProvider(AIProvider):
    """OpenAI GPT provider for content analysis."""
    
    def __init__(self):
        self.config = Config()
        self.api_key = self.config.get_api_key('openai')
        self.model = self.config.get('ai', 'openai', 'model', default='gpt-4-turbo-preview')
        self.max_tokens = self.config.get('ai', 'openai', 'max_tokens', default=2000)
        self.temperature = self.config.get('ai', 'openai', 'temperature', default=0.3)
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def analyze(self, content: Content) -> Optional[AIAnalysis]:
        if not self.is_available():
            logger.warning("OpenAI API key not configured")
            return None
        
        try:
            from openai import OpenAI
            
            client = OpenAI(api_key=self.api_key)
            
            prompt = self._prepare_prompt(content)
            
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a content analysis expert for radio broadcasting. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            
            response_text = response.choices[0].message.content
            return self._parse_response(response_text)
        
        except ImportError:
            logger.error("openai package not installed")
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {e}")
        
        return None


class ClaudeProvider(AIProvider):
    """Anthropic Claude provider for content analysis."""
    
    def __init__(self):
        self.config = Config()
        self.api_key = self.config.get_api_key('claude')
        self.model = self.config.get('ai', 'claude', 'model', default='claude-3-sonnet-20240229')
        self.max_tokens = self.config.get('ai', 'claude', 'max_tokens', default=2000)
        self.temperature = self.config.get('ai', 'claude', 'temperature', default=0.3)
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def analyze(self, content: Content) -> Optional[AIAnalysis]:
        if not self.is_available():
            logger.warning("Anthropic API key not configured")
            return None
        
        try:
            from anthropic import Anthropic
            
            client = Anthropic(api_key=self.api_key)
            
            prompt = self._prepare_prompt(content)
            
            response = client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                messages=[
                    {"role": "user", "content": prompt}
                ],
            )
            
            response_text = response.content[0].text
            return self._parse_response(response_text)
        
        except ImportError:
            logger.error("anthropic package not installed")
        except Exception as e:
            logger.error(f"Claude analysis failed: {e}")
        
        return None


class GeminiProvider(AIProvider):
    """Google Gemini provider for content analysis."""
    
    def __init__(self):
        self.config = Config()
        self.api_key = self.config.get_api_key('gemini')
        self.model = self.config.get('ai', 'gemini', 'model', default='gemini-pro')
        self.max_tokens = self.config.get('ai', 'gemini', 'max_tokens', default=2000)
        self.temperature = self.config.get('ai', 'gemini', 'temperature', default=0.3)
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def analyze(self, content: Content) -> Optional[AIAnalysis]:
        if not self.is_available():
            logger.warning("Google AI API key not configured")
            return None
        
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model)
            
            prompt = self._prepare_prompt(content)
            
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=self.max_tokens,
                    temperature=self.temperature,
                )
            )
            
            response_text = response.text
            return self._parse_response(response_text)
        
        except ImportError:
            logger.error("google-generativeai package not installed")
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
        
        return None


class AIAnalyzer:
    """Main AI analyzer that manages multiple providers with fallback."""
    
    def __init__(self, preferred_provider: str = None):
        self.config = Config()
        
        if preferred_provider is None:
            preferred_provider = self.config.ai_provider
        
        self.providers = {
            'openai': OpenAIProvider(),
            'claude': ClaudeProvider(),
            'gemini': GeminiProvider(),
        }
        
        self.preferred_provider = preferred_provider
        self._provider_order = self._get_provider_order()
    
    def _get_provider_order(self) -> List[str]:
        """Get ordered list of providers to try."""
        order = [self.preferred_provider]
        for provider in self.providers.keys():
            if provider not in order:
                order.append(provider)
        return order
    
    def get_available_providers(self) -> List[str]:
        """Get list of available (configured) providers."""
        return [name for name, provider in self.providers.items() 
                if provider.is_available()]
    
    def analyze(self, content: Content, provider: str = None) -> Optional[AIAnalysis]:
        """
        Analyze content using AI.
        
        Args:
            content: Content to analyze
            provider: Specific provider to use (optional)
            
        Returns:
            AIAnalysis object or None if all providers fail
        """
        if provider and provider in self.providers:
            return self.providers[provider].analyze(content)
        
        # Try providers in order until one succeeds
        for provider_name in self._provider_order:
            provider_instance = self.providers.get(provider_name)
            
            if provider_instance and provider_instance.is_available():
                logger.info(f"Analyzing with {provider_name}")
                result = provider_instance.analyze(content)
                
                if result:
                    return result
                
                logger.warning(f"{provider_name} analysis failed, trying next provider")
        
        logger.error("All AI providers failed")
        return None
    
    def batch_analyze(self, contents: List[Content], 
                     max_items: int = None) -> Dict[str, AIAnalysis]:
        """
        Analyze multiple content items.
        
        Args:
            contents: List of content to analyze
            max_items: Maximum number of items to analyze
            
        Returns:
            Dictionary mapping content IDs to analysis results
        """
        results = {}
        
        if max_items:
            contents = contents[:max_items]
        
        for i, content in enumerate(contents):
            logger.info(f"Analyzing content {i+1}/{len(contents)}: {content.title or content.source}")
            
            analysis = self.analyze(content)
            if analysis:
                results[content.id] = analysis
                content.analysis = analysis
        
        return results
