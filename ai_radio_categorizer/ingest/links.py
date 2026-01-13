from __future__ import annotations

from pathlib import Path

from ..models import ContentItem, SourceType
from ..utils import extract_urls, sha256_text


def ingest_links_txt(links_path: Path) -> list[ContentItem]:
    """
    Supports:
    - one URL per line
    - "title | url"
    - arbitrary text containing URLs
    """
    if not links_path.exists():
        return []

    items: list[ContentItem] = []
    for line in links_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        title: str | None = None
        url: str | None = None

        if "|" in line:
            left, right = [p.strip() for p in line.split("|", 1)]
            urls = extract_urls(right) or extract_urls(line)
            if urls:
                url = urls[0]
                title = left or None
        else:
            urls = extract_urls(line)
            if urls:
                url = urls[0]

        if not url:
            continue

        item_id = sha256_text(f"url:{url}")
        items.append(
            ContentItem(
                id=item_id,
                source_type=SourceType.link_list,
                title=title,
                url=url,
                raw={"links_file": str(links_path)},
            )
        )

    return items

