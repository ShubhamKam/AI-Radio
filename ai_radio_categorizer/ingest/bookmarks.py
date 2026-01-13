from __future__ import annotations

from pathlib import Path

from bs4 import BeautifulSoup

from ..models import ContentItem, SourceType
from ..utils import sha256_text


def ingest_bookmarks_html(bookmarks_path: Path) -> list[ContentItem]:
    if not bookmarks_path.exists():
        return []

    html = bookmarks_path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")
    items: list[ContentItem] = []

    for a in soup.find_all("a"):
        href = (a.get("href") or "").strip()
        if not href or not (href.startswith("http://") or href.startswith("https://")):
            continue
        title = (a.get_text() or "").strip() or None
        item_id = sha256_text(f"url:{href}")
        items.append(
            ContentItem(
                id=item_id,
                source_type=SourceType.bookmark,
                title=title,
                url=href,
                raw={"bookmark_file": str(bookmarks_path)},
            )
        )

    return items

