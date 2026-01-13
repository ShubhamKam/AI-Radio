import os
import json
from bs4 import BeautifulSoup
import glob

class ContentExtractor:
    def __init__(self, bookmark_path=None, content_dirs=None):
        self.bookmark_path = bookmark_path
        self.content_dirs = content_dirs or []

    def extract_bookmarks(self):
        """
        Parses Chrome/Standard HTML bookmark file.
        Returns a list of dictionaries with 'title' and 'url'.
        """
        if not self.bookmark_path or not os.path.exists(self.bookmark_path):
            print(f"Bookmark file not found at {self.bookmark_path}")
            return []

        try:
            with open(self.bookmark_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')

            links = []
            for link in soup.find_all('a'):
                title = link.get_text()
                url = link.get('href')
                if url:
                    links.append({'title': title, 'url': url, 'type': 'bookmark'})
            
            return links
        except Exception as e:
            print(f"Error parsing bookmarks: {e}")
            return []

    def scan_local_files(self):
        """
        Scans configured directories for text and audio files.
        """
        files_found = []
        extensions = ['*.txt', '*.md', '*.mp3', '*.wav', '*.m4a']
        
        for directory in self.content_dirs:
            if not os.path.exists(directory):
                continue
                
            for ext in extensions:
                path_pattern = os.path.join(directory, ext)
                # Note: recursive glob requires python 3.5+ and ** pattern
                for filepath in glob.glob(path_pattern): # Simple glob for now
                     files_found.append({
                         'path': filepath,
                         'filename': os.path.basename(filepath),
                         'type': 'file'
                     })
        return files_found

if __name__ == "__main__":
    # Test execution
    extractor = ContentExtractor(
        bookmark_path="data/bookmarks/bookmarks.html",
        content_dirs=["data/content"]
    )
    print("Bookmarks:", len(extractor.extract_bookmarks()))
    print("Files:", len(extractor.scan_local_files()))
