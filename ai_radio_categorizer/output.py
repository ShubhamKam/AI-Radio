from __future__ import annotations

import json
from pathlib import Path

from .models import Categorization, ContentItem
from .utils import ensure_dir, slugify


def write_item_bundle(*, out_root: Path, run_date: str, item: ContentItem, cat: Categorization) -> Path:
    title = item.title or item.extracted_title or item.url or item.local_path or item.id
    slug = slugify(title) or item.id[:12]

    bundle_dir = ensure_dir(out_root / run_date / "categories" / cat.primary_category / slug)

    (bundle_dir / "id.txt").write_text(item.id, encoding="utf-8")

    if item.url:
        (bundle_dir / "source.url").write_text(item.url, encoding="utf-8")
    if item.local_path:
        (bundle_dir / "source.path").write_text(item.local_path, encoding="utf-8")

    if item.extracted_text:
        (bundle_dir / "source.txt").write_text(item.extracted_text, encoding="utf-8", errors="ignore")

    (bundle_dir / "metadata.json").write_text(
        json.dumps(cat.model_dump(), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    brief = []
    brief.append(f"# {title}\n")
    brief.append(f"- Source: {item.source_type}\n")
    if item.url:
        brief.append(f"- URL: {item.url}\n")
    brief.append(f"- Primary category: {cat.primary_category}\n")
    brief.append(f"- Tags: {', '.join(cat.tags) if cat.tags else '(none)'}\n")
    brief.append(f"- Segment: {cat.recommended_radio_segment}\n")
    brief.append(f"- Content type: {cat.content_type}\n")
    brief.append(f"- Urgency: {cat.urgency_0_to_10}/10 | Evergreen: {cat.evergreen_0_to_10}/10\n")
    brief.append(f"- Licensing risk: {cat.licensing_risk} | Confidence: {cat.confidence_0_to_1}\n\n")
    brief.append("## Summary\n")
    brief.append(f"{cat.summary}\n\n")
    brief.append("## Key points\n")
    for kp in cat.key_points:
        brief.append(f"- {kp}\n")
    brief.append("\n## Suggested hooks\n")
    for h in cat.suggested_hooks:
        brief.append(f"- {h}\n")

    (bundle_dir / "brief.md").write_text("".join(brief), encoding="utf-8")
    return bundle_dir

