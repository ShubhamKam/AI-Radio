from __future__ import annotations

import time
from dataclasses import dataclass

import html2text
import requests
from bs4 import BeautifulSoup


@dataclass(frozen=True)
class ExtractResult:
    title: str | None
    text: str


def extract_from_url(url: str, timeout_s: int = 20, max_chars: int = 50_000) -> ExtractResult:
    # Small, polite defaults; enough for phone use.
    headers = {
        "User-Agent": "AI-Radio-Categorizer/0.1 (+https://example.invalid)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    # One retry for transient failures.
    last_err: Exception | None = None
    for attempt in range(2):
        try:
            r = requests.get(url, headers=headers, timeout=timeout_s, allow_redirects=True)
            r.raise_for_status()
            html = r.text
            break
        except Exception as e:
            last_err = e
            if attempt == 0:
                time.sleep(1.0)
                continue
            raise

    soup = BeautifulSoup(html, "html.parser")
    title = None
    if soup.title and soup.title.string:
        title = soup.title.string.strip() or None

    # Remove obvious junk nodes
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = True
    h.body_width = 0

    text = h.handle(str(soup))
    text = (text or "").strip()
    if len(text) > max_chars:
        text = text[:max_chars]

    return ExtractResult(title=title, text=text)

