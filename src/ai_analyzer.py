import json
import os
import requests

class AIAnalyzer:
    def __init__(self, api_key, provider="gemini"):
        self.api_key = api_key
        self.provider = provider
        # Example endpoint for a generic AI provider (replace with actual)
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent" 

    def analyze_content(self, content_item):
        """
        Sends content metadata to AI for categorization and radio suitability analysis.
        """
        if self.provider == "gemini":
            return self._analyze_gemini(content_item)
        else:
            # Fallback or other providers
            return {"category": "Uncategorized", "suitability": "Unknown"}

    def _analyze_gemini(self, content_item):
        """
        Specific implementation for Gemini API.
        """
        if not self.api_key:
            return {"error": "API Key missing"}

        title = content_item.get('title', content_item.get('filename', 'Unknown'))
        url = content_item.get('url', 'N/A')
        
        prompt = f"""
        Analyze the following content for a Radio Station:
        Title: {title}
        URL/Path: {url}

        1. Categorize this into one of: News, Tech Talk, Music Analysis, Storytelling, Interviews, or Other.
        2. Is this suitable for radio broadcast? (Yes/No)
        3. Provide a brief 1-sentence summary for a radio host.

        Return response in JSON format with keys: category, suitability, summary.
        """

        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        try:
            # Note: In a real implementation, you'd use the proper client library or handle the URL params for key
            # requests.post(f"{self.api_url}?key={self.api_key}", headers=headers, json=data)
            # mocking response for structure
            return {
                "category": "Tech Talk",
                "suitability": "Yes",
                "summary": f"Discussion about {title}",
                "raw_data": content_item
            }
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    analyzer = AIAnalyzer(api_key="TEST_KEY")
    print(analyzer.analyze_content({"title": "AI in Radio", "url": "http://example.com"}))
