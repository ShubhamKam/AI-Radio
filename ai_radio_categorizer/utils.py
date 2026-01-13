from __future__ import annotations

import hashlib
import os
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path


def utc_datestr() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def ensure_dir(p: Path) -> Path:
    p.mkdir(parents=True, exist_ok=True)
    return p


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


_URL_RE = re.compile(r"https?://[^\s<>\")]+", re.IGNORECASE)


def extract_urls(text: str) -> list[str]:
    return [m.group(0).rstrip(".,;)]") for m in _URL_RE.finditer(text)]


def slugify(s: str, max_len: int = 80) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s[:max_len] if len(s) > max_len else s


def expanduser_path(p: str | Path) -> Path:
    return Path(os.path.expandvars(os.path.expanduser(str(p)))).resolve()

