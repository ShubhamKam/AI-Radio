import os
import json
import sys
from src.content_extractor import ContentExtractor
from src.ai_analyzer import AIAnalyzer
from src.categorization_engine import CategorizationEngine
from src.drive_uploader import DriveUploader

def load_config():
    config_path = "config/config.json"
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {
        "api_key": os.environ.get("AI_API_KEY", "dummy_key"),
        "bookmark_path": "data/bookmarks/bookmarks.html",
        "content_dirs": ["data/content"]
    }

def main():
    print("=== AI Radio Content Automation Started ===")
    config = load_config()

    # 1. Extract Content
    print("\n[1/4] Extracting Content...")
    extractor = ContentExtractor(
        bookmark_path=config.get("bookmark_path"),
        content_dirs=config.get("content_dirs")
    )
    bookmarks = extractor.extract_bookmarks()
    files = extractor.scan_local_files()
    all_content = bookmarks + files
    print(f"Found {len(all_content)} items.")

    if not all_content:
        print("No content found. Exiting.")
        return

    # 2. Analyze Content
    print("\n[2/4] Analyzing Content with Cloud AI...")
    analyzer = AIAnalyzer(api_key=config.get("api_key"))
    analyzed_items = []
    
    # Limit for demo purposes if list is huge
    for item in all_content[:10]: 
        print(f"Processing: {item.get('title', 'Unknown')[:30]}...")
        result = analyzer.analyze_content(item)
        if result and "error" not in result:
            analyzed_items.append(result)
        else:
            print(f"Failed to analyze: {result}")

    # 3. Categorize
    print("\n[3/4] Categorizing Content...")
    engine = CategorizationEngine()
    organized_content = engine.organize_content(analyzed_items)

    # 4. Upload
    print("\n[4/4] Uploading to Drive...")
    uploader = DriveUploader()
    uploader.upload_categorized_content(organized_content)

    print("\n=== Automation Complete ===")

if __name__ == "__main__":
    main()
