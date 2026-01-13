from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml
from openai import OpenAI
from pydantic import ValidationError

from .models import Categorization, ContentItem


def load_categories_yaml(p: Path) -> dict[str, Any]:
    data = yaml.safe_load(p.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("categories.yaml must be a mapping")
    return data


def _prompt(categories: dict[str, Any], item: ContentItem, snippet: str) -> str:
    return (
        "You are an expert radio producer. Create a categorization and brief that is optimized for "
        "AI-driven radio content creation. Output MUST be valid JSON matching the required schema.\n\n"
        "CATEGORY CONFIG (YAML-as-text):\n"
        f"{yaml.safe_dump(categories, sort_keys=False)}\n"
        "ITEM:\n"
        f"- title: {item.title or item.extracted_title or ''}\n"
        f"- url: {item.url or ''}\n"
        f"- source_type: {item.source_type}\n\n"
        "CONTENT SNIPPET (may be truncated):\n"
        f"{snippet}\n\n"
        "REQUIRED JSON SCHEMA:\n"
        "{\n"
        '  "primary_category": string,\n'
        '  "tags": string[],\n'
        '  "content_type": string,\n'
        '  "recommended_radio_segment": string,\n'
        '  "summary": string,\n'
        '  "key_points": string[],\n'
        '  "suggested_hooks": string[],\n'
        '  "urgency_0_to_10": integer (0-10),\n'
        '  "evergreen_0_to_10": integer (0-10),\n'
        '  "licensing_risk": "low" | "medium" | "high",\n'
        '  "confidence_0_to_1": number (0.0-1.0)\n'
        "}\n"
    )


def categorize_item(
    *,
    client: OpenAI,
    model: str,
    categories: dict[str, Any],
    item: ContentItem,
    max_snippet_chars: int = 9000,
) -> Categorization:
    text = item.extracted_text or ""
    snippet = text.strip()
    if len(snippet) > max_snippet_chars:
        snippet = snippet[:max_snippet_chars]

    resp = client.responses.create(
        model=model,
        input=_prompt(categories, item, snippet),
        temperature=0.2,
    )
    out = (resp.output_text or "").strip()
    try:
        data = json.loads(out)
    except Exception:
        # Basic recovery: try to extract the first JSON object in the output.
        start = out.find("{")
        end = out.rfind("}")
        if start != -1 and end != -1 and end > start:
            data = json.loads(out[start : end + 1])
        else:
            raise ValueError(f"Model did not return JSON. Output was:\n{out}")

    try:
        return Categorization.model_validate(data)
    except ValidationError as e:
        raise ValueError(f"Invalid categorization JSON: {e}\nRaw JSON:\n{json.dumps(data, indent=2)}")

