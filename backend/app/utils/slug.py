from __future__ import annotations

import re
import unicodedata

SLUG_ALLOWED_PATTERN = re.compile(r"[^a-zA-Z0-9\u0600-\u06FF\s-]")
MULTI_DASH_PATTERN = re.compile(r"-+")


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).strip().lower()
    cleaned = SLUG_ALLOWED_PATTERN.sub("", normalized)
    dashed = re.sub(r"\s+", "-", cleaned)
    return MULTI_DASH_PATTERN.sub("-", dashed).strip("-") or "martyr"


def build_unique_slug(base_slug: str, existing_slugs: set[str]) -> str:
    if base_slug not in existing_slugs:
        return base_slug

    counter = 2
    while f"{base_slug}-{counter}" in existing_slugs:
        counter += 1
    return f"{base_slug}-{counter}"
