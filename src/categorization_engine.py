import json
import os
import shutil

class CategorizationEngine:
    def __init__(self, output_base_dir="data/categorized_content"):
        self.output_base_dir = output_base_dir
        self.categories = [
            "News", "Tech Talk", "Music Analysis", 
            "Storytelling", "Interviews", "Other"
        ]

    def organize_content(self, analyzed_items):
        """
        Takes a list of analyzed items (dicts with 'category') and organizes them.
        Returns a structure suitable for Drive upload.
        """
        organized = {cat: [] for cat in self.categories}
        
        for item in analyzed_items:
            category = item.get('category', 'Other')
            if category not in self.categories:
                category = 'Other'
            
            organized[category].append(item)
            
            # Create local file structure for verification/staging
            self._save_local_manifest(category, item)
            
        return organized

    def _save_local_manifest(self, category, item):
        cat_dir = os.path.join(self.output_base_dir, category)
        os.makedirs(cat_dir, exist_ok=True)
        
        # Save a JSON manifest for the item
        # Sanitize filename
        safe_title = "".join([c for c in item.get('raw_data', {}).get('title', 'item') if c.isalnum() or c in (' ', '-', '_')]).strip()
        filename = f"{safe_title}.json"
        
        with open(os.path.join(cat_dir, filename), 'w') as f:
            json.dump(item, f, indent=2)

if __name__ == "__main__":
    engine = CategorizationEngine()
    test_items = [
        {"category": "Tech Talk", "summary": "AI stuff", "raw_data": {"title": "AI Report"}},
        {"category": "News", "summary": "World news", "raw_data": {"title": "Daily Briefing"}}
    ]
    print(engine.organize_content(test_items))
