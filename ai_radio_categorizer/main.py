from __future__ import annotations

import argparse
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

from .drive import rclone_sync
from .extract import extract_from_url
from .ingest.bookmarks import ingest_bookmarks_html
from .ingest.links import ingest_links_txt
from .ingest.local_files import ingest_local_files
from .llm import categorize_item, load_categories_yaml
from .models import ContentItem
from .output import write_item_bundle
from .utils import ensure_dir, expanduser_path, utc_datestr


def _dedupe(items: list[ContentItem]) -> list[ContentItem]:
    seen: set[str] = set()
    out: list[ContentItem] = []
    for it in items:
        if it.id in seen:
            continue
        seen.add(it.id)
        out.append(it)
    return out


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="AI-Radio content categorizer (Termux-friendly)")
    p.add_argument("--categories", default="config/categories.yaml", help="Path to categories.yaml")
    p.add_argument("--bookmarks", default="~/storage/downloads/AI-Radio/bookmarks.html")
    p.add_argument("--links", default="~/storage/downloads/AI-Radio/links.txt")
    p.add_argument("--input-dir", default="~/storage/downloads/AI-Radio/inputs")
    p.add_argument("--out-dir", default="output")
    p.add_argument("--max-items", type=int, default=50)
    p.add_argument("--no-fetch", action="store_true", help="Do not fetch URLs; use titles only")
    p.add_argument("--upload", action="store_true", help="Sync output/ to Google Drive via rclone")
    p.add_argument("--dry-run-upload", action="store_true")
    return p


def main() -> int:
    load_dotenv()

    args = build_parser().parse_args()
    categories_path = Path(args.categories)
    out_dir = ensure_dir(Path(args.out_dir))

    bookmarks_path = expanduser_path(args.bookmarks)
    links_path = expanduser_path(args.links)
    input_dir = expanduser_path(args.input_dir)

    categories = load_categories_yaml(categories_path)

    items: list[ContentItem] = []
    items.extend(ingest_bookmarks_html(bookmarks_path))
    items.extend(ingest_links_txt(links_path))
    items.extend(ingest_local_files(input_dir))
    items = _dedupe(items)[: max(0, args.max_items)]

    api_key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key:
        raise SystemExit("Missing OPENAI_API_KEY (put it in .env or environment).")

    client = OpenAI(api_key=api_key)
    run_date = utc_datestr()

    for it in items:
        if it.url and not args.no_fetch:
            try:
                ex = extract_from_url(it.url)
                it.extracted_title = ex.title
                it.extracted_text = ex.text
            except Exception as e:
                # Still attempt categorization with whatever we have.
                it.extracted_text = (it.extracted_text or "") + f"\n\n[fetch_error] {e}\n"

        cat = categorize_item(client=client, model=model, categories=categories, item=it)
        write_item_bundle(out_root=out_dir, run_date=run_date, item=it, cat=cat)

    if args.upload:
        remote = os.environ.get("RCLONE_REMOTE", "gdrive")
        drive_root = os.environ.get("DRIVE_ROOT", "AI-Radio")
        rclone_sync(
            src_dir=out_dir / run_date,
            remote=remote,
            drive_root=f"{drive_root}/{run_date}",
            dry_run=args.dry_run_upload,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

