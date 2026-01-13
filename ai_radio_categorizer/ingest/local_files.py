from __future__ import annotations

from pathlib import Path

from ..models import ContentItem, SourceType
from ..utils import sha256_text


DEFAULT_GLOBS = ("**/*.txt", "**/*.md")


def ingest_local_files(input_dir: Path, globs: tuple[str, ...] = DEFAULT_GLOBS) -> list[ContentItem]:
    if not input_dir.exists():
        return []

    items: list[ContentItem] = []
    for g in globs:
        for p in input_dir.glob(g):
            if not p.is_file():
                continue
            try:
                text = p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            item_id = sha256_text(f"file:{str(p)}")
            items.append(
                ContentItem(
                    id=item_id,
                    source_type=SourceType.local_file,
                    title=p.stem,
                    local_path=str(p),
                    extracted_text=text,
                    raw={"input_dir": str(input_dir)},
                )
            )
    return items

