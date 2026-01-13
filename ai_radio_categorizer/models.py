from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SourceType(str, Enum):
    bookmark = "bookmark"
    link_list = "link_list"
    local_file = "local_file"


class ContentItem(BaseModel):
    id: str = Field(..., description="Stable ID (hash) for the item")
    source_type: SourceType
    title: str | None = None
    url: str | None = None
    local_path: str | None = None

    extracted_text: str | None = None
    extracted_title: str | None = None

    raw: dict[str, Any] = Field(default_factory=dict)


class Categorization(BaseModel):
    primary_category: str
    tags: list[str] = Field(default_factory=list)

    content_type: str = Field(description="e.g. news, essay, tutorial, thread, report")
    recommended_radio_segment: str = Field(
        description="e.g. headline, explainer, deep-dive, debate, interview, monologue"
    )

    summary: str
    key_points: list[str] = Field(default_factory=list)
    suggested_hooks: list[str] = Field(default_factory=list)

    urgency_0_to_10: int = Field(ge=0, le=10)
    evergreen_0_to_10: int = Field(ge=0, le=10)
    licensing_risk: str = Field(description="low | medium | high")
    confidence_0_to_1: float = Field(ge=0.0, le=1.0)

